/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId } from 'react';

import styles from './plain-switch.module.css';

export type PlainSwitchProps = Omit<React.ComponentPropsWithRef<'input'>, 'type' | 'role' | 'id'> & {
  /** Visible title, rendered as the clickable <label> of the switch. */
  label: string;
  /** Non-interactive secondary text under the title, linked via aria-describedby. `null` is treated as absent. */
  description?: string | null;
};

/**
 * Accessible on/off switch built on a native `<input type="checkbox" role="switch">`.
 * Only the track and the title toggle it; the description is not clickable.
 * `className` and `style` are applied to the root; every other prop is forwarded to the input.
 */
export const PlainSwitch = ({
  label,
  description,
  disabled,
  className,
  style,
  'aria-describedby': callerDescribedBy,
  ...rest
}: PlainSwitchProps) => {
  const inputId = useId();
  const descriptionId = useId();
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);

  return (
    <div
      className={clsx(styles.root, className)}
      style={style}
      data-disabled={disabled || undefined}
    >
      <span className={styles.control}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={styles.input}
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
      <span className={styles.text}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>
    </div>
  );
};
