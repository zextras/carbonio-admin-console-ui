/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { Button, Container, Row, TabBar } from '@zextras/ui-components';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MailQueueActionRequest,
  MailQueueInfo,
  MtaMailQueueItem,
  mtaStats,
  TRow,
} from '../../../../types';
import {
  ACTIVE,
  CORRUPT,
  DEFERRED,
  DELETE,
  HOLD,
  INCOMING,
  RECORD_DISPLAY_LIMIT,
  RELEASE,
  REQUEUE,
  ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { mtaQueryKeys } from '../../../services/mta-query-keys';
import { useBatchMailQueueAction } from '../../../services/use-batch-mail-queue-action';
import { useMailQueue } from '../../../services/use-mail-queue';
import { useMailQueueInfo } from '../../../services/use-mail-queue-info';
import { MailQueueActions } from './sections/mail-queue-actions';
import { MailQueueTable } from './sections/mail-queue-table';
import { ReusedDefaultTabBar } from './sections/reused-default-tab-bar';

type MTAStatsMailProps = Readonly<{
  serverState: mtaStats | undefined;
  closeDialogMail: (val?: boolean) => void;
  flushQueues: () => void;
  requestInprogress: boolean;
  flushRequestInProgress: boolean;
}>;

function buildTableRows(queueItems: Array<MtaMailQueueItem>): Array<TRow> {
  return queueItems.map((item: MtaMailQueueItem) => ({
    id: item?.id,
    columns: [
      <Container crossAlignment="flex-start" key={item?.id}>
        <ds-text as="span" color="gray0" weight="regular">{item?.id}</ds-text>
      </Container>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>
        {format(new Date(Number.parseInt(item?.arrivalTime, 10)), 'dd/MM/yy - HH:mm')}
      </ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.size}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.fromDomain}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.toDomain}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.sender}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.receiver}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.host}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.ip}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.reason}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.filter}</ds-text>,
      <ds-text as="span" color="gray0" weight="light" key={item?.id}>{item?.receiveid}</ds-text>,
    ],
  }));
}

function extractQueueCounts(queue: Array<MailQueueInfo>): Record<string, number> {
  return {
    queued: queue.find((item: Record<string, string | number>) => item?.name === ACTIVE)?.n || 0,
    corrupted: queue.find((item: Record<string, string | number>) => item?.name === CORRUPT)?.n || 0,
    deferred: queue.find((item: Record<string, string | number>) => item?.name === DEFERRED)?.n || 0,
    incoming: queue.find((item: Record<string, string | number>) => item?.name === INCOMING)?.n || 0,
    onhold: queue.find((item: Record<string, string | number>) => item?.name === HOLD)?.n || 0,
  };
}

function parseQueueItems(serverData: { queue?: Array<{ qi?: Array<Record<string, string>>; total?: number }> } | undefined): { items: Array<MtaMailQueueItem>; total: number } {
  const queue = serverData?.queue?.[0];
  const total = queue?.total ?? 0;
  const items: Array<MtaMailQueueItem> = [];

  if (queue?.qi && Array.isArray(queue.qi)) {
    queue.qi.forEach((qItem: Record<string, string>) => {
      items.push({
        arrivalTime: qItem?.time,
        filter: qItem?.filter,
        fromDomain: qItem?.fromdomain,
        host: qItem?.host,
        id: qItem?.id,
        ip: qItem?.ip || '',
        reason: qItem?.reason,
        receiveid: qItem?.received,
        receiver: qItem?.receiver || '',
        sender: qItem?.from,
        size: qItem?.size,
        toDomain: qItem?.todomain,
      });
    });
  }

  return { items, total };
}

export const MTAStatsMail = ({
  serverState,
  closeDialogMail,
  flushQueues,
  requestInprogress,
  flushRequestInProgress,
}: MTAStatsMailProps) => {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: batchMailQueueActionAsync } = useBatchMailQueueAction();
  const [change, setChange] = useState(ACTIVE);
  const [selectedRow, setSelectedRow] = useState<Array<string>>([]);
  const [holdInProgress, setHoldInProgress] = useState<boolean>(false);
  const [releaseInProgress, setReleaseInProgress] = useState<boolean>(false);
  const [requeueInProgress, setRequeueInProgress] = useState<boolean>(false);
  const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);

  const serverName = serverState?.serverName ?? '';

  const { data: queueInfoData } = useMailQueueInfo(serverName, Boolean(serverName));

  const {
    data: mailQueueData,
    isLoading: isMailQueueLoading,
  } = useMailQueue(serverName, change, offset, limit, Boolean(serverName));

  const queueInfo = queueInfoData?.server?.[0]?.queue ?? [];
  const mailStatCount = extractQueueCounts(queueInfo);

  const serverQueueData = mailQueueData?.server?.[0];
  const { items: queueItems, total: totalAccount } = parseQueueItems(serverQueueData);
  const mailRows = buildTableRows(queueItems);

  const items = [
    { id: ACTIVE, label: t('mta.queued', 'Queued'), count: mailStatCount?.queued, CustomComponent: ReusedDefaultTabBar },
    { id: CORRUPT, label: t('mta.corrupted', 'Corrupted'), count: mailStatCount?.corrupted, CustomComponent: ReusedDefaultTabBar },
    { id: DEFERRED, label: t('mta.deferred', 'Deferred'), count: mailStatCount?.deferred, CustomComponent: ReusedDefaultTabBar },
    { id: INCOMING, label: t('mta.incoming', 'Incoming'), count: mailStatCount?.incoming, CustomComponent: ReusedDefaultTabBar },
    { id: HOLD, label: t('mta.onhold', 'On Hold'), count: mailStatCount?.onhold, CustomComponent: ReusedDefaultTabBar },
  ];

  async function callAllRequest(request: Array<MailQueueActionRequest>) {
    try {
      await batchMailQueueActionAsync({
        serverName,
        MailQueueActionRequest: request,
      });
      await queryClient.invalidateQueries({ queryKey: mtaQueryKeys.mailQueue(serverName, change, offset, limit) });
      await queryClient.invalidateQueries({ queryKey: mtaQueryKeys.mailQueueInfo(serverName) });
      setSelectedRow([]);
    } catch {
      // Error snackbar is already shown by the hook
    } finally {
      setHoldInProgress(false);
      setReleaseInProgress(false);
      setRequeueInProgress(false);
      setDeleteInProgress(false);
    }
  }

  function mailQueAction(operation: string) {
    const mailActionRequestData: Array<MailQueueActionRequest> = [];
    if (serverName) {
      selectedRow.forEach((item) => {
        mailActionRequestData.push({
          _jsns: ZIMBRA_ADMIN_URN,
          server: {
            name: serverName,
            queue: { name: change, action: { op: operation, by: 'id', _content: item } },
          },
        });
      });
      callAllRequest(mailActionRequestData);
    }
  }

  function onHoldPress() {
    setHoldInProgress(true);
    mailQueAction(HOLD);
  }

  function onReleasePress() {
    setReleaseInProgress(true);
    mailQueAction(RELEASE);
  }

  function onRequeuePress() {
    setRequeueInProgress(true);
    mailQueAction(REQUEUE);
  }

  function onDeletePress() {
    setDeleteInProgress(true);
    mailQueAction(DELETE);
  }

  function closeDialog(closeDetailDialog?: boolean) {
    closeDialogMail(closeDetailDialog);
  }

  return (
    <Container
      background="gray5"
      mainAlignment="flex-start"
      style={{
        position: 'absolute',
        top: '0rem',
        height: 'auto',
        width: '62rem',
        overflow: 'hidden',
        transition: 'left 0.2s ease-in-out',
        boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
        right: 0,
        background: 'red',
      }}
    >
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="3.5rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {serverState?.serverName}
          </ds-text>
        </Row>
        <Row></Row>
        <Row padding={{ right: 'extrasmall', left: 'small' }}>
          <Button
            type="ghost"
            color={'text'}
            size="medium"
            icon="CloseOutline"
            onClick={(): void => closeDialog(true)}
          />
        </Row>
      </Row>
      <Container>
        <ds-divider></ds-divider>
      </Container>
      <Container
        padding={{ all: 'extralarge' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 3.5rem)"
        style={{ overflow: 'auto' }}
        background="white"
      >
        <Container mainAlignment="flex-end" crossAlignment="flex-end" height="auto" width="100%">
          <TabBar
            items={items}
            background={''}
            selected={change}
            onChange={(ev: unknown, selectedId: string): void => {
              setOffset(0);
              setChange(selectedId);
            }}
            underlineColor="primary"
            height="auto"
            width="auto"
          />
        </Container>

        <MailQueueActions
          selectedRowCount={selectedRow.length}
          holdInProgress={holdInProgress}
          releaseInProgress={releaseInProgress}
          requeueInProgress={requeueInProgress}
          deleteInProgress={deleteInProgress}
          requestInprogress={requestInprogress}
          flushRequestInProgress={flushRequestInProgress}
          onHoldPress={onHoldPress}
          onReleasePress={onReleasePress}
          onRequeuePress={onRequeuePress}
          onDeletePress={onDeletePress}
          flushQueues={flushQueues}
        />

        <MailQueueTable
          mailRows={mailRows}
          selectedRow={selectedRow}
          isMailQueueLoading={isMailQueueLoading}
          totalAccount={totalAccount}
          limit={limit}
          setOffset={setOffset}
          setLimit={setLimit}
          onSelectionChange={(selected: Array<string>): void => setSelectedRow(selected)}
        />
      </Container>
    </Container>
  );
}
