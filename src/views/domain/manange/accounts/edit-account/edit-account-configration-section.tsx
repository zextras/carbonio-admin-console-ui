/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Row, Text } from '@zextras/carbonio-design-system';

const EditAccountConfigrationSection: FC = () => (
	<Container
		mainAlignment="flex-start"
		padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
	>
		<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
			<Text>Configration</Text>
		</Row>
	</Container>
);

export default EditAccountConfigrationSection;
