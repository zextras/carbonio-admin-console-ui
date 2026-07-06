/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListItems } from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../../constants';
import { type ManageOption } from '../../types/operations';

const VALID_TABS = [RUNNING_ROUTE_ID, QUEUED_ROUTE_ID, DONE_ROUTE_ID];

const OperationsListPanel: FC = () => {
	const [t] = useTranslation();
	const { pathname } = useLocation();

	const selectedOperationItem = useMemo(() => {
		const segments = pathname.replace(/\/+$/, '').split('/');
		const last = segments[segments.length - 1];
		return VALID_TABS.includes(last) ? last : RUNNING_ROUTE_ID;
	}, [pathname]);

	const manageOptions = useMemo<Array<ManageOption>>(
		() => [
			{
				id: RUNNING_ROUTE_ID,
				name: t('label.running', 'Running'),
				isSelected: true
			},
			{
				id: QUEUED_ROUTE_ID,
				name: t('label.queued', 'Queued'),
				isSelected: true
			},
			{
				id: DONE_ROUTE_ID,
				name: t('label.done', 'Done'),
				isSelected: true
			}
		],
		[t]
	);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '0.0625rem solid #FFFFFF' }}
		>
			<ListItems
				items={manageOptions}
				selectedOperationItem={selectedOperationItem}
				setSelectedOperationItem={(id: string): void => {
					replaceHistory(`/${id}`);
				}}
			/>
		</Container>
	);
};

export default OperationsListPanel;
