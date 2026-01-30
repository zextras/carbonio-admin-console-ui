# Migrate HorizontalWizardLayout to UI Components

## Current State Analysis

- Files exist in both `admin-ui-storage` and `admin-ui-domains`
- No files exist in `ui-components/custom/`
- No imports found for `HorizontalWizardLayout` (component may be unused or dynamically imported)

## Implementation Steps

### 1. Move files from storage to ui-components

Move the following files from `apps/admin-ui-storage/src/views/app/component/` to `packages/ui-components/src/components/custom/`:

- `horizontal-wizard-layout.tsx`
- `horizontal-wizard-layout.module.css`

### 2. Delete duplicate files from domains

Remove the following files from `apps/admin-ui-domains/src/views/app/component/`:

- `horizontal-wizard-layout.tsx`
- `horizontal-wizard-layout.module.css`

### 3. Export component from ui-components

Add export to `packages/ui-components/src/index.ts`:

```typescript
export * from './components/custom/horizontal-wizard-layout';
```

### 4. Update CSS import

Update the CSS import in the moved file from:

```typescript
import styles from './horizontal-wizard-layout.module.css';
```

To:

```typescript
import styles from './components/custom/horizontal-wizard-layout.module.css';
```

## Key Differences Between Versions

### Storage Version (to keep)
- Uses `data-is-active` attribute in className
- Imports `FC` from 'react'
- Full component with export

### Domains Version (to delete)
- Uses `rowContainerActive` CSS class (lines 51-52)
- Same import structure
- Duplicate implementation

## Verification Steps

1. Confirm files moved successfully
2. Confirm duplicates removed
3. Confirm component exported from index.ts
4. Run linting and typecheck
