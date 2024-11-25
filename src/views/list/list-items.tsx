/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Container, Padding, List, Text, Divider, ListItem } from '@zextras/carbonio-design-system';

const ListItems: FC<{
	items: any;
	selectedOperationItem: any;
	setSelectedOperationItem: any;
}> = ({ items, selectedOperationItem, setSelectedOperationItem }) => {
	const selectOption = useCallback(
		(item: { id: string; isSelected: boolean; background: string }) => () => {
			if (item?.isSelected) {
				setSelectedOperationItem(item?.id);
			}
		},
		[setSelectedOperationItem]
	);

	return (
		<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
			<List>
				{items.map((item: any) => (
					<ListItem
						active={item?.id === selectedOperationItem}
						selected={item?.isSelected}
						background={item?.background}
						key={item?.id}
					>
						{(visible: boolean): React.JSX.Element =>
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
											<Text
												color="gray0"
												weight={item?.id === selectedOperationItem ? 'bold' : 'regular'}
												style={item?.isSelected ? { opacity: '1' } : { opacity: '0.5' }}
											>
												{item.name}
											</Text>
										</Padding>
									</Container>
									<Divider color="gray3" />
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

export default ListItems;
