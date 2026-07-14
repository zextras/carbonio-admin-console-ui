/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import {
  Banner,
  Button,
  Container,
  Input,
  ModalOverlay,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteS3ConnectorRequest, S3Connector, S3ConnectorRow } from '../../../types';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { deleteS3Connector } from '../../services/s3-connector-service';
import { s3ConnectorVolumeQueryKeys } from '../../services/s3-connector-volume-query-keys';
import { useListS3Connectors } from '../../services/use-list-s3-connectors';
import { DeleteS3ConnectorModal as ConnectorDeleteModal } from './delete-s3-connector-modal';
import { EditS3ConnectorDetailPanel } from './edit-s3-connector-details-panel';
import { NewS3Connector } from './new-s3-connector';
import { S3ConnectorListTable, type SingleSelection } from './s3-connector-list-table';

export function resolveSelectedS3Connector(
  connectorList: Array<S3ConnectorRow>,
  selectedValue?: string,
): S3ConnectorRow | undefined {
  if (selectedValue === undefined) {
    return undefined;
  }

  const selectedIndex = Number(selectedValue);
  if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < connectorList.length) {
    return connectorList[selectedIndex];
  }

  return connectorList.find((connector) => connector.uuid === selectedValue || connector.id === selectedValue);
}

export const S3ConnectorListPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: connectors = [], isLoading, isError } = useListS3Connectors();
  const [connectorSelection, setConnectorSelection] = useState<SingleSelection>([]);
  const [connectorDeleteName, setConnectorDeleteName] = useState<S3ConnectorRow | undefined>();
  const [selectedUuid, setSelectedUuid] = useState<string | undefined>();
  const [toggleWizardSection, setToggleWizardSection] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchConnector, setSearchConnector] = useState('');
  const [showEditDetailView, setShowEditDetailView] = useState(false);

  const connectorList: Array<S3ConnectorRow> = connectors.map((connector: S3Connector) => ({
    uuid: connector.uuid,
    id: connector.uuid,
    label: connector.label || '',
    bucketName: connector.bucketName || '',
    region: connector.region || '',
    url: connector.url || '',
    accessKey: connector.accessKey || '',
    prefix: connector.prefix || '',
    insecureHttps: String(connector.insecureHttps ?? false),
    notes: connector.notes || '',
    storeType: connector.storeType || 'S3',
    'usage in external backup': connector['usage in external backup'] ?? '',
    'usage in powerstore volumes': connector['usage in powerstore volumes'] ?? '',
    'usage in powerstore volume': connector['usage in powerstore volume'] ?? '',
    usage: connector.usage ?? '',
  }));

  const lowerSearch = searchConnector.toLowerCase();
  const filteredConnectorList =
    searchConnector === ''
      ? connectorList
      : connectorList.filter(
          (o) =>
            o.bucketName.toLowerCase().includes(lowerSearch) ||
            o.label.toLowerCase().includes(lowerSearch),
        );

  const closeHandler = (): void => {
    setOpen(false);
  };

  const deleteHandler = async (): Promise<void> => {
    setOpen(false);
    const objectToSendDeleteConnector: DeleteS3ConnectorRequest = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'deleteS3Connector',
      uuid: connectorDeleteName?.uuid || '',
      iAmSure: true,
    };

    try {
      const response = await deleteS3Connector(objectToSendDeleteConnector);
      if (response.ok) {
        void queryClient.invalidateQueries({ queryKey: s3ConnectorVolumeQueryKeys.s3Connectors() });
        createSnackbar({
          key: '1',
          severity: 'success',
          label: t('label.delete_bucket_sucess', 'The {{name}} has been removed', {
            name: connectorDeleteName?.bucketName,
          }),
          autoHideTimeout: 2000,
        });
        setShowEditDetailView(false);
      } else {
        const errorMessage =
          typeof response?.error === 'string' ? response.error : response?.error?.message;

        createSnackbar({
          key: '1',
          severity: 'error',
          label:
            errorMessage ||
            t('label.delete_bucket_fail', 'The {{name}} has not been removed', {
              name: connectorDeleteName?.bucketName,
            }),
          autoHideTimeout: 2000,
        });
      }
    } catch (err) {
      createSnackbar({
        key: '1',
        severity: 'error',
        label:
          (err instanceof Error ? err.message : undefined) ||
          t('label.delete_bucket_fail', 'The {{name}} has not been removed', {
            name: connectorDeleteName?.bucketName,
          }),
        autoHideTimeout: 2000,
      });
    }
  };

  const connectionData = selectedUuid ? connectorList.find((b) => b.uuid === selectedUuid) : undefined;

  const handleClick = (i: number): void => {
    const volumeObject = filteredConnectorList.find((s, index) => index === i);
    setSelectedUuid(volumeObject?.uuid);
    setShowEditDetailView(true);
  };

  const filterConnectorList = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchConnector(e.target.value);
  };

  if (isLoading) {
    return <ds-page-shimmer />;
  }

  return (
    <>
      {toggleWizardSection && (
        <ModalOverlay open={toggleWizardSection}>
          <NewS3Connector
            setToggleWizardSection={setToggleWizardSection}
            setDetailsConnector={setShowEditDetailView}
            setConnectionData={(): void => setSelectedUuid(undefined)}
          />
        </ModalOverlay>
      )}
      {showEditDetailView && connectionData && (
        <ModalOverlay open={showEditDetailView}>
          <EditS3ConnectorDetailPanel
            setConnectorDeleteName={setConnectorDeleteName}
            setOpen={setOpen}
            setShowEditDetailView={setShowEditDetailView}
            title={t('storages.s3Connectors.detailsTitle', 'S3 details')}
            connectorDetail={connectionData}
            getConnectorListType={(): void => {
              void queryClient.invalidateQueries({
                queryKey: s3ConnectorVolumeQueryKeys.s3Connectors(),
              });
            }}
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
        <Row mainAlignment="flex-start" padding={{ all: 'large' }}>
          <ds-text as="h2" weight="bold">
            {t('storages.s3Connectors.title', 'S3 connectors')}
          </ds-text>
        </Row>
        <ds-divider></ds-divider>
        <Padding vertical="small" />
        <Row
          width="100%"
          mainAlignment="flex-end"
          style={{ gap: '1rem' }}
          orientation="horizontal"
          padding={{ top: 'extralarge', right: 'large', left: 'large' }}
        >
          <Button
            label={t('storages.createNewS3', 'CREATE A NEW S3')}
            icon="PlusOutline"
            color="primary"
            onClick={(): void => {
              setToggleWizardSection(!toggleWizardSection);
            }}
          />
        </Row>
        {open && connectorDeleteName && (
          <ConnectorDeleteModal
            open={open}
            closeHandler={closeHandler}
            saveHandler={deleteHandler}
            connectorName={connectorDeleteName.label}
          />
        )}
        {isError ? (
          <Row width="100%" padding={{ all: 'large' }}>
            <Banner
              severity="error"
              description={t(
                'storages.s3Connectors.loadError',
                'Failed to load S3 connectors. Please try again later.',
              )}
            />
          </Row>
        ) : (
          <>
            <Row width="100%" padding={{ all: 'large' }}>
              <Input
                disabled={connectorList.length === 0 && searchConnector.length === 0}
                backgroundColor="gray5"
                label={t('storages.s3Connectors.filterS3List', 'Filter S3 List')}
                CustomIcon={(): React.ReactElement => (
                  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                )}
                onChange={filterConnectorList}
              />
            </Row>

            <Row style={{ padding: '0 0.875rem 0 0.875rem' }} width="100%">
              <S3ConnectorListTable
                volumes={filteredConnectorList}
                selectedRows={connectorSelection}
                onSelectionChange={(selected: string[]): void => {
                  const [firstSelected] = selected;
                  const nextSelection: SingleSelection =
                    firstSelected === undefined ? [] : [firstSelected];
                  setConnectorSelection(nextSelection);

                  const volumeObject = resolveSelectedS3Connector(
                    filteredConnectorList,
                    firstSelected,
                  );
                  setConnectorDeleteName(volumeObject);
                }}
                onDoubleClick={(i: number): void => {
                  handleClick(i);
                }}
                onClick={(i: number): void => {
                  handleClick(i);
                }}
              />
            </Row>
          </>
        )}
      </Container>
    </>
  );
};
