# SonarLint Fixes — 2026-08-20 (PR #1344)

Source: `pnpm sonarlint` (SonarQube: carbonio-admin-console-ui, PR #1344) — **26 issues**, all in `apps/admin-ui-domains/src/views/domain/edit-account/`.
All fixed with real code changes; no rule suppressions. One commit per step (see git log).

## Fixes by file

### `add-delegate-section/delegate-selectmode-section.tsx`
| Line | Rule | Change |
|---|---|---|
| 117 | S6749 (MINOR) | Removed the redundant single-child `<>` fragment wrapping `<Container>` (body dedented) |
| 157 | S6606 (MINOR) | Undefined-check ternary → nullish coalescing: `searchDelegateAccountName ?? (grantee?.name \|\| '')` |

### `administration-section/admin-rights-section.tsx`
| Line | Rule | Change |
|---|---|---|
| 52, 55 | S6325 + S7781 (MINOR ×4) | `replace(new RegExp('__','g'),'')` → `replaceAll('__','')` in both row cells |
| 162 | S6819 (MAJOR) | `div role="button" tabIndex onKeyDown` → real `<button type="button">`; native Enter/Space activation replaces the manual `onKeyDown`; button-reset rules (`border/bg/padding/text-align/width`) added to `.domainItem` |

### `delegates-section/add-delegate-wizard.tsx`
| Line | Rule | Change |
|---|---|---|
| 30–117 | S6478 (MAJOR ×9) | All five inline step-button components (CANCEL / empty-prev / NEXT / BACK / ADD) extracted to module-level factory `createWizardStepButtons(t, onCancel, onAdd)` in new `wizard-step-buttons.tsx`; steps reference the factory result — no component defined inside the component |

### `delegates-section/simplified-rights-panel.tsx`
| Line | Rule | Change |
|---|---|---|
| 61 | S6754 (MINOR) | `readRightWriteCheck` → `readWriteRightCheck` (matching `setReadWriteRightCheck`), incl. the `SimplifiedRightsChecks` type |
| 118 | S3776 (CRITICAL, 22>15) | Three duplicated rights-type branches extracted to pure `selectDelegatesForRemoval(rightsType, single, selectedRowId, identitiesList, identityRows)` in `utils.tsx` with a rights-type → filter-spec lookup table; +4 unit tests |

**Bonus bug fixed (exposed by the extraction):** REMOVE ALL passed table *rows* to the revoke-batch builder, but `buildDelegateRows` (phase E) nests the identity under `.identity` instead of spreading it — so `folder`/`right` were absent and the batch was silently empty. The helper now maps rows back to their identities; the revoke batch is actually built.

### `delegates-section/utils.tsx`
| Line | Rule | Change |
|---|---|---|
| 103 | S4144 (MAJOR) | `buildGrantRight` and `buildRevokeRight` were byte-identical → merged into `buildAdminRightEnvelope`; call sites (`advanced-delegates-table`, `buildSimplifiedGrantBatch`/`RevokeBatch`) and tests updated. The Grant/Revoke distinction lives in the batch keys (`GrantRightRequest`/`RevokeRightRequest`), not the envelope |

### `general-section.tsx`
| Line | Rule | Change |
|---|---|---|
| 122 | S3776 (CRITICAL, 16>15) | Domain-dropdown items builder (limit-hint branch + domain-row map) extracted to module-level `buildDomainDropdownItems(domainList, onSelectedDomain, t)` |

### `parts/account-header-actions.tsx`
| Line | Rule | Change |
|---|---|---|
| 56 | S7764 (MINOR) | `window.location.hostname` → `globalThis.location.hostname` |

### `parts/quota-utils.ts`
| Line | Rule | Change |
|---|---|---|
| 15 | S4323 (MINOR) | Repeated `number | 'unlimited' | undefined` union → exported `type QuotaLimitValue`, used across all signatures |

### `services-passphrase.tsx`
| Line | Rule | Change |
|---|---|---|
| 157 | S6479 (MAJOR) | Row key `` `credentialList${index}` `` → `item.id ?? item.label` (credentials always carry ids) |
| 196 | S7750 (MINOR) | Status `defaultSelection` `.filter(…)[0]` → `.find(…)` |

### `services-passphrase/credential-created-dialog.tsx`
| Line | Rule | Change |
|---|---|---|
| 81 | S6478 (MAJOR) | Inline `CustomIcon` arrow → module-level `createCopyPasswordIcon(password)` factory returning a named component (`LabeledValue` renders `CustomIcon` as a prop-less `React.ComponentType`) |

### `signature-detail/signature-detail.tsx`
| Line | Rule | Change |
|---|---|---|
| 172 | S6478 (MAJOR) | Inline `CustomIcon` arrow → module-level static `SearchFunnelIcon` |

## Verification

Per the run instructions, `pnpm sonarlint` was **not** re-run (cached results would be misleading). Instead:

| Command | Result |
|---|---|
| `pnpm type-check` | 15/15 packages pass |
| `pnpm lint` | 0 errors (pre-existing `no-explicit-any` warnings only) |
| `pnpm test` | full monorepo suite green |

Targeted suites along the way: delegate-selectmode 4/4, administration-section 3/3, delegates-section 4/4 + utils 17/17 (now 16 after the merge), general-section + save-flow 3/3, quota-utils 9/9, services-passphrase 3/3, signature-detail 6/6.
