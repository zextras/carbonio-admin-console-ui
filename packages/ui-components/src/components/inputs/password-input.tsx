/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';

import iconStyles from './combobox-input.module.css';
import { TextInput, type TextInputProps } from './text-input';

export type PasswordInputProps = Omit<TextInputProps, 'type' | 'autoComplete'> & {
  /** Defaults to 'off' so browser password managers do not capture admin secrets; override for login-style fields. */
  autoComplete?: string;
};

export const PasswordInput = ({
  autoComplete = 'off',
  disabled,
  ...rest
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...rest}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      disabled={disabled}
      icon={
        <button
          type="button"
          className={iconStyles.iconButton}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            setVisible((current) => !current);
          }}
        >
          <ds-icon
            icon={visible ? 'EyeOffOutline' : 'EyeOutline'}
            size="1rem"
            color="var(--color-gray1-focus)"
            aria-hidden="true"
          />
        </button>
      }
    />
  );
};
