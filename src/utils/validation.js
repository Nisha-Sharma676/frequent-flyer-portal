/**
 * Form validation utilities for Frequent Flyer records.
 */

export const VALID_TIERS = ['Silver', 'Gold', 'Platinum', 'Executive'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an individual form field.
 *
 * @param {string} name - Field name
 * @param {any} value - Field value
 * @param {Array} existingRecords - List of existing records to check for collisions
 * @param {string|null} currentId - Optional ID of the record currently being edited
 * @returns {string|null} Error message if invalid, or null if valid
 */
export function validateField(name, value, existingRecords = [], currentId = null) {
  switch (name) {
    case 'memberNumber': {
      if (value === null || value === undefined || String(value).trim() === '') {
        return 'Member number is required.';
      }
      const trimmed = String(value).trim();
      const duplicate = existingRecords.find(
        (r) => r.memberNumber.toUpperCase() === trimmed.toUpperCase() && r.id !== currentId
      );
      if (duplicate) {
        return 'Member number already exists.';
      }
      return null;
    }

    case 'firstName': {
      if (value === null || value === undefined || String(value).trim() === '') {
        return 'First name is required.';
      }
      return null;
    }

    case 'lastName': {
      if (value === null || value === undefined || String(value).trim() === '') {
        return 'Last name is required.';
      }
      return null;
    }

    case 'email': {
      if (value === null || value === undefined || String(value).trim() === '') {
        return 'Email address is required.';
      }
      if (!EMAIL_REGEX.test(String(value).trim())) {
        return 'Please enter a valid email address.';
      }
      return null;
    }

    case 'tierStatus': {
      if (!VALID_TIERS.includes(value)) {
        return `Tier status must be one of: ${VALID_TIERS.join(', ')}.`;
      }
      return null;
    }

    case 'pointsBalance': {
      if (value === null || value === undefined || value === '') {
        return 'Points balance is required.';
      }
      const num = Number(value);
      if (Number.isNaN(num) || typeof value === 'string' && isNaN(Number(value)) || !Number.isInteger(num)) {
        return 'Points balance must be a whole number.';
      }
      if (num < 0) {
        return 'Points balance cannot be negative.';
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Validates a complete Frequent Flyer record object.
 *
 * @param {Object} record - The flyer record to validate
 * @param {Array} existingRecords - Current records to check uniqueness
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateFlyerRecord(record, existingRecords = []) {
  const errors = {};
  const currentId = record.id || null;

  const fieldsToCheck = [
    'memberNumber',
    'firstName',
    'lastName',
    'email',
    'tierStatus',
    'pointsBalance'
  ];

  for (const field of fieldsToCheck) {
    const error = validateField(field, record[field], existingRecords, currentId);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
