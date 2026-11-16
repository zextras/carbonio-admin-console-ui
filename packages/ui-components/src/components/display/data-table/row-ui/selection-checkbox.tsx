/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
 * Table selection control styled to match the Customize mock checkbox
 * (filled primary square + white check). Native input keeps indeterminate
 * support and existing role="checkbox" tests.
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

  return (
    <span className={clsx(styles.selectionCheckbox, disabled && styles.selectionCheckboxDisabled)}>
      <input
        ref={ref}
        type="checkbox"
        className={styles.tableCheckbox}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={stopEventPropagation}
        onKeyDown={stopEventPropagation}
        onChange={onChange}
      />
    </span>
  );
};
