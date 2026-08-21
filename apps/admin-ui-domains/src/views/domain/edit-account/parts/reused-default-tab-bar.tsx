/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DefaultTabBarItem, type DefaultTabBarItemProps } from '@zextras/ui-components';
import type { HTMLAttributes } from 'react';

type ReusedDefaultTabBarProps = DefaultTabBarItemProps & HTMLAttributes<HTMLDivElement>;

export const ReusedDefaultTabBar = ({
  item,
  selected,
  onClick,
  tabIndex,
}: ReusedDefaultTabBarProps) => (
  <DefaultTabBarItem
    item={item}
    tabIndex={tabIndex}
    selected={selected}
    onClick={onClick}
    orientation="horizontal"
    background="gray6"
    underlineColor="primary"
    forceWidthEquallyDistributed={false}
  >
    <div className="p-sm">
      <ds-text size="small" color={selected ? 'primary' : 'gray'} as="span">
        {item.label}
      </ds-text>
    </div>
  </DefaultTabBarItem>
);
