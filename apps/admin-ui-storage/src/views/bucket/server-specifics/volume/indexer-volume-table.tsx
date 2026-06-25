/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Row,
  Table,
} from '@zextras/ui-components';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { IndexerVolumeTableProps } from '../../../../../types';
import { FLEX_START, LOCAL_VALUE, NO, YES } from '../../../../constants';

const IndexerVolumeTable: FC<IndexerVolumeTableProps> = ({ volumes, selectedRows, onSelectionChange, headers, onClick, isAdvanced }) => {
  const [t] = useTranslation();
  const tableRows = useMemo(
    () =>
      volumes.map((v, i) => {
        const columns = [
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="light">
              {v?.id}
            </ds-text>
          </Row>,
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="light">
              {v?.name}
            </ds-text>
          </Row>,
          isAdvanced && (
            <Row
              key={i}
              onClick={(): void => {
                onClick(i);
              }}
              style={{ textAlign: 'left', justifyContent: FLEX_START }}
            >
              <ds-text as="span" size="small" weight="light">
                {v?.storeType === LOCAL_VALUE
                  ? t('volume.volume_allocation_list.local_block_device', 'Local Block Device')
                  : t('volume.volume_allocation_list.object_storage', 'Object Storage')}
              </ds-text>
            </Row>
          ),
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="light">
              {v?.storeType === LOCAL_VALUE ? v?.path : v?.rootpath}
            </ds-text>
          </Row>,
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <ds-text as="span" color={v?.isCurrent ? 'text' : 'error'} size="small" weight="light">
              {v?.isCurrent ? YES : NO}
            </ds-text>
          </Row>,
          <Row key={`${i}-actions`} orientation="vertical" mainAlignment="center" crossAlignment="flex-start">
            <button
              type="button"
              onClick={(): void => { onClick(i); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0px 0px 14px', display: 'inline-flex', alignItems: 'center' }}
            >
              <ds-icon icon="ArrowForwardOutline" size="18px" color="primary" />
            </button>
          </Row>
        ];

        return {
          id: String(v?.id ?? ''),
          columns: columns.filter((column) => column !== false),
          clickable: true,
        };
      }),
    [isAdvanced, onClick, t, volumes],
  );

  return (
    <Container crossAlignment="flex-start">
      <Table
        headers={headers}
        rows={tableRows}
        showCheckbox={false}
        multiSelect={false}
        selectedRows={selectedRows as [] | [string]}
        onSelectionChange={onSelectionChange}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      {tableRows?.length === 0 && (
        <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
          <ds-text as="p">{t('label.empty_table', 'Empty Table')}</ds-text>
        </Row>
      )}
    </Container>
  );
};

export default IndexerVolumeTable;
