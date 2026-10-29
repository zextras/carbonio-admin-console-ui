/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId } from 'react';

import { RadioGroupContext, type RadioValue } from './plain-radio';
import styles from './plain-radio.module.css';

export type PlainRadioGroupProps = Omit<React.ComponentPropsWithRef<'div'>, 'onChange' | 'role'> & {
  /** Selected value; the group is always controlled. */
  value: RadioValue;
  /** Fired with the value of the radio the user selects. */
  onChange: (value: RadioValue) => void;
  /** Visible group title, used as the group name. Without it, pass `aria-label` or `aria-labelledby`. */
  legend?: React.ReactNode;
  /** Shared native `name` of the radios; generated when omitted. */
  name?: string;
  /** Disables every radio of the group. */
  disabled?: boolean;
};

/**
 * `role="radiogroup"` container whose PlainRadio children share one native `name`,
 * so Arrow keys move the selection and Tab enters/leaves the group.
 */
export const PlainRadioGroup = ({
  value,
  onChange,
  legend,
  name,
  disabled,
  className,
  children,
  'aria-labelledby': callerLabelledBy,
  ...rest
}: PlainRadioGroupProps) => {
  const generatedName = useId();
  const legendId = useId();

  return (
    <div
      role="radiogroup"
      className={clsx(styles.group, className)}
      aria-disabled={disabled || undefined}
      aria-labelledby={callerLabelledBy ?? (legend ? legendId : undefined)}
      {...rest}
    >
      {legend && (
        <span id={legendId} className={styles.legend}>
          {legend}
        </span>
      )}
      <RadioGroupContext.Provider
        value={{ name: name ?? generatedName, value, disabled, onSelect: onChange }}
      >
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
};
