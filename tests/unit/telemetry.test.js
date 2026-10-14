import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TELEMETRY_MESSAGE, logPortalTelemetry } from '../../src/services/telemetryService.js';

describe('Telemetry Service', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should have the exact required telemetry message constant', () => {
    expect(TELEMETRY_MESSAGE).toBe('[Analytics] User interacted with End-to-End Frequent Flyer Portal');
  });

  it('should log the exact telemetry message to console.log when called', () => {
    logPortalTelemetry();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('[Analytics] User interacted with End-to-End Frequent Flyer Portal');
  });

  it('should not alter or prefix the message with extra custom formatting', () => {
    logPortalTelemetry();
    const loggedMessage = consoleSpy.mock.calls[0][0];
    expect(loggedMessage).toEqual('[Analytics] User interacted with End-to-End Frequent Flyer Portal');
  });
});
