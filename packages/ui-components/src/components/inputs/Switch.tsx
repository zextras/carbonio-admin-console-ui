/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import { CSSProperties, useMemo, useRef } from 'react';

import { useCheckbox } from '../../hooks/useCheckbox';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { Text } from '../basic/text/Text';
import { Container, ContainerProps } from '../layout/Container';
import { Padding } from '../layout/Padding';
import styles from './Switch.module.css';

type SwitchSize = 'medium' | 'small';

type SwitchProps = Omit<ContainerProps, 'onChange' | 'onClick'> & {
  defaultChecked?: boolean;
  value?: boolean;
  label?: string;
  padding?: ContainerProps['padding'];
  disabled?: boolean;
  onClick?: (event: Event) => void;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
  iconColor?: string;
  ref?: React.Ref<HTMLDivElement>;
};

const Switch = ({
  defaultChecked = false,
  value,
  label,
  padding,
  disabled = false,
  onClick,
  onChange,
  size = 'medium',
  iconColor = 'gray0',
  ref,
  ...rest
}: SwitchProps) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const ckbRef = useCombinedRefs<HTMLDivElement>(ref, innerRef);
  const checked = useCheckbox({
    ref: ckbRef,
    defaultChecked,
    value,
    disabled,
    onClick,
    onChange,
  });

  const iconWrapperStyle = useMemo<CSSProperties>(
    () =>
      ({
        '--icon-color-focus': resolveThemeColor(String(iconColor), 'focus'),
        '--icon-color-hover': resolveThemeColor(String(iconColor), 'hover'),
        '--icon-color-active': resolveThemeColor(String(iconColor), 'active'),
        '--icon-color-disabled': resolveThemeColor(String(iconColor), 'disabled'),
      } as CSSProperties),
    [iconColor],
  );

  return (
    <Container
      ref={ckbRef}
      orientation="horizontal"
      width="fit"
      height="fit"
      padding={padding}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      crossAlignment="center"
      {...rest}
    >
      <div
        className={clsx(styles.iconWrapper, disabled && styles.disabled)}
        style={iconWrapperStyle}
        tabIndex={disabled ? -1 : 0}
      >
        <icon-wc
          icon={checked ? 'ToggleRight' : 'ToggleLeftOutline'}
          size={size === 'medium' ? 'large' : 'medium'}
          color={String(iconColor)}
          disabled={disabled || undefined}
        />
      </div>
      {label && (
        <Padding left="small">
          <Text
            className={styles.text}
            size={size === 'medium' ? 'medium' : 'small'}
            weight="regular"
            overflow="break-word"
            color="gray0"
            disabled={disabled}
          >
            {label}
          </Text>
        </Padding>
      )}
    </Container>
  );
};

export { Switch };
export type { SwitchProps };
