/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Paging,
  Row,
  Table,
  TrackNumberPerPage,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { TRow } from '../../../../../types';
import logo from '../../../../assets/gardian.svg';

type MailQueueTableProps = Readonly<{
  mailRows: Array<TRow>;
  selectedRow: Array<string>;
  isMailQueueLoading: boolean;
  totalAccount: number;
  limit: number;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void;
  onSelectionChange: (selected: Array<string>) => void;
}>;

export const MailQueueTable = ({
  mailRows,
  selectedRow,
  isMailQueueLoading,
  totalAccount,
  limit,
  setOffset,
  setLimit,
  onSelectionChange,
}: MailQueueTableProps) => {
  const [t] = useTranslation();

  const headers = [
    { id: 'id', label: t('label.ID', 'ID'), width: '12%', bold: true },
    { id: 'arrivaltime', label: t('label.arrival_time', 'Arrival Time'), width: '12%', bold: true },
    { id: 'size', label: t('label.size_kb', 'Size (KB)'), width: '12%', bold: true },
    { id: 'fromdomain', label: t('label.from_domain', 'FromDomain'), width: '12%', bold: true },
    { id: 'todomain', label: t('label.to_domain', 'ToDomain'), width: '12%', bold: true },
    { id: 'sender', label: t('label.sender', 'Sender'), width: '12%', bold: true },
    { id: 'receiver', label: t('label.receiver', 'Receiver'), width: '12%', bold: true },
    { id: 'hostorigin', label: t('label.host_origin', 'Host (Origin)'), width: '12%', bold: true },
    { id: 'iporigin', label: t('label.ip_origin', 'IP (Origin)'), width: '12%', bold: true },
    { id: 'reason', label: t('label.reason', 'Reason'), width: '12%', bold: true },
    { id: 'filter', label: t('label.filter', 'Filter'), width: '12%', bold: true },
    { id: 'received', label: t('label.received', 'Received'), width: '12%', bold: true },
  ];

  return (
    <>
      <Container
        height="auto"
        style={{
          height: mailRows.length === 0 ? '10rem' : 'calc(100vh - 17.25rem)',
          position: 'relative',
        }}
      >
        <Table
          selectedRows={selectedRow}
          rows={mailRows}
          headers={headers}
          onSelectionChange={onSelectionChange}
          style={{ overflow: 'auto', height: '100%', width: 'auto' }}
          RowFactory={HoverableRowFactory}
          HeaderFactory={CustomHeaderFactory}
        />
        {isMailQueueLoading && (
          <Container
            crossAlignment="center"
            mainAlignment="flex-start"
            height="auto"
            style={{ position: 'absolute' }}
            padding={{ top: 'medium' }}
          >
            <ds-spinner></ds-spinner>
          </Container>
        )}
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        width="100%"
        height="auto"
        padding={{ top: 'medium' }}
      >
        <Container crossAlignment="flex-start">
          {mailRows && mailRows.length > 0 && (
            <Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
          )}
        </Container>

        <Container crossAlignment="flex-end" orientation="horizontal" mainAlignment="flex-end">
          {mailRows && mailRows.length > 0 && <TrackNumberPerPage setPageSize={setLimit} />}
        </Container>
      </Container>
      {mailRows.length === 0 && !isMailQueueLoading && (
        <Container orientation="column" crossAlignment="center" mainAlignment="center">
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
    </>
  );
}
