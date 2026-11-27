/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { IconName } from '../../../web-components/icon-registry';
import { Tooltip } from '../Tooltip';
import styles from './dropdown.module.css';

export type ItemTextSize = NonNullable<React.ComponentPropsWithRef<'ds-text'>['size']>;

export type DropdownItemContentProps = {
  icon?: IconName;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  itemTextSize: ItemTextSize;
  tooltipLabel?: string;
};

export const DropdownItemContent = ({
  icon,
  label,
  selected,
  disabled,
  itemTextSize,
  tooltipLabel,
}: Readonly<DropdownItemContentProps>) => (
  <Tooltip disabled={!disabled || !tooltipLabel} label={tooltipLabel} placement="bottom-end">
    <div className={styles.rowLayout}>
      {icon && (
        <ds-icon
          className={styles.itemIcon}
          icon={icon}
          size="medium"
          color={disabled ? 'secondary' : 'text'}
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        ></ds-icon>
      )}
      <ds-text
        as="span"
        size={itemTextSize}
        weight={selected ? 'bold' : 'regular'}
        color={disabled ? 'secondary' : 'text'}
        disabled={disabled}
      >
        {label}
      </ds-text>
    </div>
  </Tooltip>
);
