/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactNode } from 'react';

import { Container, Divider, Row, Text } from '@zextras/carbonio-design-system';

const PageLayout: FC<{
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
			padding={{ all: 'medium' }}
			style={{ overflowY: 'auto' }}
		>
			{children}
		</Container>
	</Container>
);

export default PageLayout;
