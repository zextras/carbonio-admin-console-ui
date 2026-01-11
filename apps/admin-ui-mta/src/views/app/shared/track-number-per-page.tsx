/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row, Select, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { paginationItems } from '../../../constants';

const TrackNumberPerPage: FC<{
	setPageSize: any;
}> = ({ setPageSize }) => {
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
					onChange={(value): void => setPageSize(value ?? 5)}
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

export default TrackNumberPerPage;
