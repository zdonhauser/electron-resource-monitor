# Technology Stack

## Core Technologies

- **Runtime**: Electron 38+ with Node.js
- **Frontend**: React 19 + TypeScript
- **Build System**: Electron Vite 4.0+ with Vite 7+
- **State Management**: Redux Toolkit with Reselect
- **Styling**: Tailwind CSS (no other CSS frameworks)
- **Charts**: Plotly.js with react-plotly.js
- **Database**: SQLite (better-sqlite3) in main process
- **Routing**: React Router v7 in HashRouter mode
- **Schema Validation**: Zod for IPC and data validation

## Development Tools

- **TypeScript**: Strict mode enabled with path aliases
- **ESLint**: Flat config with TypeScript, React, and Prettier rules
- **Prettier**: Code formatting with consistent style
- **Testing**: Jest + React Testing Library + Cypress
- **Package Manager**: npm (package-lock.json committed)

## Build & Development Commands

```bash
# Development
npm run dev                 # Start Electron in dev mode
npm run dev:renderer       # Start renderer with hot reload

# Building
npm run build              # Build all processes
npm run typecheck          # Type check all TypeScript
npm run typecheck:node     # Type check main/preload
npm run typecheck:web      # Type check renderer

# Testing
npm run test               # Run unit tests
npm run test:unit          # Run unit tests only
npm run test:e2e           # Run Cypress E2E tests
npm run test:e2e:open      # Open Cypress GUI
npm run test:all           # Run all tests
npm run test:ci            # CI test pipeline

# Code Quality
npm run lint               # ESLint check
npm run format             # Prettier format

# Packaging
npm run package            # Package for current platform
npm run make               # Create distributable
npm run make:mac           # Create macOS distributable
```

## Architecture Patterns

- **IPC Communication**: Secure preload script with Zod validation
- **State Management**: Redux slices with ring buffer pattern for telemetry
- **Component Structure**: Feature-based organization
- **Error Handling**: Graceful degradation with user feedback
- **Security**: Context isolation, no node integration, CSP headers

## Path Aliases

- `@shared/*` → `src/shared/*` (types, schemas, constants)
- `@main/*` → `src/main/*` (main process code)
- `@renderer/*` → `src/renderer/src/*` (React app)
- `@preload/*` → `src/preload/*` (preload scripts)