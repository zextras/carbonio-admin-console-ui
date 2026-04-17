/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-divider';

import React, { useMemo } from 'react';

import { getPaddingVar, resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import styles from './labeled-value.module.css';

type LabeledValueProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  backgroundColor?: AnyColor;
  textColor?: AnyColor;
  label?: string;
  value?: string | number;
  CustomIcon?: React.ComponentType;
};

export const LabeledValue = ({
  backgroundColor = 'gray5',
  textColor = 'text',
  label,
  value,
  CustomIcon,
}: LabeledValueProps) => {
  const computedTextColor = {
    '--text-color': resolveThemeColor(textColor, 'regular'),
  } as React.CSSProperties;

  const wrapperStyle = useMemo(() => {
    return {
      '--text-container-bg': resolveThemeColor(backgroundColor, 'regular'),
    } as React.CSSProperties;
  }, [backgroundColor]);

  const innerStyle = {
    ...computedTextColor,
    padding: getPaddingVar({ vertical: label ? '0.0625rem' : '0.625rem' }),
  } as React.CSSProperties;

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.fieldWrapper} style={wrapperStyle}>
        <div className={styles.relativeContainer} style={innerStyle}>
          <span className={styles.value}>{value}</span>
          {label && <span className={styles.label}>{label}</span>}
        </div>
        {CustomIcon && (
          <span className={styles.iconWrapper}>
            <CustomIcon />
          </span>
        )}
      </div>
      <ds-divider color={'gray3'}></ds-divider>
    </div>
  );
};
