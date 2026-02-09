# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side encrypted financial dashboard ("Financial Broccoli" / ファイナンシャル ブロッコリー) for tracking net worth and analyzing investment transactions. All data stays in the browser — the SQLite database is encrypted with AES-GCM (PBKDF2-derived key) and stored as a static file. No backend server handles financial data.

## Commands

- `bun install` — install dependencies
- `bun run dev` — start Vite dev server (binds 0.0.0.0)
- `bun run build` — typecheck with `tsc` then build with Vite
- `bun run lint` — ESLint (zero warnings allowed)
- `bun run db:seed` — seed a fresh SQLite database at `./db/sqlite.db`
- `bun run db:migrate` — apply Drizzle migration SQL files from `./drizzle/`
- `DB_PASSWORD=<pw> bun run db:encrypt` — encrypt `./db/sqlite.db` → `./public/encrypted-sqlite.db`

## Architecture

### Runtime database flow

The app uses **sql.js** (SQLite compiled to WASM) running entirely in the browser. On login, the encrypted db (`public/encrypted-sqlite.db`) is fetched, decrypted in-memory using the Web Crypto API, and wrapped with **Drizzle ORM**. After data entry the user downloads the re-encrypted db file to persist changes.

The encrypted file format is: `[16-byte salt][12-byte IV][AES-GCM ciphertext]`.

### Key layers

| Layer | Files | Notes |
|---|---|---|
| Schema | `src/schema.ts` | Drizzle SQLite schema — `users` and `financialData` tables |
| Encryption | `src/utils/encryption.ts` (browser), `db/encrypt.ts` (Node/Bun) | Browser uses Web Crypto; server script uses Node `crypto`. Same wire format. |
| Password storage | `src/utils/passwordStorage.ts` | Stores password in localStorage (base64-encoded) for session persistence |
| Data entry | `src/components/DataEntryForm.tsx` | Income/worth fields accept math expressions via `mathjs` (`evaluateMathExpression` in `transactionHelpers.ts`) |
| Net worth chart | `src/components/NetWorthGraph.tsx` | Uses **Dygraphs** with dual y-axes |
| Transaction analysis | `src/components/TransactionAnalysis.tsx` | CSV upload for investment transaction data (Dutch-format DeGiro exports), grouped by ISIN |
| Transaction charts | `src/components/UplotChart.tsx` | Per-security price history via **uPlot** |
| Transaction table | `src/components/TransactionsTable.tsx` | Generic sortable table, used for both summary and detail views |

### Important patterns

- The Drizzle `db` instance is created from sql.js in `App.tsx` and passed down as a prop — there is no context provider or global store.
- `dataVersion` (a counter in App state) is incremented after inserts to trigger chart re-renders.
- Transaction CSV parsing assumes DeGiro export format with Dutch column names (Datum, Tijd, Koers, etc.) — see `RawTransaction` interface in `transactionHelpers.ts`.
- `sql-wasm.js` and `sql-wasm.wasm` are loaded from `public/` via a script tag in `index.html` and `window.initSqlJs`.

## Tech Stack

- **Bun** as package manager and script runner
- **Vite** + **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS 3** for styling
- **Drizzle ORM** with **sql.js** (SQLite in WASM)
- **Dygraphs** (net worth chart) and **uPlot** (transaction price charts)
- **mathjs** for evaluating math expressions in form inputs
