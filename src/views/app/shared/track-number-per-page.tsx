/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';

import { Container, Text, Row, Select } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const TrackNumberPerPage: FC<{
	setPageSize: any;
}> = ({ setPageSize }) => {
	const [t] = useTranslation();
	const paginationItems: any[] = useMemo(
		() => [
			{
				label: '5',
				value: 5
			},
			{
				label: '10',
				value: 10
			},
			{
				label: '15',
				value: 15
			},
			{
				label: '25',
				value: 25
			},
			{
				label: '50',
				value: 50
			},
			{
				label: '100',
				value: 100
			}
		],
		[]
	);
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-end"
			crossAlignment="center"
			width="fit"
			padding={{ bottom: 'small' }}
		>
			<Row padding={{ right: 'small' }}>
				<Text size="small">{t('label.showing', 'Showing')}</Text>
			</Row>
			<Row padding={{ right: 'small' }}>
				<Select
					items={paginationItems}
					background="gray5"
					defaultSelection={paginationItems[1]}
					onChange={(e): void => setPageSize(e)}
					showCheckbox={false}
					itemTextSize="1rem"
					style={{ minWidth: '4rem' }}
				/>
			</Row>
			<Row>
				<Text size="small">{t('label.items_per_page', 'items per page')}</Text>
			</Row>
		</Container>
	);
};

export default TrackNumberPerPage;
