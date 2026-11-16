/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { IconName } from '../../web-components/icon-registry';
import { Button } from '../basic/button/button';
import { Tooltip } from '../display/Tooltip';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';

type DisplayerButtonBase = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large' | 'extralarge';
  color?: string;
};

/**
 * Left-aligned buttons are icon-only pin toggles named internally via the pin
 * tooltip. Right-aligned buttons must carry their own accessible name: a
 * visible label, or (icon-only) a tooltiplabel used as aria-label.
 */
type DisplayerLeftButton = DisplayerButtonBase & { align: 'left'; icon: IconName };
type DisplayerRightButton = DisplayerButtonBase & {
  align: 'right';
  type?: 'outlined' | 'ghost' | 'default';
} & (
    | { label: string; icon?: IconName; tooltiplabel?: string }
    | { label?: never; tooltiplabel: string; icon: IconName }
  );
type DisplayerButton = DisplayerLeftButton | DisplayerRightButton;

type DisplayerProps = {
  buttons: Array<DisplayerButton>;
  pinIcon: boolean;
};

const Displayer: FC<DisplayerProps> = ({ buttons, pinIcon }) => {
  const { t } = useTranslation();
  const rightAlignButtons = buttons.filter(
    (button): button is DisplayerRightButton => button.align === 'right',
  );
  const leftIcons = buttons.filter(
    (button): button is DisplayerLeftButton => button.align === 'left',
  );
  const pinLabel = pinIcon
    ? t(
        'label.click_to_make_the_button_bar_scroll_with_the_page',
        'Click to make the button bar scroll with the page',
      )
    : t('label.click_to_make_the_button_bar_sticky', 'Click to make the button bar sticky');

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
          <Tooltip placement="bottom" label={pinLabel} key={button.icon ?? i}>
            <Button
              type="ghost"
              color="text"
              size="extralarge"
              icon={button?.icon}
              aria-label={pinLabel}
              onClick={(): void => {
                button?.onClick?.();
              }}
            />
          </Tooltip>
        ))}
      </Row>

      <Row orientation="horizontal" mainAlignment="flex-end">
        {rightAlignButtons?.map((button, i) => {
          const nameProps = button.label
            ? { label: button.label }
            : {
                // DisplayerRightButton guarantees tooltiplabel when label
                // is absent; TS cannot narrow past the falsy empty-string label.
                'aria-label': button.tooltiplabel as string,
              };
          return (
            <Padding key={button.label ?? button.icon ?? i} left="large">
              <Tooltip
                placement="bottom"
                label={button.tooltiplabel}
                disabled={!button.tooltiplabel}
              >
                <Button
                  {...nameProps}
                  loading={button?.loading ?? false}
                  icon={button?.icon}
                  size={button?.size ?? 'extralarge'}
                  disabled={button?.disabled ?? false}
                  type={button?.type ?? 'outlined'}
                  color={button?.color ?? 'primary'}
                  onClick={(): void => {
                    button?.onClick?.();
                  }}
                />
              </Tooltip>
            </Padding>
          );
        })}
      </Row>
    </Row>
  );
};

export { Displayer, type DisplayerButton, type DisplayerProps };
