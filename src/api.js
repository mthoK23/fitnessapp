export async function request(path, method = 'GET', body, userId, requestId) {
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`/api${path}`, {
      signal: controller.signal,
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'X-FitTrack-User': userId } : {}),
        ...(requestId ? { 'X-Request-ID': requestId } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    clearTimeout(timeout);
    if (controller.signal.aborted)
      throw new Error(
        'The request timed out. Saving is paused. Check your connection, then retry.',
      );
    throw new Error('Cannot reach FitTrack. Check your connection and try again.');
  }
  let result;
  try {
    result = await response.json();
  } catch {
    clearTimeout(timeout);
    throw new Error('The server returned an unexpected response. Please try again.');
  }
  clearTimeout(timeout);
  if (!response.ok)
    throw Object.assign(new Error(result.error || 'Something went wrong.'), {
      status: response.status,
    });
  return result;
}
