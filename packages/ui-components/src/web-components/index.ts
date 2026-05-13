/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Import theme CSS to define CSS variables for web components
import '../theme/theme.css';

// Import and export the web components to ensure they are bundled and registered
export { DsBadge } from './ds-badge';
export { DividerElement } from './ds-divider';
export { DsIcon } from './ds-icon';
export { DsPageShimmer } from './ds-page-shimmer';
export { DsSpinner } from './ds-spinner';
export { DsStepper, type DsStepperProps, type DsStepperStep } from './ds-stepper';
export { DsTagIcon } from './ds-tag-icon';
export { DsText, type DsTextProps as TextProps } from './ds-text';
