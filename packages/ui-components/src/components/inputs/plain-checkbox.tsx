/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId } from 'react';

import styles from './plain-checkbox.module.css';
import rowStyles from './selection-row.module.css';

export type PlainCheckboxProps = Omit<React.ComponentPropsWithRef<'input'>, 'type' | 'id'> & {
  /** Visible title, rendered as the clickable <label>. Without it, pass `aria-label`. */
  label?: string;
  /** Non-interactive secondary text under the title, linked via aria-describedby. `null` is treated as absent. */
  description?: React.ReactNode;
  /** Ref to the root element (e.g. a tooltip anchor covering control and title). */
  rootRef?: React.Ref<HTMLDivElement>;
};

/**
 * Accessible checkbox built on a native `<input type="checkbox">`.
 * Only the control and the title toggle it; the description is not clickable.
 * `className`, `style` and `rootRef` are applied to the root; every other prop is forwarded to the input.
 */
export const PlainCheckbox = ({
  label,
  description,
  disabled,
  className,
  style,
  rootRef,
  'aria-describedby': callerDescribedBy,
  ...rest
}: PlainCheckboxProps) => {
  const inputId = useId();
  const descriptionId = useId();
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);

  return (
    <div
      ref={rootRef}
      className={clsx(rowStyles.root, styles.root, className)}
      style={style}
      data-disabled={disabled || undefined}
    >
      <span className={rowStyles.control}>
        <input
          id={inputId}
          type="checkbox"
          className={clsx(rowStyles.input, styles.input)}
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        <svg
          className={clsx(rowStyles.icon, styles.icon)}
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <rect className={styles.box} x="3" y="3" width="14" height="14" rx="2" />
          <path className={styles.check} d="M6.5 10.2 8.8 12.5 13.5 7.6" />
        </svg>
      </span>
      {(label || description) && (
        <span className={rowStyles.text}>
          {label && (
            <label htmlFor={inputId} className={rowStyles.label}>
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className={rowStyles.description}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
