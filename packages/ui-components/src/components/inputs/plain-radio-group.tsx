/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId } from 'react';

import { RadioGroupContext, type RadioValue } from './plain-radio';
import styles from './plain-radio.module.css';

export type PlainRadioGroupProps = Omit<
  React.ComponentPropsWithRef<'fieldset'>,
  'onChange' | 'role'
> & {
  /** Selected value; the group is always controlled. */
  value: RadioValue;
  /** Fired with the value of the radio the user selects. */
  onChange: (value: RadioValue) => void;
  /** Visible group title rendered as <legend>. Without it, pass `aria-label` or `aria-labelledby`. */
  legend?: React.ReactNode;
  /** Shared native `name` of the radios; generated when omitted. */
  name?: string;
};

/**
 * Native `<fieldset role="radiogroup">` whose PlainRadio children share one `name`,
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
  ...rest
}: PlainRadioGroupProps) => {
  const generatedName = useId();

  return (
    <fieldset
      role="radiogroup"
      className={clsx(styles.group, className)}
      disabled={disabled}
      {...rest}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      <RadioGroupContext.Provider
        value={{ name: name ?? generatedName, value, disabled, onSelect: onChange }}
      >
        {children}
      </RadioGroupContext.Provider>
    </fieldset>
  );
};
