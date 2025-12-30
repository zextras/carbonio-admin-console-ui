# Admin UI Bootstrap - Architecture Documentation

## Overview

**Admin UI Bootstrap** is the shell application for the Zextras Carbonio Admin Console. It serves as the main entry point and orchestrator for all admin UI applications, providing a plugin-based architecture where other `admin-ui-*` apps are dynamically loaded and integrated.

### Key Responsibilities

- **Application Shell**: Provides the main UI framework with header, navigation, and content areas
- **Plugin Manager**: Dynamically loads and manages child admin applications
- **State Orchestrator**: Centralized state management using Zustand
- **Router Hub**: Manages routing for all registered apps via react-router-dom
- **Service Provider**: Shared services including i18n, API communication, and server state

## Directory Structure

```
apps/admin-ui-bootstrap/
├── src/
│   ├── boot/                    # Application initialization
│   │   ├── bootstrapper.tsx     # Main initialization component
│   │   └── bootstrapper-router.tsx  # Router configuration
│   ├── apps/                    # App loading and management
│   │   ├── app-loader.tsx       # Dynamic app loader
│   │   └── types.ts             # App manifest types
│   ├── shell/                   # Core UI components
│   │   ├── shell-view.tsx       # Main layout
│   │   ├── shell-header.tsx     # Top navigation bar
│   │   ├── shell-navigation-bar.tsx  # Left sidebar
│   │   ├── shell-utility-bar.tsx     # Utility actions
│   │   └── shell-utility-panel.tsx   # Right utility panel
│   ├── store/                   # Zustand state management
│   │   ├── app/                 # Main app store
│   │   ├── i18n/                # i18n state
│   │   └── integrations/        # Third-party integrations
│   ├── react-query/             # Server state (TanStack Query)
│   ├── network/                 # API communication (SOAP)
│   ├── i18n/                    # Internationalization
│   ├── providers/               # React providers
│   ├── history/                 # Routing utilities
│   ├── tracker/                 # Analytics tracking
│   ├── utility-bar/             # Utility sidebar
│   ├── svg/                     # SVG assets
│   └── types/                   # TypeScript definitions
├── exports.ts                   # Public API exports for child apps
├── index.tsx                    # Application entry point
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── index.html                   # HTML template
```

## Architecture

### Application Flow

```
index.tsx
    └── Bootstrapper (lazy-loaded)
        ├── I18nFactory (i18n instance)
        ├── init() - Application initialization
        └── Provider Hierarchy
            ├── ReactQueryProvider (server state)
            ├── ThemeProvider (theming)
            ├── SnackbarManager & ModalManager (notifications)
            ├── TrackerProvider (analytics)
            └── BootstrapperContextProvider
                └── Router (react-router-dom)
                    ├── AppLoaderMounter (renders loaded apps)
                    └── ShellView (main UI)
```

### Plugin System

The bootstrap app manages child applications through a **virtual app registry**:

1. **Registration**: Apps are registered at compile-time via `virtual:app-registry` module
2. **Loading**: Apps are lazy-loaded as separate chunks using dynamic imports
3. **Manifest**: Each app provides metadata including:
   - `name`: Unique identifier
   - `displayName`: Human-readable name
   - `icon`: Navigation icon
   - `priority`: Display order
   - `entryPoint`: Lazy-loaded component

### Route Management

Routes are registered dynamically by child apps using the `addRoute()` API:

```typescript
interface AppRouteDescriptor {
  id: string;
  name: string;
  path: string;
  component: React.ComponentType;
  primaryBarItem?: {
    icon: string;
    label: string;
    position?: number;
  };
  appViewItem?: {
    component: React.ComponentType;
  };
  utilityBarItems?: UtilityBarItem[];
  badge?: number | string;
  tooltip?: string;
}
```

## State Management

### Zustand Stores

#### App Store (`store/app/store.ts`)

Central store managing the application registry:

**State:**
- `apps`: Registry of all loaded applications
- `routes`: Registered routes with navigation metadata
- `views`: Primary bar, app view, and utility bar configurations
- `entryPoints`: Lazy-loaded app components

**Actions:**
- `addApps(apps)`: Register new applications
- `registerApps()`: Register from compile-time manifest
- `addRoute(route)`: Register navigation routes
- `removeRoute(routeId)`: Unregister routes

#### Other Stores

| Store | Purpose |
|-------|---------|
| `i18n` | Language/locale preferences |
| `integrations` | Third-party integrations |
| `app-config` | Application configuration |
| `domains` | Domain management |
| `sticky-bar` | Utility bar state |

### Server State (TanStack Query)

Centralized React Query client with default configuration:
- **Retries**: 3 attempts on failure
- **Stale Time**: 5 minutes
- **Refetch**: Disabled on window focus
- **DevTools**: Enabled in development

## Internationalization

### I18nFactory Pattern

Each app gets its own i18n instance, managed by the `I18nFactory`:

- Creates separate i18next instances per app
- Caches instances for performance
- Handles locale switching across all apps
- Loads translations from `{appPath}/i18n/{locale}.json`

## API Communication

### Network Layer (`src/network/`)

SOAP-based API for backend communication:
- Authentication management
- Account and session handling
- Configuration fetching
- Server information queries

## Public API

The bootstrap exports a comprehensive API for child apps via `@zextras/admin-ui-bootstrap`:

### Route Registration
```typescript
addRoute(route: Partial<AppRouteDescriptor>)
```

### Navigation
```typescript
pushHistory(params: HistoryParams)
replaceHistory(params: HistoryParams)
```

### State Hooks
```typescript
useAppStore()
useDomainStore()
useStickyBarStore()
```

### Server State Hooks
```typescript
useUserAccount()
useAllConfig()
useServersByService()
```

### API Calls
```typescript
soapFetch()
getSoapFetchRequest()
postSoapFetchRequest()
```

## Shell Interface

### ShellView Components

```
ShellView
├── ShellHeader
│   ├── Logo
│   └── ShellUtilityBar
├── ShellNavigationBar (primary navigation)
├── AppViewContainer (main content)
└── ShellUtilityPanel (collapsible sidebar)
```

### Responsive Design

- Mobile-responsive with navigation modal
- Collapsible utility panel
- Adaptive navigation for different screen sizes

## Key Features

| Feature | Description |
|---------|-------------|
| **Plugin Architecture** | Apps are dynamically loaded and integrated |
| **Shared Infrastructure** | Common services, UI components, and patterns |
| **Centralized Routing** | Support for nested navigation |
| **Dual State Management** | Zustand (client) + TanStack Query (server) |
| **Multi-language Support** | Per-app i18n instances |
| **Development Experience** | HMR, devtools, and hot reloading |
| **Error Handling** | Global error boundaries and fallback UIs |

## Integration Points

- **Virtual Registry**: Apps registered at build time
- **Dynamic Imports**: Runtime loading of app modules
- **Context Bridge**: Shared functions across app boundaries
- **Route Registration**: Apps register their navigation items
- **State Sharing**: Centralized stores for cross-app state

## Build Configuration

### Vite Configuration (`vite.config.ts`)

- Uses `@zextras/admin-ui-sdk/vite` plugin
- Virtual module for app registry: `virtual:app-registry`
- Build output targets library mode
- React Fast Refresh enabled

### TypeScript Configuration

- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- JSX set to react-jsx

## Development

### Running the Bootstrap App

```bash
cd apps/admin-ui-bootstrap
pnpm start
```

This starts the development server with HMR enabled.

### Building

```bash
# Development build
pnpm --filter admin-ui-bootstrap run build:dev

# Production build
pnpm --filter admin-ui-bootstrap run build
```

## Dependencies

### Core Dependencies

- `react` ^19.1.0
- `react-router-dom` ^7.4.0
- `zustand` ^5.0.2
- `@tanstack/react-query` ^5.65.0
- `i18next` ^24.2.3
- `@zextras/carbonio-design-system` (workspace:*)
- `@zextras/admin-ui-sdk` (workspace:*)

### Dev Dependencies

- `vite` ^6.3.2
- `typescript` ~5.8.0
- `@vitest/browser` ^3.0.7
- `eslint` ^9.23.0

---

**Document Version**: 1.0
**Last Updated**: 2025-12-29
