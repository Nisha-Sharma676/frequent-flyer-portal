import { describe, it, expect, beforeEach } from 'vitest';
import { FrequentFlyerService } from '../../src/services/frequentFlyerService.js';

describe('FrequentFlyerService (Storage & Async Operations)', () => {
  let service;
  const TEST_KEY = 'test_frequent_flyers';

  beforeEach(() => {
    localStorage.clear();
    service = new FrequentFlyerService(TEST_KEY);
  });

  it('should return an empty array when no records have been stored', async () => {
    const records = await service.getAll();
    expect(Array.isArray(records)).toBe(true);
    expect(records).toHaveLength(0);
  });

  it('should create and persist a new frequent flyer record', async () => {
    const newRecord = {
      memberNumber: 'FF-1001',
      firstName: 'Charles',
      lastName: 'Lindbergh',
      email: 'charles@flight.com',
      tierStatus: 'Platinum',
      pointsBalance: 120000
    };

    const created = await service.create(newRecord);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeDefined();
    expect(created.memberNumber).toBe('FF-1001');

    const allRecords = await service.getAll();
    expect(allRecords).toHaveLength(1);
    expect(allRecords[0].id).toBe(created.id);
  });

  it('should fetch a record by its id', async () => {
    const created = await service.create({
      memberNumber: 'FF-2002',
      firstName: 'Orville',
      lastName: 'Wright',
      email: 'orville@wright.org',
      tierStatus: 'Executive',
      pointsBalance: 250000
    });

    const found = await service.getById(created.id);
    expect(found).not.toBeNull();
    expect(found.firstName).toBe('Orville');

    const notFound = await service.getById('non-existent-id');
    expect(notFound).toBeNull();
  });

  it('should update an existing record by id', async () => {
    const created = await service.create({
      memberNumber: 'FF-3003',
      firstName: 'Wilbur',
      lastName: 'Wright',
      email: 'wilbur@wright.org',
      tierStatus: 'Silver',
      pointsBalance: 15000
    });

    const updated = await service.update(created.id, {
      tierStatus: 'Gold',
      pointsBalance: 30000
    });

    expect(updated).not.toBeNull();
    expect(updated.tierStatus).toBe('Gold');
    expect(updated.pointsBalance).toBe(30000);
    expect(updated.memberNumber).toBe('FF-3003'); // Preserved original field

    const fetched = await service.getById(created.id);
    expect(fetched.tierStatus).toBe('Gold');
  });

  it('should delete a record by id and persist removal', async () => {
    const item1 = await service.create({
      memberNumber: 'FF-4001',
      firstName: 'Bessie',
      lastName: 'Coleman',
      email: 'bessie@aviation.org',
      tierStatus: 'Platinum',
      pointsBalance: 95000
    });

    const item2 = await service.create({
      memberNumber: 'FF-4002',
      firstName: 'Harriet',
      lastName: 'Quimby',
      email: 'harriet@aviation.org',
      tierStatus: 'Silver',
      pointsBalance: 10000
    });

    const deleteSuccess = await service.delete(item1.id);
    expect(deleteSuccess).toBe(true);

    const remaining = await service.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(item2.id);
  });

  it('should filter records case-insensitively using search', async () => {
    await service.create({
      memberNumber: 'FF-5001',
      firstName: 'Chuck',
      lastName: 'Yeager',
      email: 'chuck@speed.com',
      tierStatus: 'Executive',
      pointsBalance: 300000
    });

    await service.create({
      memberNumber: 'FF-5002',
      firstName: 'Sally',
      lastName: 'Ride',
      email: 'sally@space.org',
      tierStatus: 'Executive',
      pointsBalance: 500000
    });

    const resultsByName = await service.search('yeager');
    expect(resultsByName).toHaveLength(1);
    expect(resultsByName[0].firstName).toBe('Chuck');

    const resultsByNumber = await service.search('ff-5002');
    expect(resultsByNumber).toHaveLength(1);
    expect(resultsByNumber[0].firstName).toBe('Sally');

    const resultsByEmail = await service.search('@space.org');
    expect(resultsByEmail).toHaveLength(1);

    const resultsEmpty = await service.search('nonexistent');
    expect(resultsEmpty).toHaveLength(0);
  });
});
