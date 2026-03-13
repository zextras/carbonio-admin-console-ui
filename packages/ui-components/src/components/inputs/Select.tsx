/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/icon-wc';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { Text } from '../basic/text/Text';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from '../constants';
import { Dropdown, DropdownItem, DropdownProps } from '../display/Dropdown';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';
import styles from './Select.module.css';

type SelectItem<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
  customComponent?: React.ReactElement;
};

type LabelFactoryProps<T = string> = {
  label: string | undefined;
  open: boolean;
  focus: boolean;
  background: string;
  multiple: boolean;
  disabled: boolean;
  selected: SelectItem<T>[];
};

type MultipleSelectionOnChange<T = string> = (value: Array<SelectItem<T>>) => void;

type SingleSelectionOnChange<T = string> = (value: T | null) => void;

type UncontrolledMultipleSelection<T> = {
  multiple: true;
  selection?: never;
  defaultSelection?: Array<SelectItem<T>>;
  onChange: MultipleSelectionOnChange<T>;
};

type ControlledMultipleSelection<T> = {
  multiple: true;
  selection: Array<SelectItem<T>>;
  defaultSelection?: never;
  onChange: MultipleSelectionOnChange<T>;
};

type UncontrolledSingleSelection<T> = {
  multiple?: false;
  selection?: never;
  defaultSelection?: SelectItem<T>;
  onChange: SingleSelectionOnChange<T>;
};

type ControlledSingleSelection<T> = {
  multiple?: false;
  selection: SelectItem<T>;
  defaultSelection?: never;
  onChange: SingleSelectionOnChange<T>;
};

type SelectComponentProps<T> = {
  label?: string;
  background?: string;
  disabled?: boolean;
  items: SelectItem<T>[];
  /** Css display property of select */
  display?: 'block' | 'inline-block';
  /** Css width property of dropdown */
  dropdownWidth?: string;
  /** Css max-width property of dropdown */
  dropdownMaxWidth?: string;
  /** Css max-height property of dropdown */
  dropdownMaxHeight?: string;
  LabelFactory?: React.ComponentType<LabelFactoryProps<T>>;
  i18nAllLabel?: string;
  /** Flag to disable the Portal implementation of dropdown */
  disablePortal?: boolean;
  /** Whether to show checkboxes */
  showCheckbox?: boolean;
} & (
  | UncontrolledMultipleSelection<T>
  | ControlledMultipleSelection<T>
  | UncontrolledSingleSelection<T>
  | ControlledSingleSelection<T>
);

type SelectProps<T = string> = SelectComponentProps<T> &
  Omit<DropdownProps, keyof SelectComponentProps<T> | 'children'>;

type SelectType = <T = string>(p: SelectProps<T>) => React.ReactElement | null;

const DefaultLabelFactory = <T,>({
  selected,
  label,
  open,
  focus,
  background,
  disabled,
}: LabelFactoryProps<T>): React.JSX.Element => {
  const selectedLabels = useMemo(
    () => selected.reduce<string[]>((arr, obj) => [...arr, obj.label], []).join(', '),
    [selected],
  );

  const hasSelection = selected.length > 0;
  const labelColor = (disabled && 'gray2') || ((open || focus) && 'primary') || 'secondary';
  const iconColor = (disabled && 'gray2') || ((open || focus) && 'primary') || 'secondary';

  const containerStyle: React.CSSProperties = {
    '--select-bg': resolveThemeColor(background, 'regular'),
    '--select-bg-hover': resolveThemeColor(background, 'hover'),
    '--select-bg-focus': resolveThemeColor(background, 'focus'),
  } as React.CSSProperties;

  const labelStyle: React.CSSProperties = {
    top: hasSelection ? 'calc(var(--padding-size-small) - 0.0625rem)' : '50%',
    transform: hasSelection ? 'translateY(0)' : 'translateY(-50%)',
  };

  return (
    <>
      <Container
        orientation="horizontal"
        width="fill"
        crossAlignment="flex-end"
        mainAlignment="space-between"
        borderRadius="half"
        padding={{
          horizontal: 'large',
          vertical: 'small',
        }}
        className={`${styles.container}${focus ? ` ${styles.containerFocused}` : ''}`}
        style={containerStyle}
      >
        <Row takeAvailableSpace mainAlignment="unset">
          <Padding top="medium" width="100%">
            <Text
              size="medium"
              color={disabled ? 'secondary' : 'text'}
              className={styles.customText}
            >
              {selectedLabels}
            </Text>
          </Padding>
          <div className={styles.label} style={labelStyle}>
            <Text size={hasSelection ? 'small' : 'medium'} color={labelColor}>
              {label}
            </Text>
          </div>
        </Row>
        <div className={styles.iconWrapper}>
          <icon-wc size="medium" icon={open ? 'ArrowUp' : 'ArrowDown'} color={iconColor}></icon-wc>
        </div>
      </Container>
      <divider-wc color={open || focus ? 'primary' : INPUT_DIVIDER_COLOR}></divider-wc>
    </>
  );
};

const SelectComponent = function SelectFn<T = string>({
  background = INPUT_BACKGROUND_COLOR,
  disabled = false,
  items,
  label,
  onChange,
  defaultSelection,
  multiple = false,
  i18nAllLabel = 'All',
  display = 'block',
  dropdownWidth = '100%',
  dropdownMaxWidth,
  dropdownMaxHeight,
  LabelFactory = DefaultLabelFactory,
  selection,
  disablePortal = false,
  showCheckbox = true,
  ...rest
}: SelectProps<T>): React.JSX.Element {
  const initialState = defaultSelection ?? selection ?? [];
  const [selected, setSelected] = useState<SelectItem<T>[]>(
    Array.isArray(initialState) ? initialState : [initialState],
  );
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);

  const isControlled = selection !== undefined && selection !== null;

  const updateMultipleSelection = useCallback(
    (item: SelectItem<T>, isSelected: boolean) => {
      const newSelected = isSelected
        ? selected.filter((obj) => obj.value !== item.value)
        : [...selected, item];
      if (!isControlled) {
        setSelected(newSelected);
      }
      (onChange as MultipleSelectionOnChange<T>)(newSelected);
    },
    [isControlled, onChange, selected],
  );

  const updateSingleSelection = useCallback(
    (item: SelectItem<T>) => {
      if (!isControlled) {
        setSelected(item.value !== null && item.value !== undefined ? [item] : []);
      }
      (onChange as SingleSelectionOnChange<T>)(item.value);
    },
    [isControlled, onChange],
  );

  const clickItemHandler = useCallback(
    (item: SelectItem<T>, isSelected: boolean) => (): void => {
      if (multiple) {
        updateMultipleSelection(item, isSelected);
      } else if (selected.length === 0 || item.value !== selected[0].value) {
        updateSingleSelection(item);
      }
    },
    [multiple, selected, updateMultipleSelection, updateSingleSelection],
  );

  const mappedItems = useMemo(
    () =>
      items.map((item, index): DropdownItem => {
        const isSelected = selected.some((s) => s.value === item.value);
        return {
          id: `${index}-${item.label}`,
          label: item.label,
          ...(showCheckbox ? { icon: isSelected ? 'CheckmarkSquare' : 'Square' } : {}),
          onClick: clickItemHandler(item, isSelected),
          selected: isSelected,
          disabled: item.disabled,
          customComponent: item.customComponent,
        };
      }),
    [items, selected, showCheckbox, clickItemHandler],
  );

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onFocus = useCallback(() => setFocus(true), []);
  const onBlur = useCallback(() => setFocus(false), []);

  const toggleSelectAll = useCallback(
    (isSelected: boolean) => (): void => {
      if (isSelected) {
        if (!isControlled) {
          setSelected([]);
        }
        (onChange as MultipleSelectionOnChange<T>)([]);
      } else {
        const newSelected = items.filter((obj) => !obj.disabled);
        if (!isControlled) {
          setSelected(newSelected);
        }
        (onChange as MultipleSelectionOnChange<T>)(newSelected);
      }
    },
    [isControlled, items, onChange],
  );

  const multipleMappedItems = useMemo((): DropdownItem[] => {
    if (!multiple) return [];
    const selectableItems = items.filter((obj) => !obj.disabled);
    const alreadySelected = selected.filter((obj) => !obj.disabled);
    const isSelected = alreadySelected.length === selectableItems.length;
    return [
      {
        id: 'all',
        label: i18nAllLabel,
        ...(showCheckbox ? { icon: isSelected ? 'CheckmarkSquare' : 'Square' } : {}),
        onClick: toggleSelectAll(isSelected),
        selected: isSelected,
      },
      ...mappedItems,
    ];
  }, [multiple, items, selected, i18nAllLabel, showCheckbox, toggleSelectAll, mappedItems]);

  useEffect(() => {
    if (isControlled) {
      if (multiple && selection instanceof Array) {
        setSelected(selection);
      } else if (!multiple && !(selection instanceof Array)) {
        setSelected([selection]);
      }
    }
  }, [isControlled, multiple, onChange, selection]);

  return (
    <Dropdown
      display={display}
      width={dropdownWidth}
      maxWidth={dropdownMaxWidth}
      maxHeight={dropdownMaxHeight}
      items={multiple ? multipleMappedItems : mappedItems}
      handleTriggerEvents
      multiple={multiple}
      disabled={disabled}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-end"
      disablePortal={disablePortal}
      {...rest}
    >
      <div onFocus={onFocus} onBlur={onBlur} tabIndex={0} className={styles.tabContainer}>
        <LabelFactory
          label={label}
          open={open}
          focus={focus}
          background={background}
          multiple={multiple}
          disabled={disabled}
          selected={selected}
        />
      </div>
    </Dropdown>
  );
};

const Select = SelectComponent as SelectType;

export {
  type MultipleSelectionOnChange,
  Select,
  type SelectItem,
  type SelectProps,
  type SingleSelectionOnChange,
};
