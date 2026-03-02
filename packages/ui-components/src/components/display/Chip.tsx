/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../web-components/icon-wc';

import { map } from 'lodash-es';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { getThemeColorVar } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { type IconName } from '../../web-components/icon-registry';
import { Avatar, AvatarPropTypes } from '../basic/Avatar';
import { Text } from '../basic/text/Text';
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
  /** Chip Avatar Background Color */
  avatarBackground?: AvatarPropTypes['background'];
  /** Chip avatar color (icon color or capitals color) */
  avatarColor?: AvatarPropTypes['color'];
  /** Chip avatar label.
   * It allows overriding the capitals for the avatar.
   * If the main label is not a string, you have to fill this prop to show capitals in the avatar */
  avatarLabel?: AvatarPropTypes['label'];
  /** Chip avatar picture */
  avatarPicture?: AvatarPropTypes['picture'];
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
  /** Define if the chip avatar is visible or hidden */
  hasAvatar?: boolean;
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
    avatar: 'small',
    font: 'extrasmall',
    icon: 'small',
    spacing: '0.25rem',
  },
  medium: {
    avatar: 'medium',
    font: 'small',
    icon: 'medium',
    spacing: '0.5rem',
  },
  large: {
    avatar: 'large',
    font: 'medium',
    icon: 'large',
    spacing: '0.75rem',
  },
} as const;

function getChipColorVars(background: string): Record<string, string> {
  return {
    '--chip-bg': getThemeColorVar(background, 'regular'),
    '--chip-bg-hover': getThemeColorVar(background, 'hover'),
    '--chip-bg-active': getThemeColorVar(background, 'active'),
  };
}

const Chip = ({
  actions = [],
  avatarBackground,
  avatarColor,
  avatarLabel,
  avatarPicture,
  background = 'gray3',
  shape = 'round',
  closable = true,
  color,
  disabled,
  error,
  hasAvatar = true,
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

  const chipActions = useMemo(() => {
    const result = [...actions];
    if (onClose) {
      result.push({
        id: 'CloseChipAction',
        icon: 'Close',
        onClick: onClose,
        type: 'button' as const,
        disabled: !closable,
      });
    }
    return result;
  }, [actions, closable, onClose]);

  const showInnerTooltip = useCallback(() => {
    setTooltipVisible(true);
  }, []);

  const hideInnerTooltip = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const showLabelTooltip = useCallback(() => {
    maxWidth && typeof label === 'string' && showInnerTooltip();
  }, [label, maxWidth, showInnerTooltip]);

  const hideLabelTooltip = useCallback(() => {
    maxWidth && typeof label === 'string' && hideInnerTooltip();
  }, [hideInnerTooltip, label, maxWidth]);

  const actionItems = useMemo(
    () =>
      map(chipActions, (action) => {
        let item;
        const actionDisabled = !!disabled || !action.label;
        const showTooltipHandler = (!actionDisabled && showInnerTooltip) || undefined;
        const hideTooltipHandler = (!actionDisabled && hideInnerTooltip) || undefined;
        if (action.type === 'icon') {
          item = (
            <Tooltip
              key={action.id}
              label={action.label}
              disabled={actionDisabled}
              placement={tooltipPlacement}
            >
              <div
                className={styles.actionContainer}
                onMouseEnter={showTooltipHandler}
                onMouseLeave={hideTooltipHandler}
                onFocus={showTooltipHandler}
                onBlur={hideTooltipHandler}
                style={{ '--action-spacing': SIZES[size].spacing } as React.CSSProperties}
              >
                <icon-wc
                  icon={action.icon}
                  color={error ? 'gray6' : action.color}
                  disabled={!!disabled || action.disabled}
                  size={SIZES[size].icon}
                ></icon-wc>
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
              placement={tooltipPlacement}
            >
              <button
                type="button"
                className={styles.actionButton}
                onMouseEnter={showTooltipHandler}
                onMouseLeave={hideTooltipHandler}
                onFocus={showTooltipHandler}
                onBlur={hideTooltipHandler}
                onClick={clickHandler}
                disabled={!!disabled || action.disabled}
                style={
                  {
                    '--action-spacing': SIZES[size].spacing,
                    '--action-radius':
                      shape === 'round' ? '100vh' : `calc(var(--border-radius) * 2)`,
                    background: action.background
                      ? getThemeColorVar(action.background, 'regular')
                      : undefined,
                  } as React.CSSProperties
                }
              >
                <icon-wc
                  icon={action.icon}
                  color={error ? 'gray6' : action.color}
                  disabled={!!disabled || action.disabled}
                  size={SIZES[size].icon}
                ></icon-wc>
              </button>
            </Tooltip>
          );
        }
        return item;
      }),
    [
      chipActions,
      disabled,
      showInnerTooltip,
      hideInnerTooltip,
      tooltipPlacement,
      size,
      error,
      shape,
    ],
  );

  const clickHandler = useCallback<React.ReactEventHandler>(
    (event) => {
      event.preventDefault();
      onClick?.(event);
    },
    [onClick],
  );

  const dblClickHandler = useCallback<React.ReactEventHandler>(
    (event) => {
      event.preventDefault();
      onDoubleClick?.(event);
    },
    [onDoubleClick],
  );

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

  const contentMaxWidth = maxWidth
    ? `calc(100% - calc(${hasAvatar ? `var(--avatar-${SIZES[size].avatar}-diameter)` : '0'} + ${
        SIZES[size].spacing
      }))`
    : undefined;

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
        data-testid="chip"
        ref={chipRef}
        className={styles.chip}
        style={chipStyle}
        data-shape={shape}
        data-clickable={isClickable || undefined}
        data-disabled={isDisabled || undefined}
        onClick={onClick && clickHandler}
        onDoubleClick={onDoubleClick && dblClickHandler}
        {...rest}
      >
        {hasAvatar && (
          <Avatar
            size={SIZES[size].avatar}
            label={avatarLabel || (typeof label === 'string' && label) || ''}
            picture={avatarPicture}
            background={error ? 'error.active' : avatarBackground}
            color={error ? 'gray6' : avatarColor}
            shape={shape === 'regular' ? 'square' : shape}
            disabled={!!disabled}
          />
        )}
        <div
          className={styles.content}
          style={{
            gap: SIZES[size].spacing,
            minWidth: maxWidth ? '0' : 'fit',
            maxWidth: contentMaxWidth,
          }}
        >
          {keyLabel && (
            <div className={styles.label} style={{ width: 'auto' }}>
              <Text
                weight="regular"
                size={SIZES[size].font}
                color={error ? 'gray6' : color}
                disabled={!!disabled}
              >
                {keyLabel}
              </Text>
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
                <Text
                  weight="light"
                  size={SIZES[size].font}
                  color={error ? 'gray6' : color}
                  disabled={!!disabled}
                >
                  {typeof label === 'string' ? label : <Row wrap="nowrap">{label}</Row>}
                </Text>
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
      </div>
    </Tooltip>
  );
};

export type { ChipAction, ChipProps };
export { Chip };
