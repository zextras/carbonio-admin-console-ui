/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState, useMemo } from 'react';
import { Container, Icon, Padding, List, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const ListItem: FC<{
	visible: any;
	active: boolean;
	item: any;
	selected: boolean;
	selecting: any;
	background: any;
	selectedBackground: any;
	activeBackground: any;
	select: any;
}> = ({
	visible,
	active,
	item,
	selected,
	selecting,
	background,
	selectedBackground,
	activeBackground,
	select
}) => (
	<Container height={52} orientation="vertical" mainAlignment="flex-start" width="100%">
		<Container padding={{ all: 'small' }} orientation="horizontal" mainAlignment="flex-start">
			<Padding all="small">
				<Icon icon="ActivityOutline" size="large" />
			</Padding>

			<Padding horizontal="small">
				<Text weight="bold">{item.name}</Text>
			</Padding>
		</Container>
	</Container>
);

const BucketListPanel: FC = () => {
	const [t] = useTranslation();
	const options = useMemo(
		() => [
			{
				id: 1,
				name: t('buckets.connect_buckets', 'Connect Buckets')
			}
		],
		[t]
	);
	const [selected, setSelected] = useState(
		{}
		/* reduce(
			map(
				range(0, 200),
				i => Math.round(Math.random() * 500)
			),
			(acc, v) => ({ ...acc, [v]: true })
		) */
	);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflowY: 'auto' }}
			width="100%"
			background="gray5"
		>
			<Container crossAlignment="flex-start" mainAlignment="flex-start">
				<List items={options} ItemComponent={ListItem} active={1} selected={selected} />
			</Container>
		</Container>
	);
};
export default BucketListPanel;
