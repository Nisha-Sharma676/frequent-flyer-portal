/**
 * Service handling asynchronous CRUD and search operations against browser localStorage.
 */
export class FrequentFlyerService {
  constructor(storageKey = 'frequent_flyer_records', simulatedDelayMs = 0) {
    this.storageKey = storageKey;
    this.simulatedDelayMs = simulatedDelayMs;
  }

  /**
   * Helper to simulate non-blocking asynchronous latency if configured.
   */
  async _delay() {
    if (this.simulatedDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedDelayMs));
    }
  }

  /**
   * Reads raw records array from localStorage.
   * @private
   */
  _readStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Writes records array to localStorage.
   * @private
   */
  _writeStorage(records) {
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  /**
   * Generates a unique identifier.
   * @private
   */
  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `ff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Retrieves all records.
   * @returns {Promise<Array>}
   */
  async getAll() {
    await this._delay();
    return this._readStorage();
  }

  /**
   * Retrieves a single record by its unique ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    await this._delay();
    const records = this._readStorage();
    const record = records.find((item) => item.id === id);
    return record || null;
  }

  /**
   * Creates and persists a new record.
   * @param {Object} recordData
   * @returns {Promise<Object>}
   */
  async create(recordData) {
    await this._delay();
    const records = this._readStorage();
    const newRecord = {
      ...recordData,
      id: recordData.id || this._generateId(),
      pointsBalance: Number(recordData.pointsBalance),
      createdAt: recordData.createdAt || new Date().toISOString()
    };
    records.push(newRecord);
    this._writeStorage(records);
    return newRecord;
  }

  /**
   * Updates an existing record by its ID.
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    await this._delay();
    const records = this._readStorage();
    const index = records.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updatedRecord = {
      ...records[index],
      ...updateData,
      id: records[index].id, // Prevent overriding original ID
      createdAt: records[index].createdAt, // Preserve original creation timestamp
      pointsBalance: updateData.pointsBalance !== undefined
        ? Number(updateData.pointsBalance)
        : records[index].pointsBalance
    };

    records[index] = updatedRecord;
    this._writeStorage(records);
    return updatedRecord;
  }

  /**
   * Deletes a record by ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    await this._delay();
    const records = this._readStorage();
    const index = records.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    records.splice(index, 1);
    this._writeStorage(records);
    return true;
  }

  /**
   * Searches records matching a query across memberNumber, name, and email.
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async search(query) {
    await this._delay();
    const records = this._readStorage();
    if (!query || String(query).trim() === '') {
      return records;
    }

    const q = String(query).toLowerCase().trim();
    return records.filter((r) => {
      const memberNumber = (r.memberNumber || '').toLowerCase();
      const firstName = (r.firstName || '').toLowerCase();
      const lastName = (r.lastName || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      return (
        memberNumber.includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        email.includes(q)
      );
    });
  }
}
