/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type FC, type JSX, useCallback } from 'react';

import { List } from '../display/List/List';
import { ListItem } from '../display/ListItem';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';

type ListItemType = {
  id: string;
  name: string;
  isSelected: boolean;
  background?: string;
};

type ListItemsProps = {
  items: Array<ListItemType>;
  selectedOperationItem: string | null;
  setSelectedOperationItem: (id: string) => void;
};

const ListItems: FC<ListItemsProps> = ({
  items,
  selectedOperationItem,
  setSelectedOperationItem,
}) => {
  const selectOption = useCallback(
    (item: ListItemType) => () => {
      if (item?.isSelected) {
        setSelectedOperationItem(item?.id);
      }
    },
    [setSelectedOperationItem],
  );

  return (
    <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
      <List>
        {items.map((item) => (
          <ListItem
            active={item?.id === selectedOperationItem}
            selected={item?.isSelected}
            background={item?.background}
            key={item?.id}
          >
            {(visible: boolean): JSX.Element =>
              visible ? (
                <Container
                  height={52}
                  orientation="vertical"
                  mainAlignment="flex-start"
                  width="100%"
                  onClick={selectOption(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <Container
                    padding={{ all: 'small' }}
                    orientation="horizontal"
                    mainAlignment="flex-start"
                  >
                    <Padding horizontal="small">
                      <ds-text
                        as="span"
                        color="gray0"
                        weight={item?.id === selectedOperationItem ? 'bold' : 'regular'}
                        style={item?.isSelected ? { opacity: '1' } : { opacity: '0.5' }}
                      >
                        {item.name}
                      </ds-text>
                    </Padding>
                  </Container>
                  <ds-divider color="gray3"></ds-divider>
                </Container>
              ) : (
                <div style={{ height: '4rem' }} />
              )
            }
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export { ListItems, type ListItemsProps, type ListItemType };
