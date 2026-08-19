/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, DefaultTabBarItem, type DefaultTabBarItemProps } from '@zextras/ui-components';

export const ReusedDefaultTabBar = ({
  item,
  selected,
  onClick,
}: Readonly<DefaultTabBarItemProps>) => {
  const count = (item as { count?: number }).count;
  return (
    <DefaultTabBarItem
      item={item}
      selected={selected}
      onClick={onClick}
      orientation="horizontal"
      background={'transparent'}
      underlineColor={'primary'}
      forceWidthEquallyDistributed={false}
    >
      <Container
        orientation="horizontal"
        mainAlignment="flex-end"
        crossAlignment="flex-end"
        padding={{ all: 'medium' }}
        width="100%"
      >
        <Container mainAlignment="flex-end" crossAlignment="flex-end" width="100%" height="auto">
          <ds-text as="span" size="small" weight="regular" color={selected ? 'primary' : 'gray'}>
            {item.label} ({count ?? 0})
          </ds-text>
        </Container>
      </Container>
    </DefaultTabBarItem>
  );
}
