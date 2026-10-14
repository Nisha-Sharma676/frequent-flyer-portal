import { beforeEach } from 'vitest';

beforeEach(() => {
  // Clear localStorage and DOM before each test run
  localStorage.clear();
  document.body.innerHTML = '';
});
