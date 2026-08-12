/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListItems } from '@zextras/ui-components';
import { replaceHistory, useRelativePathname } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../../constants';
import { type ManageOption } from '../../types/operations';
import { SECTION_ROUTES } from './operations-section-routes';

const VALID_TABS = new Set([RUNNING_ROUTE_ID, QUEUED_ROUTE_ID, DONE_ROUTE_ID]);

export const OperationsListPanel = () => {
	const [t] = useTranslation();
	const relativePathname = useRelativePathname();

	const match = matchPath('/:operation', relativePathname);
	const op = match?.params.operation;
	const selectedOperationItem = op && VALID_TABS.has(op) ? op : RUNNING_ROUTE_ID;

	const manageOptions: Array<ManageOption> = SECTION_ROUTES.map(({ id, labelKey, labelDefault }) => ({
		id,
		name: t(labelKey, labelDefault),
		isSelected: true
	}));

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
