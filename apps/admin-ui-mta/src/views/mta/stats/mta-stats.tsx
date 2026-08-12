/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  ModalOverlay,
  Row,
  Table,
  useSnackbar,
} from '@zextras/ui-components';
import { useMtaServers } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MailQueueInfo, MtaStats, TRow } from '../../../../types';
import logo from '../../../assets/gardian.svg';
import { ACTIVE, CORRUPT, DEFERRED, HOLD, INCOMING } from '../../../constants';
import { getMailqueueInformation } from '../../../services/get-mail-queue-info';
import { mailQueueFlushByServer } from '../../../services/mail-queue-flush';
import { mtaQueryKeys } from '../../../services/mta-query-keys';
import { MTAStatsMail } from './mta-stats-mail';

type ServerInfo = { id: string; name: string };

function extractQueueStats(
  queueData: { queue: Array<MailQueueInfo> } | undefined,
  serverId: string,
  serverName: string,
): MtaStats {
  const queue = queueData?.queue ?? [];
  return {
    id: serverId,
    serverName,
    active: String(queue.find((info: MailQueueInfo) => info?.name === ACTIVE)?.n ?? ''),
    corrupt: String(queue.find((info: MailQueueInfo) => info?.name === CORRUPT)?.n ?? ''),
    deferred: String(queue.find((info: MailQueueInfo) => info?.name === DEFERRED)?.n ?? ''),
    hold: String(queue.find((info: MailQueueInfo) => info?.name === HOLD)?.n ?? ''),
    incoming: String(queue.find((info: MailQueueInfo) => info?.name === INCOMING)?.n ?? ''),
  };
}

export function MTAStats() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: mtaServerListData = [] } = useMtaServers();
  const [selectedServer, setSelectedServer] = useState<Array<string>>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [flushRequestInProgress, setFlushRequestInProgress] = useState<boolean>(false);

  const showMtaStatDetail = selectedServer.length > 0;

  const mtaServerList: Array<ServerInfo> = mtaServerListData?.length
    ? mtaServerListData.map((item) => ({ id: item?.id || '', name: item?.name || '' }))
    : [];

  const serverQueueQueries = useQueries({
    queries: mtaServerList.map((server) => ({
      queryKey: mtaQueryKeys.mailQueueInfo(server.name),
      queryFn: () => getMailqueueInformation(server.name),
      enabled: Boolean(server.name),
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  const requestInprogress = serverQueueQueries.some((q) => q.isLoading || q.isFetching);

  const mailServerStats: Array<MtaStats> = mtaServerList.map((server, index) => {
    const queryResult = serverQueueQueries[index];
    const serverData = queryResult?.data?.server?.[0];
    return extractQueueStats(serverData, server.id, server.name);
  });

  const serverHeader = [
    {
      id: 'mail_server',
      label: t('mta.mail_server', 'Mail Server'),
      width: '40%',
      bold: true,
    },
    {
      id: 'queued',
      label: t('mta.queued', 'Queued'),
      width: '12%',
      bold: true,
    },
    {
      id: 'corrupt',
      label: t('mta.corrupt', 'Corrupt'),
      width: '12%',
      bold: true,
    },
    {
      id: 'deferred',
      label: t('mta.deferred', 'Deferred'),
      width: '12%',
      bold: true,
    },
    {
      id: 'incoming',
      label: t('mta.incoming', 'Incoming'),
      width: '12%',
      bold: true,
    },
    {
      id: 'hold',
      label: t('mta.hold', 'Hold'),
      width: '12%',
      bold: true,
    },
  ];

  const serverTableRow: Array<TRow> = mailServerStats.map((item: MtaStats) => ({
    id: item?.id,
    columns: [
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item?.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.serverName}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.active}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item?.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.corrupt}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item?.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.deferred}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item?.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.incoming}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={item?.id}
        style={{ cursor: 'pointer' }}
        onClick={(): void => {
          setSelectedServer([item?.id]);
        }}
      >
        <ds-text as="span" size="small" weight="regular" key={`${item?.id}display-child`} color="gray0">
          {item?.hold}
        </ds-text>
      </Container>,
    ],
  }));

  function scanServer() {
    setScanTime(new Date());
    mtaServerList.forEach((server) => {
      queryClient.invalidateQueries({ queryKey: mtaQueryKeys.mailQueueInfo(server.name) });
    });
  }

  async function flushQueues() {
    const flushRequest: Array<Promise<Record<string, unknown>>> = [];
    if (showMtaStatDetail) {
      const serverName = mtaServerList.find((item) => item?.id === selectedServer[0])?.name;
      if (serverName) {
        flushRequest.push(mailQueueFlushByServer(serverName));
      }
    } else {
      mailServerStats.forEach((item: MtaStats) => {
        flushRequest.push(mailQueueFlushByServer(item?.serverName));
      });
    }

    if (flushRequest.length > 0) {
      setFlushRequestInProgress(true);
      try {
        await Promise.all(flushRequest);
        setSelectedServer([]);
        mtaServerList.forEach((server) => {
          queryClient.invalidateQueries({ queryKey: mtaQueryKeys.mailQueueInfo(server.name) });
        });
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('mta.mail_queue_flush_successfully', 'Mail queue flush successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      } catch (error) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: (error as { error?: { message?: string } })?.error?.message
            ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      } finally {
        setFlushRequestInProgress(false);
      }
    }
  }

  function closeDialogMail() {
    setSelectedServer([]);
  }

  const currentTime = scanTime ?? (serverQueueQueries.some((q) => q.dataUpdatedAt) ? new Date() : null);

  return (
    <Container background="gray6" mainAlignment="flex-start">
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="gray6"
        width="fill"
        height="3.5rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('mta.queue', 'Queue')}
          </ds-text>
        </Row>
        <Row></Row>
      </Row>
      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>
      <Container
        padding={{ all: 'extralarge' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 10.5rem)"
        style={{ overflow: 'auto' }}
      >
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          padding={{ bottom: 'extralarge' }}
          height="auto"
        >
          <Container
            crossAlignment="flex-start"
            padding={{ right: 'medium' }}
            orientation="horizontal"
            mainAlignment="flex-end"
            width="65%"
          >
            <Container
              crossAlignment="center"
              padding={{ right: 'extralarge' }}
              orientation="horizontal"
              mainAlignment="center"
              width="auto"
            >
              <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
                <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
                  {t('mta.updated_at', 'Updated at')}:
                </ds-text>
              </Container>
              <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
                <ds-text as="span" size="small" overflow="ellipsis">
                  &nbsp;
                  {currentTime === null
                    ? '-'
                    : format(new Date(currentTime), 'HH:mm:ss dd eeee yyyy')}
                </ds-text>
              </Container>
            </Container>
            <Container
              crossAlignment="center"
              padding={{ right: 'extralarge' }}
              orientation="horizontal"
              mainAlignment="flex-end"
              width="auto"
            >
              <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
                <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
                  {t('mta.status', 'Status')}:
                </ds-text>
              </Container>
              <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
                <ds-text as="span" size="small" overflow="ellipsis">
                  &nbsp;
                  {requestInprogress
                    ? t('mta.scan_in_progress', 'Scan In progress')
                    : t('mta.scan_completed', 'Scan Completed')}
                </ds-text>
              </Container>
            </Container>
          </Container>
          <Container
            crossAlignment="flex-end"
            orientation="horizontal"
            mainAlignment="flex-end"
            width="35%"
          >
            <Container
              crossAlignment="flex-start"
              height="auto"
              width="fit"
              padding={{ right: 'medium' }}
            >
              <Button
                type="outlined"
                size="medium"
                label={t('mta.restart_scan', 'Restart Scan')}
                color="primary"
                onClick={scanServer}
                disabled={mtaServerList.length === 0 || requestInprogress}
                loading={requestInprogress}
              />
            </Container>
            <Container crossAlignment="flex-start" height="auto" width="fit">
              <Button
                type="outlined"
                size="medium"
                label={t('mta.flush_queues', 'Flush queues')}
                color="primary"
                onClick={flushQueues}
                disabled={mtaServerList.length === 0 || flushRequestInProgress || requestInprogress}
                loading={requestInprogress || flushRequestInProgress}
              />
            </Container>
          </Container>
        </Container>
        <Container
          crossAlignment="center"
          height="auto"
          padding={{ top: 'medium', bottom: 'large' }}
        >
          <ds-text as="span" size="small" overflow="ellipsis" weight="light">
            {t('mta.select_a_mail_server_to_see_stats', 'Select a mail server to see its stats')}
          </ds-text>
        </Container>
        <Container mainAlignment="flex-start" crossAlignment="flex-start" height="auto">
          <Table
            rows={serverTableRow}
            headers={serverHeader}
            selectedRows={selectedServer}
            showCheckbox={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
          {requestInprogress && (
            <Container
              crossAlignment="center"
              mainAlignment="center"
              height="auto"
              padding={{ top: 'large' }}
            >
              <ds-spinner></ds-spinner>
            </Container>
          )}
          {mtaServerList.length === 0 && !requestInprogress && (
            <Container
              orientation="column"
              crossAlignment="center"
              mainAlignment="center"
              padding={{ top: 'large' }}
            >
              <Row>
                <img src={logo} alt="logo" />
              </Row>
              <Row
                padding={{ top: 'extralarge' }}
                orientation="vertical"
                crossAlignment="center"
                style={{ textAlign: 'center' }}
              >
                <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                  {t('label.this_list_is_empty', 'This list is empty.')}
                </ds-text>
              </Row>
            </Container>
          )}
          {selectedServer && selectedServer.length > 0 && (
            <ModalOverlay open={showMtaStatDetail}>
              <MTAStatsMail
                serverState={mailServerStats.find((item) => item?.id === selectedServer[0])}
                closeDialogMail={closeDialogMail}
                flushQueues={flushQueues}
                requestInprogress={requestInprogress}
                flushRequestInProgress={flushRequestInProgress}
              />
            </ModalOverlay>
          )}
        </Container>
      </Container>
    </Container>
  );
}
