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
  TrackNumberPerPage,
  type TRow,
} from '@zextras/ui-components';
import { type ChangeEvent, type FC, type ReactNode } from 'react';

import logo from '../../../assets/gardian.svg';
import { FunnelSearchIcon } from '../funnel-search-icon';

type SearchableTableProps = {
  title: ReactNode;
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  rows: Array<TRow>;
  headers: Array<THeader>;
  totalItems: number;
  pageSize: number;
  onOffsetChange: (offset: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isPending: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  hasBottomPadding?: boolean;
  marginTopStyle?: React.CSSProperties;
};

export const SearchableTable: FC<SearchableTableProps> = ({
  title,
  searchLabel,
  searchValue,
  onSearchChange,
  rows,
  headers,
  totalItems,
  pageSize,
  onOffsetChange,
  onPageSizeChange,
  isPending,
  isFetching,
  isPlaceholderData,
  hasBottomPadding = false,
  marginTopStyle,
}) => {
  const showEmptyState = rows.length === 0 && !isFetching;
  const showPagination = rows.length !== 0;

  return (
    <>
      <Row
        width="100%"
        padding={{ vertical: 'large' }}
        style={marginTopStyle}
      >
        <Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
          <ds-text as="strong" size="medium" weight="bold" color="gray0">
            {title}
          </ds-text>
        </Row>
      </Row>
      <Row
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        width="fill"
      >
        <Container padding={{ all: 'small' }}>
          <Input
            label={searchLabel}
            disabled={rows.length === 0 && searchValue.length === 0}
            value={searchValue}
            backgroundColor="gray5"
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              onSearchChange(e.target.value);
            }}
            CustomIcon={FunnelSearchIcon}
          />
        </Container>
      </Row>
      <Row
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        width="fill"
        style={{
          height: 'calc(100vh - 21.25rem)',
          position: 'relative',
        }}
        padding={hasBottomPadding ? { bottom: 'large' } : undefined}
      >
        <Container padding={{ all: 'small' }}>
          <Table
            rows={isPending && !isPlaceholderData ? [] : rows}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            style={{
              overflow: 'auto',
              height: '100%',
            }}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
          {isFetching && !isPlaceholderData && (
            <Container
              crossAlignment="center"
              mainAlignment="center"
              height="auto"
              padding={{ top: 'medium' }}
            >
              <ds-spinner></ds-spinner>
            </Container>
          )}
          {showEmptyState && (
            <Container
              orientation="column"
              crossAlignment="center"
              mainAlignment="center"
              style={{ marginTop: '1rem' }}
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
                  {'This list is empty.'}
                </ds-text>
              </Row>
            </Container>
          )}
          {showPagination && (
            <Container
              orientation="horizontal"
              mainAlignment="space-between"
              width="100%"
              style={{ position: 'absolute', bottom: '-4rem' }}
              height="auto"
              padding={{ all: 'large' }}
            >
              <Container crossAlignment="flex-start" padding={{ all: 'small' }}>
                <Paging totalItem={totalItems} setOffset={onOffsetChange} pageSize={pageSize} />
              </Container>
              <Container
                crossAlignment="flex-end"
                orientation="horizontal"
                mainAlignment="flex-end"
                padding={{ all: 'small' }}
              >
                <TrackNumberPerPage setPageSize={onPageSizeChange} />
              </Container>
            </Container>
          )}
        </Container>
      </Row>
    </>
  );
};
