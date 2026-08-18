/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Padding,
  Paging,
  Row,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { RECORD_DISPLAY_LIMIT } from '../../constants';
import { LegalHoldEmptyState } from './legal-hold-empty-state';

const absoluteContainerItemStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  top: '8rem',
};

type LegalHoldAccountsTableProps = {
  rows: Array<TRow>;
  selectedRowIds: Array<string>;
  totalItem: number;
  accountOffset: number;
  isFetching: boolean;
  errorMessage?: string;
  onSelectionChange: (ids: Array<string>) => void;
  onPageChange: (page: number) => void;
};

export const LegalHoldAccountsTable = ({
  rows,
  selectedRowIds,
  totalItem,
  accountOffset,
  isFetching,
  errorMessage,
  onSelectionChange,
  onPageChange,
}: LegalHoldAccountsTableProps) => {
  const [t] = useTranslation();

  const headers: Array<THeader> = [
    {
      id: 'email',
      label: t('label.email', 'Email'),
      width: '20%',
      bold: true,
    },
    {
      id: 'uid',
      label: t('label.account_id', 'Account Id'),
      width: '20%',
      bold: true,
    },
    {
      id: 'serverName',
      label: t('label.server_name', 'Server Name'),
      width: '20%',
      bold: true,
    },
    {
      id: 'createdDate',
      label: t('label.created_date', 'Created Date'),
      width: '10%',
      bold: true,
    },
    {
      id: 'deletedDate',
      label: t('label.deleted_date', 'Deleted Date'),
      width: '10%',
      bold: true,
    },
    {
      id: 'status',
      label: t('label.account_status', 'Account Status'),
      width: '10%',
      bold: true,
    },
    {
      id: 'legalhold',
      label: t('label.legal_hold_status', 'Legal Hold Status'),
      width: '10%',
      bold: true,
    },
  ];

  return (
    <Container crossAlignment="center" mainAlignment="flex-start" style={{ position: 'relative' }}>
      {isFetching && (
        <Container
          crossAlignment="center"
          mainAlignment="center"
          height="auto"
          padding={{ top: 'medium' }}
          style={absoluteContainerItemStyle}
        >
          <ds-spinner></ds-spinner>
        </Container>
      )}

      {errorMessage && (
        <Padding all="medium">
          <ds-text as="p" color="error" overflow="break-word">
            {errorMessage}
          </ds-text>
        </Padding>
      )}
      {rows.length === 0 && !errorMessage && <LegalHoldEmptyState />}
      {rows.length > 0 && (
        <>
          <Row
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            width="fill"
            style={{
              height: 'calc(100vh - 25rem)',
            }}
            padding={{ all: 'large' }}
          >
            <Table
              rows={rows}
              headers={headers}
              showCheckbox={false}
              multiSelect={false}
              style={{
                overflow: 'auto',
                height: '100%',
              }}
              selectedRows={selectedRowIds as [] | [string]}
              onSelectionChange={onSelectionChange}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
          </Row>
          <ListRow>
            <Container mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding right="4rem">
                <Paging
                  totalItem={totalItem}
                  pageSize={RECORD_DISPLAY_LIMIT}
                  currentPageProp={accountOffset ? accountOffset + 1 : 1}
                  onPageChange={onPageChange}
                />
              </Padding>
            </Container>
          </ListRow>
        </>
      )}
    </Container>
  );
};
