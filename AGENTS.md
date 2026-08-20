# AGENTS.md

This file provides guidance for agentic coding assistants working in this repository.

## Development Commands

### Root Level (Turborepo)
- `pnpm install` - Install all dependencies across workspaces
- `pnpm build` - Build all packages in dependency order
- `pnpm build:dev` - Development build without caching
- `pnpm test` - Run tests across all packages
- `pnpm test:ci` - Run tests with coverage for CI
- `pnpm type-check` - TypeScript type checking across all packages
- `pnpm lint` - ESLint across all packages
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm type-lint` - Type check + lint combined
- `pnpm reset` - Full clean reinstall (removes node_modules, lock file, cache)

### App/Package Specific
- `pnpm build` - SDK build (within app directory)
- `pnpm deploy` - Build and deploy (within app directory)
- `pnpm test` - Vitest run (within app directory)
- `pnpm test:watch` - Vitest with browser preview and watching (within app directory)
- `pnpm test:ci` - Vitest with coverage for CI (within app directory)

### Running a Single Test
- `pnpm vitest run <test-file>` - Run specific test file from root
- `pnpm vitest run <test-file> --reporter=verbose` - Run with verbose output
- `HEADED=true vitest run <test-file>` - Run with visible browser window
- Example: `pnpm vitest run apps/admin-ui-dashboard/src/views/dashboard/tests/license-banner.browser.test.tsx`
- From within an app: `vitest run <relative-path-to-test-file>`

### Package Management
- `pnpm add <package> --filter <appname>` - Add to specific workspace
- `pnpm add -D <package> -w` - Add dev dependency to root
- `pnpm add <package> -r` - Add to all workspaces

## Code Style Guidelines

### File Header
Every source file must include the SPDX license header (auto-enforced by eslint):
```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
```
Year is auto-updated by eslint. The header is required in all files except:
- Icons (`**/icons/**/*.[jt]sx`)
- Configuration files (`**/*.config.*`)
- Templates and mocks
- Node modules, dist, build, coverage directories

### Imports
- Imports are auto-sorted by `eslint-plugin-simple-import-sort`
- External imports first, then internal, then type imports
- Use named exports, avoid default exports in React components

### TypeScript Types
- Use `type` for component Props and State (more constrained, prevents accidental extension)
- Use `interface` for public API definitions where consumers may need declaration merging
- Use `Array<SomeType>` instead of `SomeType[]` for array types
- Example: `type Items = Array<Item>` not `type Items = Item[]`
- Avoid empty interface `{}` and `Object` — they accept any non-nullish value; use `Record<string, never>` for truly empty objects

### Function Definitions
- Use arrow functions for React components, directly exported with a named export
- Use regular function declarations for all other (non-component) logic
- **Never use IIFEs** (Immediately Invoked Function Expressions) — extract to a variable or a named function instead
- Example:
  ```typescript
  // Component
  export const MyComponent = ({ title }: MyComponentProps) => {
    return <div>{title}</div>;
  };

  // Logic
  function calculateTotal(items: Array<Item>): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
  ```

### React Compiler
- This project uses the **React Compiler** (babel plugin)
- **Do not use `useMemo` or `useCallback`** — the compiler handles memoization automatically
- Writing manual memoization hooks is redundant and linters will flag them

### React Components
- Use named exports only, no default exports
- Do not use `FC` — use arrow function consts with an explicit props type, directly exported
- Return type is inferred; do not annotate it explicitly
- Example: `export const ComponentName = ({ title }: ComponentNameProps) => { ... };`
- **Visibility belongs to the parent** — a component must not receive an `isDirty`/`isVisible`/`shouldRender`-style flag and return `null` from it. That hides the rendered structure from the call site and produces a component that lies about its own purpose. Conditionally render at the usage site instead:
  ```tsx
  // Don't — component internally decides to render nothing
  <AccountSaveCancelActions isDirty={isDirty} ... />
  // (inside the component: if (!isDirty) return null;)

  // Do — parent owns the decision, JSX reads truthfully
  {isDirty && <AccountSaveCancelActions ... />}
  ```
  Legit internal nulls are ones the component derives itself (e.g. no data after its own query), never a mirrored parent condition passed as a prop.

#### Typing Component Props
- `children?: React.ReactNode` — accepts everything React can render (preferred over `JSX.Element`)
- `style?: React.CSSProperties` — for style props
- Function props: `onClick: () => void` or `onChange: (id: number) => void`
- Event handler props: `onChange?: React.ChangeEventHandler<HTMLInputElement>`
- State setter as prop: `setState: React.Dispatch<React.SetStateAction<number>>`
- Component as prop: `view: React.ComponentType<SomeProps>`
- Optional props use `?:` suffix (e.g. `disabled?: boolean`)

#### Hooks Typing
- `useState`: type inference works for simple values; use explicit generic for nullable state:
  ```typescript
  const [user, setUser] = useState<User | null>(null);
  ```
- `useRef` for DOM elements: `useRef<HTMLDivElement>(null)` — be specific with element type
- `useRef` for mutable values: `useRef<number | null>(null)`
- `useReducer`: use discriminated unions for action types:
  ```typescript
  type Action = { type: 'increment'; payload: number } | { type: 'reset' };
  ```
- Custom hooks returning arrays: use `as const` to get tuple types instead of union arrays
- **Do not use `useMemo` or `useCallback`** — the React Compiler handles memoization

#### Context
- Create context with `null` default when there's no meaningful default:
  ```typescript
  const UserContext = createContext<User | null>(null);
  ```
- Provide a custom hook that throws if context is missing (prefer runtime checks over type assertions):
  ```typescript
  function useUser(): User {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <UserProvider>');
    return ctx;
  }
  ```

#### Forms & Events
- Prefer inline handlers — TypeScript infers event types automatically:
  ```typescript
  <input onChange={(e) => { /* e is typed */ }} />
  ```
- For extracted handlers, use: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.KeyboardEvent<HTMLInputElement>`, etc.
- `React.ReactNode` is the return value of a component; `React.JSX.Element` is the return value of `React.createElement`

#### Refs (React 19+)
- `ref` is a regular prop — no `forwardRef` needed
- Inherit all native element props (including ref): `React.ComponentPropsWithRef<'input'>`
- Or explicit ref typing: `ref?: React.Ref<HTMLDivElement>`

#### Component Patterns
- **Extract props from existing component:** `type Props = React.ComponentProps<typeof Button>`
- **Wrap/mirror HTML elements:** extend `React.ComponentPropsWithoutRef<'button'>`
- **Generic components:**
  ```typescript
  const List = <T,>({ items, renderItem }: { items: Array<T>; renderItem: (item: T) => React.ReactNode }) => { ... };
  ```
- **Conditional props** (one or the other, not both): use `never` — `{ foo: string; bar?: never } | { bar: string; foo?: never }`
- **Discriminated unions** for props that vary by type: `{ type: 'button'; onClick: () => void } | { type: 'link'; href: string }`

### Deprecated Layout Components
`Container`, `Row`, and `Padding` from `@zextras/ui-components` (and their `*Props` types) are **deprecated**. Do not add new usages, including in tests. They are thin wrappers over `<div>` that compile layout props into inline styles at runtime (unoverrideable without `!important`). Use a plain `<div>` with CSS modules instead:

```tsx
// Don't
<Row mainAlignment="space-between" padding={{ all: 'small' }}>...</Row>

// Do
import styles from './my-component.module.css';

<div className={styles.header}>...</div>
```

```css
/* my-component.module.css */
.header {
  display: flex;
  justify-content: space-between;
  padding: var(--padding-size-small);
}
```

Theme tokens are plain CSS variables and work directly in stylesheets:
- Colors: `var(--color-<name>-regular)` / `var(--color-<name>-<state>)`, e.g. `var(--color-gray3-regular)`
- Padding sizes: `var(--padding-size-extrasmall | small | medium | large | extralarge)`
- Border radius: `var(--border-radius)`

### Tailwind Utilities
Tailwind v4 utilities are available in every app **and in browser tests** (the vitest pipeline compiles them via `@tailwindcss/vite` in `vitest.config.base.ts` + root `tailwind.css` imported by `vitest-browser-setup.ts`; the production shell compiles the same utilities via `apps/admin-ui-bootstrap/src/index.css`).

- For tiny one-off styles (a single padding/margin/gap/color), prefer a Tailwind class over creating a `.module.css` file, e.g. `<div className="pr-md">` instead of a whole CSS module
- For anything multi-rule, keep using CSS modules (theme tokens work directly in them, see above)
- Theme tokens are mapped to Tailwind utilities by `packages/ui-components/src/theme/tailwind-theme.css`:
  - Spacing: `--spacing-xs|sm|md|lg|xl` → `--padding-size-extrasmall|small|medium|large|extralarge` (e.g. `p-sm` = `var(--padding-size-small)`)
  - Colors: `text-primary`, `bg-gray5`, … resolve to `var(--color-<name>-regular)`
- Never import `tailwindcss/preflight` — it would globally reset styles and shift screenshot baselines

Existing call sites (~3,300) are migrated incrementally. When modifying a file that still uses these components, migrate it opportunistically.

### Testing
- Always add timeout instruction when running tests: `testTimeout: 10_000` (default) or `20_000` for CI
- **Never** remove `.test.only` or `it.only` - they are intentional
- Use Vitest globals (no need to import describe, it, expect, etc.)
- Browser tests use `.browser.test.tsx` extension and run in Playwright
- Unit tests use `.test.ts`/`.test.tsx` and run in jsdom
- Use `admin-ui-test-utils` for shared test utilities
- Full browser-test conventions (setup, locators, interactions, TanStack Form, MSW) are documented in `docs/browser-test-conventions.md`
- **Never use `getByTestId`** in browser tests — it couples tests to implementation details invisible to users. Prefer user-facing selectors in this priority order:
  1. `getByRole` (e.g. `getByRole('button', { name: 'Save' })`)
  2. `getByLabelText` (e.g. `getByLabelText('Domain Name')`)
  3. `getByText` / `getByPlaceholder` (visible text content)
  4. For icon-only buttons without `aria-label`: locate the rendered icon via its visible attribute (e.g. `page.getByTestId('icon: CloseOutline')`)
- **`page.locator` does not exist** in Vitest browser mode — the `page` object from `vitest/browser` is NOT a Playwright Page. Use `page.getByRole`, `page.getByText`, `page.getByTestId`, or `userEvent` for all interactions instead.

### State Management
- Global state: Zustand stores in `store/` directories
- Server state: TanStack React Query with proper query keys
- Example query key pattern:
  ```typescript
  const accountQueryKeys = {
    all: ['account'] as const,
    info: () => [...accountQueryKeys.all, 'info'] as const,
  } as const;
  ```

### TanStack Form + React Query: Post-Save Pattern

When a form backed by TanStack Form needs to clear `isDirty` after a successful save, you must use **both** `form.reset()` and query invalidation together. Neither alone works:

- **`form.reset()` alone** → `isDirty` stays `true` (defaults unchanged) or values revert (if defaults updated and `!isTouched`)
- **Query invalidation alone** → `isDirty` stays `true` (`isTouched` is still `true`, so `formApi.update()` never triggers a `baseStore` change, and `isDefaultValue` is never recomputed)

**Correct pattern:**
```typescript
// 1. Reset form values to saved state AND clear isTouched
form.reset(value, { keepDefaultValues: true });
// 2. Invalidate the query so refetch updates the form's internal defaults
queryClient.invalidateQueries({ queryKey: myQueryKeys.config(id) });
```

**Why this works:** `form.reset(value, { keepDefaultValues: true })` clears `isTouched` to `false`. When the refetch completes, `formApi.update(opts)` runs with new `defaultValues`. Since `!isTouched` is now `true`, `shouldUpdateValues` is `true`, which triggers a `baseStore` change. This causes `isDefaultValue` to recompute against the new defaults → `isDirty` becomes `false`.

**Query hook requirement:** Add `placeholderData: keepPreviousData` to prevent loading-spinner flashes during refetch and cross-entity navigation:
```typescript
import { keepPreviousData, useQuery } from '@tanstack/react-query';
// ...
placeholderData: keepPreviousData,
```

**Reference implementation:** `apps/admin-ui-storage/src/views/hsm/hsm-setting-panel.tsx` (HSM Settings), `apps/admin-ui-backup/src/views/backup/server-advanced/server-advanced.tsx` (Server Advanced)

### API Calls
- Use `soapFetch` for SOAP API calls
- Service files contain API request functions
- React Query hooks wrap service functions with caching and refetching
- Error handling: use snackbar feedback for user-facing errors

### Formatting (Prettier)
- Print width: 100
- Single quotes: true
- Trailing commas: all

### ESLint Rules
Key enforced rules:
- `simple-import-sort/imports` - Auto-sorted imports
- `unused-imports/no-unused-imports` - No unused imports
- `react-hooks/rules-of-hooks` - Proper hooks usage
- `@typescript-eslint/no-explicit-any` - Warn, avoid `any`
- `no-console` - Error (allow `console.error` only)

### Naming Conventions
- Components: PascalCase (`MyComponent`)
- Functions: camelCase (`calculateTotal`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types: PascalCase (`UserProfile`)
- Hooks: camelCase with `use` prefix (`useUserData`)

### Error Handling
- User-facing errors: show snackbar via `useSnackbar()`
- API errors: check `data?.status`, `data?.error`, `err?.message`
- Provide fallback messages from i18n

### Workspace Structure
- `apps/*` - 12 admin modules (bootstrap, domains, backup, etc.)
- `packages/*` - Shared packages (ui-components, sdk, test-utils)
- Apps import TypeScript source directly from `@zextras/ui-components` (no build needed)
- Workspace dependencies use `workspace:*` protocol

### Priority Notes
When multiple skills apply, use this order:
1. Process skills first (brainstorming, debugging)
2. Implementation skills second (frontend-design, etc.)
