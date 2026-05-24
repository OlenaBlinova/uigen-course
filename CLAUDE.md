# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack, with Node.js compat shim)
npm run dev

# Build
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run migrations after schema changes
npx prisma migrate dev
```

The `NODE_OPTIONS='--require ./node-compat.cjs'` prefix in dev/build scripts patches Node 25's experimental Web Storage globals, which break SSR. Do not remove it.

## Architecture

UIGen is a Next.js 15 App Router application that lets users describe React components in a chat and see them rendered live.

### Request flow

1. User types a prompt in `ChatInterface` → Vercel AI SDK's `useChat` posts to `/api/chat`
2. The API route reconstructs a `VirtualFileSystem` from serialized state sent in the request body, then calls Claude (or the mock provider) with two tools: `str_replace_editor` and `file_manager`
3. Claude streams tool calls back; `onToolCall` in `ChatContext` dispatches each call to `FileSystemContext.handleToolCall`, which applies the change to the in-memory `VirtualFileSystem`
4. `PreviewFrame` watches `refreshTrigger` from `FileSystemContext`; on each change it runs `createImportMap` + `createPreviewHTML` (in `src/lib/transform/jsx-transformer.ts`) and writes the result to an `<iframe srcdoc>`
5. On stream finish, the API route persists `messages` and `fileSystem.serialize()` to the SQLite `Project` row (authenticated users only)

### Virtual file system

`VirtualFileSystem` (`src/lib/file-system.ts`) is a pure in-memory tree. It never touches disk. `serialize()` / `deserializeFromNodes()` convert it to/from a plain JSON-serializable `Record<string, FileNode>` for wire transfer and database storage. The root node is always `"/"`.

### Preview pipeline

`createImportMap` (jsx-transformer) Babel-transforms every `.jsx/.tsx/.js/.ts` file in the VFS to ESM, creates blob URLs for each, and builds a browser `<script type="importmap">`. Third-party package imports are resolved via `esm.sh`. The resulting HTML is injected into an `<iframe>` with `allow-scripts allow-same-origin`. The entry point defaults to `/App.jsx`.

### AI provider

`src/lib/provider.ts` exports `getLanguageModel()`. When `ANTHROPIC_API_KEY` is absent, it returns a `MockLanguageModel` that streams static hardcoded components. When the key is present, it uses `claude-haiku-4-5` via `@ai-sdk/anthropic`.

### Auth

Custom JWT auth using `jose` — no NextAuth. Sessions are stored in an `auth-token` httpOnly cookie (7-day TTL). `src/lib/auth.ts` is `server-only`. Anonymous users can use the app freely; their work is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts` so it can be associated with an account on sign-up.

### Database

Prisma with SQLite (`prisma/dev.db`). Two models: `User` (email + bcrypt password) and `Project` (stores `messages` and VFS `data` as JSON strings). The Prisma client is generated to `src/generated/prisma`.

### Context providers

`FileSystemProvider` → `ChatProvider` nesting is required — `ChatProvider` depends on `useFileSystem`. Both wrap `MainContent` in `src/app/main-content.tsx`.

### AI tool contracts

The system prompt (`src/lib/prompts/generation.tsx`) instructs Claude to:
- Always create `/App.jsx` as the entry point
- Use `@/` import aliases for local files (e.g. `@/components/Button`)
- Style with Tailwind, not inline styles
- Never create HTML files

The two tools exposed to Claude are `str_replace_editor` (create/str_replace/insert commands) and `file_manager` (rename/delete commands), both defined in `src/lib/tools/`.

## Code style

Use comments sparingly. Only comment complex code.
