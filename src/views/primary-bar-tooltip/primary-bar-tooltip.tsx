/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Text, Padding } from '@zextras/carbonio-design-system';

const PrimaryBarTooltip: FC<{ items: any[] }> = ({ items }) => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		background="gray3"
		width="fit"
		height="fit"
		crossAlignment="flex-start"
	>
		<Padding left="small" right="small">
			{items.map((item) => (
				<Padding top="small" bottom="small" key={item.header}>
					<Text size="small" color="text" weight="bold">
						{item.header}
					</Text>
					{item.options.map((v: any) => (
						<Text size="extrasmall" color="text" key={v.label}>
							{v.label}
						</Text>
					))}
				</Padding>
			))}
		</Padding>
	</Container>
);

export default PrimaryBarTooltip;
