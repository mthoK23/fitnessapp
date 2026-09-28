# FitTrack

A rebuilt React fitness journal with a lime, charcoal and warm-neutral design. Track completed or planned workouts, nutrition, body measurements and personal targets through one consistent set of forms and calculations.

## Run locally

Requires Node.js **22.12 or newer**.

```sh
npm install
npm start
```

Open **http://127.0.0.1:5173**. This command starts both the Vite frontend and the API on `127.0.0.1:3001`. Create an account with a username and a password of 12–128 characters. No API keys or cloud accounts are needed.

Use one hostname consistently: `localhost` and `127.0.0.1` have separate cookie sessions. Stop an existing server before starting another one on the same ports. Server code changes require restarting `npm start`; frontend changes update automatically.

## Included

- Server-verified accounts with salted password hashing, seven-day HttpOnly cookie sessions and logout.
- Account-owned records stored on disk; no passwords, session tokens or fitness records in local storage.
- Workout create/edit/delete, future plans, historical logs, search, date/status filters, sorting and activity calorie estimates. To complete a plan, edit its status and actual date/duration.
- Meal create/edit/delete with calories and macros, meal categories, daily totals and profile targets.
- Weight/body-fat check-ins, one measurement per day, edit/delete, time-based trend charts, date ranges, weight gain/loss goal calculations and derived milestones.
- Personal targets and JSON export; metric units throughout.
- Responsive navigation, keyboard-accessible native dialogs, labelled forms, useful empty/error states and route aliases for `/dashboard` and `/user`.
- At phone widths (700 px and below): persistent five-tab navigation, safe-area spacing, bottom-sheet forms, full-width primary actions, and measurement cards instead of a horizontal table. Desktop retains its sidebar.
- Appearance controls in Profile (and the desktop header/sign-in screen): System, Light, Dark, and High contrast. Only this visual preference is stored in the browser; account data stays on the server.
- Skeletons protect session loading and lazy-loaded screens. Failed initial loads stop and offer Retry; requests time out after 15 seconds. Pending forms are locked against duplicate actions, and failed saves keep the entered values. Create requests carry a stable identifier so retrying a lost response does not duplicate a record.

The original browser-only accounts do not migrate automatically. Their plaintext passwords are not a trustworthy authentication source. Existing browser storage and ZIP archives are preserved, but are not used by the new app. Create a new account. Food search has been replaced with reliable manual nutrition entry; reintroducing a provider requires a server-side proxy.

## Checks

```sh
npm test
npm run test:server
npm run build
npm audit
# Or all application checks:
npm run check
```

## Run a built app

```sh
npm run build
npm run serve
```

Open **http://127.0.0.1:3001**. The server serves `dist` and the API from the same origin, including direct links to React routes. The client cannot be deployed alone to GitHub Pages because authentication and persistence now need a server.

## Deploy from GitHub

The included `render.yaml` deploys the frontend and API together on Render, with a persistent disk for account data. Push this repository to GitHub, then in Render choose **New + → Blueprint**, connect the repository, and apply the detected blueprint. Render builds with `npm ci && npm run build`, starts with `npm run serve`, and supplies the HTTPS origin automatically. The persistent-disk plan is paid; without persistent storage, account data can be lost on redeploy.

GitHub Actions runs the tests and production build on each push and pull request. The generated `dist/` directory is intentionally ignored by Git; Render builds it during deployment. GitHub Pages is not suitable for the complete app because it cannot run the authentication API or persist account data.

For HTTPS deployment, set `NODE_ENV=production`, `APP_ORIGIN=https://your-host.example`, and optionally `PORT`, `HOST`, `DATA_DIR` in the server process environment. `.env.example` documents these settings; it is **not automatically loaded**. `HOST` defaults to loopback. Use a trusted TLS reverse proxy, and restrict upstream access.

The server stores private records in `.data/fittrack.json` by default. Back up this directory with access controls. Run only one server process per data directory: this simple atomic JSON store is suitable for local/small single-process use, not multiple instances. Sessions survive restart until expiry. Do not publish `.data`, environment files, or backups.

## Structure

| Path | Responsibility |
| --- | --- |
| `src/App.jsx` | Authentication screen, app shell and routes |
| `src/pages/` | Separate overview, workout/nutrition journals, progress and profile modules |
| `src/components.jsx` | Shared fields, modal, entry forms and record lists |
| `src/charts.jsx` | Accessible activity and weight visualizations |
| `src/domain.js` | Shared validation, dates and fitness calculations |
| `src/store.jsx`, `src/api.js` | Session lifecycle and server mutations |
| `src/styles.css` | Unified design tokens and responsive styles |
| `server/app.js` | Authentication, authorization, API and disk persistence |
| `AUDIT.md` | Original findings, remediation and remaining production work |

Public deployment still needs a production database, distributed throttling, recovery/verification flows, backup operations and monitoring. See [AUDIT.md](AUDIT.md) for the full assessment and security boundary.
