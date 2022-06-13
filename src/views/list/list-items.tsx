/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';
import { Container, Padding, List, Text, Divider } from '@zextras/carbonio-design-system';

const ListItems: FC<{
	items: any;
	selectedOperationItem: any;
	setSelectedOperationItem: any;
}> = ({ items, selectedOperationItem, setSelectedOperationItem }) => {
	const selectOption = useCallback(
		(item) => () => {
			if (item?.isSelected) {
				setSelectedOperationItem(item?.id);
			}
		},
		[setSelectedOperationItem]
	);
	const ListItem: FC<{
		visible: any;
		active: boolean;
		item: any;
		selected: boolean;
		selecting: any;
		background: any;
		selectedBackground: any;
		activeBackground: any;
	}> = ({
		visible,
		active,
		item,
		selected,
		selecting,
		background,
		selectedBackground,
		activeBackground
	}) => (
		<Container
			height={52}
			orientation="vertical"
			mainAlignment="flex-start"
			width="100%"
			onClick={selectOption(item)}
		>
			<Container padding={{ all: 'small' }} orientation="horizontal" mainAlignment="flex-start">
				<Padding horizontal="small">
					<Text
						color={item?.isSelected ? '#414141' : 'rgba(204, 204, 204, 1)'}
						weight={item?.id === selectedOperationItem ? 'bold' : 'regular'}
					>
						{item.name}
					</Text>
				</Padding>
			</Container>
			<Divider color="gray3" />
		</Container>
	);

	return (
		<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
			<List items={items} ItemComponent={ListItem} active={selectedOperationItem} />
		</Container>
	);
};

export default ListItems;
