/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../../web-components/ds-icon';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import styles from '../data-table.module.css';
import { stopEventPropagation } from './stop-propagation';

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  'aria-label': string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Table selection control with design-system checkbox icons. Keeps a native
 * input for indeterminate support and existing role="checkbox" tests while
 * rendering CheckmarkSquare / Square to match project Checkbox visuals.
 */
export const SelectionCheckbox = ({
  checked,
  indeterminate = false,
  disabled = false,
  'aria-label': ariaLabel,
  onChange,
}: SelectionCheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const mixed = indeterminate && !checked;

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = mixed;
    }
  }, [mixed]);

  let icon: 'CheckmarkSquare' | 'CheckmarkSquareOutline' | 'Square' = 'Square';
  if (checked) {
    icon = 'CheckmarkSquare';
  } else if (mixed) {
    icon = 'CheckmarkSquareOutline';
  }

  return (
    <span className={clsx(styles.selectionCheckbox, disabled && styles.selectionCheckboxDisabled)}>
      <input
        ref={ref}
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={stopEventPropagation}
        onKeyDown={stopEventPropagation}
        onChange={onChange}
      />
      <ds-icon
        className={styles.selectionCheckboxIcon}
        icon={icon}
        size="medium"
        color={checked || mixed ? 'primary' : 'gray0'}
        aria-hidden="true"
      />
    </span>
  );
};
