/**
 * Telemetry logging service for user interactions.
 */

export const TELEMETRY_MESSAGE = '[Analytics] User interacted with End-to-End Frequent Flyer Portal';

/**
 * Logs the telemetry message to the console upon successful completion of a primary action.
 */
export function logPortalTelemetry() {
  console.log(TELEMETRY_MESSAGE);
}
