/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React from 'react';

import { AnyColor } from '../../../types/utils';
import styles from './dropdown.module.css';
import { DropdownItemContent, type DropdownItemContentProps } from './dropdown-item-content';
import { getItemStyleVars, type ItemClickHandler } from './dropdown-logic';

type DropdownItemButtonProps = DropdownItemContentProps &
  React.ComponentPropsWithRef<'button'> & {
    onClick?: ItemClickHandler;
    selectedBackgroundColor?: AnyColor;
  };

export const DropdownItemButton = ({
  icon,
  label,
  onClick,
  selected,
  disabled = false,
  selectedBackgroundColor,
  itemTextSize,
  tooltipLabel,
  ...rest
}: Readonly<DropdownItemButtonProps>) => (
  <button
    type="button"
    className={clsx(
      styles.containerEl,
      styles.itemButton,
      disabled && styles.disabled,
      selected && 'zapp-selected',
    )}
    style={getItemStyleVars(selected, selectedBackgroundColor)}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    {...rest}
  >
    <DropdownItemContent
      icon={icon}
      label={label}
      selected={selected}
      disabled={disabled}
      itemTextSize={itemTextSize}
      tooltipLabel={tooltipLabel}
    />
  </button>
);
