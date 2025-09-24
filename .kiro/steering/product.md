# Product Overview

## Resource Monitor Desktop App

A desktop application for macOS (Apple Silicon) that provides real-time system telemetry monitoring and visualization. The app streams, visualizes, and analyzes local machine vitals including CPU, GPU, memory, disk, network, and process statistics.

## Key Features

- **Real-time Metrics**: Live system telemetry sampled every 250ms
- **Interactive Visualizations**: Plotly-powered charts with pan/zoom capabilities
- **Desktop Notifications**: Configurable alerts with threshold monitoring
- **Data Export**: JSON/CSV export functionality
- **Dark/Light Themes**: Full theme support with Tailwind CSS

## Target Platform

- Primary: macOS Apple Silicon (arm64)
- Future: Cross-platform support planned

## Architecture Philosophy

- **Security-First**: Electron security best practices with context isolation
- **Performance**: Efficient data handling with Redux ring buffers
- **Extensibility**: Designed for future MQTT multi-host monitoring
- **Testing**: Comprehensive test coverage (unit, component, E2E)