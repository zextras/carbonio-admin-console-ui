/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId } from 'react';

import { InputShell } from './input-shell';
import styles from './input-shell.module.css';
import textareaStyles from './plain-textarea.module.css';

export type PlainTextareaProps = Omit<
  React.ComponentPropsWithRef<'textarea'>,
  'value' | 'onChange' | 'defaultValue' | 'id'
> & {
  /** Always rendered as a visible <label> above the field. */
  label: string;
  /** Controlled value. The field is fully controlled by design: `value` and `onChange` are required and `defaultValue` is not accepted. */
  value: string;
  /** Fired on every keystroke; the caller owns the text. */
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
  description?: string | null;
  /** Marks the field as invalid (aria-invalid) and applies the error styling. */
  hasError?: boolean;
  /** Cap on the user-resizable height; unlimited when not provided. */
  maxHeight?: string;
};

export const PlainTextarea = ({
  label,
  value,
  onChange,
  disabled,
  required,
  className,
  hasError = false,
  description,
  maxHeight,
  ref: callerRef,
  'aria-describedby': callerDescribedBy,
  ...rest
}: PlainTextareaProps) => {
  const textareaId = useId();
  const descriptionId = useId();
  const textareaClassName = clsx(styles.control, textareaStyles.textarea, className);
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);

  return (
    <InputShell
      id={textareaId}
      label={label}
      disabled={disabled}
      required={required}
      hasError={hasError}
      description={description ?? ''}
      descriptionId={descriptionId}
      multiline
    >
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={2}
        className={textareaClassName}
        style={maxHeight ? { maxHeight } : undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        ref={callerRef}
        {...rest}
      />
    </InputShell>
  );
};
