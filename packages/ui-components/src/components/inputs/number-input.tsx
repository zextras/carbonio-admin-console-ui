/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PlainInput, type PlainInputProps } from './plain-input';

/**
 * Normalizes a raw number-input value to digits only. Leading zeros are collapsed
 * while a single zero is preserved (`"007"` → `"7"`, `"0"` → `"0"`, `"000"` → `"0"`).
 */
function sanitizeNumberValue(raw: string): string {
  const digits = raw.replaceAll(/\D/g, '');
  return digits.replace(/^0+(?=\d)/, '');
}

export type NumberInputProps = Omit<
  PlainInputProps,
  'type' | 'value' | 'onChange' | 'inputMode'
> & {
  /** Controlled numeric value. */
  value: string | number;
  /** Receives the sanitized digits-only string; `''` when the field is empty. The caller owns the fallback. */
  onChange: (value: string) => void;
};

export const NumberInput = ({ value, onChange, ...rest }: NumberInputProps) => (
  <PlainInput
    type="number"
    inputMode="numeric"
    value={value}
    onChange={(e) => {
      onChange(sanitizeNumberValue(e.target.value));
    }}
    {...rest}
  />
);

export { sanitizeNumberValue };
