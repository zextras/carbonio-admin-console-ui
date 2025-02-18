/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactNode } from 'react';

import { Container, Divider, Row, Text } from '@zextras/carbonio-design-system';

export const PageLayout: FC<{
	title: string;
	headerComponent?: ReactNode;
	children: ReactNode | ReactNode[];
}> = ({ title, headerComponent, children }) => (
	<Container mainAlignment="flex-start" padding={{ all: 'large' }}>
		<Container orientation="horizontal" height="fit" padding={{ all: 'medium' }}>
			<Row takeAvailableSpace mainAlignment="flex-start" minHeight="35px">
				<Text weight="bold" color="gray0">
					{title}
				</Text>
			</Row>
			<Row>{headerComponent}</Row>
		</Container>
		<Divider />
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ horizontal: 'medium', vertical: 'large' }}
			style={{ overflowY: 'auto' }}
		>
			{children}
		</Container>
	</Container>
);

export const BoxLayout: FC<{
	title: string;
	description: string;
	children?: ReactNode | ReactNode[];
}> = ({ title, description, children }) => (
	<Container orientation="vertical" height="fit" gap="1rem">
		<Container orientation="vertical" height="fit" crossAlignment="flex-start" gap="0.5rem">
			<Text weight="bold">{title}</Text>
			<Text size="small">{description}</Text>
		</Container>
		<Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit" gap="1rem">
			{children}
		</Container>
	</Container>
);
