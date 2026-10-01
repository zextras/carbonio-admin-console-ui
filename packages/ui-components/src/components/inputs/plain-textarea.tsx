/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { useId, useLayoutEffect, useRef } from 'react';

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
  /** Auto-grow limit beyond which the field scrolls. */
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
  maxHeight = '10.313rem',
  ref: callerRef,
  'aria-describedby': callerDescribedBy,
  ...rest
}: PlainTextareaProps) => {
  const textareaId = useId();
  const descriptionId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaClassName = clsx(styles.control, textareaStyles.textarea, className);
  const describedBy = clsx(callerDescribedBy, description ? descriptionId : undefined);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

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
        rows={1}
        className={textareaClassName}
        style={{ maxHeight }}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        ref={(node: HTMLTextAreaElement | null) => {
          textareaRef.current = node;
          if (typeof callerRef === 'function') callerRef(node);
          else if (callerRef) callerRef.current = node;
        }}
        {...rest}
      />
    </InputShell>
  );
};
