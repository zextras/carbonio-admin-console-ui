/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { createContext, useContext, useId } from 'react';

import styles from './plain-radio.module.css';
import rowStyles from './selection-row.module.css';

export type RadioValue = React.InputHTMLAttributes<HTMLInputElement>['value'];

type RadioGroupContextValue = {
  name: string;
  value: RadioValue;
  disabled?: boolean;
  onSelect: (value: RadioValue) => void;
};

/** Provided by PlainRadioGroup; radios rendered outside a group behave as plain native radios. */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type PlainRadioProps = Omit<React.ComponentPropsWithRef<'input'>, 'type' | 'id'> & {
  /** Visible title, rendered as the clickable <label>. Without it, pass `aria-label`. */
  label?: React.ReactNode;
  /** Non-interactive secondary text under the title, linked via aria-describedby. `null` is treated as absent. */
  description?: React.ReactNode;
  /** Ref to the root element. */
  rootRef?: React.Ref<HTMLDivElement>;
};

/**
 * Accessible radio built on a native `<input type="radio">`.
 * Inside a PlainRadioGroup it takes `name`, `checked` and `disabled` from the group, so the browser
 * handles Arrow keys and Tab for the whole group.
 * `className`, `style` and `rootRef` are applied to the root; every other prop is forwarded to the input.
 */
export const PlainRadio = ({
  label,
  description,
  disabled,
  className,
  style,
  rootRef,
  value,
  name,
  checked,
  onChange,
  'aria-describedby': callerDescribedBy,
  ...rest
}: PlainRadioProps) => {
  const group = useContext(RadioGroupContext);
  const inputId = useId();
  const descriptionId = useId();
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);
  const isDisabled = disabled || group?.disabled;

  return (
    <div
      ref={rootRef}
      className={clsx(rowStyles.root, styles.root, className)}
      style={style}
      data-disabled={isDisabled || undefined}
    >
      <span className={rowStyles.control}>
        <input
          id={inputId}
          type="radio"
          className={clsx(rowStyles.input, styles.input)}
          disabled={isDisabled}
          value={value}
          name={group?.name ?? name}
          checked={group ? group.value === value : checked}
          onChange={(event) => {
            onChange?.(event);
            group?.onSelect(value);
          }}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        <svg
          className={clsx(rowStyles.icon, styles.icon)}
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <circle className={styles.ring} cx="10" cy="10" r="7.5" />
          <circle className={styles.dot} cx="10" cy="10" r="4" />
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
