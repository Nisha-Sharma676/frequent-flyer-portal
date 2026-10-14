import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeRecord } from '../../src/utils/sanitization.js';

describe('Input Sanitization Utility (XSS Prevention)', () => {
  it('should strip script tags from input string', () => {
    const maliciousInput = '<script>alert("xss")</script>John';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).toBe('John');
    expect(sanitized).not.toContain('<script>');
  });

  it('should remove inline event handlers such as onerror and onclick', () => {
    const maliciousInput = '<img src="invalid.jpg" onerror="alert(1)">Alice';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toBe('Alice');
  });

  it('should neutralize javascript pseudo-protocol links', () => {
    const maliciousInput = '<a href="javascript:alert(1)">Click Here</a>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('javascript:');
  });

  it('should preserve valid text with accents, hyphens, and apostrophes', () => {
    const validName = "Mary-Anne O'Connor";
    const sanitized = sanitizeInput(validName);
    expect(sanitized).toBe("Mary-Anne O'Connor");
  });

  it('should return an empty string when given null, undefined, or non-string values', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(12345)).toBe('12345');
  });

  it('should sanitize all string fields in a frequent flyer record object', () => {
    const dirtyRecord = {
      memberNumber: '<script>evil()</script>FF-1001',
      firstName: '<b onmouseover="alert(1)">Bruce</b>',
      lastName: '<iframe src="evil.com"></iframe>Wayne',
      email: 'bruce@wayne.com',
      tierStatus: 'Gold',
      pointsBalance: 50000
    };

    const cleanRecord = sanitizeRecord(dirtyRecord);

    expect(cleanRecord.memberNumber).toBe('FF-1001');
    expect(cleanRecord.firstName).toBe('Bruce');
    expect(cleanRecord.lastName).toBe('Wayne');
    expect(cleanRecord.email).toBe('bruce@wayne.com');
    expect(cleanRecord.tierStatus).toBe('Gold');
    expect(cleanRecord.pointsBalance).toBe(50000);
  });
});
