/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/divider-wc';

import { useMemo } from 'react';

import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { INPUT_BACKGROUND_COLOR } from '../constants';
import { Container, ContainerProps } from '../layout/Container';
import { InputContainer } from './commons/InputContainer';
import styles from './labeled-value.module.css';

type InputProps = ContainerProps & {
  backgroundColor?: AnyColor;
  textColor?: AnyColor;
  label?: string;
  value?: string | number;
  CustomIcon?: React.ComponentType;
};

export const LabeledValue = ({
  backgroundColor = INPUT_BACKGROUND_COLOR,
  textColor = 'text',
  label,
  value,
  CustomIcon,
}: InputProps) => {
  const labelColor = resolveThemeColor('secondary', 'regular');

  const inputColor = useMemo<React.CSSProperties>(
    () =>
      ({
        '--input-color': resolveThemeColor(String(textColor), 'regular'),
        '--label-color': labelColor,
      } as React.CSSProperties),
    [textColor, labelColor],
  );

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start">
      <InputContainer
        orientation="horizontal"
        width="fill"
        height="fit"
        crossAlignment={'center'}
        borderRadius="half"
        background={backgroundColor}
        padding={{ horizontal: '0.75rem' }}
        gap={'0.5rem'}
      >
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
      </InputContainer>
      <divider-wc color={'gray3'}></divider-wc>
    </Container>
  );
};
