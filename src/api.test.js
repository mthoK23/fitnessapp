import { afterEach, expect, it, vi } from 'vitest';
import { request } from './api';
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
it('aborts a stalled request and does not retry it automatically', async () => {
  vi.useFakeTimers();
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
    (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('Aborted')));
      }),
  );
  const pending = request('/session');
  const assertion = expect(pending).rejects.toThrow('timed out');
  await vi.advanceTimersByTimeAsync(15000);
  await assertion;
  expect(fetch).toHaveBeenCalledTimes(1);
});
