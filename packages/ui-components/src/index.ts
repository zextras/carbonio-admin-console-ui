/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// import module augmentations to make ts use them while generating types definitions
import './globals';
import './styled-components';

/** Basic components */
export * from './components/basic/button/Button';
export { Icon, type IconProps } from './components/basic/icon/Icon';
export * from './components/basic/Link';
export * from './components/basic/Spinner';
export * from './components/basic/text/Text';
/** Layout components */
export * from './components/layout/Container';
export * from './components/layout/divider/Divider';
export * from './components/layout/Padding';
export * from './components/layout/Row';

/** Inputs components */
export * from './components/inputs/Checkbox';
export {
	ChipInput,
	type ChipInputProps,
	type ChipInputType,
	type ChipItem
} from './components/inputs/chipInput/ChipInput';
export * from './components/inputs/DateTimePicker';
export * from './components/inputs/IconCheckbox';
export * from './components/inputs/Input';
export * from './components/inputs/multiButton/MultiButton';
export * from './components/inputs/PasswordInput';
export { Radio, type RadioProps } from './components/inputs/Radio';
export { RadioGroup, type RadioGroupProps } from './components/inputs/RadioGroup';
export {
	type LabelFactoryProps,
	type MultipleSelectionOnChange,
	Select,
	type SelectItem,
	type SelectProps,
	type SingleSelectionOnChange
} from './components/inputs/Select';
export * from './components/inputs/Switch';
export * from './components/inputs/TextArea';

/** navigation components */
export * from './components/navigation/TabBar';

/** custom components */
export * from './components/custom/custom-spinner';
export * from './components/custom/custom-text-area';
export * from './components/custom/dropdown-input';
export * from './components/custom/modal-overlay';
export * from './components/custom/overlay-division';

/** display components */
export * from './components/display/Chip';
export * from './components/display/Dropdown';
export * from './components/display/List/List';
export * from './components/display/ListItem';
export * from './components/display/Popper';
export {
	DefaultHeaderFactory,
	DefaultRowFactory,
	Table,
	type TableProps,
	type THeader,
	type THeaderProps,
	type TRow,
	type TRowProps
} from './components/display/Table';
export * from './components/display/Tooltip';

/** Feedback components */
export { Banner, type BannerProps } from './components/feedback/banner/Banner';
export * from './components/feedback/Modal';
export * from './components/feedback/quota/Quota';
export * from './components/feedback/snackbar/Snackbar';

/** Utilities components */
export * from './components/utilities/Catcher';
export * from './components/utilities/Collapse';
export * from './components/utilities/ModalManager';
export * from './components/utilities/SnackbarManager';
export * from './globals';
export * from './hooks/useScreenMode';
export * from './hooks/useSnackbar/useSnackbar';
export type { ThemeObj as Theme } from './theme/theme';
export * from './theme/theme-context-provider';
export * from './theme/theme-utils';
export type { AnyColor, PaletteColor } from './types/utils';
