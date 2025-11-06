/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Padding, Text, Divider, Button } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';


const ListPanelItem: FC<{
	title: string;
	isListExpanded: boolean;
	setToggleView: any;
}> = ({ title, isListExpanded, setToggleView }) => (
	<>
		<Container
			height={52}
			orientation="vertical"
			mainAlignment="flex-start"
			width="100%"
			style={{ cursor: 'pointer' }}
		>
			<Row padding={{ all: 'small' }} width="100%" mainAlignment="space-between"></Row>
			<Row
				padding={{ all: 'small' }}
				width="100%"
				mainAlignment="space-between"
				onClick={setToggleView}
			>
				<Padding horizontal="small">
					<Text size="small" color="gray0" weight="bold">
						{title}
					</Text>
				</Padding>
				<Padding horizontal="small">
					<Button
						type="ghost"
						color={'text'}
						icon={isListExpanded ? 'ChevronUpOutline' : 'ChevronDownOutline'}
						size="small"
						onClick={setToggleView}
					/>
				</Padding>
			</Row>
		</Container>
		<Divider color="gray3" />
	</>
);

export default ListPanelItem;
