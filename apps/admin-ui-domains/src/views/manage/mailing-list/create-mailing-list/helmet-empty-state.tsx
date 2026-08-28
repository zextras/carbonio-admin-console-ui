/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Row } from '@zextras/ui-components';
import { type FC } from 'react';

import helmetLogo from '../../../../assets/helmet_logo.svg';

type HelmetEmptyStateProps = {
	topPadding?: string;
	firstMessage: string;
	secondMessage: string;
};

export const HelmetEmptyState: FC<HelmetEmptyStateProps> = ({
	topPadding = '57px 0 0 0',
	firstMessage,
	secondMessage
}) => (
	<Container
		background="gray6"
		height="fit-content"
		mainAlignment="center"
		crossAlignment="center"
	>
		<Padding value={topPadding} width="100%">
			<Row mainAlignment="center" width="100%">
				<img src={helmetLogo} alt="logo" />
			</Row>
		</Padding>
		<Padding vertical="extralarge" width="100%">
			<Row mainAlignment="center" width="100%">
				<ds-text as="p" size="large" color="secondary" weight="regular">
					{firstMessage}
				</ds-text>
			</Row>
			<Row mainAlignment="center" width="100%">
				<ds-text as="p" size="large" color="secondary" weight="regular">
					{secondMessage}
				</ds-text>
			</Row>
		</Padding>
	</Container>
);
