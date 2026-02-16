/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row, Select, Text } from '@zextras/ui-components';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

type PaginationItem = {
	label: string;
	value: number;
};

const paginationItems: Array<PaginationItem> = [
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
];

type TrackNumberPerPageProps = {
	setPageSize: (value: number) => void;
};

const TrackNumberPerPage: FC<TrackNumberPerPageProps> = ({ setPageSize }) => {
	const [t] = useTranslation();

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
					data-testid="pagination-select"
					background="gray5"
					defaultSelection={paginationItems[1]}
					onChange={(value): void => setPageSize(value ?? 10)}
					showCheckbox={false}
					itemTextSize="medium"
					style={{ minWidth: '4rem' }}
				/>
			</Row>
			<Row>
				<Text size="small">{t('label.items_per_page', 'items per page')}</Text>
			</Row>
		</Container>
	);
};

export { TrackNumberPerPage, type TrackNumberPerPageProps };
