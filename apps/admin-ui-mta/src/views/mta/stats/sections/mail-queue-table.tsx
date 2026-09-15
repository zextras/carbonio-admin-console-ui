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
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { TRow } from '../../../../../types';
import logo from '../../../../assets/gardian.svg';
import styles from './mail-queue-table.module.css';

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
  const hasRows = mailRows.length > 0;
  const contentColumnWidth = hasRows ? '10rem' : undefined;

  const headers = [
    { id: 'id', label: t('label.ID', 'ID'), width: contentColumnWidth, bold: true },
    { id: 'arrivaltime', label: t('label.arrival_time', 'Arrival Time'), width: contentColumnWidth, bold: true },
    { id: 'size', label: t('label.size_kb', 'Size (KB)'), width: contentColumnWidth, bold: true },
    { id: 'fromdomain', label: t('label.from_domain', 'FromDomain'), width: contentColumnWidth, bold: true },
    { id: 'todomain', label: t('label.to_domain', 'ToDomain'), width: contentColumnWidth, bold: true },
    { id: 'sender', label: t('label.sender', 'Sender'), width: contentColumnWidth, bold: true },
    { id: 'receiver', label: t('label.receiver', 'Receiver'), width: contentColumnWidth, bold: true },
    { id: 'hostorigin', label: t('label.host_origin', 'Host (Origin)'), width: contentColumnWidth, bold: true },
    { id: 'iporigin', label: t('label.ip_origin', 'IP (Origin)'), width: contentColumnWidth, bold: true },
    { id: 'reason', label: t('label.reason', 'Reason'), width: contentColumnWidth, bold: true },
    { id: 'filter', label: t('label.filter', 'Filter'), width: contentColumnWidth, bold: true },
    { id: 'received', label: t('label.received', 'Received'), width: contentColumnWidth, bold: true },
  ];

  return (
    <>
      <Container
        height="auto"
        minWidth={0}
        className={clsx(styles.tableSection, hasRows && styles.hasRows)}
        style={{
          height: hasRows ? 'calc(100vh - 17.25rem)' : '10rem',
          position: 'relative',
        }}
      >
        <Table
          selectedRows={selectedRow}
          rows={mailRows}
          headers={headers}
          onSelectionChange={onSelectionChange}
          horizontalScroll={hasRows}
          style={{ height: '100%' }}
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
