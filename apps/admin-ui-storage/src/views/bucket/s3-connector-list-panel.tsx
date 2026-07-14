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
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ListRow,
  ModalOverlay,
  Padding,
  Row,
  Table,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { TFunction } from 'i18next';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BucketConnectorRow, DeleteS3ConnectorRequest, S3Connector } from '../../../types';
import logo from '../../assets/ninja_robo.svg';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { deleteS3Connector } from '../../services/bucket-service';
import { bucketVolumeQueryKeys } from '../../services/bucket-volume-query-keys';
import { useListS3Connectors } from '../../services/use-list-s3-connectors';
import BucketDeleteModel from './delete-bucket-model';
import EditBucketDetailPanel from './edit-bucket-details-panel';
import NewBucket from './new-bucket';

type TableHeader = {
  id: string;
  label: string;
  bold: boolean;
  width?: string;
};

type SingleSelection = [] | [string];

type TextColumnConfig = {
  key: string;
  getValue: (volume: BucketConnectorRow) => string;
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

export function resolveSelectedBucketConnector(
  bucketList: Array<BucketConnectorRow>,
  selectedValue?: string,
): BucketConnectorRow | undefined {
  if (selectedValue === undefined) {
    return undefined;
  }

  const selectedIndex = Number(selectedValue);
  if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < bucketList.length) {
    return bucketList[selectedIndex];
  }

  return bucketList.find((bucket) => bucket.uuid === selectedValue || bucket.id === selectedValue);
}

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
  volume: BucketConnectorRow,
  index: number,
  onClick: (i: number) => void,
  onDoubleClick: (i: number) => void,
): React.ReactElement {
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

const BucketListTable: FC<{
  volumes: Array<BucketConnectorRow>;
  selectedRows: SingleSelection;
  onSelectionChange: (selected: string[]) => void;
  onDoubleClick: (i: number) => void;
  onClick: (i: number) => void;
}> = ({ volumes, selectedRows, onSelectionChange, onDoubleClick, onClick }) => {
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

export const S3ConnectorListPanel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: connectors = [], isLoading, isError } = useListS3Connectors();
  const [bucketselection, setBucketselection] = useState<SingleSelection>([]);
  const [bucketDeleteName, setBucketDeleteName] = useState<BucketConnectorRow | undefined>();
  const [selectedUuid, setSelectedUuid] = useState<string | undefined>();
  const [toggleWizardSection, setToggleWizardSection] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchBucket, setSearchBucket] = useState('');
  const [showEditDetailView, setShowEditDetailView] = useState(false);

  const bucketList: Array<BucketConnectorRow> = connectors.map((connector: S3Connector) => ({
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

  const lowerSearch = searchBucket.toLowerCase();
  const filteredBucketList =
    searchBucket === ''
      ? bucketList
      : bucketList.filter(
          (o) =>
            o.bucketName.toLowerCase().includes(lowerSearch) ||
            o.label.toLowerCase().includes(lowerSearch),
        );

  const closeHandler = (): void => {
    setOpen(false);
  };

  const deleteHandler = async (): Promise<void> => {
    setOpen(false);
    const objectToSendDeleteBucket: DeleteS3ConnectorRequest = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'deleteS3Connector',
      uuid: bucketDeleteName?.uuid || '',
      iAmSure: true,
    };

    try {
      const response = await deleteS3Connector(objectToSendDeleteBucket);
      if (response.ok) {
        void queryClient.invalidateQueries({ queryKey: bucketVolumeQueryKeys.s3Connectors() });
        createSnackbar({
          key: '1',
          severity: 'success',
          label: t('label.delete_bucket_sucess', 'The {{name}} has been removed', {
            name: bucketDeleteName?.bucketName,
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
              name: bucketDeleteName?.bucketName,
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
            name: bucketDeleteName?.bucketName,
          }),
        autoHideTimeout: 2000,
      });
    }
  };

  const connectionData = selectedUuid ? bucketList.find((b) => b.uuid === selectedUuid) : undefined;

  const handleClick = (i: number): void => {
    const volumeObject = filteredBucketList.find((s, index) => index === i);
    setSelectedUuid(volumeObject?.uuid);
    setShowEditDetailView(true);
  };

  const filterBucketList = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchBucket(e.target.value);
  };

  if (isLoading) {
    return <ds-page-shimmer />;
  }

  return (
    <>
      {toggleWizardSection && (
        <ModalOverlay open={toggleWizardSection}>
          <NewBucket
            setToggleWizardSection={setToggleWizardSection}
            setDetailsBucket={setShowEditDetailView}
            setConnectionData={(): void => setSelectedUuid(undefined)}
          />
        </ModalOverlay>
      )}
      {showEditDetailView && connectionData && (
        <ModalOverlay open={showEditDetailView}>
          <EditBucketDetailPanel
            setBucketDeleteName={setBucketDeleteName}
            setOpen={setOpen}
            setShowEditDetailView={setShowEditDetailView}
            title={t('storages.s3Connectors.detailsTitle', 'S3 details')}
            bucketDetail={connectionData}
            getBucketListType={(): void => {
              void queryClient.invalidateQueries({
                queryKey: bucketVolumeQueryKeys.s3Connectors(),
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
        {open && bucketDeleteName && (
          <BucketDeleteModel
            open={open}
            closeHandler={closeHandler}
            saveHandler={deleteHandler}
            connectorName={bucketDeleteName.label}
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
                disabled={bucketList.length === 0 && searchBucket.length === 0}
                backgroundColor="gray5"
                label={t('storages.s3Connectors.filterS3List', 'Filter S3 List')}
                CustomIcon={(): React.ReactElement => (
                  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                )}
                onChange={filterBucketList}
              />
            </Row>

            <Row style={{ padding: '0 0.875rem 0 0.875rem' }} width="100%">
              <BucketListTable
                volumes={filteredBucketList}
                selectedRows={bucketselection}
                onSelectionChange={(selected: string[]): void => {
                  const [firstSelected] = selected;
                  const nextSelection: SingleSelection =
                    firstSelected === undefined ? [] : [firstSelected];
                  setBucketselection(nextSelection);

                  const volumeObject = resolveSelectedBucketConnector(
                    filteredBucketList,
                    firstSelected,
                  );
                  setBucketDeleteName(volumeObject);
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
