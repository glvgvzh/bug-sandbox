# Pantry Pilot

Pantry Pilot is a small household inventory app for keeping track of pantry staples, expiry dates, and the next shopping run. The team uses it internally as a lightweight React application and is preparing a public beta.

## Getting started

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. The app starts with sample data. Browser storage is used after the first change.

## Useful commands

```bash
npm run typecheck
npm test
npm run build
```

## Product notes

- Inventory changes are saved in the browser.
- “Sync pantry” uses a local mock service, so it works without a backend.
- The mock service occasionally rejects requests to exercise the same UI states as the staging API.
- Dates are entered in the user's local calendar.

## Team workflow

Pick one issue at a time, reproduce it before changing code, and keep the fix focused. Add a regression test when a bug can reasonably return unnoticed. Do not combine unrelated cleanup with a bug fix.
