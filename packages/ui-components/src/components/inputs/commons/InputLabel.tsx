/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import { CSSProperties, FC, LabelHTMLAttributes } from 'react';

import { resolveThemeColor } from '../../../theme/theme-utils';
import styles from './InputLabel.module.css';

type InputLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  $hasError?: boolean;
  $hasFocus?: boolean;
  $disabled?: boolean;
  children?: React.ReactNode;
};

export const InputLabel: FC<InputLabelProps> = ({
  $hasError,
  $hasFocus,
  $disabled,
  className,
  style,
  children,
  ...rest
}) => {
  const labelColor = resolveThemeColor(
    ($hasError && 'error') || ($hasFocus && 'primary') || 'secondary',
    $disabled ? 'disabled' : 'regular',
  );

  const labelStyle = {
    '--label-color': labelColor,
    ...style,
  } as CSSProperties;

  return (
    <label className={clsx(styles.label, className)} style={labelStyle} {...rest}>
      {children}
    </label>
  );
};
