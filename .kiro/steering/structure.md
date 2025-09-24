# Project Structure

## Root Directory

```
├── src/                    # Source code
├── tests/                  # All test files
├── dist-electron/          # Built Electron app
├── node_modules/           # Dependencies
├── .kiro/                  # Kiro configuration
└── package.json           # Project configuration
```

## Source Code Organization (`src/`)

### Main Process (`src/main/`)
- `index.ts` - Entry point, window management, app lifecycle
- `ipc/handlers.ts` - IPC message handlers
- `services/` - Core services
  - `database/DatabaseService.ts` - SQLite operations
  - `sampler/TelemetrySampler.ts` - System metrics collection
- `utils/` - Main process utilities

### Preload (`src/preload/`)
- `index.ts` - Secure API exposure to renderer

### Renderer (`src/renderer/`)
- `index.html` - HTML entry point
- `src/` - React application
  - `App.tsx` - Root component with routing
  - `main.tsx` - React app bootstrap
  - `index.css` - Global styles (Tailwind)
  - `app/` - Redux store and slices
    - `store.ts` - Redux store configuration
    - `*Slice.ts` - Feature-specific state slices
  - `features/` - Feature-based components
    - `telemetry/` - Dashboard and widgets
    - `settings/` - Configuration UI
    - `alerts/` - Alert management
  - `components/` - Shared UI components
  - `hooks/` - Custom React hooks
  - `types/` - Renderer-specific types
  - `utils/` - Renderer utilities

### Shared (`src/shared/`)
- `types/` - TypeScript interfaces shared across processes
- `schemas/` - Zod validation schemas
- `constants/` - Shared constants (IPC channels, etc.)

## Test Organization (`tests/`)

### Unit Tests (`tests/unit/`)
- Component tests: `*.test.tsx`
- Service tests: `*.test.ts`
- Slice tests: `*.test.ts`

### Integration Tests (`tests/integration/`)
- Cross-process communication tests
- Database integration tests

### E2E Tests (`tests/e2e/`)
- `*.cy.ts` - Cypress test files
- `support/` - Cypress configuration and commands
- `fixtures/` - Test data
- `screenshots/` - Test failure screenshots

## Configuration Files

- `electron.vite.config.ts` - Build configuration
- `tsconfig*.json` - TypeScript configurations
- `eslint.config.js` - Linting rules
- `jest.config.js` - Unit test configuration
- `cypress.config.ts` - E2E test configuration
- `tailwind.config.js` - Styling configuration

## Naming Conventions

- **Files**: PascalCase for components/classes, camelCase for utilities
- **Directories**: lowercase with hyphens for multi-word names
- **Components**: PascalCase, match filename
- **Hooks**: camelCase starting with "use"
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

## Import Patterns

- Use path aliases (`@shared`, `@main`, `@renderer`, `@preload`)
- Group imports: external → internal → relative
- No default exports for utilities, prefer named exports
- Components can use default exports