/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
	DONE_ROUTE_ID,
	QUEUED,
	QUEUED_ROUTE_ID,
	RUNNING_ROUTE_ID,
	STARTED,
	STOPPING
} from '../../constants';
import { getAllOperations } from '../../services/get-all-operations';
import { useOperationStore } from '../../store/operation/store';
import { useServerStore } from '../../store/server/store';
import DoneDetailPanel from './done-detail-panel';
import QuededDetailPanel from './queued-detail-panel';
import RunningDetailPanel from './running-detail-panel';

const OperationsDetailOperation: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { operation }: { operation: string } = useParams();
	const serverList = useServerStore((state) => state?.serverList)[0]?.name;
	const { setAlloperationDetail, setRunningData, setQueuedData, setDoneData } = useOperationStore(
		(state) => state
	);

	const getAllOperationAPICallHandler = useCallback(() => {
		getAllOperations()
			.then((response: any) => {
				const res = JSON.parse(response?.Body?.response?.content);
				if (res?.response?.[`${serverList}`]?.ok) {
					const result = res?.response?.[`${serverList}`]?.response?.operationList;
					setAlloperationDetail(result);
					const RunningOperationData = result?.filter((item: any) => item?.state === STARTED);
					setRunningData(RunningOperationData);
					const QueuedOperationData = result?.filter((item: any) => item?.state === QUEUED);
					setQueuedData(QueuedOperationData);
					const DoneOperationData = result?.filter((item: any) => item?.state === STOPPING);
					setDoneData(DoneOperationData);
				}
			})
			.catch((err) => {
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.operation.get_all_operation_error', '{{name}}', {
						name: err
					})
				});
			});
	}, [
		createSnackbar,
		serverList,
		setAlloperationDetail,
		setDoneData,
		setQueuedData,
		setRunningData,
		t
	]);

	useEffect(() => {
		getAllOperationAPICallHandler();
	}, [getAllOperationAPICallHandler]);

	return (
		<>
			{((): any => {
				switch (operation) {
					case RUNNING_ROUTE_ID:
						return (
							<RunningDetailPanel getAllOperationAPICallHandler={getAllOperationAPICallHandler} />
						);
					case QUEUED_ROUTE_ID:
						return (
							<QuededDetailPanel getAllOperationAPICallHandler={getAllOperationAPICallHandler} />
						);
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
