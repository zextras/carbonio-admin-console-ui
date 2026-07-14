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
  Row,
  Table,
  Tooltip,
} from '@zextras/ui-components';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { S3ConnectorRow } from '../../../types';
import logo from '../../assets/ninja_robo.svg';

type TableHeader = {
  id: string;
  label: string;
  bold: boolean;
  width?: string;
};

export type SingleSelection = [] | [string];

type TextColumnConfig = {
  key: string;
  getValue: (volume: S3ConnectorRow) => string;
  weight: 'light' | 'regular';
  hasTooltip?: boolean;
};

const TEXT_COLUMNS: Array<TextColumnConfig> = [
  { key: 'id', getValue: (v) => v.uuid, weight: 'light', hasTooltip: true },
  { key: 'label', getValue: (v) => v.label, weight: 'regular' },
  { key: 'bucket', getValue: (v) => v.bucketName, weight: 'light' },
];

const ACTION_BUTTON_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '14px 0px 0px 14px',
  display: 'inline-flex',
  alignItems: 'center',
};

const headers = (t: TFunction): Array<TableHeader> => [
  {
    id: 'id',
    label: t('label.id', 'ID'),
    width: '35%',
    bold: true,
  },
  {
    id: 'label',
    label: t('label.descriptive_name', 'Descriptive Name'),
    width: '25%',
    bold: true,
  },
  {
    id: 'bucketName',
    label: t('label.bucket_name', 'Bucket name'),
    width: '25%',
    bold: true,
  },
  {
    id: 'actions',
    label: t('label.actions', 'Actions'),
    width: '10%',
    bold: true,
  },
];

function renderTextCell(
  config: TextColumnConfig,
  volume: S3ConnectorRow,
  index: number,
  onClick: (i: number) => void,
  onDoubleClick: (i: number) => void,
) {
  const value = config.getValue(volume);
  const cellKey = `${volume.uuid}-${config.key}`;

  const row = (
    <Row
      key={cellKey}
      onDoubleClick={(): void => {
        onDoubleClick(index);
      }}
      onClick={(): void => {
        onClick(index);
      }}
      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
    >
      <ds-text as="span" size="small" weight={config.weight}>
        {value}
      </ds-text>
    </Row>
  );

  if (config.hasTooltip) {
    return (
      <Tooltip placement="bottom" label={value} key={`${cellKey}-tip`}>
        {row}
      </Tooltip>
    );
  }

  return row;
}

type S3ConnectorListTable = {
  volumes: Array<S3ConnectorRow>;
  selectedRows: SingleSelection;
  onSelectionChange: (selected: string[]) => void;
  onDoubleClick: (i: number) => void;
  onClick: (i: number) => void;
};

export const S3ConnectorListTable = ({
  volumes,
  selectedRows,
  onSelectionChange,
  onDoubleClick,
  onClick,
}: S3ConnectorListTable) => {
  const [t] = useTranslation();

  const tableRows: Array<{
    id: string;
    columns: Array<string | React.ReactElement>;
    clickable: boolean;
  }> = volumes.map((v, i) => ({
    id: v.uuid,
    columns: [
      ...TEXT_COLUMNS.map((config) => renderTextCell(config, v, i, onClick, onDoubleClick)),
      <Row
        key={`${v.uuid}-actions`}
        orientation="vertical"
        mainAlignment="center"
        crossAlignment="flex-start"
      >
        <button
          type="button"
          onClick={(): void => {
            onClick(i);
          }}
          style={ACTION_BUTTON_STYLE}
        >
          <ds-icon icon="ArrowForwardOutline" size="18px" color="primary" />
        </button>
      </Row>,
    ],
    clickable: true,
  }));

  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start">
      <ListRow>
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          maxHeight="calc(100vh - 25rem)"
          minHeight="auto"
        >
          <Table
            headers={headers(t)}
            rows={tableRows}
            showCheckbox={false}
            multiSelect={false}
            selectedRows={selectedRows}
            onSelectionChange={onSelectionChange}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {tableRows.length === 0 && (
        <Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '4rem' }}>
          <img src={logo} alt="logo" />
          <Padding all="medium" width="30.875rem">
            <ds-text
              as="p"
              color="gray1"
              overflow="break-word"
              weight="regular"
              size="large"
              style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
            >
              {t(
                'select_bucket_or_create_bucket',
                'It seems like you haven\'t setup a bucket type. \n Click on the "CREATE +" button to create a new one.',
              )}
            </ds-text>
          </Padding>
        </Container>
      )}
    </Container>
  );
};
