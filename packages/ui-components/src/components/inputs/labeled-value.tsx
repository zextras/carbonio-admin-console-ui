/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import styles from './labeled-value.module.css';

type LabeledValueProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  textColor?: AnyColor;
  label?: string;
  value?: string | number;
  CustomIcon?: React.ComponentType;
};

export const LabeledValue = ({
  textColor = 'text',
  label,
  value,
  CustomIcon,
}: LabeledValueProps) => {
  const valueStyle = {
    '--text-color': resolveThemeColor(textColor, 'regular'),
  } as React.CSSProperties;

  return (
    <div className={styles.outerWrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.fieldWrapper}>
        <span className={styles.value} style={valueStyle}>
          {value}
        </span>
        {CustomIcon && (
          <span className={styles.iconWrapper}>
            <CustomIcon />
          </span>
        )}
      </div>
    </div>
  );
};
