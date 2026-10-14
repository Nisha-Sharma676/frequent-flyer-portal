import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getByRole, getByLabelText, getByText, queryByText, queryByRole, fireEvent, waitFor } from '@testing-library/dom';
import { initPortalApp } from '../../src/app.js';
import { FrequentFlyerService } from '../../src/services/frequentFlyerService.js';
import { TELEMETRY_MESSAGE } from '../../src/services/telemetryService.js';

describe('Frequent Flyer Portal - End-to-End Integration Tests', () => {
  let container;
  let service;
  let consoleSpy;
  const STORAGE_KEY = 'integration_test_flyers';

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    service = new FrequentFlyerService(STORAGE_KEY, 0); // Deterministic 0ms delay by default
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('renders a useful empty state when no frequent flyer records exist', async () => {
    await initPortalApp(container, { service });

    // Empty state should be visible with helpful message and call-to-action button
    const emptyHeading = getByText(container, /no frequent flyer records/i);
    expect(emptyHeading).toBeDefined();

    const addBtn = getByRole(container, 'button', { name: /add member|create record|new member|create first member/i });
    expect(addBtn).toBeDefined();

    // Table should not be rendered when database is empty
    expect(queryByRole(container, 'table')).toBeNull();
  });

  it('renders dashboard summary with total members and tier distribution when records exist', async () => {
    await service.create({
      memberNumber: 'FF-1001',
      firstName: 'Barry',
      lastName: 'Allen',
      email: 'barry@speed.com',
      tierStatus: 'Gold',
      pointsBalance: 50000
    });
    await service.create({
      memberNumber: 'FF-1002',
      firstName: 'Iris',
      lastName: 'West',
      email: 'iris@central.com',
      tierStatus: 'Silver',
      pointsBalance: 12000
    });

    await initPortalApp(container, { service });

    // Summary should show total count and tier breakdown
    const summary = container.querySelector('.dashboard-summary');
    expect(getByText(summary, /total members/i)).toBeDefined();
    expect(getByText(summary, '2')).toBeDefined();
    expect(getByText(summary, /gold/i)).toBeDefined();
    expect(getByText(summary, /silver/i)).toBeDefined();
  });

  it('shows an accessible loading indicator during asynchronous operations', async () => {
    // Create a service with simulated delay
    let resolveDelay;
    const delayedService = new FrequentFlyerService(STORAGE_KEY, 0);
    vi.spyOn(delayedService, 'getAll').mockImplementation(() => {
      return new Promise((resolve) => {
        resolveDelay = () => resolve([]);
      });
    });

    const initPromise = initPortalApp(container, { service: delayedService });

    // While in-flight, loading indicator with role="status" should be present
    const loadingEl = getByRole(container, 'status');
    expect(loadingEl).toBeDefined();
    expect(loadingEl.getAttribute('aria-live')).toBe('polite');

    // Resolve async delay
    resolveDelay();
    await initPromise;

    // Loading indicator should be removed
    expect(queryByRole(container, 'status')).toBeNull();
  });

  it('allows adding a new record, sanitizes XSS payloads, and logs exact telemetry', async () => {
    await initPortalApp(container, { service });

    // Open add modal/form
    const openAddBtn = getByRole(container, 'button', { name: /add member|create record|new member/i });
    fireEvent.click(openAddBtn);

    // Populate form with XSS payload in name field
    fireEvent.input(getByLabelText(container, /member number/i), { target: { value: 'FF-9001' } });
    fireEvent.input(getByLabelText(container, /first name/i), { target: { value: '<script>alert(1)</script>Diana' } });
    fireEvent.input(getByLabelText(container, /last name/i), { target: { value: 'Prince' } });
    fireEvent.input(getByLabelText(container, /email/i), { target: { value: 'diana@amazon.org' } });
    fireEvent.change(getByLabelText(container, /tier/i), { target: { value: 'Executive' } });
    fireEvent.input(getByLabelText(container, /points balance/i), { target: { value: '150000' } });

    // Submit form
    const submitBtn = getByRole(container, 'button', { name: /save member|save record|submit/i });
    fireEvent.click(submitBtn);

    // Wait for record to appear in table
    await waitFor(() => {
      expect(getByText(container, 'FF-9001')).toBeDefined();
    });

    // Verify XSS tag was stripped before rendering
    expect(getByText(container, 'Diana')).toBeDefined();
    expect(container.innerHTML).not.toContain('<script>');

    // Verify exact telemetry message was logged
    expect(consoleSpy).toHaveBeenCalledWith(TELEMETRY_MESSAGE);
  });

  it('highlights invalid form inputs with aria-invalid="true" and prevents telemetry logging', async () => {
    await initPortalApp(container, { service });

    // Open form
    const openAddBtn = getByRole(container, 'button', { name: /add member|create record|new member/i });
    fireEvent.click(openAddBtn);

    // Fill in invalid email and negative points
    const emailInput = getByLabelText(container, /email/i);
    const pointsInput = getByLabelText(container, /points balance/i);

    fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.input(pointsInput, { target: { value: '-200' } });

    // Attempt submission
    const submitBtn = getByRole(container, 'button', { name: /save member|save record|submit/i });
    fireEvent.click(submitBtn);

    // Inputs must be marked as invalid with aria-invalid="true" and class for red styling
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(emailInput.classList.contains('is-invalid')).toBe(true);

    expect(pointsInput.getAttribute('aria-invalid')).toBe('true');
    expect(pointsInput.classList.contains('is-invalid')).toBe(true);

    // Telemetry MUST NOT be logged for failed form validation
    expect(consoleSpy).not.toHaveBeenCalledWith(TELEMETRY_MESSAGE);
  });

  it('allows editing an existing record and logs telemetry upon save', async () => {
    await service.create({
      memberNumber: 'FF-3001',
      firstName: 'Barry',
      lastName: 'Allen',
      email: 'barry@speed.com',
      tierStatus: 'Silver',
      pointsBalance: 5000
    });

    await initPortalApp(container, { service });

    // Find and click edit button for Barry Allen
    const editBtn = getByRole(container, 'button', { name: /edit barry|edit/i });
    fireEvent.click(editBtn);

    // Change tier to Gold and points to 40000
    const tierSelect = getByLabelText(container, /tier/i);
    const pointsInput = getByLabelText(container, /points balance/i);
    fireEvent.change(tierSelect, { target: { value: 'Gold' } });
    fireEvent.input(pointsInput, { target: { value: '40000' } });

    // Save changes
    const submitBtn = getByRole(container, 'button', { name: /save member|save record|update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(getByText(container, 'Gold')).toBeDefined();
    });

    // Telemetry logged on successful edit
    expect(consoleSpy).toHaveBeenCalledWith(TELEMETRY_MESSAGE);
  });

  it('deletes a record upon confirmation, logs telemetry, and restores empty state', async () => {
    await service.create({
      memberNumber: 'FF-4001',
      firstName: 'Arthur',
      lastName: 'Curry',
      email: 'arthur@atlantis.org',
      tierStatus: 'Platinum',
      pointsBalance: 80000
    });

    await initPortalApp(container, { service });
    expect(getByText(container, 'FF-4001')).toBeDefined();

    // Mock confirm dialog to true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteBtn = getByRole(container, 'button', { name: /delete arthur|delete/i });
    fireEvent.click(deleteBtn);

    // Record should be removed and empty state restored
    await waitFor(() => {
      expect(queryByText(container, 'FF-4001')).toBeNull();
      expect(getByText(container, /no frequent flyer records/i)).toBeDefined();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(TELEMETRY_MESSAGE);
  });

  it('filters records by search query and shows a friendly no-match state', async () => {
    await service.create({
      memberNumber: 'FF-1001',
      firstName: 'Clark',
      lastName: 'Kent',
      email: 'clark@dailyplanet.com',
      tierStatus: 'Executive',
      pointsBalance: 999999
    });

    await service.create({
      memberNumber: 'FF-2002',
      firstName: 'Lois',
      lastName: 'Lane',
      email: 'lois@dailyplanet.com',
      tierStatus: 'Gold',
      pointsBalance: 45000
    });

    await initPortalApp(container, { service });

    const searchInput = getByRole(container, 'searchbox', { name: /search/i }) || getByLabelText(container, /search/i);

    // Search for "Clark"
    fireEvent.input(searchInput, { target: { value: 'Clark' } });

    await waitFor(() => {
      expect(getByText(container, 'Clark')).toBeDefined();
      expect(queryByText(container, 'Lois')).toBeNull();
    });

    // Search for non-existent record
    fireEvent.input(searchInput, { target: { value: 'Zod' } });

    await waitFor(() => {
      expect(getByText(container, /no records matching "zod"|no matching records/i)).toBeDefined();
    });

    // Clear search
    fireEvent.input(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(getByText(container, 'Clark')).toBeDefined();
      expect(getByText(container, 'Lois')).toBeDefined();
    });
  });
});
