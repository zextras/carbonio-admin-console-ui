/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FC, ReactNode } from 'react';
import { useParams } from 'react-router';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../../constants';
import DoneDetailPanel from './done-detail-panel';
import QuededDetailPanel from './queued-detail-panel';
import RunningDetailPanel from './running-detail-panel';

const OperationsDetailOperation: FC = () => {
	const { operation } = useParams();

	return (
		<>
			{((): ReactNode => {
				switch (operation) {
					case RUNNING_ROUTE_ID:
						return <RunningDetailPanel />;
					case QUEUED_ROUTE_ID:
						return <QuededDetailPanel />;
					case DONE_ROUTE_ID:
						return <DoneDetailPanel />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default OperationsDetailOperation;
