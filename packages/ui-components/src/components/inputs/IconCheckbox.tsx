/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-icon';

import { useCallback, useMemo, useRef } from 'react';

import { useCheckbox } from '../../hooks/useCheckbox';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { type IconName } from '../../web-components/icon-registry';
import { Container, ContainerProps } from '../layout/Container';
import { Padding } from '../layout/Padding';
import styles from './IconCheckbox.module.css';

const padding = {
  small: 'extrasmall',
  regular: 'small',
  large: 'medium',
} as const;

type IconCheckboxProps = Omit<ContainerProps, 'margin'> & {
  defaultChecked?: boolean;
  label?: string;
  borderRadius?: 'regular' | 'round';
  disabled?: boolean;
  icon: IconName;
  size?: 'small' | 'regular' | 'large';
  margin?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
  value?: boolean;
  onChange: () => void;
  iconAriaLabel?: string;
};

const IconCheckbox = ({
  defaultChecked = false,
  label,
  borderRadius = 'round',
  disabled = false,
  icon,
  size = 'regular',
  margin = 'extrasmall',
  value,
  onChange,
  iconAriaLabel,
  ref,
  ...rest
}: IconCheckboxProps) => {
  const iconCheckboxRef = useCombinedRefs<HTMLDivElement>(ref);

  const containerRef = useRef<HTMLDivElement>(null);

  const onClick = useCallback(() => {
    onChange?.();
  }, [onChange]);

  const checked = useCheckbox({
    ref: containerRef,
    defaultChecked,
    value,
    disabled,
    onClick,
    onChange,
  });

  const iconSize = useMemo(() => (size === 'small' ? 'medium' : 'large'), [size]);

  const iconWrapperStyle = useMemo(
    () =>
      ({
        '--icon-wrapper-radius': borderRadius === 'regular' ? 'var(--border-radius)' : '50%',
        '--icon-wrapper-bg': checked ? resolveThemeColor('primary', 'regular') : 'transparent',
        '--icon-wrapper-bg-hover': checked
          ? resolveThemeColor('primary', 'hover')
          : resolveThemeColor('transparent', 'hover'),
        '--icon-wrapper-bg-focus': checked
          ? resolveThemeColor('primary', 'focus')
          : resolveThemeColor('transparent', 'focus'),
        '--icon-wrapper-bg-active': checked
          ? resolveThemeColor('primary', 'active')
          : resolveThemeColor('transparent', 'active'),
        '--icon-wrapper-bg-disabled': checked
          ? resolveThemeColor('primary', 'disabled')
          : resolveThemeColor('transparent', 'disabled'),
        '--icon-fill': checked ? resolveThemeColor('gray6', 'regular') : 'currentColor',
        '--icon-fill-hover': checked
          ? resolveThemeColor('gray6', 'hover')
          : resolveThemeColor('primary', 'hover'),
        '--icon-fill-focus': checked
          ? resolveThemeColor('gray6', 'focus')
          : resolveThemeColor('primary', 'focus'),
        '--icon-fill-disabled': checked ? resolveThemeColor('gray6', 'disabled') : 'currentColor',
      } as React.CSSProperties),
    [borderRadius, checked],
  );

  const iconWrapperClassName = `${styles.iconWrapper} ${disabled ? styles.disabled : ''}`;

  return (
    <Container
      ref={containerRef}
      orientation="horizontal"
      width="fit"
      height="fit"
      padding={{ horizontal: margin }}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
      crossAlignment="center"
      {...rest}
    >
      <div
        ref={iconCheckboxRef}
        className={iconWrapperClassName}
        style={iconWrapperStyle}
        tabIndex={disabled ? -1 : 0}
      >
        <Padding all={padding[size]}>
          <ds-icon size={iconSize} icon={icon} aria-label={iconAriaLabel}></ds-icon>
        </Padding>
      </div>
      {label && (
        <ds-text
          as="label"
          style={{ whiteSpace: 'normal', paddingLeft: 'var(--padding-small)', userSelect: 'none' } as React.CSSProperties}
          size="medium"
          weight="regular"
        >
          {label}
        </ds-text>
      )}
    </Container>
  );
};

export type { IconCheckboxProps };
export { IconCheckbox };
