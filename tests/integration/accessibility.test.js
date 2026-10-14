import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getByRole, getByLabelText, getByText, queryByRole, fireEvent } from '@testing-library/dom';
import { initPortalApp } from '../../src/app.js';
import { FrequentFlyerService } from '../../src/services/frequentFlyerService.js';

describe('Accessibility & Keyboard Navigation Integration Tests', () => {
  let container;
  let service;
  const STORAGE_KEY = 'a11y_test_flyers';

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    service = new FrequentFlyerService(STORAGE_KEY, 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders required semantic HTML landmarks and table structure', async () => {
    await service.create({
      memberNumber: 'FF-7001',
      firstName: 'Hal',
      lastName: 'Jordan',
      email: 'hal@ferris.com',
      tierStatus: 'Gold',
      pointsBalance: 60000
    });

    await initPortalApp(container, { service });

    // Header landmark and primary heading
    const headerEl = container.querySelector('header');
    expect(headerEl).not.toBeNull();

    const mainEl = container.querySelector('main');
    expect(mainEl).not.toBeNull();

    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toMatch(/frequent flyer/i);

    // Table with accessible header scopes
    const table = getByRole(container, 'table');
    expect(table).toBeDefined();

    const columnHeaders = container.querySelectorAll('th[scope="col"]');
    expect(columnHeaders.length).toBeGreaterThanOrEqual(6);
  });

  it('associates explicit <label> elements with every form input control', async () => {
    await initPortalApp(container, { service });

    // Open add member modal
    const addBtn = getByRole(container, 'button', { name: /add member|create record|new member/i });
    fireEvent.click(addBtn);

    const dialog = getByRole(container, 'dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    // Every input must resolve via getByLabelText
    const memberNumInput = getByLabelText(container, /member number/i);
    const firstNameInput = getByLabelText(container, /first name/i);
    const lastNameInput = getByLabelText(container, /last name/i);
    const emailInput = getByLabelText(container, /email/i);
    const tierInput = getByLabelText(container, /tier/i);
    const pointsInput = getByLabelText(container, /points balance/i);

    expect(memberNumInput.id).toBeTruthy();
    expect(firstNameInput.id).toBeTruthy();
    expect(lastNameInput.id).toBeTruthy();
    expect(emailInput.id).toBeTruthy();
    expect(tierInput.id).toBeTruthy();
    expect(pointsInput.id).toBeTruthy();
  });

  it('supports closing modals via Escape key and restores focus', async () => {
    await initPortalApp(container, { service });

    const addBtn = getByRole(container, 'button', { name: /add member|create record|new member/i });
    addBtn.focus();
    expect(document.activeElement).toBe(addBtn);

    // Open dialog
    fireEvent.click(addBtn);
    const dialog = getByRole(container, 'dialog');
    expect(dialog).toBeDefined();

    // Press Escape key
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    // Dialog should be closed and focus returned to the trigger button
    expect(queryByRole(container, 'dialog')).toBeNull();
    expect(document.activeElement).toBe(addBtn);
  });

  it('links error messages to invalid inputs using aria-describedby', async () => {
    await initPortalApp(container, { service });

    const addBtn = getByRole(container, 'button', { name: /add member|create record|new member/i });
    fireEvent.click(addBtn);

    // Submit blank form to trigger validation errors
    const submitBtn = getByRole(container, 'button', { name: /save member|save record|submit/i });
    fireEvent.click(submitBtn);

    const firstNameInput = getByLabelText(container, /first name/i);
    expect(firstNameInput.getAttribute('aria-invalid')).toBe('true');

    const describedById = firstNameInput.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();

    const errorEl = document.getElementById(describedById);
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toMatch(/required/i);
  });
});
