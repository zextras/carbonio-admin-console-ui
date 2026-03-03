/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import { CSSProperties, FC, LabelHTMLAttributes, useMemo } from 'react';

import { resolveThemeColor } from '../../../theme/theme-utils';
import styles from './InputLabel.module.css';

type InputLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  $hasError?: boolean;
  $hasFocus?: boolean;
  $disabled?: boolean;
};

export const InputLabel: FC<InputLabelProps> = ({
  $hasError,
  $hasFocus,
  $disabled,
  className,
  style,
  ...rest
}) => {
  const labelColor = useMemo(() => {
    const color = ($hasError && 'error') || ($hasFocus && 'primary') || 'secondary';
    return resolveThemeColor(color, $disabled ? 'disabled' : 'regular');
  }, [$hasError, $hasFocus, $disabled]);

  const labelStyle = useMemo<CSSProperties>(
    () =>
      ({
        '--label-color': labelColor,
        ...style,
      } as CSSProperties),
    [labelColor, style],
  );

  return <label className={clsx(styles.label, className)} style={labelStyle} {...rest} />;
};
