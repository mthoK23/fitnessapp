import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, afterEach, beforeEach, it, expect } from 'vitest';
import App from './App';
import { AppProvider } from './store';
import { emptyData, localDate } from './domain';
import { ThemeProvider, Appearance } from './preferences';
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});
it('shows a skeleton until the session finishes loading', async () => {
  let resolve;
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  mount();
  expect(screen.getByRole('status', { name: 'Loading your FitTrack space' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(screen.queryByRole('button', { name: 'Log workout' })).not.toBeInTheDocument();
  resolve(await response({ user: { id: 'a', username: 'alex' }, data: emptyData() }));
  expect(await screen.findByRole('heading', { name: /keep you moving/i })).toBeInTheDocument();
});
it('locks form fields while saving and releases them after a failure', async () => {
  let rejectSave;
  vi.spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() =>
      response({ user: { id: 'a', username: 'alex' }, data: emptyData() }),
    )
    .mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          rejectSave = reject;
        }),
    );
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /keep you moving/i });
  await user.click(screen.getByRole('button', { name: 'Log workout', exact: true }));
  await user.type(screen.getByLabelText('Duration (minutes)'), '30');
  await user.click(screen.getByRole('button', { name: 'Save entry' }));
  expect(screen.getByLabelText('Duration (minutes)')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  rejectSave(new Error('Offline'));
  expect(await screen.findByRole('button', { name: 'Retry save' })).toBeEnabled();
  expect(screen.getByLabelText('Duration (minutes)')).toHaveValue(30);
});
it('pauses a failed initial load until an explicit retry', async () => {
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('Offline'))
    .mockImplementation(() => response({ error: 'Signed out' }, 401));
  const user = userEvent.setup();
  mount();
  expect(await screen.findByText('LOADING PAUSED')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Retry loading' }));
  expect(await screen.findByLabelText('Username')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('provides five direct mobile tabs with the current tab marked', async () => {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: query === '(max-width: 700px)',
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    response({ user: { id: 'a', username: 'alex' }, data: emptyData() }),
  );
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /keep you moving/i });
  expect(screen.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await user.click(screen.getByRole('link', { name: 'Nutrition', exact: true }));
  expect(await screen.findByRole('heading', { name: 'Your nutrition.' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Nutrition', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.queryByRole('button', { name: 'Open navigation' })).not.toBeInTheDocument();
});
it('remembers dark and high contrast appearance without storing account information', async () => {
  const user = userEvent.setup();
  const view = render(
    <ThemeProvider>
      <Appearance />
    </ThemeProvider>,
  );
  await user.click(screen.getByRole('radio', { name: 'Dark', exact: true }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem('fittrack-appearance')).toBe('dark');
  view.unmount();
  render(
    <ThemeProvider>
      <Appearance />
    </ThemeProvider>,
  );
  expect(screen.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked();
  await user.click(screen.getByRole('radio', { name: 'High contrast', exact: true }));
  expect(document.documentElement.dataset.theme).toBe('contrast');
});
it('keeps a failed meal submission open and preserves the entered values', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() =>
      response({ user: { id: 'a', username: 'alex' }, data: emptyData() }),
    )
    .mockRejectedValue(new Error('Offline'));
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /keep you moving/i });
  await user.click(screen.getByRole('button', { name: 'Log a meal', exact: true }));
  await user.type(screen.getByLabelText('Meal name'), 'Oats');
  await user.type(screen.getByLabelText('Calories (kcal)'), '350');
  await user.click(screen.getByRole('button', { name: 'Save entry' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach FitTrack');
  expect(screen.getByLabelText('Meal name')).toHaveValue('Oats');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('edits an existing measurement and updates the history and trend', async () => {
  const data = emptyData();
  data.measurements = [{ id: 'm1', date: localDate(), weight: 80, bodyFat: null }];
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() => response({ user: { id: 'a', username: 'alex' }, data }))
    .mockImplementation((url, options) =>
      response({ data: { ...data, measurements: [{ ...JSON.parse(options.body), id: 'm1' }] } }),
    );
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /keep you moving/i });
  await user.click(screen.getByRole('link', { name: 'Progress ↗' }));
  await user.click(await screen.findByRole('button', { name: `Edit measurement ${localDate()}` }));
  await user.clear(screen.getByLabelText('Weight (kg)'));
  await user.type(screen.getByLabelText('Weight (kg)'), '79.5');
  await user.click(screen.getByRole('button', { name: 'Save entry' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('cell', { name: '79.5 kg' })).toBeInTheDocument();
  expect(fetch.mock.calls[1][0]).toBe('/api/data/measurements/m1');
  expect(fetch.mock.calls[1][1].headers['X-FitTrack-User']).toBe('a');
});
it('clears account data on logout and does not carry it into another account', async () => {
  const data = emptyData();
  data.profile.name = 'Private Alex';
  vi.spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() => response({ user: { id: 'a', username: 'alex' }, data }))
    .mockImplementationOnce(() => response({ ok: true }))
    .mockImplementationOnce(() =>
      response({ user: { id: 'b', username: 'blake' }, data: emptyData() }),
    );
  const user = userEvent.setup();
  mount();
  await screen.findByText('Private Alex');
  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  await screen.findByRole('heading', { name: /back for a better you/i });
  expect(screen.queryByText('Private Alex')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Username'), 'blake');
  await user.type(screen.getByLabelText('Password'), 'a-valid-password-123');
  await user.click(screen.getAllByRole('button', { name: /^Sign in$/ }).at(-1));
  expect(await screen.findByText('blake')).toBeInTheDocument();
  expect(screen.queryByText('Private Alex')).not.toBeInTheDocument();
});
const response = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: async () => body });
const mount = () =>
  render(
    <MemoryRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );
it('restores a server session and renders real empty states', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    response({
      user: { id: 'a', username: 'alex' },
      data: { ...emptyData(), profile: { ...emptyData().profile, name: 'Alex' } },
    }),
  );
  mount();
  expect(await screen.findByRole('heading', { name: /keep you moving/i })).toBeInTheDocument();
  expect(screen.getByText('Your next chapter starts here')).toBeInTheDocument();
});
it('requires sign in and shows server errors without entering the app', async () => {
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() => response({ error: 'Signed out' }, 401))
    .mockImplementation(() => response({ error: 'Incorrect username or password.' }, 401));
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /back for a better you/i });
  await user.type(screen.getByLabelText('Username'), 'alex');
  await user.type(screen.getByLabelText('Password'), 'wrong-password-123');
  await user.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect username');
});
it('saves a workout and refreshes dashboard totals from the server response', async () => {
  const data = emptyData();
  data.profile.name = 'Alex';
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementationOnce(() => response({ user: { id: 'a', username: 'alex' }, data }))
    .mockImplementation((url, options) => {
      const entry = JSON.parse(options.body);
      return response({ data: { ...data, workouts: [{ ...entry, id: 'w1' }] } }, 201);
    });
  const user = userEvent.setup();
  mount();
  await screen.findByRole('heading', { name: /keep you moving/i });
  await user.click(screen.getByRole('button', { name: /^Log workout$/ }));
  await user.type(screen.getByLabelText('Duration (minutes)'), '30');
  await user.click(screen.getByRole('button', { name: 'Save entry' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('Running')).toBeInTheDocument();
  expect(fetch.mock.calls[1][0]).toBe('/api/data/workouts');
});
