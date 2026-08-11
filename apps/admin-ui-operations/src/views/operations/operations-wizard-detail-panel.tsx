/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, LabeledValue, ListRow, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  DONE_ROUTE_ID,
  FALSE_OPERATION,
  QUEUED,
  RUNNING_ROUTE_ID,
  STARTED,
  TRUE_OPERATION,
} from '../../constants';
import { copyTextToClipboard } from '../utility/utils';
import { MilliSecondToDate } from './functions/milliSecondToDate';

type OperationsWizardDetailPanelProps = {
  setWizardDetailToggle: (value: boolean) => void;
  setOpen: (value: boolean) => void;
  selectedData: any;
  allowStop: boolean;
};

function getDisplayStatus(state: string | undefined): string {
  if (state === STARTED) {
    return RUNNING_ROUTE_ID.charAt(0).toUpperCase() + RUNNING_ROUTE_ID.slice(1);
  }
  if (state === QUEUED) {
    return QUEUED;
  }
  return DONE_ROUTE_ID.charAt(0).toUpperCase() + DONE_ROUTE_ID.slice(1);
}

export const OperationsWizardDetailPanel = ({
  setWizardDetailToggle,
  setOpen,
  selectedData,
  allowStop,
}: OperationsWizardDetailPanelProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const status = getDisplayStatus(selectedData?.state);

  const copyOperation = () => {
    const operationItem = `
			${t('operations.label.operation_type', 'Operation Type')} : ${selectedData?.module || ''} \n
			${t('operations.label.who_started_it', 'Who started it?')} : ${
      selectedData?.parameters?.requesterAddress || ''
    } \n
			${t('operations.label.status', 'Status')} : ${
      (selectedData?.type ? selectedData?.type : status) || ''
    } \n
			${t('operations.label.submitted_at', 'Submitted at')}:  ${
      selectedData?.startTime ? MilliSecondToDate(selectedData?.startTime) : ''
    } \n
			${t('operations.label.started_at', 'Started at')} : ${
      selectedData?.humanStartTime ? selectedData?.humanStartTime : ''
    } \n
			${t('operations.label.notifications', 'Notifications')} : ${
      selectedData?.parameters?.additionalNotificationAddresses
        ? selectedData?.parameters?.additionalNotificationAddresses?.length
        : ''
    } \n
			${t('operations.label.create_fake_blob', 'Create Fake Blob')} : ${
      selectedData?.parameters?.createFakeBlob ? TRUE_OPERATION : FALSE_OPERATION
    } \n
			${t('operations.label.Deep', 'Deep')} : ${
      selectedData?.parameters?.isDeep ? TRUE_OPERATION : FALSE_OPERATION
    } \n
		`;
    copyTextToClipboard(operationItem);
    createSnackbar({
      key: 'success',
      severity: 'success',
      label: t('operations.copy_operation_successfully', 'Operation details copied successfully'),
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  return (
    <Container background="gray6">
      <Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
        <Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
          <ds-text as="h2"  weight="bold">
            {t('operations.operationname_on_servername', '{{operationName}} on {{serverName}}', {
              operationName: selectedData?.name,
              serverName: selectedData?.serverName,
            })}
          </ds-text>
        </Row>
        <Row padding={{ horizontal: 'small' }}>
          <Button
            type="ghost"
            color={'text'}
            icon="CloseOutline"
            aria-label={t('label.close', 'Close')}
            onClick={(): void => setWizardDetailToggle(false)}
          />
        </Row>
      </Row>
      <ds-divider></ds-divider>
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
        <Row
          mainAlignment="flex-end"
          crossAlignment="flex-end"
          width="100%"
          padding={{ vertical: 'large' }}
        >
          <Padding right="large">
            <Button
              type="outlined"
              label={t('operations.copy_btn', 'COPY')}
              color="primary"
              icon="CopyOutline"
              iconPlacement="right"
              onClick={copyOperation}
            />
          </Padding>
          {allowStop && (
            <Button
              type="outlined"
              label={
                selectedData?.state === STARTED
                  ? t('operations.stop_operation_btn', 'STOP OPERATION')
                  : t('operations.cancel_operation_btn', 'CANCEL OPERATION')
              }
              color="error"
              icon={selectedData?.state === STARTED ? 'StopCircleOutline' : 'Close'}
              iconPlacement="right"
              onClick={(): void => setOpen(true)}
            />
          )}
        </Row>
        <Row mainAlignment="flex-start" padding={{ vertical: 'large' }} width="100%">
          <ds-text as="h2" size="medium" color="gray0" weight="bold">
            {t('operations.details', 'Details')}
          </ds-text>
          <Row width="100%" padding={{ top: 'large' }}>
            <ListRow>
              <Container padding={{ right: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.operation_type', 'Operation Type')}
                  value={selectedData?.module || ''}
                />
              </Container>
              <Container padding={{ right: 'small', left: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.who_started_it', 'Who started it?')}
                  value={selectedData?.parameters?.requesterAddress || ''}
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.status', 'Status')}
                  value={(selectedData?.type ? selectedData?.type : status) || ''}
                />
              </Container>
            </ListRow>
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <ListRow>
              <Container padding={{ right: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.submitted_at', 'Submitted at')}
                  value={selectedData?.startTime ? MilliSecondToDate(selectedData?.startTime) : ''}
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.started_at', 'Started at')}
                  value={selectedData?.humanStartTime ? selectedData?.humanStartTime : ''}
                />
              </Container>
            </ListRow>
          </Row>
        </Row>
        <Padding vertical="large" />
        <ds-divider></ds-divider>
        <Padding vertical="large" />
        <Row mainAlignment="flex-start" padding={{ vertical: 'large' }} width="100%">
          <ds-text as="h2" size="medium" color="gray0" weight="bold">
            {t('operations.other', 'Other')}
          </ds-text>
          <Row width="100%" padding={{ top: 'large' }}>
            <LabeledValue
              backgroundColor="gray6"
              label={t('operations.label.notifications', 'Notifications')}
              value={
                (selectedData?.parameters?.additionalNotificationAddresses &&
                  selectedData?.parameters?.additionalNotificationAddresses?.length) ||
                ''
              }
            />
          </Row>
          <Row width="100%" padding={{ top: 'large' }}>
            <ListRow>
              <Container padding={{ right: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.create_fake_blob', 'Create Fake Blob')}
                  value={selectedData?.parameters?.createFakeBlob ? TRUE_OPERATION : FALSE_OPERATION}
                />
              </Container>
              <Container padding={{ left: 'small' }}>
                <LabeledValue
                  backgroundColor="gray6"
                  label={t('operations.label.Deep', 'Deep')}
                  value={selectedData?.parameters?.isDeep ? TRUE_OPERATION : FALSE_OPERATION}
                />
              </Container>
            </ListRow>
          </Row>
        </Row>
      </Container>
    </Container>
  );
};
