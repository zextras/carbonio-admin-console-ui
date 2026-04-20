/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ModalOverlay, Row, useSnackbar } from '@zextras/ui-components';
import { useAllServers } from '@zextras/ui-shared';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { stopOperations } from '../../services/stop-operation';
import { useOperationStore } from '../../store/operation/store';
import { type Operation } from '../../types/operations';
import { OperationsHeader } from '../utility/utils';
import DeleteOpearationsModel from './delete-operations-model';
import { OperationsTable } from './operations-table';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';

const RunningDetailPanel: FC<{ getAllOperationAPICallHandler: () => void }> = ({
  getAllOperationAPICallHandler,
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: serverList = [] } = useAllServers();
  const serverName = serverList[0]?.name;
  const { runningData } = useOperationStore((state) => state);
  const operationsHeader = useMemo(() => OperationsHeader(t), [t]);
  const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Operation | undefined>();
  const [isSelectedRow, setIsSelectedRow] = useState<Array<string>>([]);

  const closeHandler = (): void => {
    setOpen(false);
  };

  const stopHandler = (): void => {
    if (!selectedData?.id) {
      return;
    }

    stopOperations(selectedData?.id)
      .then((res) => {
        const result = JSON.parse(res?.Body?.response?.content);
        if (result?.response?.[`${serverName}`]?.ok) {
          createSnackbar({
            key: '1',
            severity: 'success',
            label: t(
              'label.stop_operation_sucess',
              'The {{name}} operation has been stopped successfully',
              {
                name: selectedData?.name,
              },
            ),
          });
          setOpen(false);
          setWizardDetailToggle(false);
          getAllOperationAPICallHandler();
        } else {
          createSnackbar({
            key: '1',
            severity: 'error',
            label: t('label.stop_operation_helperText', '{{message}}', {
              message: result?.response?.[`${serverName}`]?.error?.message,
            }),
          });
          setOpen(false);
          setWizardDetailToggle(false);
        }
      })
      .catch((err) => {
        createSnackbar({
          key: '1',
          severity: 'error',
          label: t('label.operation.stop_operation_error', '{{name}}', {
            name: err,
          }),
        });
      });
  };

  const handleClick = (i: number): void => {
    const volumeObject = runningData?.find((s: Operation, index: number) => index === i);
    setSelectedData(volumeObject);
    setWizardDetailToggle(true);
  };

  return (
    <>
      {wizardDetailToggle && (
        <ModalOverlay open={wizardDetailToggle}>
          <OperationsWizardDetailPanel
            setWizardDetailToggle={setWizardDetailToggle}
            setOpen={setOpen}
            selectedData={selectedData}
          />
        </ModalOverlay>
      )}
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflowY: 'auto', position: 'relative' }}
        background="white"
      >
        <DeleteOpearationsModel
          open={open}
          closeHandler={closeHandler}
          saveHandler={stopHandler}
          selectedData={selectedData}
        />
        <Row mainAlignment="flex-start" padding={{ all: 'large' }}>
          <ds-text as="h2"  weight="bold">
            {t('operations.running_panel_heading', 'Running Operations')}
          </ds-text>
        </Row>
        <ds-divider></ds-divider>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
          height="calc(100vh - 12.5rem)"
          padding={{ all: 'large' }}
        >
          <Row width="100%" padding={{ top: 'large' }}>
            {runningData && (
              <OperationsTable
                operations={runningData}
                headers={operationsHeader}
                donePanel={false}
                selectedRows={isSelectedRow}
                onSelectionChange={(selected: Array<string>): void => {
                  setIsSelectedRow(selected);
                }}
                onClick={(i: number): void => {
                  handleClick(i);
                }}
              />
            )}
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default RunningDetailPanel;
