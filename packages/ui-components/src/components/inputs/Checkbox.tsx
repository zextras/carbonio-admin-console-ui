/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';

import { useCheckbox } from '../../hooks/useCheckbox';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { Text } from '../basic/text/Text';
import { Container, ContainerProps } from '../layout/Container';
import { Padding } from '../layout/Padding';
import styles from './Checkbox.module.css';

type CheckboxSize = 'medium' | 'small';

export type CheckboxProps = Omit<ContainerProps, 'onChange' | 'onClick'> & {
  /** status of the Checkbox */
  defaultChecked?: boolean;
  /** Checkbox value */
  value?: boolean;
  /** Checkbox size
   * @deprecated use size instead
   */
  iconSize?: 'small' | 'medium' | 'large' | 'extralarge';
  /** Checkbox color */
  iconColor?: AnyColor;
  /** Checkbox text */
  label?: string;
  /** Checkbox padding */
  padding?: ContainerProps['padding'];
  /** whether to disable the checkbox or not */
  disabled?: boolean;
  /** click callback */
  onClick?: (event: Event) => void;
  /** change callback */
  onChange?: (checked: boolean) => void;
  /** available sizes */
  size?: CheckboxSize;
  ref?: React.Ref<HTMLDivElement>;
};

export const Checkbox = ({
  defaultChecked = false,
  value,
  label,
  iconSize,
  iconColor = 'gray0',
  padding,
  disabled = false,
  onClick,
  onChange,
  size = 'medium',
  ref,
  ...rest
}: CheckboxProps) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const ckbRef = useCombinedRefs(ref, innerRef);
  const checked = useCheckbox({
    ref: ckbRef,
    defaultChecked,
    value,
    disabled,
    onClick,
    onChange,
  });

  const computedIconSize = useMemo(
    () =>
      // TODO simplify when iconSize will be removed
      iconSize ?? (size === 'medium' ? 'large' : 'medium'),
    [size, iconSize],
  );

  const iconWrapperClassName = clsx(styles.iconWrapper, disabled && styles.disabled);

  const iconWrapperStyle: React.CSSProperties = useMemo(
    () =>
      ({
        '--icon-wrapper-height':
          size === 'medium'
            ? 'calc(var(--font-size-medium) * 1.5)'
            : 'calc(var(--font-size-small) * 1.5)',
        '--icon-color-focus': resolveThemeColor(iconColor, 'focus'),
        '--icon-color-hover': resolveThemeColor(iconColor, 'hover'),
        '--icon-color-active': resolveThemeColor(iconColor, 'active'),
      } as React.CSSProperties),
    [size, iconColor],
  );

  return (
    <Container
      ref={ckbRef}
      orientation="horizontal"
      width="fit"
      height="fit"
      padding={padding}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      crossAlignment="flex-start"
      data-testid={'checkbox'}
      {...rest}
    >
      <div className={iconWrapperClassName} style={iconWrapperStyle} tabIndex={disabled ? -1 : 0}>
        <icon-wc
          icon={checked ? 'CheckmarkSquare' : 'Square'}
          size={computedIconSize}
          color={iconColor}
          disabled={disabled || undefined}
        />
      </div>
      {label && (
        <Padding left="small">
          <Text
            className={styles.customText}
            size={size}
            weight="regular"
            overflow="break-word"
            disabled={disabled}
            color="gray0"
          >
            {label}
          </Text>
        </Padding>
      )}
    </Container>
  );
};
