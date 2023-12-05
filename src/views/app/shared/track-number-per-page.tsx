/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';

import { Container, Text, Row, Input } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const TrackNumberPerPage: FC<{
	pageSize: number;
}> = ({ pageSize = 0 }) => {
	const [t] = useTranslation();
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-end"
			crossAlignment="center"
			width="fit"
		>
			<Row padding={{ right: 'small' }}>
				<Text size="small">{t('label.showing', 'Showing')}</Text>
			</Row>
			<Row padding={{ right: 'small' }} width="15%" height="auto">
				<Input
					readOnly
					backgroundColor="gray5"
					value={pageSize}
					style={{ minHeight: '1.75rem', height: '1.25rem' }}
				/>
			</Row>
			<Row>
				<Text size="small">{t('label.items_per_page', 'items per page')}</Text>
			</Row>
		</Container>
	);
};

export default TrackNumberPerPage;
