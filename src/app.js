import { FrequentFlyerService } from './services/frequentFlyerService.js';
import { validateFlyerRecord, VALID_TIERS } from './utils/validation.js';
import { sanitizeRecord } from './utils/sanitization.js';
import { logPortalTelemetry } from './services/telemetryService.js';

/**
 * Initializes the Frequent Flyer Portal into the provided container.
 *
 * @param {HTMLElement} container - The host DOM element
 * @param {Object} options - Configuration options (e.g. custom service instance)
 */
export async function initPortalApp(container, options = {}) {
  const service = options.service || new FrequentFlyerService();

  // Application State
  const state = {
    records: [],
    searchQuery: '',
    isLoading: true,
    isModalOpen: false,
    editingRecordId: null,
    fieldErrors: {},
    formData: {
      memberNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      tierStatus: 'Silver',
      pointsBalance: 0
    },
    lastFocusedElement: null
  };

  // Render Skeleton / Base Container
  container.innerHTML = `
    <header class="portal-header" role="banner">
      <div class="portal-header-content">
        <div>
          <h1 class="portal-title">Frequent Flyer Portal</h1>
          <p class="portal-subtitle">Digital Membership & Rewards Management</p>
        </div>
      </div>
    </header>

    <main class="portal-main" id="main-content">
      <!-- Loading Status Indicator -->
      <div id="loading-indicator" class="loading-container" role="status" aria-live="polite" style="display: none;">
        <div class="spinner" aria-hidden="true"></div>
        <span>Loading frequent flyer records...</span>
      </div>

      <!-- Dashboard Content View -->
      <div id="portal-content" style="display: none;"></div>
    </main>

    <!-- Accessible Modal Dialog Container -->
    <div id="modal-container"></div>
  `;

  const loadingEl = container.querySelector('#loading-indicator');
  const contentEl = container.querySelector('#portal-content');
  const modalContainer = container.querySelector('#modal-container');

  function showLoading(show) {
    state.isLoading = show;
    if (show) {
      loadingEl.style.display = 'flex';
      contentEl.style.display = 'none';
    } else {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
    }
  }

  // Load initial data from service
  showLoading(true);
  try {
    state.records = await service.getAll();
  } catch (err) {
    console.error('Failed to load records:', err);
    state.records = [];
  } finally {
    showLoading(false);
    renderContent();
  }

  /**
   * Main Render Coordinator for content area.
   */
  function renderContent() {
    contentEl.innerHTML = '';

    // If completely empty (no records exist in database)
    if (state.records.length === 0) {
      renderEmptyState();
      return;
    }

    // Render Dashboard Summary, Search Toolbar, and Table
    renderSummary();
    renderToolbar();
    renderTable();
  }

  /**
   * Render Dashboard Summary (Total members and tier counts).
   */
  function renderSummary() {
    const totalMembers = state.records.length;
    const tierCounts = {
      Silver: 0,
      Gold: 0,
      Platinum: 0,
      Executive: 0
    };

    state.records.forEach((r) => {
      if (tierCounts[r.tierStatus] !== undefined) {
        tierCounts[r.tierStatus]++;
      }
    });

    const summarySection = document.createElement('section');
    summarySection.className = 'dashboard-summary';
    summarySection.setAttribute('aria-label', 'Membership Summary');
    summarySection.innerHTML = `
      <div class="summary-card">
        <span class="summary-label">Total Members</span>
        <span class="summary-value">${totalMembers}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Silver Tier</span>
        <span class="summary-value">${tierCounts.Silver}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Gold Tier</span>
        <span class="summary-value">${tierCounts.Gold}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Platinum Tier</span>
        <span class="summary-value">${tierCounts.Platinum}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Executive Tier</span>
        <span class="summary-value">${tierCounts.Executive}</span>
      </div>
    `;

    contentEl.appendChild(summarySection);
  }

  /**
   * Render Toolbar with Search and Add Member CTA.
   */
  function renderToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'portal-toolbar';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'search-records';
    searchInput.className = 'search-input';
    searchInput.setAttribute('role', 'searchbox');
    searchInput.setAttribute('aria-label', 'Search frequent flyer records');
    searchInput.placeholder = 'Search by name, member number, or email...';
    searchInput.value = state.searchQuery;

    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTableOnly();
    });

    searchContainer.appendChild(searchInput);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-primary';
    addBtn.textContent = 'Add Member';
    addBtn.addEventListener('click', () => {
      openModal();
    });

    toolbar.appendChild(searchContainer);
    toolbar.appendChild(addBtn);
    contentEl.appendChild(toolbar);
  }

  /**
   * Render Table or No-Match Search State.
   */
  function renderTable() {
    let tableContainer = contentEl.querySelector('#table-container');
    if (!tableContainer) {
      tableContainer = document.createElement('div');
      tableContainer.id = 'table-container';
      contentEl.appendChild(tableContainer);
    }
    renderTableOnly();
  }

  function renderTableOnly() {
    const tableContainer = contentEl.querySelector('#table-container');
    if (!tableContainer) return;

    tableContainer.innerHTML = '';

    const query = state.searchQuery.toLowerCase().trim();
    const filteredRecords = state.records.filter((r) => {
      if (!query) return true;
      const mem = (r.memberNumber || '').toLowerCase();
      const fn = (r.firstName || '').toLowerCase();
      const ln = (r.lastName || '').toLowerCase();
      const em = (r.email || '').toLowerCase();
      return mem.includes(query) || fn.includes(query) || ln.includes(query) || em.includes(query);
    });

    if (filteredRecords.length === 0) {
      const noMatch = document.createElement('div');
      noMatch.className = 'empty-state';
      noMatch.innerHTML = `
        <h2 class="empty-state-title">Search Results</h2>
        <p class="empty-state-text">No records matching "${escapeHtml(state.searchQuery)}". Try a different search query.</p>
      `;
      tableContainer.appendChild(noMatch);
      return;
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';

    const table = document.createElement('table');
    table.className = 'flyer-table';
    table.setAttribute('aria-label', 'Frequent Flyer Records');

    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Member Number</th>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Tier Status</th>
          <th scope="col">Points Balance</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    filteredRecords.forEach((record) => {
      const tr = document.createElement('tr');

      // Member Number
      const tdNum = document.createElement('td');
      tdNum.textContent = record.memberNumber;

      // Name: distinct spans for first and last name to allow precision querying
      const tdName = document.createElement('td');
      const fnSpan = document.createElement('span');
      fnSpan.className = 'first-name';
      fnSpan.textContent = record.firstName;

      const lnSpan = document.createElement('span');
      lnSpan.className = 'last-name';
      lnSpan.textContent = record.lastName;

      tdName.appendChild(fnSpan);
      tdName.appendChild(document.createTextNode(' '));
      tdName.appendChild(lnSpan);

      // Email
      const tdEmail = document.createElement('td');
      tdEmail.textContent = record.email;

      // Tier
      const tdTier = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'tier-badge';
      badge.textContent = record.tierStatus;
      tdTier.appendChild(badge);

      // Points Balance
      const tdPoints = document.createElement('td');
      tdPoints.textContent = Number(record.pointsBalance).toLocaleString();

      // Actions
      const tdActions = document.createElement('td');
      tdActions.className = 'actions-cell';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-secondary btn-sm';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit ${record.firstName} ${record.lastName}`);
      editBtn.addEventListener('click', () => {
        openModal(record);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete ${record.firstName} ${record.lastName}`);
      deleteBtn.addEventListener('click', async () => {
        await handleDelete(record);
      });

      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);

      tr.appendChild(tdNum);
      tr.appendChild(tdName);
      tr.appendChild(tdEmail);
      tr.appendChild(tdTier);
      tr.appendChild(tdPoints);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

    tableWrapper.appendChild(table);
    tableContainer.appendChild(tableWrapper);
  }

  /**
   * Render Empty Database State.
   */
  function renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <h2 class="empty-state-title">No Frequent Flyer Records</h2>
      <p class="empty-state-text">There are currently no frequent flyer members in the portal. Create your first member record to get started.</p>
    `;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-primary';
    addBtn.setAttribute('aria-label', 'Add Member (Create First Member)');
    addBtn.textContent = 'Create First Member';
    addBtn.addEventListener('click', () => {
      openModal();
    });

    emptyState.appendChild(addBtn);
    contentEl.appendChild(emptyState);
  }

  /**
   * Deletion Handler with Confirmation & Telemetry.
   */
  async function handleDelete(record) {
    const confirmed = window.confirm(`Are you sure you want to delete member ${record.firstName} ${record.lastName} (${record.memberNumber})?`);
    if (!confirmed) {
      return;
    }

    showLoading(true);
    try {
      const success = await service.delete(record.id);
      if (success) {
        state.records = state.records.filter((r) => r.id !== record.id);
        logPortalTelemetry();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      showLoading(false);
      renderContent();
    }
  }

  /**
   * Modal Open Handler.
   */
  function openModal(recordToEdit = null) {
    state.lastFocusedElement = document.activeElement;
    state.isModalOpen = true;
    state.fieldErrors = {};

    if (recordToEdit) {
      state.editingRecordId = recordToEdit.id;
      state.formData = {
        memberNumber: recordToEdit.memberNumber,
        firstName: recordToEdit.firstName,
        lastName: recordToEdit.lastName,
        email: recordToEdit.email,
        tierStatus: recordToEdit.tierStatus,
        pointsBalance: recordToEdit.pointsBalance
      };
    } else {
      state.editingRecordId = null;
      state.formData = {
        memberNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        tierStatus: 'Silver',
        pointsBalance: 0
      };
    }

    renderModal();
  }

  /**
   * Modal Close Handler.
   */
  function closeModal() {
    state.isModalOpen = false;
    state.editingRecordId = null;
    modalContainer.innerHTML = '';

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus();
    }
  }

  /**
   * Modal Dialog Renderer with Full Accessibility.
   */
  function renderModal() {
    const isEditing = Boolean(state.editingRecordId);
    const titleText = isEditing ? 'Edit Frequent Flyer' : 'Add Frequent Flyer';
    const submitBtnText = isEditing ? 'Save Member' : 'Save Member';

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
          <div class="modal-header">
            <h2 class="modal-title" id="modal-title">${titleText}</h2>
            <button type="button" class="btn btn-secondary btn-sm" id="modal-close-btn" aria-label="Close dialog">✕</button>
          </div>
          <form id="flyer-form" novalidate>
            <div class="modal-body">
              <!-- Member Number -->
              <div class="form-group">
                <label for="flyer-member-number" class="form-label">Member Number</label>
                <input
                  type="text"
                  id="flyer-member-number"
                  name="memberNumber"
                  class="form-control"
                  value="${escapeHtml(state.formData.memberNumber)}"
                  required
                />
                <div id="flyer-member-number-error" class="field-error" style="display: none;"></div>
              </div>

              <!-- First Name -->
              <div class="form-group">
                <label for="flyer-first-name" class="form-label">First Name</label>
                <input
                  type="text"
                  id="flyer-first-name"
                  name="firstName"
                  class="form-control"
                  value="${escapeHtml(state.formData.firstName)}"
                  required
                />
                <div id="flyer-first-name-error" class="field-error" style="display: none;"></div>
              </div>

              <!-- Last Name -->
              <div class="form-group">
                <label for="flyer-last-name" class="form-label">Last Name</label>
                <input
                  type="text"
                  id="flyer-last-name"
                  name="lastName"
                  class="form-control"
                  value="${escapeHtml(state.formData.lastName)}"
                  required
                />
                <div id="flyer-last-name-error" class="field-error" style="display: none;"></div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="flyer-email" class="form-label">Email</label>
                <input
                  type="email"
                  id="flyer-email"
                  name="email"
                  class="form-control"
                  value="${escapeHtml(state.formData.email)}"
                  required
                />
                <div id="flyer-email-error" class="field-error" style="display: none;"></div>
              </div>

              <!-- Tier Status -->
              <div class="form-group">
                <label for="flyer-tier" class="form-label">Tier Status</label>
                <select id="flyer-tier" name="tierStatus" class="form-control">
                  ${VALID_TIERS.map((tier) => `
                    <option value="${tier}" ${state.formData.tierStatus === tier ? 'selected' : ''}>
                      ${tier}
                    </option>
                  `).join('')}
                </select>
                <div id="flyer-tier-error" class="field-error" style="display: none;"></div>
              </div>

              <!-- Points Balance -->
              <div class="form-group">
                <label for="flyer-points" class="form-label">Points Balance</label>
                <input
                  type="number"
                  id="flyer-points"
                  name="pointsBalance"
                  class="form-control"
                  value="${state.formData.pointsBalance !== undefined ? state.formData.pointsBalance : 0}"
                  min="0"
                  step="1"
                  required
                />
                <div id="flyer-points-error" class="field-error" style="display: none;"></div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="modal-submit-btn">${submitBtnText}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const dialog = modalContainer.querySelector('.modal-dialog');
    const form = modalContainer.querySelector('#flyer-form');
    const closeBtn = modalContainer.querySelector('#modal-close-btn');
    const cancelBtn = modalContainer.querySelector('#modal-cancel-btn');
    const submitBtn = modalContainer.querySelector('#modal-submit-btn');

    // Focus inside modal
    const firstInput = form.querySelector('#flyer-member-number');
    if (firstInput) {
      firstInput.focus();
    }

    // Keyboard navigation: Escape key closes modal
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Live input synchronization
    form.addEventListener('input', (e) => {
      const field = e.target.name;
      if (field) {
        state.formData[field] = e.target.value;
      }
    });

    let isSubmitting = false;

    // Form submission handler
    async function handleFormSubmit(e) {
      if (e) {
        e.preventDefault();
      }
      if (isSubmitting) return;
      isSubmitting = true;

      // Collect raw values from form controls
      const rawData = {
        memberNumber: form.querySelector('#flyer-member-number').value,
        firstName: form.querySelector('#flyer-first-name').value,
        lastName: form.querySelector('#flyer-last-name').value,
        email: form.querySelector('#flyer-email').value,
        tierStatus: form.querySelector('#flyer-tier').value,
        pointsBalance: form.querySelector('#flyer-points').value
      };

      const editingId = state.editingRecordId;
      if (editingId) {
        rawData.id = editingId;
      }

      // Validate
      const validation = validateFlyerRecord(rawData, state.records);

      if (!validation.isValid) {
        applyValidationErrors(form, validation.errors);
        isSubmitting = false;
        return;
      }

      // Sanitize inputs before state/storage persistence
      const sanitizedData = sanitizeRecord(rawData);
      sanitizedData.pointsBalance = Number(sanitizedData.pointsBalance);

      closeModal();
      showLoading(true);

      try {
        if (editingId) {
          const updated = await service.update(editingId, sanitizedData);
          if (updated) {
            const idx = state.records.findIndex((r) => r.id === editingId);
            if (idx !== -1) {
              state.records[idx] = updated;
            }
            logPortalTelemetry();
          }
        } else {
          const created = await service.create(sanitizedData);
          if (created) {
            state.records.push(created);
            logPortalTelemetry();
          }
        }
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        isSubmitting = false;
        showLoading(false);
        renderContent();
      }
    }

    form.addEventListener('submit', handleFormSubmit);
    submitBtn.addEventListener('click', handleFormSubmit);
  }

  /**
   * Applies validation error styling and ARIA attributes.
   */
  function applyValidationErrors(form, errors) {
    const fieldMapping = {
      memberNumber: '#flyer-member-number',
      firstName: '#flyer-first-name',
      lastName: '#flyer-last-name',
      email: '#flyer-email',
      tierStatus: '#flyer-tier',
      pointsBalance: '#flyer-points'
    };

    for (const [field, selector] of Object.entries(fieldMapping)) {
      const input = form.querySelector(selector);
      const errorDiv = form.querySelector(`${selector}-error`);
      if (!input) continue;

      if (errors[field]) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        if (errorDiv) {
          errorDiv.textContent = errors[field];
          errorDiv.style.display = 'block';
          input.setAttribute('aria-describedby', errorDiv.id);
        }
      } else {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        if (errorDiv) {
          errorDiv.textContent = '';
          errorDiv.style.display = 'none';
          input.removeAttribute('aria-describedby');
        }
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
