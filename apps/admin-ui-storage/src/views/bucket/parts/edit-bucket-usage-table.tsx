/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Paging,
  Row,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import { type ChangeEvent, type FC, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';

const PAGE_SIZE = 10;

type SearchFilterInputIconProps = {
  hasError: boolean;
  hasFocus: boolean;
  disabled: boolean;
};

const SearchFilterInputIcon: FC<SearchFilterInputIconProps> = (): ReactElement => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

type EditBucketUsageTableProps = {
  rows: Array<Record<string, string>>;
  columnKeys: Array<string>;
  headers: Array<THeader>;
  searchLabel: string;
};

export const EditBucketUsageTable: FC<EditBucketUsageTableProps> = ({
  rows,
  columnKeys,
  headers,
  searchLabel,
}) => {
  const [t] = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [prevRows, setPrevRows] = useState(rows);

  if (searchValue !== prevSearchValue || rows !== prevRows) {
    setPrevSearchValue(searchValue);
    setPrevRows(rows);
    setOffset(0);
    setCurrentPage(1);
  }

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredRows =
    normalizedSearch === ''
      ? rows
      : rows.filter((row) =>
          columnKeys.some((key) => row[key]?.toLowerCase().includes(normalizedSearch)),
        );

  const pagedRows = filteredRows.slice(offset, offset + PAGE_SIZE);

  const tableRows: Array<TRow> = pagedRows.map((row, index) => ({
    id: `${row[columnKeys[0]] ?? 'row'}-${index}`,
    columns: columnKeys.map((key) => (
      <Row key={`${row[columnKeys[0]] ?? 'row'}-${key}`} mainAlignment="flex-start">
        <ds-text as="span" size="small" weight="light">
          {row[key]}
        </ds-text>
      </Row>
    )),
    clickable: false,
  }));

  return (
    <Container
      padding={{ all: 'large' }}
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      width="fill"
    >
      {rows.length > 0 && (
        <>
          <Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
            <Input
              label={searchLabel}
              value={searchValue}
              backgroundColor="gray5"
              disabled={rows.length === 0 && searchValue.length === 0}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                setSearchValue(event.target.value);
              }}
              CustomIcon={SearchFilterInputIcon}
            />
          </Row>
          <Table
            headers={headers}
            rows={tableRows}
            showCheckbox={false}
            multiSelect={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
          {filteredRows.length === 0 && (
            <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
              <ds-text as="p">{t('label.this_list_is_empty', 'This list is empty.')}</ds-text>
            </Row>
          )}
          {filteredRows.length > 0 && (
            <Row
              orientation="horizontal"
              mainAlignment="flex-start"
              width="100%"
              padding={{ top: 'large' }}
            >
              <Paging
                totalItem={filteredRows.length}
                setOffset={setOffset}
                pageSize={PAGE_SIZE}
                currentPageProp={currentPage}
                onPageChange={setCurrentPage}
              />
            </Row>
          )}
        </>
      )}
      {rows.length === 0 && (
        <Row width="100%">
          <Row width="100%">
            <img src={logo} alt="logo" />
          </Row>
          <Row padding={{ top: 'extralarge' }} style={{ textAlign: 'center' }}>
            <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
              {t('label.this_list_is_empty', 'This list is empty.')}
            </ds-text>
          </Row>
        </Row>
      )}
    </Container>
  );
};
