/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Input, ModalOverlay, Paging, Row, useSnackbar } from '@zextras/ui-components';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDoneOperations } from '../../services/use-done-operations';
import { type Operation } from '../../types/operations';
import { OperationsDoneHeader } from '../utility/utils';
import { OperationsTable } from './operations-table';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';

const FunnelSearchIcon = () => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

const DoneDetailPanel: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: doneData = [], isError } = useDoneOperations();
  const operationsDoneHeader = useMemo(() => OperationsDoneHeader(t), [t]);
  const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
  const [selectedData, setSelectedData] = useState<Operation | undefined>();
  const [isSelectedRow, setIsSelectedRow] = useState<Array<string>>([]);
  const [doneOffset, setDoneOffset] = useState<number>(0);
  const [searchOperation, setSearchOperation] = useState<string>('');

  const limit = 10;

  useEffect(() => {
    if (isError) {
      createSnackbar({
        key: '1',
        severity: 'error',
        label: t('label.operation.get_done_operation_error', '{{name}}', {
          name: '',
        }),
      });
    }
  }, [createSnackbar, isError, t]);

  const searchText = searchOperation?.toLocaleLowerCase();
  const filteredOperationData = doneData.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchText) ||
      item?.serverName?.toLowerCase().includes(searchText) ||
      item.parameters?.requesterAddress?.toLowerCase().includes(searchText),
  );
  const totalData = filteredOperationData.length;
  const startIndex = doneOffset;
  const endIndex = startIndex + limit;
  const doneOperationPaginationData = filteredOperationData.slice(startIndex, endIndex);

  const handleClick = (i: number): void => {
    const volumeObject = doneOperationPaginationData?.find((s, index: number) => index === i);
    setSelectedData(volumeObject);
    setWizardDetailToggle(true);
  };

  return (
    <>
      {wizardDetailToggle && (
        <ModalOverlay open={wizardDetailToggle}>
          <OperationsWizardDetailPanel
            setWizardDetailToggle={setWizardDetailToggle}
            setOpen={() => {}}
            selectedData={selectedData}
            allowStop={false}
          />
        </ModalOverlay>
      )}
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        background="white"
        style={{ position: 'relative' }}
      >
        <Row mainAlignment="flex-start" padding={{ all: 'large' }}>
          <ds-text as="h2" weight="bold">
            {t('operations.done_panel_heading', 'Done Operations')}
          </ds-text>
        </Row>
        <ds-divider></ds-divider>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
          padding={{ all: 'large' }}
        >
          <Row
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            width="fill"
          >
            <Container>
              <Input
                label={t(
                  'label.search_for_a_completed_operation',
                  `Search for a completed operation`,
                )}
                value={searchOperation}
                backgroundColor="gray5"
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setSearchOperation(e.target.value);
                }}
                CustomIcon={FunnelSearchIcon}
              />
            </Container>
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <OperationsTable
              operations={doneOperationPaginationData}
              headers={operationsDoneHeader}
              donePanel
              selectedRows={isSelectedRow}
              onSelectionChange={(selected: Array<string>): void => {
                setIsSelectedRow(selected);
              }}
              onClick={(i: number): void => {
                handleClick(i);
              }}
            />
          </Row>
          <Row
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            width="fill"
            padding={{ top: 'large' }}
          >
            <ds-divider></ds-divider>
          </Row>
          {filteredOperationData.length !== 0 && (
            <Container
              orientation="horizontal"
              mainAlignment="space-between"
              width="100%"
              height="auto"
            >
              <Container crossAlignment="flex-end">
                <Paging totalItem={totalData} setOffset={setDoneOffset} pageSize={limit} />
              </Container>
            </Container>
          )}
        </Container>
      </Container>
    </>
  );
};

export default DoneDetailPanel;
