/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';

import type { AnyColor, With$Prefix, Without$Prefix } from '../../../types/utils';
import { type IconName } from '../../../web-components/icon-registry';
import styles from './Button.module.css';

type ButtonSize = 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
type ButtonWidth = 'fit' | 'fill';
type ButtonIconPlacement = 'left' | 'right';
type ButtonColorsByType =
  | ({
      type?: 'default' | 'outlined';
    } & (
      | { color?: AnyColor }
      | {
          backgroundColor?: AnyColor;
          labelColor?: AnyColor;
        }
    ))
  | {
      type: 'ghost';
      color?: AnyColor;
    };
type ButtonType = NonNullable<ButtonColorsByType['type']>;

type ButtonSecondaryAction = {
  icon: IconName;
  /** Accessible name for the icon-only secondary trigger (forwarded as aria-label). */
  ariaLabel: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  forceActive?: boolean;
  ref?: React.RefObject<HTMLButtonElement | null>;
};

type ButtonPropsInternal = {
  forceActive?: boolean;
  disabled?: boolean;
  /**
   * Native HTML button type. Defaults to 'button' so that Buttons rendered
   * inside a <form> never submit it unless explicitly opted in.
   */
  htmlType?: 'button' | 'submit' | 'reset';
  icon?: IconName;
  iconPlacement?: ButtonIconPlacement;
  loading?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  width?: ButtonWidth;
  minWidth?: string;
  ref?: React.Ref<HTMLButtonElement>;
} & (
  /**
   * Every button must expose an accessible name: a visible label or an
   * aria-label (at least one, enforced at type level). `'aria-label'?: string`
   * on the first arm (instead of `never`) keeps `{...buttonAttrs}` spreads
   * assignable — aria-label overriding the visible label stays legal per
   * WCAG 2.5.3 Label-in-Name.
   */
  | { label: string; 'aria-label'?: string }
  | { label?: never; 'aria-label': string }
) & (
  | {
      size?: 'medium' | 'large' | 'extralarge';
      secondaryAction?: ButtonSecondaryAction;
    }
  | {
      size?: ButtonSize;
      secondaryAction?: never;
    }
) &
  ButtonColorsByType;

type ButtonProps = ButtonPropsInternal &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonPropsInternal>;

type StyledButtonProps = With$Prefix<{
  backgroundColor: string;
  color: string;
  padding: string;
  gap: string;
  buttonType: ButtonType;
  iconPlacement?: ButtonIconPlacement;
  forceActive: boolean;
  width: ButtonWidth;
  minWidth?: string;
}>;

const SIZES: Record<ButtonSize, { label: string; icon: string; padding: string; gap: string }> &
  Record<
    'medium' | 'large' | 'extralarge',
    { secondaryButton: { icon: string; padding: string } }
  > = {
  extrasmall: {
    label: '0.5rem',
    icon: '0.5rem',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  small: {
    label: '0.75rem',
    icon: '0.75rem',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  medium: {
    label: '1rem',
    icon: '1rem',
    padding: '0.5rem',
    gap: '0.5rem',
    secondaryButton: {
      icon: '1rem',
      padding: '0rem',
    },
  },
  large: {
    label: '1.25rem',
    icon: '1.25rem',
    padding: '0.5rem',
    gap: '0.5rem',
    secondaryButton: {
      icon: '1.25rem',
      padding: '0rem',
    },
  },
  extralarge: {
    label: '1.25rem',
    icon: '1.25rem',
    padding: '0.75rem',
    gap: '0.5rem',
    secondaryButton: {
      icon: '1.25rem',
      padding: '0rem',
    },
  },
} as const;

const SUPPORTS_SECONDARY_ACTION: Array<ButtonSize> = ['medium', 'large', 'extralarge'];

const DEFAULT_COLORS = {
  outlined: {
    backgroundColor: 'gray6',
    color: 'primary',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'primary',
  },
  default: {
    backgroundColor: 'primary',
    color: 'gray6',
  },
} as const;

function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replaceAll(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

function getColorStyles(colorName: string, bgName: string): Record<string, string> {
  return {
    '--btn-color': getThemeColorVar(colorName, 'regular'),
    '--btn-color-hover': getThemeColorVar(colorName, 'hover'),
    '--btn-color-active': getThemeColorVar(colorName, 'active'),
    '--btn-color-focus': getThemeColorVar(colorName, 'focus'),
    '--btn-color-disabled': getThemeColorVar(colorName, 'disabled'),
    '--btn-bg': getThemeColorVar(bgName, 'regular'),
    '--btn-bg-hover': getThemeColorVar(bgName, 'hover'),
    '--btn-bg-active': getThemeColorVar(bgName, 'active'),
    '--btn-bg-focus': getThemeColorVar(bgName, 'focus'),
    '--btn-bg-disabled': getThemeColorVar(bgName, 'disabled'),
  };
}

function getColors(
  type: ButtonType,
  props: ButtonColorsByType,
): Without$Prefix<Pick<StyledButtonProps, '$color' | '$backgroundColor'>> {
  const colors: Without$Prefix<Pick<StyledButtonProps, '$color' | '$backgroundColor'>> = {
    ...DEFAULT_COLORS[type],
  };
  if ('backgroundColor' in props && props.backgroundColor) {
    colors.backgroundColor = props.backgroundColor;
  }
  if ('labelColor' in props && props.labelColor) {
    colors.color = props.labelColor;
  }
  if ('color' in props && props.color) {
    if (type === 'default') {
      colors.backgroundColor = props.color;
    } else if (type === 'outlined' || type === 'ghost') {
      colors.color = props.color;
    }
  }
  return colors;
}

const WIDTHS: Record<ButtonWidth, { button: string; grid: string }> = {
  fit: { button: 'auto', grid: 'fit-content' },
  fill: { button: '100%', grid: '100%' },
};

const CONTENT_ORDER: Record<ButtonIconPlacement, { icon: number; text: number }> = {
  left: { icon: 1, text: 2 },
  right: { icon: 2, text: 1 },
};

function flagAttr(value: boolean | undefined): 'true' | undefined {
  return value ? 'true' : undefined;
}

function getButtonClassName(type: ButtonType): string {
  return clsx(styles.button, type === 'outlined' && styles.outlined);
}

function createClickHandler(
  disabled: boolean,
  loading: boolean,
  onClick: React.MouseEventHandler<HTMLButtonElement>,
): React.MouseEventHandler<HTMLButtonElement> {
  return (clickEvent) => {
    if (!disabled && !loading && onClick && !clickEvent.defaultPrevented) {
      onClick(clickEvent);
    }
  };
}

function createSecondaryActionClickHandler(
  secondaryAction: ButtonSecondaryAction | undefined,
  loading: boolean,
): React.MouseEventHandler<HTMLButtonElement> {
  return (clickEvent) => {
    if (secondaryAction && !secondaryAction.disabled && !loading) {
      secondaryAction.onClick(clickEvent);
    }
    clickEvent.preventDefault();
  };
}

function getButtonStyle({
  type,
  padding,
  gap,
  width,
  colorStyles,
}: {
  type: ButtonType;
  padding: string;
  gap: string;
  width: ButtonWidth;
  colorStyles: Record<string, string>;
}): React.CSSProperties {
  return {
    '--btn-padding': padding,
    '--btn-padding-adjusted': type === 'outlined' ? `calc(${padding} - 0.0625rem)` : padding,
    '--btn-gap': gap,
    '--btn-width': WIDTHS[width].button,
    ...colorStyles,
  } as React.CSSProperties;
}

function getGridStyle(
  width: ButtonWidth,
  minWidth: string | undefined,
  padding: string,
): React.CSSProperties {
  return {
    '--btn-width': WIDTHS[width].grid,
    '--btn-min-width': minWidth ?? '0',
    '--secondary-margin': padding,
  } as React.CSSProperties;
}

function getSecondaryButtonStyle(
  secondarySizeConfig: { icon: string; padding: string } | null,
  gap: string,
  colorStyles: Record<string, string>,
): React.CSSProperties | null {
  return secondarySizeConfig
    ? ({
        '--btn-padding': secondarySizeConfig.padding,
        '--btn-padding-adjusted': secondarySizeConfig.padding,
        '--btn-gap': gap,
        '--btn-width': 'auto',
        '--icon-size': secondarySizeConfig.icon,
        ...colorStyles,
      } as React.CSSProperties)
    : null;
}

function warnIfEmptyAccessibleName(
  label: string | undefined,
  ariaLabel: string | undefined,
): void {
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;
  if (isDev && !label?.trim() && !ariaLabel?.trim()) {
    console.error('Button: empty accessible name — pass label or aria-label');
  }
}

const Button = ({
  type = 'default',
  disabled = false,
  htmlType = 'button',
  label,
  size = 'medium',
  icon,
  iconPlacement = 'right',
  onClick,
  loading = false,
  forceActive = false,
  secondaryAction,
  width = 'fit',
  minWidth,
  ref,
  ...rest
}: ButtonProps) => {
  const clickHandler = createClickHandler(disabled, loading, onClick);
  const secondaryActionClickHandler = createSecondaryActionClickHandler(secondaryAction, loading);

  const colors = getColors(type, { type, ...rest });

  const hasSecondaryAction = secondaryAction && SUPPORTS_SECONDARY_ACTION.includes(size);

  warnIfEmptyAccessibleName(label, rest['aria-label']);

  const { padding, gap, icon: iconSize, label: textSize } = SIZES[size];

  const buttonClassName = getButtonClassName(type);
  const colorStyles = getColorStyles(colors.color, colors.backgroundColor);
  const buttonStyle = getButtonStyle({ type, padding, gap, width, colorStyles });
  const gridStyle = getGridStyle(width, minWidth, padding);

  const secondarySizeConfig = hasSecondaryAction
    ? SIZES[size as 'medium' | 'large' | 'extralarge'].secondaryButton
    : null;
  const secondaryButtonStyle = getSecondaryButtonStyle(secondarySizeConfig, gap, colorStyles);

  const contentOrder = CONTENT_ORDER[iconPlacement];

  return (
    <div className={styles.grid} style={gridStyle}>
      <button
        {...rest}
        type={htmlType}
        className={buttonClassName}
        style={{ ...buttonStyle, ...rest.style }}
        disabled={disabled}
        aria-busy={flagAttr(loading)}
        aria-disabled={flagAttr(loading)}
        onClick={clickHandler}
        ref={ref}
        data-force-active={flagAttr(!disabled && forceActive)}
      >
        {loading && (
          <div className={styles.loadingContainer} aria-hidden="true">
            <ds-spinner color="currentColor"></ds-spinner>
          </div>
        )}
        {icon && (
          <span
            className={styles.icon}
            data-loading={flagAttr(loading)}
            style={
              {
                '--icon-size': iconSize,
                '--icon-order': contentOrder.icon,
              } as React.CSSProperties
            }
          >
            <ds-icon
              aria-hidden="true"
              icon={icon}
              color="currentColor"
              size={iconSize}
            ></ds-icon>
          </span>
        )}
        {label && (
          <span
            className={styles.text}
            data-loading={flagAttr(loading)}
            style={
              {
                '--text-size': textSize,
                '--text-order': contentOrder.text,
              } as React.CSSProperties
            }
          >
            <ds-text
              as="span"
              color="currentColor"
              style={{ '--ds-text-font-size': textSize } as React.CSSProperties}
            >
              {label}
            </ds-text>
          </span>
        )}

        {hasSecondaryAction && secondarySizeConfig && (
          <span
            className={styles.secondaryPlaceholder}
            style={{ '--placeholder-padding': secondarySizeConfig.padding } as React.CSSProperties}
          >
            <ds-icon
              aria-hidden="true"
              icon={secondaryAction.icon}
              color="currentColor"
              size={secondarySizeConfig.icon}
            ></ds-icon>
          </span>
        )}
      </button>
      {hasSecondaryAction && secondaryButtonStyle && secondarySizeConfig && (
        <button
          type="button"
          aria-label={secondaryAction.ariaLabel}
          aria-disabled={flagAttr(loading)}
          className={clsx(styles.button, styles.secondaryAction)}
          style={secondaryButtonStyle}
          disabled={!!secondaryAction.disabled}
          ref={secondaryAction.ref}
          onClick={secondaryActionClickHandler}
          data-force-active={flagAttr(!secondaryAction.disabled && !!secondaryAction.forceActive)}
          data-loading={flagAttr(loading)}
        >
          <ds-icon
            aria-hidden="true"
            icon={secondaryAction.icon}
            color="currentColor"
            size={secondarySizeConfig.icon}
          ></ds-icon>
        </button>
      )}
    </div>
  );
};

export type { ButtonProps, ButtonSecondaryAction };
export { Button };
