/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Padding,
  Row,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { FunnelSearchIcon } from './funnel-search-icon';

const TABLE_CONTAINER_HEIGHT = 'calc(100vh - 340px)';

type ServerPoolTableProps = {
  searchValue: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSearchDisabled: boolean;
  enableDisabled: boolean;
  disableDisabled: boolean;
  onEnable: () => void;
  onDisableClick: () => void;
  onSelectionChange: (ids: Array<string>) => void;
  tableRows: Array<TRow>;
  tableHeaders: Array<THeader>;
  selectedRows: Array<string>;
};

export const ServerPoolTable = ({
  searchValue,
  onSearchChange,
  isSearchDisabled,
  enableDisabled,
  disableDisabled,
  onEnable,
  onDisableClick,
  onSelectionChange,
  tableRows,
  tableHeaders,
  selectedRows,
}: ServerPoolTableProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Row mainAlignment="flex-start" width="100%">
        <Container orientation="vertical" mainAlignment="space-around" height="fit">
          <Row orientation="horizontal" width="100%">
            <Row
              padding={{ right: 'small' }}
              mainAlignment="flex-start"
              width="65%"
              crossAlignment="flex-start"
            >
              <Input
                value={searchValue}
                disabled={isSearchDisabled}
                label={t('cos.search_a_specific_server', 'Search for a specific server')}
                CustomIcon={FunnelSearchIcon}
                onChange={onSearchChange}
              />
            </Row>
            <Row padding={{ all: 'small' }} width="35%">
              <Padding left="small" right="large">
                <Button
                  type="outlined"
                  key="enable-button"
                  label={t('label.enable', 'enable')}
                  color="primary"
                  icon="CheckmarkCircleOutline"
                  iconPlacement="right"
                  disabled={enableDisabled}
                  onClick={onEnable}
                  size="extralarge"
                />
              </Padding>
              <Button
                type="outlined"
                key="disable-button"
                label={t('label.disable', 'disable')}
                color="error"
                icon="CloseCircleOutline"
                iconPlacement="right"
                size="extralarge"
                disabled={disableDisabled}
                onClick={onDisableClick}
              />
            </Row>
          </Row>
        </Container>
      </Row>

      <Row
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        width="fill"
        height={TABLE_CONTAINER_HEIGHT}
        padding={{ top: 'large' }}
      >
        <Table
          style={{ overflow: 'auto', height: '100%' }}
          rows={tableRows}
          headers={tableHeaders}
          showCheckbox={false}
          selectedRows={selectedRows}
          multiSelect={false}
          onSelectionChange={onSelectionChange}
          HeaderFactory={CustomHeaderFactory}
          RowFactory={HoverableRowFactory}
        />
      </Row>
    </>
  );
};
