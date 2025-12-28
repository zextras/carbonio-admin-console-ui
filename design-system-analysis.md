# Carbonio Design System Analysis

## Import Statistics

**Total files importing from `@zextras/carbonio-design-system`:** 361

**Total unique components imported:** 38

### Top 15 Most Imported Components

| Component | Import Count |
|-----------|--------------|
| Container | 163 |
| Text | 127 |
| Row | 100 |
| Padding | 71 |
| Button | 50 |
| Icon | 37 |
| Divider | 34 |
| Input | 21 |
| useSnackbar | 20 |
| PaddingObj | 13 |
| ContainerProps | 12 |
| Spinner (as SpinnerDS) | 11 |
| Checkbox | 11 |
| Tooltip | 10 |
| Modal | 10 |

### Complete Component List

```
Container (163), Text (127), Row (100), Padding (71), Button (50),
Icon (37), Divider (34), Input (21), useSnackbar (20), PaddingObj (13),
ContainerProps (12), Spinner (11), Checkbox (11), Tooltip (10), Modal (10),
Select (9), Dropdown (8), Switch (7), SelectItem (7), ListItem (7),
List (7), Table (4), SnackbarManager (4), ModalManager (4),
IconCheckbox (3), ThemeProvider (2), Spinner (2), RowProps (2), Chip (2),
Banner (2), typeTheme (1), typeTHeader (1), SingleSelectionOnChange (1),
Responsive (1), MultiButton (1), ModalManagerContext (1), ChipInput (1),
Catcher (1)
```

---

## Comparison with Material UI and Bootstrap

### Components That Make Sense (Standard UI Elements)

These exist in all major design systems for good reason:

| Carbonio | MUI | Bootstrap | Purpose |
|----------|-----|-----------|---------|
| Button | Button | btn | Interactive actions |
| Input | TextField | form-control | Form input |
| Checkbox | Checkbox | form-check | Boolean selection |
| Switch | Switch | form-switch | Toggle states |
| Select | Select | form-select | Dropdown selection |
| Modal | Dialog | modal | Overlay content |
| Tooltip | Tooltip | tooltip | Contextual help |
| Table | Table | table | Data display |
| Icon | Icon | (via icons) | Visual symbols |
| Divider | Divider | hr | Visual separation |
| Chip | Chip | badge | Small labels/tags |
| Dropdown | Menu | dropdown | Menu actions |
| List/ListItem | List | list | Item collections |

---

### Components That Are Questionable

#### The "Div Wrapper" Anti-Pattern

| Carbonio | What it really is | Why it's weird |
|----------|-------------------|----------------|
| **Container** | Just a `<div>` | Adds component overhead for nothing |
| **Row** | `<div style="display:flex">` | Should be a layout primitive or CSS |
| **Padding** | `<div style="padding:...">` | Padding is a style prop, not a component |

**Comparison:**
- **MUI:** Uses `Box` (one component) with `sx` prop for any layout need: spacing, flex, grid
- **Bootstrap:** Uses utility classes (`p-4`, `d-flex`, `flex-row`) - no component overhead
- **Carbonio:** Three separate components doing what CSS does natively

#### Type Exports as Components

These shouldn't even be components:
- `ContainerProps` - This is a TypeScript type, not a component
- `RowProps` - Same, just a type
- `PaddingObj` - Utility type

#### Unusual Naming/Approach

| Carbonio | Standard Approach | Note |
|----------|-------------------|------|
| `Text` | `Typography` (MUI) | Minor, but `Text` is less common |
| `useSnackbar` + `SnackbarManager` | `Snackbar` component (MUI) | Over-engineered? |
| `Spinner` vs `SpinnerDS` | `CircularProgress` (MUI) | Why two names? |
| `Catcher` | ErrorBoundary | Odd name for error handling |

---

### Missing Standard Components

Things most design systems have but Carbonio seems to lack:

| Missing | MUI | Bootstrap | Common Use Case |
|---------|-----|-----------|-----------------|
| Card/Paper | Card | card | Content containers |
| Grid | Grid | grid + col-* | Layout system |
| Stack | Stack | (via d-flex) | 1D layouts |
| Tabs | Tabs | nav-tabs | Content switching |
| Accordion | Accordion | accordion | Expandable content |
| Alert | Alert | alert | Status messages |
| AppBar | AppBar | navbar | Top navigation |
| Radio | Radio | radio | Single selection |
| Typography | Typography | (via utilities) | Text variants |
| Badge | Badge | badge | Notifications/counts |

---

## Summary Assessment

| Category | Verdict |
|----------|---------|
| Form controls (Button, Input, Select, etc.) | ✅ Make sense - standard components |
| Feedback (Modal, Tooltip, Snackbar) | ✅ Make sense - necessary patterns |
| Layout primitives (Container, Row, Padding) | ❌ **Redundant** - should be CSS utilities or one flexible Box-like component |
| Type exports (Props, PaddingObj) | ❌ **Wrong** - these aren't components |

---

## Key Issue

Carbonio has componentized basic CSS layout (Container, Row, Padding) which adds:

1. **Extra React component overhead** - Every `Container`, `Row`, `Padding` is a React component with props, lifecycle, reconciliation cost
2. **Prop drilling for simple styles** - Instead of `sx={{ p: 4 }}` or `className="p-4"`, you need `<Padding><Row><Container>`
3. **More verbose JSX** - Three wrapper components instead of inline styles or utility classes

**Modern patterns** (MUI's `Box`, Chakra's `Box`, Tailwind utilities) handle this with:
- One flexible primitive (Box) with comprehensive style props, OR
- Utility classes that compile to minimal CSS

Not three separate div-wrapper components.
