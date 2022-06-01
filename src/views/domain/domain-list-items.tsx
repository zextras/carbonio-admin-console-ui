/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';
import { Container, Padding, List, Text } from '@zextras/carbonio-design-system';
import { GENERAL_INFORMATION } from '../../constants';

const DomainListItems: FC<{
	items: any;
	selectedOperationItem: any;
	setSelectedOperationItem: any;
}> = ({ items, selectedOperationItem, setSelectedOperationItem }) => {
	const selectDomainOption = useCallback(
		(item) => () => {
			if (item?.domainSelected && item?.id !== GENERAL_INFORMATION) {
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
			onClick={selectDomainOption(item)}
		>
			<Container padding={{ all: 'small' }} orientation="horizontal" mainAlignment="flex-start">
				<Padding horizontal="small">
					<Text
						color={item?.domainSelected ? '#414141' : 'rgba(204, 204, 204, 1)'}
						weight={item?.id === selectedOperationItem ? 'bold' : 'regular'}
					>
						{item.name}
					</Text>
				</Padding>
			</Container>
		</Container>
	);

	return (
		<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
			<List items={items} ItemComponent={ListItem} active={selectedOperationItem} />
		</Container>
	);
};

export default DomainListItems;
