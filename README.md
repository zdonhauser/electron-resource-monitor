# Resource Monitor

A desktop application for real-time system telemetry monitoring and visualization, built with modern web technologies and Electron. This project serves as a comprehensive portfolio demonstration showcasing full-stack development skills, advanced architecture patterns, and production-ready development practices.

## Project Purpose

This application was developed as a **skill-building exercise** and **portfolio demonstration** to showcase:

- **Modern Desktop Development**: Electron with security best practices
- **Advanced React Patterns**: Redux Toolkit, custom hooks, performance optimization
- **Real-time Data Visualization**: Interactive charts with Plotly.js
- **System Programming**: Native system metrics collection
- **Production Architecture**: IPC communication, database persistence, comprehensive testing
- **DevOps Practices**: CI/CD pipelines, automated testing, code quality tools

## Features

### Currently Implemented

#### Real-time System Monitoring
- **CPU Metrics**: Usage percentage, load averages, core-level monitoring
- **Memory Tracking**: RAM usage, swap utilization, memory pressure indicators
- **Disk I/O**: Read/write speeds, disk usage statistics
- **Network Activity**: Upload/download speeds, packet statistics
- **Process Monitoring**: Top processes by CPU/memory usage

#### Interactive Visualizations
- **Live Charts**: Real-time updating with Plotly.js
- **Pan & Zoom**: Interactive chart exploration
- **Multiple Chart Types**: Line charts, gauges, sparklines
- **Dark/Light Themes**: Full theme support with Tailwind CSS

#### System Features
- **Configurable Sampling**: Adjustable collection intervals (250ms default)
- **Data Export**: JSON/CSV export functionality
- **Desktop Notifications**: Configurable threshold alerts
- **Settings Management**: Persistent user preferences

#### Technical Architecture
- **Secure IPC**: Context isolation with Zod schema validation
- **State Management**: Redux Toolkit with ring buffer pattern for telemetry
- **Database Persistence**: SQLite for settings and historical data
- **Performance Optimized**: Efficient data handling and rendering
- **Comprehensive Testing**: Unit, integration, and E2E test coverage

## Technology Stack

### Core Technologies
- **Runtime**: Electron 38+ with Node.js
- **Frontend**: React 19 + TypeScript
- **Build System**: Electron Vite 4.0+ with Vite 7+
- **State Management**: Redux Toolkit with Reselect
- **Styling**: Tailwind CSS
- **Charts**: Plotly.js with react-plotly.js
- **Database**: SQLite (better-sqlite3)
- **Routing**: React Router v7 in HashRouter mode
- **Schema Validation**: Zod for IPC and data validation

### Development Tools
- **TypeScript**: Strict mode with path aliases
- **ESLint**: Flat config with comprehensive rules
- **Prettier**: Consistent code formatting
- **Testing**: Jest + React Testing Library + Cypress
- **Package Manager**: npm with committed lock file

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- macOS (primary target platform)

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd resource-monitor

# Install dependencies
npm install

# Start development server
npm run dev

# Run with hot reload for renderer only
npm run dev:renderer
```

### Building & Testing

```bash
# Build for production
npm run build

# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:e2e:open      # Open Cypress GUI

# Code quality checks
npm run lint               # ESLint
npm run format             # Prettier
npm run typecheck          # TypeScript validation
```

### Packaging

```bash
# Package for current platform
npm run package

# Create distributable
npm run make

# Create macOS distributable
npm run make:mac
```

## Project Structure

```
├── src/
│   ├── main/              # Electron main process
│   │   ├── services/      # Core services (database, telemetry)
│   │   ├── ipc/          # IPC handlers
│   │   └── utils/        # Main process utilities
│   ├── preload/          # Secure preload scripts
│   ├── renderer/         # React application
│   │   └── src/
│   │       ├── app/      # Redux store and slices
│   │       ├── features/ # Feature-based components
│   │       ├── components/ # Shared UI components
│   │       └── hooks/    # Custom React hooks
│   └── shared/           # Shared types and schemas
├── tests/                # Comprehensive test suite
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # Cypress E2E tests
└── dist-electron/       # Built application
```

## Security Features

- **Context Isolation**: Renderer process runs in isolated context
- **No Node Integration**: Renderer cannot access Node.js APIs directly
- **Secure Preload**: Limited, validated API surface
- **CSP Headers**: Content Security Policy implementation
- **Schema Validation**: All IPC communication validated with Zod

## Architecture Highlights

### IPC Communication Pattern
```typescript
// Secure, validated communication between processes
const telemetryData = await window.telemetry.getCpuMetrics()
// All data validated with Zod schemas
```

### Redux Ring Buffer Pattern
```typescript
// Efficient telemetry data management
const cpuData = useSelector(selectRecentCpuData(300)) // Last 5 minutes
```

### Performance Optimization
- Selective metric subscriptions
- Efficient data structures
- Memoized selectors
- Lazy loading for development features

## Coming Soon

### Planned Features
- **Multi-Host Monitoring**: MQTT-based distributed monitoring
- **Advanced Analytics**: Historical trend analysis and predictions
- **Custom Dashboards**: User-configurable layouts and widgets
- **Plugin System**: Extensible architecture for custom metrics
- **Cross-Platform Support**: Windows and Linux compatibility
- **Auto-Updates**: Seamless application updates
- **Data Retention Policies**: Configurable data lifecycle management
- **Performance Profiling**: Advanced system bottleneck detection

### Technical Improvements
- **XState Integration**: State machine-based device lifecycle management
- **WebGL Acceleration**: Hardware-accelerated chart rendering
- **Worker Threads**: Background data processing
- **Accessibility Enhancements**: Full WCAG compliance
- **Internationalization**: Multi-language support

## Testing Strategy

- **Unit Tests**: Service logic, utilities, and pure functions
- **Component Tests**: React component behavior and rendering
- **Integration Tests**: Cross-process communication and data flow
- **E2E Tests**: Complete user workflows and system integration
- **Performance Tests**: Memory usage and rendering performance

## Development Metrics

- **Test Coverage**: Comprehensive coverage across all layers
- **Type Safety**: 100% TypeScript with strict mode
- **Code Quality**: ESLint + Prettier with zero warnings
- **Security**: Electron security best practices implemented
- **Performance**: Optimized for real-time data handling

## Design Philosophy

- **Performance-Oriented**: Efficient real-time data processing
- **Security-Conscious**: Electron security best practices
- **Extensible**: Designed for future multi-host capabilities
- **Developer-Friendly**: Comprehensive tooling and documentation

## License

ISC License - This project is for portfolio demonstration purposes.

## Contributing

This is a portfolio project, but feedback and suggestions are welcome! Feel free to open issues or submit pull requests.

---

**Built as a portfolio demonstration of modern desktop application development**