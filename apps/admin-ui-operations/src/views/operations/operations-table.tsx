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

import { EXCEPTION, FINISHED, STARTED } from '../../constants';
import { type Operation } from '../../types/operations';
import MiliSecondToDate from './functions/miliSecondToDate';

export const OperationsTable: FC<{
  operations: Array<Operation>;
  headers: any;
  donePanel: boolean;
  selectedRows: any;
  onSelectionChange: any;
  onClick: (value: number) => void;
}> = ({ operations, headers, donePanel, selectedRows, onSelectionChange, onClick }) => {
  const [t] = useTranslation();

  const doneTableRowPanel = useMemo(
    () =>
      operations?.map((v, i) => ({
        id: i?.toString(),
        columns: [
          <Row
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="medium">
              {v?.serverName || ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.name || ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',

              justifyContent: 'flex-center',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            {v?.type === EXCEPTION && (
              <ds-icon icon="StopCircleOutline" size="medium" color="secondary"></ds-icon>
            )}
            {v?.type === FINISHED && (
              <ds-icon icon="CloseCircleOutline" size="medium" color="error"></ds-icon>
            )}
            {v?.type === STARTED && (
              <ds-icon icon="CheckmarkCircleOutline" size="medium" color="success"></ds-icon>
            )}
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.parameters?.requesterAddress}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.startTime ? MiliSecondToDate(v?.startTime) : ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.humanStartTime ? v?.humanStartTime : ''}
            </ds-text>
          </Row>,
        ],
        clickable: true,
      })),
    [onClick, operations],
  );

  const unDoneTableRowsPanel = useMemo(
    () =>
      operations?.map((v, i) => ({
        id: i?.toString(),
        columns: [
          <Row
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="medium">
              {v?.host || ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.name || ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.parameters?.requesterAddress}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-center',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.startTime ? MiliSecondToDate(v?.startTime) : ''}
            </ds-text>
          </Row>,
          <Row
            key={i}
            style={{
              textAlign: 'left',
              justifyContent: 'flex-center',
            }}
            onClick={(): void => {
              onClick(i);
            }}
          >
            <ds-text as="span" weight="light" size="small">
              {v?.queuedTime ? MiliSecondToDate(v?.queuedTime) : ''}
            </ds-text>
          </Row>,
        ],
        clickable: true,
      })),
    [onClick, operations],
  );

  const tableRows = useMemo(
    () => (donePanel ? doneTableRowPanel : unDoneTableRowsPanel),
    [donePanel, doneTableRowPanel, unDoneTableRowsPanel],
  );

  return (
    <Container crossAlignment="flex-start">
      <Table
        headers={headers}
        rows={tableRows}
        showCheckbox={false}
        multiSelect={false}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      {tableRows.length === 0 && (
        <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
          <ds-text as="span" weight="light" size="small">
            {t('label.empty_table', 'Empty Table')}
          </ds-text>
        </Row>
      )}
    </Container>
  );
};
