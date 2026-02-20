/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, IconName, Padding, Row, Tooltip } from '@zextras/ui-components';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

type DisplayerButton = {
  align?: 'left' | 'right';
  label?: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'outlined' | 'ghost' | 'default';
  size?: 'small' | 'medium' | 'large' | 'extralarge';
  color?: string;
  tooltiplabel?: string;
};

type DisplayerProps = {
  buttons: Array<DisplayerButton>;
  pinIcon: boolean;
};

const Displayer: FC<DisplayerProps> = ({ buttons, pinIcon }) => {
  const { t } = useTranslation();
  const rightAlignButtons = buttons.filter((button) => button.align === 'right');
  const leftIcons = buttons.filter((button) => button.align === 'left');

  return (
    <Row
      orientation="horizontal"
      mainAlignment="space-between"
      width="100%"
      background="white"
      padding={{ all: 'large' }}
      style={{ position: pinIcon ? 'sticky' : 'relative', top: '0', zIndex: '1' }}
    >
      <Row orientation="horizontal" mainAlignment="flex-end">
        {leftIcons?.map((button, i) => (
          <Tooltip
            placement="bottom"
            label={
              pinIcon
                ? t(
                    'label.click_to_make_the_button_bar_scroll_with_the_page',
                    'Click to make the button bar scroll with the page',
                  )
                : t(
                    'label.click_to_make_the_button_bar_sticky',
                    'Click to make the button bar sticky',
                  )
            }
            key={i}
          >
            <Button
              type="ghost"
              color="text"
              size="extralarge"
              icon={button?.icon as IconName}
              onClick={(): void => {
                button?.onClick?.();
              }}
            />
          </Tooltip>
        ))}
      </Row>

      <Row orientation="horizontal" mainAlignment="flex-end">
        {rightAlignButtons?.map((button, i) => (
          <Padding key={i} left="large">
            <Tooltip placement="bottom" label={button.tooltiplabel} disabled={!button.tooltiplabel}>
              <Button
                loading={button?.loading ?? false}
                icon={button?.icon as IconName}
                size={button?.size ?? 'extralarge'}
                disabled={button?.disabled ?? false}
                type={button?.type ?? 'outlined'}
                label={button?.label ?? ''}
                color={button?.color ?? 'primary'}
                onClick={(): void => {
                  button?.onClick?.();
                }}
              />
            </Tooltip>
          </Padding>
        ))}
      </Row>
    </Row>
  );
};

export { Displayer, type DisplayerButton, type DisplayerProps };
