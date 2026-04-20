/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/ui-components';
import { useAllServers } from '@zextras/ui-shared';
import { FC, ReactNode, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DONE_ROUTE_ID, QUEUED, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID, STARTED } from '../../constants';
import { getAllOperations } from '../../services/get-all-operations';
import { useOperationStore } from '../../store/operation/store';
import { type Operation } from '../../types/operations';
import DoneDetailPanel from './done-detail-panel';
import QuededDetailPanel from './queued-detail-panel';
import RunningDetailPanel from './running-detail-panel';

const OperationsDetailOperation: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { operation } = useParams();
  const { data: serverList = [] } = useAllServers();
  const serverName = serverList[0]?.name;
  const { setAlloperationDetail, setRunningData, setQueuedData } = useOperationStore(
    (state) => state,
  );

  const getAllOperationAPICallHandler = useCallback(() => {
    getAllOperations()
      .then((response) => {
        const res = JSON.parse(response?.Body?.response?.content);
        if (res?.response?.[`${serverName}`]?.ok) {
          const result = res?.response?.[`${serverName}`]?.response?.operationList;
          setAlloperationDetail(result);
          const RunningOperationData = result?.filter((item: Operation) => item?.state === STARTED);
          setRunningData(RunningOperationData);
          const QueuedOperationData = result?.filter((item: Operation) => item?.state === QUEUED);
          setQueuedData(QueuedOperationData);
        }
      })
      .catch((err) => {
        createSnackbar({
          key: '1',
          severity: 'error',
          label: t('label.operation.get_all_operation_error', '{{name}}', {
            name: err,
          }),
        });
      });
  }, [createSnackbar, serverName, setAlloperationDetail, setQueuedData, setRunningData, t]);

  useEffect(() => {
    getAllOperationAPICallHandler();
  }, [getAllOperationAPICallHandler]);

  return (
    <>
      {((): ReactNode => {
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
