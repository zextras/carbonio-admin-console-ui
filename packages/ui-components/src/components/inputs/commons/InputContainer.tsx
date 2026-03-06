/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import { CSSProperties, FC, HTMLAttributes, useMemo } from 'react';

import { resolveThemeColor } from '../../../theme/theme-utils';
import { Container, ContainerProps } from '../../layout/Container';
import styles from './InputContainer.module.css';

type InputContainerOwnProps = {
  background: NonNullable<ContainerProps['background']>;
  $disabled?: boolean;
};

export type InputContainerProps = InputContainerOwnProps &
  Omit<ContainerProps, 'background'> &
  Omit<HTMLAttributes<HTMLDivElement>, keyof ContainerProps>;

const COLOR_VARIANTS = ['regular', 'hover', 'focus', 'active', 'disabled'] as const;
const COLOR_SPLIT_REGEXP = new RegExp(`.(${COLOR_VARIANTS.join('|')})`);

function resolveColorVar(color: string, variant: string): string {
  return resolveThemeColor(color.replace(COLOR_SPLIT_REGEXP, ''), variant);
}

export const InputContainer: FC<InputContainerProps> = ({
  background,
  $disabled,
  className,
  style,
  ...rest
}) => {
  const containerStyle = useMemo<CSSProperties>(() => {
    const baseColor = background.replace(COLOR_SPLIT_REGEXP, '');
    return {
      '--input-container-bg': resolveColorVar(background, 'regular'),
      '--input-container-bg-hover': resolveColorVar(`${baseColor}.hover`, 'hover'),
      '--input-container-bg-focus': resolveColorVar(`${baseColor}.focus`, 'focus'),
      '--input-container-bg-active': resolveColorVar(`${baseColor}.active`, 'active'),
      '--input-container-bg-disabled': resolveColorVar(`${baseColor}.disabled`, 'disabled'),
      ...style,
    } as CSSProperties;
  }, [background, style]);

  return (
    <Container
      className={clsx(styles.inputContainer, $disabled && styles.disabled, className)}
      style={containerStyle}
      {...rest}
    />
  );
};
