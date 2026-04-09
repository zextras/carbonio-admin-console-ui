/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/divider-wc';

import { useMemo } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { Container, ContainerProps } from '../layout/Container';
import styles from './labeled-value.module.css';

type InputProps = ContainerProps & {
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
}: InputProps) => {
  const inputColor = useMemo(
    () =>
      ({
        '--input-color': resolveThemeColor(textColor, 'regular'),
      } as React.CSSProperties),
    [textColor],
  );

  const wrapperStyle = useMemo(() => {
    return {
      '--input-container-bg': resolveThemeColor(backgroundColor, 'regular'),
    } as React.CSSProperties;
  }, [backgroundColor]);

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start">
      <div className={styles.fieldWrapper} style={wrapperStyle}>
        <Container
          className={styles.relativeContainer}
          style={inputColor}
          padding={{ vertical: label ? '0.0625rem' : '0.625rem' }}
          mainAlignment={'flex-end'}
          height={'fill'}
          width={'fill'}
          minHeight={'inherit'}
        >
          <span className={styles.value}>{value}</span>
          {label && <span className={styles.label}>{label}</span>}
        </Container>
        {CustomIcon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CustomIcon />
          </span>
        )}
      </div>
      <divider-wc color={'gray3'}></divider-wc>
    </Container>
  );
};
