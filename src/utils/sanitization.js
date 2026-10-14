import DOMPurify from 'dompurify';

/**
 * Sanitizes a single input value against XSS attacks, treating it as plain text.
 * Strips all HTML tags, script elements, inline event handlers, and unsafe attributes.
 *
 * @param {any} value - The input value to sanitize
 * @returns {string} Safe plain-text string
 */
export function sanitizeInput(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Configure DOMPurify to strip all tags and attributes, ensuring pure safe text
  const clean = DOMPurify.sanitize(stringValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return clean;
}

/**
 * Sanitizes all string properties in a frequent flyer record object.
 * Non-string properties (such as numbers or dates) are preserved intact.
 *
 * @param {Object} record - The frequent flyer record object
 * @returns {Object} A new record object with sanitized string fields
 */
export function sanitizeRecord(record) {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitized = { ...record };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    }
  }

  return sanitized;
}
