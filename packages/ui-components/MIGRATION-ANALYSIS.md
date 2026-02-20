# Styled-Components to CSS Modules Migration Analysis

## Overview

| Difficulty | Count | Description |
|------------|-------|-------------|
| **EASY** | 17 | Pure composition or minimal styled-components |
| **MEDIUM** | 20 | Some props/theme usage or already using CSS modules |
| **HARD** | 23 | Complex props, heavy theme, animations, nested selectors |

---

## EASY Components (Start Here)

These components use **zero or minimal styled-components**:

| Component | Styled Components | Complexity Factors | Reasoning |
|-----------|------------------|-------------------|-----------|
| **Quota** | 0 | No styled-components, uses Container directly | Pure composition, no styled definitions |
| **Catcher** | 0 | No styled-components | Error boundary using Container/Text |
| **Portal** | 0 | No styled-components | Pure React portal, no styles |
| **Padding** | 1 (Comp) | Simple height/width/padding props | Single styled div with basic props |
| **SnackbarManager** | 0 | No styled-components | Context provider only |
| **ModalManager** | 0 | Uses existing Modal components | Composition only |
| **Displayer** | 0 | Uses Row/Container/Tooltip/Button | Pure composition |
| **ListItems** | 0 | Uses Container/List/ListItem | Pure composition |
| **ListRow** | 0 | Uses Row component | Pure wrapper |
| **ListPanelItem** | 0 | Uses Container/Row/Button | Pure composition |
| **TrackNumberPerPage** | 0 | Uses Container/Row/Select | Pure composition |
| **PrimaryBarTooltip** | 0 | Uses Container/Padding/Text | Pure composition |
| **DropDownInput** | 0 | Uses Dropdown/Input | Pure wrapper |
| **InheritedSelect** | 0 | Uses Container/Row/Select/IconCheckbox | Pure composition |
| **ModalOverlay** | 2 (ModalOverlayContainer, ModalSubOverlayContainer) | Simple static styles, one prop-based maxWidth | Fixed positioning, minimal props |
| **hwizard** | 0 | Uses HorizontalWizardLayout | Pure wrapper |
| **PasswordInput** | 0 | Uses Input/Container | Pure composition |

---

## MEDIUM Components

Some props-based styling, moderate theme usage:

| Component | Styled Components | Complexity Factors | Reasoning |
|-----------|------------------|-------------------|-----------|
| **Link** | 0 (CSS modules) | Uses CSS modules, theme via getColor | CSS modules migration needed |
| **Text** | 0 (CSS modules) | Theme usage for colors/fonts | CSS modules with theme injection |
| **Button** | 0 (CSS modules) | Complex CSS module with many states | CSS variables approach |
| **Breadcrumb** | 0 (CSS modules) | CSS modules for styling | CSS modules migration |
| **InputDescription** | 1 (styled Text) | Theme for font sizes, line-height | Extends Text, simple theme usage |
| **InputLabel** | 1 | Theme colors, transitions, props-based color logic | Complex prop-based color selection |
| **InputContainer** | 1 (styled Container) | pseudoClasses utility, disabled state | Uses pseudoClasses helper |
| **Row** | 1 (ContainerEl) | Props for display/order/takeAvailableSpace | Extends Container with flex props |
| **RadioGroup** | 1 (Fieldset) | Simple fieldset styles | Minimal styles |
| **Paging** | 0 | Uses Container/Row/Button/Text | Complex logic but no styled definitions |
| **NotificationDetail** | 0 | Uses Container/Row/Text/Button/Input | Pure composition with complex logic |
| **NotificationView** | 0 | Uses Container/Table/TabBar/Text | Pure composition |
| **InheritedInput** | 0 (CSS modules) | CSS modules for highlight | CSS modules with highlight state |
| **HorizontalWizardLayout** | 0 (CSS modules) | CSS modules for row styling | CSS modules, complex state logic |
| **DropdownInput** | 0 | Uses Input/Dropdown | Composition with complex types |
| **CustomHeaderFactory** | 0 | Uses Container/Row/Text/Select | Complex logic, no styled definitions |
| **HoverableRowFactory** | 0 (CSS modules) | CSS modules for table row styles | CSS modules with hover states |
| **Input** | 2 (InputEl, Label, RelativeContainer) | Theme for fonts/colors, focus states | Complex label animation with sibling selectors |
| **Select** | 4 (Label, ContainerEl, CustomText, CustomIcon, TabContainer) | Theme colors, focus states, transitions | Multiple styled components, moderate complexity |
| **Radio** | 3 (RadioInput, Label, RadioContainer) | Theme sizes, pseudoClasses, complex radio styling | Custom radio styling with CSS tricks |
| **Transition** | 0 | No styled-components, JS-based animations | Uses inline styles for animations |

---

## HARD Components

Heavy theme usage, complex props, animations, complex selectors:

| Component | Styled Components | Complexity Factors | Reasoning |
|-----------|------------------|-------------------|-----------|
| **Icon** | 1 (StyledIcon) | Theme icons, dynamic color/size props, CSS template | Dynamic sizing calc, theme-dependent |
| **Avatar** | 2 (AvatarContainer, Capitals) | Complex props ($size, $background, $color, $picture, $selecting, $selected, $disabled, $shape), theme colors, dynamic calc | Multiple conditional styles, shape variants |
| **Container** | 1 (ContainerEl) | Many props (orientation, borderRadius, background, height, width, minHeight, maxHeight, minWidth, maxWidth, mainAlignment, crossAlignment, wrap, padding, gap, flexGrow, flexShrink, flexBasis, margin, borderColor), theme scrollbar, map for borders | Core layout component with ~20 props affecting styles |
| **Checkbox** | 2 (IconWrapper, CustomText) | Props-based pseudo-states (:hover, :focus, :active), theme palette access, transitions | Complex state-based styling with pseudo-classes |
| **Switch** | 2 (IconWrapper, CustomText) | Similar to Checkbox, theme palette with state variants | Complex state-based styling |
| **IconCheckbox** | 2 (IconWrapper, CustomText) | Complex transitions, :hover/:focus/:active states, borderRadius prop, isActive state | Multiple state variants, transitions |
| **TextArea** | 3 (StyledTextArea, GrowContainer, Label, RelativeContainer) | Complex auto-grow with grid layout, ::after pseudo-element, scrollbar styling, sibling selectors, theme fonts | Grid-based auto-grow, complex label animation |
| **ChipInput** | 6+ (ContainerEl, ScrollContainer, RelativeContainer, InputEl, HiddenSpan, AdjustWidthInputContainer, Label, CustomInputDescription) | Complex input width adaptation, many props, theme colors, scrollbar | Very complex component with hidden elements for sizing |
| **Chip** | 4 (ActionIcon, ActionContainer, LabelContainer, ContentContainer, ChipContainer) | PseudoClasses utility, nested selectors, borderRadius variants, cursor states | Complex nested styled components |
| **TabBar** | 2 (CustomText, DefaultTabBarItemContainer) | Props ($forceWidthEquallyDistributed, $selected, $underlineColor, $disabled), :hover/:focus pseudo-classes, theme colors, transitions | Complex tab item with states |
| **Table** | 4 (StyledCheckbox, StyledText, StyledTr, TableRow, TableContainer, StyledTable) | :nth-child selectors, $selected/$highlight/$showCheckbox/$clickable props, hover states, nested selectors | Complex table with row states |
| **Dropdown** | 3 (ContainerEl, PopperDropdownWrapper, PopperList) | Complex positioning, many props, scrollbar styling, :focus states, theme shadows | Complex floating UI, focus management |
| **Popper** | 2 (PopperContainer, PopperWrapper) | $open prop with css helper, z-index management | Portal-based positioning |
| **Tooltip** | 1 (TooltipWrapperWithCss) | Fixed positioning, theme colors, rgba, boxShadow, $maxWidth prop, open state | Complex floating tooltip |
| **List** | 2 (ExternalContainer, StyledList) | Scrollbar styling, theme colors | Theme-dependent scrollbar |
| **ListItem** | 1 (ListItemWrapper) | pseudoClasses utility for hover/focus/active | Uses pseudoClasses helper |
| **Banner** | 5 (InfoContainer, BannerText, WrapAndGrowContainer, ActionsContainer, CloseContainer, BannerContainer) | Complex flex ordering based on $isMultiline, CSS -webkit-line-clamp, theme sizes | Complex responsive layout |
| **Snackbar** | 2 (SnackContainer, ProgressBarContent) | keyframes animation, screen mode responsive styles, theme shadows, $screenMode/$zIndex props | Keyframes animation, responsive |
| **CustomModal** | 0 | Uses ModalContainer/ModalContent/ModalWrapper | Complex modal with transitions |
| **Modal** | 0 | Uses CustomModal + components | Complex composition |
| **ModalHeader** | 1 (ModalTitle) | $centered prop, theme padding | Theme-dependent padding |
| **ModalFooter** | 4 (OptionalFooterContainer, ButtonContainer, DismissButton, ConfirmButton) | $pushLeftFirstChild prop with nested selector, theme padding | Complex flex layout with nested selectors |
| **ModalBody** | 1 (ModalBodyComponent) | $centered/$maxHeight props, scrollbar styling, theme colors | Scrollbar + theme |
| **ModalComponents** | 3 (ModalContainer, ModalWrapper, ModalContent) | $mounted/$open/$zIndex props, rgba, transitions, complex state-based styling, theme padding | Complex modal backdrop with transitions |
| **Collapse** | 2 (CollapseEl, CollapserNotch) | $crossSize/$orientation/$disableTransition/$open props, conditional CSS properties, theme palette | Dynamic dimension properties |
| **DateTimePicker** | 2 (Styler, InputIconsContainer, CustomButton) | MASSIVE ~850 lines of third-party library styling, many class selectors, theme palette, rgba, media queries | Extremely complex - styles entire react-datepicker library |
| **CustomTextArea** | 2 (ContainerEl, TextAreaEl, Label) | disabled/background props, :focus/:hover/:active pseudo-classes, theme palette access, sibling selectors for label animation | Complex label animation + pseudo-states |

---

## Key Patterns Identified

### Styled Patterns Used

1. **Simple static styles** - Basic CSS in template literals
2. **Props-based styling** - Using `$propName` transient props
3. **Theme usage** - Accessing `theme.palette`, `theme.sizes`, `theme.fonts`
4. **Pseudo-classes** - `:hover`, `:focus`, `:active`, `:disabled`
5. **Complex selectors** - Sibling selectors (`${Component} + &`), nested selectors
6. **Keyframes/Animations** - `keyframes` import and usage
7. **CSS helper** - `css` tagged template for conditional styles
8. **PseudoClasses utility** - Custom `pseudoClasses()` helper function

### Migration Difficulty Factors

| Factor | Description | Impact |
|--------|-------------|--------|
| **Theme dependency** | Components using `theme.palette`, `theme.sizes`, `theme.fonts` | Need CSS custom properties approach |
| **Dynamic props** | Components with many transient props (`$prop`) | Need data attributes or CSS variables |
| **Pseudo-class complexity** | Multiple state variations (hover, focus, active, disabled) | More CSS classes needed |
| **Nested selectors** | Components referencing other styled components | Need class name references |
| **Animations** | Keyframes usage | Convert to CSS @keyframes |
| **CSS Grid/Flexbox complexity** | Complex layout calculations | May need JS assistance |

---

## Recommended Migration Order

### Phase 1: Foundation (EASY)
Start with components that have zero or minimal styled-components:
1. Quota, Catcher, Portal
2. Padding
3. SnackbarManager, ModalManager
4. Displayer, ListItems, ListRow, ListPanelItem
5. TrackNumberPerPage, PrimaryBarTooltip
6. DropDownInput, InheritedSelect
7. hwizard, PasswordInput
8. ModalOverlay

### Phase 2: Study Existing Patterns (MEDIUM - CSS modules already)
Analyze how these components implement CSS modules with theme:
- Link, Text, Button, Breadcrumb
- InheritedInput, HorizontalWizardLayout
- HoverableRowFactory

### Phase 3: Moderate Complexity (MEDIUM)
1. InputDescription, InputLabel, InputContainer, Row
2. RadioGroup, Radio
3. Select
4. Input
5. Paging, NotificationDetail, NotificationView
6. Transition

### Phase 4: High Complexity (HARD - Tackle Last)
1. Icon, Avatar
2. Checkbox, Switch, IconCheckbox
3. Chip, ChipInput
4. TabBar, Table
5. Dropdown, Popper, Tooltip
6. List, ListItem
7. Banner, Snackbar
8. Collapse
9. ModalComponents, ModalHeader, ModalBody, ModalFooter
10. TextArea, CustomTextArea
11. Container (core layout - most impactful)
12. DateTimePicker (most complex - ~850 lines)

---

## Migration Strategy Suggestions

### For Theme Variables
```css
/* Instead of theme.palette.primary */
:root {
  --color-primary: ...;
  --color-secondary: ...;
}

.component {
  color: var(--color-primary);
}
```

### For Dynamic Props
```tsx
// Instead of transient props
<div className={clsx(styles.container, styles[size], styles[variant])}>

// Or using data attributes
<div className={styles.container} data-size={size} data-variant={variant}>
```

```css
.container[data-size="large"] {
  padding: 1rem;
}
```

### For Keyframes
```css
/* Instead of styled-components keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.component {
  animation: fadeIn 0.3s ease-in-out;
}
```
