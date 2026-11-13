/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/ds-icon';

import React, { useRef, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { type IconName } from '../../web-components/icon-registry';
import { Container } from '../layout/Container';
import { Row, RowProps } from '../layout/Row';
import styles from './Chip.module.css';
import { Tooltip } from './Tooltip';

type ChipAction = {
  /** Chip action icon color */
  color?: AnyColor;
  /** Chip action disabled status */
  disabled?: boolean;
  /** Chip action icon */
  icon: IconName;
  /** Chip action id (required for key attribute) */
  id: string;
  /** Chip action label value. It is shown in a tooltip. To not render the tooltip, just don't value the prop.
   * Tooltips of the actions are not shown in case the chip is disabled */
  label?: string;
} & (
  | {
      /** Chip action type */
      type: 'button';
      /** Chip action click callback (button type only). NB: onClick event IS propagated. It's up to the dev to eventually stop the propagation */
      onClick: React.MouseEventHandler;
      /** Chip action background (button type only) */
      background?: AnyColor;
    }
  | {
      /** Chip action type */
      type: 'icon';
    }
);

type ChipProps = Omit<RowProps, 'children'> & {
  /** Chip actions (buttons or icons) */
  actions?: ChipAction[];
  /** Chip background color */
  background?: AnyColor;
  /** Chip shape  */
  shape?: 'regular' | 'round';
  /** If an onClose callback is provided, this prop defines if the close action should be active or disabled */
  closable?: boolean;
  /** Chip text color */
  color?: AnyColor;
  /** Chip disabled status. If a string is provided it is shown in a tooltip */
  disabled?: boolean | string;
  /** Chip error. If a string is provided it is shown in a tooltip */
  error?: boolean | string;
  /** Chip content key text */
  keyLabel?: string;
  /** Chip content text. It can be a simple string or a custom Component, which is then rendered inside a Row */
  label?: string | React.ReactElement;
  /** Chip max width */
  maxWidth?: string;
  /** Chip click callback */
  onClick?: React.ReactEventHandler;
  /** Chip double-click callback */
  onDoubleClick?: React.ReactEventHandler;
  /** Callback to call when user tries to remove the Chip. If not provided, the close icon is hidden.
   * Be aware that the close action can be also provided with the actions prop  */
  onClose?: (event: React.MouseEvent) => void;
  /** Chip size */
  size?: 'small' | 'medium' | 'large';
  /** Tooltip placement */
  tooltipPlacement?: React.ComponentPropsWithoutRef<typeof Tooltip>['placement'];
  ref?: React.Ref<HTMLDivElement>;
};

const SIZES = {
  small: {
    font: 'extrasmall',
    icon: 'small',
    spacing: '0.25rem',
  },
  medium: {
    font: 'small',
    icon: 'medium',
    spacing: '0.5rem',
  },
  large: {
    font: 'medium',
    icon: 'large',
    spacing: '0.75rem',
  },
} as const;

function getChipColorVars(background: string): Record<string, string> {
  return {
    '--chip-bg': resolveThemeColor(background, 'regular'),
    '--chip-bg-hover': resolveThemeColor(background, 'hover'),
    '--chip-bg-active': resolveThemeColor(background, 'active'),
  };
}

function createActionItems(
  chipActions: Array<ChipAction>,
  deps: {
    disabled: ChipProps['disabled'];
    showInnerTooltip: () => void;
    hideInnerTooltip: () => void;
    tooltipPlacement: ChipProps['tooltipPlacement'];
    size: NonNullable<ChipProps['size']>;
    error: ChipProps['error'];
    shape: ChipProps['shape'];
  },
): Array<React.JSX.Element | undefined> {
  return chipActions.map((action) => {
    let item;
    const actionDisabled = !!deps.disabled || !action.label;
    const showTooltipHandler = (!actionDisabled && deps.showInnerTooltip) || undefined;
    const hideTooltipHandler = (!actionDisabled && deps.hideInnerTooltip) || undefined;
    if (action.type === 'icon') {
      item = (
        <Tooltip
          key={action.id}
          label={action.label}
          disabled={actionDisabled}
          placement={deps.tooltipPlacement}
        >
          <div
            className={styles.actionContainer}
            onMouseEnter={showTooltipHandler}
            onMouseLeave={hideTooltipHandler}
            onFocus={showTooltipHandler}
            onBlur={hideTooltipHandler}
            style={{ '--action-spacing': SIZES[deps.size].spacing } as React.CSSProperties}
          >
            <ds-icon
              icon={action.icon}
              color={deps.error ? 'error' : action.color}
              disabled={!!deps.disabled || action.disabled}
              size={SIZES[deps.size].icon}
            ></ds-icon>
          </div>
        </Tooltip>
      );
    } else if (action.type === 'button') {
      const clickHandler = (event: React.MouseEvent) => {
        event.preventDefault();
        action.onClick(event);
      };
      item = (
        <Tooltip
          key={action.id}
          label={action.label}
          disabled={actionDisabled}
          placement={deps.tooltipPlacement}
        >
          <button
            type="button"
            className={styles.actionButton}
            onMouseEnter={showTooltipHandler}
            onMouseLeave={hideTooltipHandler}
            onFocus={showTooltipHandler}
            onBlur={hideTooltipHandler}
            onClick={clickHandler}
            disabled={!!deps.disabled || action.disabled}
            style={
              {
                '--action-spacing': SIZES[deps.size].spacing,
                '--action-radius':
                  deps.shape === 'round' ? '100vh' : `calc(var(--border-radius) * 2)`,
                background: action.background
                  ? resolveThemeColor(action.background, 'regular')
                  : undefined,
              } as React.CSSProperties
            }
          >
            <ds-icon
              icon={action.icon}
              color={deps.error ? 'error' : action.color}
              disabled={!!deps.disabled || action.disabled}
              size={SIZES[deps.size].icon}
            ></ds-icon>
          </button>
        </Tooltip>
      );
    }
    return item;
  });
}

const Chip = ({
  actions = [],
  background = 'gray3',
  shape = 'round',
  closable = true,
  color,
  disabled,
  error,
  keyLabel,
  label,
  maxWidth,
  onClick,
  onClose,
  onDoubleClick,
  size = 'small',
  tooltipPlacement,
  ref,
  ...rest
}: ChipProps) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const chipRef = useCombinedRefs<HTMLDivElement>(ref, innerRef);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const chipActions = [...actions];
  if (onClose) {
    chipActions.push({
      id: 'CloseChipAction',
      icon: 'Close',
      onClick: onClose,
      type: 'button' as const,
      disabled: !closable,
    });
  }

  const showInnerTooltip = () => {
    setTooltipVisible(true);
  };

  const hideInnerTooltip = () => {
    setTooltipVisible(false);
  };

  const showLabelTooltip = () => {
    if (maxWidth && typeof label === 'string') {
      showInnerTooltip();
    }
  };

  const hideLabelTooltip = () => {
    if (maxWidth && typeof label === 'string') {
      hideInnerTooltip();
    }
  };

  const actionItems = createActionItems(chipActions, {
    disabled,
    showInnerTooltip,
    hideInnerTooltip,
    tooltipPlacement,
    size,
    error,
    shape,
  });

  const clickHandler: React.ReactEventHandler = (event) => {
    event.preventDefault();
    onClick?.(event);
  };

  const dblClickHandler: React.ReactEventHandler = (event) => {
    event.preventDefault();
    onDoubleClick?.(event);
  };

  const keyDownHandler: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      clickHandler(event);
    }
  };

  const backgroundColor = error ? 'error' : background;
  const isClickable = (onClick || onDoubleClick) && !disabled;
  const isDisabled = !!disabled;

  const chipStyle: React.CSSProperties = {
    ...getChipColorVars(backgroundColor),
    maxWidth: maxWidth || 'fit-content',
    minWidth: maxWidth ? '0' : 'max-content',
    gap: SIZES[size].spacing,
    padding: `calc(${SIZES[size].spacing} / 4) calc(${SIZES[size].spacing} / 2)`,
    backgroundColor: `var(--chip-bg)`,
    ...rest.style,
  };

  const chipContent = (
    <div
      className={styles.content}
      style={{
        gap: SIZES[size].spacing,
        minWidth: maxWidth ? '0' : 'fit',
      }}
    >
      {keyLabel && (
        <div className={styles.label} style={{ width: 'auto' }}>
          <ds-text
            as="span"
            weight="regular"
            size={SIZES[size].font}
            color={error ? 'gray6' : color}
            disabled={!!disabled}
          >
            {keyLabel}
          </ds-text>
        </div>
      )}
      {label && (
        <div
          className={styles.label}
          style={{
            width: 'fit',
            flexShrink: maxWidth ? 1 : 0,
            minWidth: 0,
          }}
          onMouseEnter={showLabelTooltip}
          onMouseLeave={hideLabelTooltip}
          onFocus={showLabelTooltip}
          onBlur={hideLabelTooltip}
        >
          <Tooltip
            label={(typeof label === 'string' && label) || ''}
            maxWidth="100%"
            disabled={!maxWidth || typeof label !== 'string'}
            overflowTooltip
            placement={tooltipPlacement}
          >
            <ds-text
              as="span"
              weight="light"
              size={SIZES[size].font}
              color={error ? 'gray6' : color}
              disabled={!!disabled}
            >
              {typeof label === 'string' ? label : <Row wrap="nowrap">{label}</Row>}
            </ds-text>
          </Tooltip>
        </div>
      )}
      {actionItems && actionItems.length > 0 && (
        <Container
          gap={`calc(${SIZES[size].spacing} / 2)`}
          orientation="horizontal"
          width="fit"
          minWidth="fit"
          flexShrink={0}
        >
          {actionItems}
        </Container>
      )}
    </div>
  );

  const hasClickHandlers = !!(onClick || onDoubleClick);

  if (hasClickHandlers) {
    return (
      <Tooltip
        disabled={
          ((typeof error !== 'string' || !error) && (typeof disabled !== 'string' || !disabled)) ||
          tooltipVisible
        }
        label={
          (typeof error === 'string' && error) || (typeof disabled === 'string' && disabled) || ''
        }
        placement={tooltipPlacement}
      >
        <button
          type="button"
          // ChipProps extends the div-based RowProps; the extra props are
          // element-agnostic and safe to forward to the button container.
          {...(rest as React.ComponentPropsWithoutRef<'button'>)}
          data-testid="chip"
          ref={chipRef as unknown as React.Ref<HTMLButtonElement>}
          className={styles.chip}
          style={chipStyle}
          data-shape={shape}
          data-clickable={isClickable || undefined}
          data-disabled={isDisabled || undefined}
          aria-disabled={isDisabled || undefined}
          onKeyDown={keyDownHandler}
          onClick={onClick && clickHandler}
          onDoubleClick={onDoubleClick && dblClickHandler}
        >
          {chipContent}
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      disabled={
        ((typeof error !== 'string' || !error) && (typeof disabled !== 'string' || !disabled)) ||
        tooltipVisible
      }
      label={
        (typeof error === 'string' && error) || (typeof disabled === 'string' && disabled) || ''
      }
      placement={tooltipPlacement}
    >
      <div
        {...rest}
        data-testid="chip"
        ref={chipRef}
        className={styles.chip}
        style={chipStyle}
        data-shape={shape}
        data-clickable={isClickable || undefined}
        data-disabled={isDisabled || undefined}
        aria-disabled={isDisabled || undefined}
      >
        {chipContent}
      </div>
    </Tooltip>
  );
};

export type { ChipAction, ChipProps };
export { Chip };
