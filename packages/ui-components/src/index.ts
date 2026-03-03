/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable-next-line @typescript-eslint/triple-slash-reference */
/// <reference path="./css-modules.d.ts" />

// global definitions
export * from './global';

// Web components setup (imports theme CSS)
export * from './web-components';
export { type IconName } from './web-components/icon-registry';
/** Basic components */
export * from './components/basic/button/Button';
export * from './components/basic/Link';
export * from './components/basic/text/Text';

/** Layout components */
export * from './components/layout/Container';
export * from './components/layout/Padding';
export * from './components/layout/Row';
export {
  Section,
  type SectionProps,
  WizardInSection,
  type WizardInSectionProps,
} from './components/layout/Section';

/** Inputs components */
export * from './components/inputs/Checkbox';
export {
  ChipInput,
  type ChipInputProps,
  type ChipItem,
} from './components/inputs/chipInput/ChipInput';
export * from './components/inputs/DateTimePicker';
export * from './components/inputs/IconCheckbox';
export * from './components/inputs/Input';
export * from './components/inputs/PasswordInput';
export { Radio, type RadioProps } from './components/inputs/Radio';
export { RadioGroup, type RadioGroupProps } from './components/inputs/RadioGroup';
export {
  type MultipleSelectionOnChange,
  Select,
  type SelectItem,
  type SelectProps,
  type SingleSelectionOnChange,
} from './components/inputs/Select';
export * from './components/inputs/Switch';
export * from './components/inputs/TextArea';

/** navigation components */
export * from './components/navigation/TabBar';

/** custom components */
export * from './components/custom/breadcrumb';
export * from './components/custom/custom-table-header-factory';
export * from './components/custom/custom-text-area';
export * from './components/custom/displayer';
export * from './components/custom/dropdown-input';
export * from './components/custom/horizontal-wizard-layout';
export {
  type TRow as HoverableRow,
  default as HoverableRowFactory,
  type HoverableRowProps,
} from './components/custom/hoverable-row-factory';
export * from './components/custom/inherited-input';
export * from './components/custom/inherited-select';
export * from './components/custom/inherited-switch';
export * from './components/custom/list-items';
export * from './components/custom/list-panel-item';
export * from './components/custom/list-row';
export * from './components/custom/modal-overlay';
export * from './components/custom/notification-detail';
export * from './components/custom/notification-view';
export * from './components/custom/paging';
export * from './components/custom/primary-bar-tooltip';
export * from './components/custom/track-number-per-page';

/** display components */
export * from './components/display/Chip';
export * from './components/display/Dropdown';
export * from './components/display/List/List';
export * from './components/display/ListItem';
export * from './components/display/Popper';
export {
  Table,
  type TableProps,
  type THeader,
  type THeaderProps,
  type TRow,
} from './components/display/Table';
export * from './components/display/Tooltip';

/** Feedback components */
export { Banner, type BannerProps } from './components/feedback/banner/Banner';
export * from './components/feedback/Modal';
export * from './components/feedback/quota/Quota';
export * from './components/feedback/snackbar/Snackbar';

/** Utilities components */
export * from './components/custom/hwizard';
export * from './components/utilities/Catcher';
export * from './components/utilities/Collapse';
export * from './components/utilities/ModalManager';
export * from './components/utilities/SnackbarManager';
export * from './hooks/usewizard';
export * from './theme/theme-utils';
export type { AnyColor } from './types/utils';
export {
  type CloseSnackbarFn,
  type CreateSnackbarFn,
  type CreateSnackbarFnArgs,
  useSnackbar,
} from '@zextras/ui-shared';
