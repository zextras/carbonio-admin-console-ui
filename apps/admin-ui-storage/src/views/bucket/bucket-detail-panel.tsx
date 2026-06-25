/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
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
import { filter } from 'lodash-es';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  BucketConnectorRow,
  DeleteS3ConnectorRequest,
  S3Connector,
} from '../../../types';
import logo from '../../assets/ninja_robo.svg';
import { ZIMBRA_ADMIN_URN } from '../../constants';
import { deleteS3Connector, listS3Connector } from '../../services/bucket-service';
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
  }> =
    useMemo(
    () =>
      volumes.map((v, i) => ({
        id: v.uuid,
        columns: [
          <Tooltip placement="bottom" label={v.uuid} key={`${v.uuid}-id`}>
            <Row
              onDoubleClick={(): void => { onDoubleClick(i); }}
              onClick={(): void => { onClick(i); }}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <ds-text as="span" size="small" weight="light">
                {v.uuid}
              </ds-text>
            </Row>
          </Tooltip>,
          <Row
            key={`${v.uuid}-label`}
            onDoubleClick={(): void => { onDoubleClick(i); }}
            onClick={(): void => { onClick(i); }}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <ds-text as="span" size="small" weight="regular">
              {v.label}
            </ds-text>
          </Row>,
          <Row
            key={`${v.uuid}-bucket`}
            onDoubleClick={(): void => { onDoubleClick(i); }}
            onClick={(): void => { onClick(i); }}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <ds-text as="span" size="small" weight="light">
              {v.bucketName}
            </ds-text>
          </Row>,
          <Row key={`${v.uuid}-actions`} orientation="vertical" mainAlignment="center" crossAlignment="flex-start">
            <button
              type="button"
              onClick={(): void => { onClick(i); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0px 0px 14px', display: 'inline-flex', alignItems: 'center' }}
            >
              <ds-icon icon="ArrowForwardOutline" size="18px" color="primary" />
            </button>
          </Row>,
        ],
        clickable: true,
      })),
    [onClick, onDoubleClick, volumes],
  );

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
          <ds-text as="p" overflow="break-word" weight="regular" size="large">
            <img src={logo} alt="logo" />
          </ds-text>
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

const BucketDetailPanel: FC = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [bucketselection, setBucketselection] = useState<SingleSelection>([]);
  const [bucketList, setBucketList] = useState<Array<BucketConnectorRow>>([]);
  const [bucketDeleteName, setBucketDeleteName] = useState<BucketConnectorRow | undefined>();
  const [allBucketList, setAllBucketList] = useState<Array<BucketConnectorRow>>([]);
  const [connectionData, setConnectionData] = useState<BucketConnectorRow | undefined>();
  const [toggleWizardSection, setToggleWizardSection] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchBucket, setSearchBucket] = useState('');
  const [showEditDetailView, setShowEditDetailView] = useState(false);
  const [toggleForGetAPICall, setToggleForGetAPICall] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BucketConnectorRow>();

  const closeHandler = (): void => {
    setOpen(false);
    setShowDetails(false);
  };

  const getBucketListType = useCallback((): void => {
    listS3Connector()
      .then((connectors) => {
        const mappedConnectors: Array<BucketConnectorRow> = connectors.map((connector: S3Connector) => ({
          uuid: connector.uuid,
          id: connector.uuid,
          label: connector.label || '',
          bucketName: connector.bucketName || '',
          region: connector.region || '',
          url: connector.url || '',
          accessKey: connector.accessKey || '',
          destinationPath: connector.destinationPath || '',
          insecureHttps: String(connector.insecureHttps ?? false),
          notes: connector.notes || '',
          storeType: ((connector as unknown as { storeType?: string }).storeType || 'S3'),
          'usage in external backup': connector['usage in external backup'] ?? '',
          'usage in powerstore volumes': connector['usage in powerstore volumes'] ?? '',
          'usage in powerstore volume': connector['usage in powerstore volume'] ?? '',
          usage: connector.usage ?? '',

        }));
        setBucketList(mappedConnectors);
        setAllBucketList(mappedConnectors);
      })
      .catch(() => {
        setBucketList([]);
        setAllBucketList([]);
      });
  }, []);

  const deleteHandler = useCallback(() => {
    // delete  api call here
    setOpen(false);
    const objectToSendDeleteBucket: DeleteS3ConnectorRequest = {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxPowerstore',
      action: 'deleteS3Connector',
      uuid: bucketDeleteName?.uuid || '',
      iAmSure: true,
    };

    deleteS3Connector(objectToSendDeleteBucket).then((response) => {
      if (response.ok) {
        getBucketListType();
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
          typeof response?.error === 'string'
            ? response.error
            : response?.error?.message;

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
    });
  }, [
    bucketDeleteName?.uuid,
    bucketDeleteName?.bucketName,
    getBucketListType,
    createSnackbar,
    t,
  ]);
  const handleClick = (i: number): void => {
    const volumeObject = bucketList.find((s, index) => index === i);
    setConnectionData(volumeObject);
    setShowEditDetailView(true);
    setShowDetails(true);
  };

  useEffect(() => {
    if (selectedRow !== undefined) {
      const getIndex = bucketList.findIndex((data) => data.uuid === selectedRow.uuid);
      const volumeObject = bucketList.find((s, index) => index === getIndex);
      setConnectionData(volumeObject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketList, toggleForGetAPICall]);

  useEffect(() => {
    getBucketListType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleWizardSection]);

  const filterBucketList = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchBucket(e.target.value);
    if (e.target.value !== '') {
      setBucketList(
        filter(
          bucketList,
          (o) =>
            o.bucketName.toLowerCase().includes(e.target.value) ||
            o.label.toLowerCase().includes(e.target.value),
        ),
      );
    } else {
      setBucketList(allBucketList);
    }
  };

  return (
    <>
      {toggleWizardSection && (
        <ModalOverlay open={toggleWizardSection}>
          <NewBucket
            setToggleWizardSection={setToggleWizardSection}
            setDetailsBucket={setShowEditDetailView}
            setConnectionData={setConnectionData as (data: unknown) => void}
          />
        </ModalOverlay>
      )}
      {showEditDetailView && connectionData && (
        <ModalOverlay open={showEditDetailView}>
          <EditBucketDetailPanel
            setBucketDeleteName={setBucketDeleteName}
            setOpen={setOpen}
            setShowEditDetailView={setShowEditDetailView}
            title="S3 details"
            bucketDetail={connectionData}
            getBucketListType={getBucketListType}
            setSelectedRow={setSelectedRow}
            setToggleForGetAPICall={setToggleForGetAPICall}
            toggleForGetAPICall={toggleForGetAPICall}
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
              if (showDetails) setShowDetails(!showDetails);
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
            volumes={bucketList}
            selectedRows={bucketselection}
            onSelectionChange={(selected: string[]): void => {
              const [firstSelected] = selected;
              const nextSelection: SingleSelection =
                firstSelected === undefined ? [] : [firstSelected];
              setBucketselection(nextSelection);
              const selectedIndex = Number(firstSelected);
              if (Number.isNaN(selectedIndex)) {
                return;
              }
              const volumeObject: BucketConnectorRow | undefined = bucketList.find(
                (s, index) => index === selectedIndex,
              );
              setShowDetails(false);
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
      </Container>
    </>
  );
};

export default BucketDetailPanel;
