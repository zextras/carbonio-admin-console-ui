/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultTabBarItem, Row } from '@zextras/ui-components';
import { type FC, type ReactElement } from 'react';

type ReusedDefaultTabBarProps = {
  item: any;
  index: any;
  selected: any;
  onClick: any;
};

export const ReusedDefaultTabBar: FC<ReusedDefaultTabBarProps> = ({
  item,
  index,
  selected,
  onClick,
}): ReactElement => (
  <DefaultTabBarItem
    item={item}
    tabIndex={index}
    selected={selected}
    onClick={onClick}
    orientation="horizontal"
    background="gray6"
    underlineColor="primary"
    forceWidthEquallyDistributed={false}
  >
    <Row padding="small">
      <ds-text as="span" size="small" color={selected ? 'primary' : 'gray'}>
        {item.label}
      </ds-text>
    </Row>
  </DefaultTabBarItem>
);
