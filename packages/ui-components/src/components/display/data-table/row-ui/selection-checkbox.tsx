/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef } from 'react';

import styles from '../data-table.module.css';

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  'aria-label': string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SelectionCheckbox = ({
  checked,
  indeterminate = false,
  disabled = false,
  'aria-label': ariaLabel,
  onChange,
}: SelectionCheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate && !checked;
    }
  }, [checked, indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className={styles.checkbox}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      onChange={onChange}
    />
  );
};
