import { describe, it, expect } from 'vitest';
import { validateFlyerRecord, validateField } from '../../src/utils/validation.js';

describe('Form Validation Utilities', () => {
  const validRecord = {
    memberNumber: 'FF-1001',
    firstName: 'Amelia',
    lastName: 'Earhart',
    email: 'amelia@aviation.org',
    tierStatus: 'Gold',
    pointsBalance: 75000
  };

  it('should accept a completely valid flyer record', () => {
    const result = validateFlyerRecord(validRecord);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  describe('Required Fields Validation', () => {
    it('should reject empty or whitespace-only memberNumber', () => {
      const result = validateFlyerRecord({ ...validRecord, memberNumber: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.errors.memberNumber).toBeDefined();
    });

    it('should reject empty firstName', () => {
      const result = validateFlyerRecord({ ...validRecord, firstName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
    });

    it('should reject empty lastName', () => {
      const result = validateFlyerRecord({ ...validRecord, lastName: '  ' });
      expect(result.isValid).toBe(false);
      expect(result.errors.lastName).toBeDefined();
    });
  });

  describe('Email Format Validation', () => {
    it('should reject invalid email formats without @ or domain', () => {
      const invalidEmails = ['plainaddress', 'user@', '@domain.com', 'user@domain'];
      for (const email of invalidEmails) {
        const result = validateFlyerRecord({ ...validRecord, email });
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBeDefined();
      }
    });

    it('should accept standard valid email addresses', () => {
      const validEmails = ['user@example.com', 'first.last@airline.co.uk'];
      for (const email of validEmails) {
        const result = validateFlyerRecord({ ...validRecord, email });
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Tier Status Validation', () => {
    it('should reject invalid tier values outside allowed options', () => {
      const result = validateFlyerRecord({ ...validRecord, tierStatus: 'Diamond' });
      expect(result.isValid).toBe(false);
      expect(result.errors.tierStatus).toBeDefined();
    });

    it('should accept valid tiers (Silver, Gold, Platinum, Executive)', () => {
      const tiers = ['Silver', 'Gold', 'Platinum', 'Executive'];
      for (const tierStatus of tiers) {
        const result = validateFlyerRecord({ ...validRecord, tierStatus });
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Points Balance Validation', () => {
    it('should reject negative point values', () => {
      const result = validateFlyerRecord({ ...validRecord, pointsBalance: -100 });
      expect(result.isValid).toBe(false);
      expect(result.errors.pointsBalance).toBeDefined();
    });

    it('should reject non-integer point values', () => {
      const result = validateFlyerRecord({ ...validRecord, pointsBalance: 125.75 });
      expect(result.isValid).toBe(false);
      expect(result.errors.pointsBalance).toBeDefined();
    });

    it('should reject non-numeric point values', () => {
      const result = validateFlyerRecord({ ...validRecord, pointsBalance: 'many' });
      expect(result.isValid).toBe(false);
      expect(result.errors.pointsBalance).toBeDefined();
    });

    it('should accept zero as a valid points balance', () => {
      const result = validateFlyerRecord({ ...validRecord, pointsBalance: 0 });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Duplicate Member Number Check', () => {
    const existingRecords = [
      { id: '1', memberNumber: 'FF-1001', firstName: 'John', lastName: 'Doe' },
      { id: '2', memberNumber: 'FF-2002', firstName: 'Jane', lastName: 'Smith' }
    ];

    it('should reject duplicate member number on new record', () => {
      const result = validateFlyerRecord({ ...validRecord, memberNumber: 'FF-1001' }, existingRecords);
      expect(result.isValid).toBe(false);
      expect(result.errors.memberNumber).toMatch(/already exists/i);
    });

    it('should allow retaining same member number when editing current record', () => {
      const editingRecord = { ...validRecord, id: '1', memberNumber: 'FF-1001' };
      const result = validateFlyerRecord(editingRecord, existingRecords);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Single Field Validation', () => {
    it('should validate individual field dynamically for live feedback', () => {
      expect(validateField('email', 'not-an-email')).toBeTruthy();
      expect(validateField('email', 'amelia@sky.com')).toBeNull();
      expect(validateField('pointsBalance', -1)).toBeTruthy();
      expect(validateField('pointsBalance', 500)).toBeNull();
    });
  });
});
