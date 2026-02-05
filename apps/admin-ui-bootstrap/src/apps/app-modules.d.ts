/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Ambient module declarations for admin apps.
 * These declarations prevent TypeScript from following imports into app source files
 * during type-checking of admin-ui-bootstrap. Each app is type-checked independently
 * via Turborepo.
 */

declare module '@zextras/admin-ui-dashboard' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-domains' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-backup' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-cos' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-legalhold' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-mta' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-notifications' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-operations' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-subscription' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-privacy' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}

declare module '@zextras/admin-ui-storage' {
  const AppComponent: React.ComponentType;
  export default AppComponent;
}
