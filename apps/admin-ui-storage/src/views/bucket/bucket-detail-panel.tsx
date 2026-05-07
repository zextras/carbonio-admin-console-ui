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

import { DeleteS3ConnectorRequest, objectType } from '../../../types';
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
};

type SingleSelection = [] | [string];

const headers = (t: TFunction): Array<TableHeader> => [
  {
    id: 'label',
    label: t('label.label', 'Label'),
    bold: true,
  },
  {
    id: 'name',
    label: t('label.bucket_name', 'Name'),
    bold: true,
  },
  {
    id: 'type',
    label: t('label.type', 'Type'),
    bold: true,
  },
];

const BucketListTable: FC<{
  volumes: objectType[];
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
        id: String(i),
        columns: [
          <Tooltip placement="bottom" label={v.notes} key={v.label}>
            <Row
              onDoubleClick={(): void => {
                onDoubleClick(i);
              }}
              onClick={(): void => {
                onClick(i);
              }}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <ds-text as="span" size="small" weight="regular">
                {v.label}
              </ds-text>
            </Row>
          </Tooltip>,
          <Tooltip placement="bottom" label={v.notes} key={v.bucketName}>
            <Row
              key={i}
              onDoubleClick={(): void => {
                onDoubleClick(i);
              }}
              onClick={(): void => {
                onClick(i);
              }}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <ds-text as="span" size="small" weight="light">
                {v.bucketName}
              </ds-text>
            </Row>
          </Tooltip>,
          <Tooltip placement="bottom" label={v.notes} key={v.storeType}>
            <Row
              key={i}
              onDoubleClick={(): void => {
                onDoubleClick(i);
              }}
              onClick={(): void => {
                onClick(i);
              }}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <ds-text as="span" size="small" weight="light">
                {v.storeType}
              </ds-text>
            </Row>
          </Tooltip>,
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
  const [bucketDeleteName, setBucketDeleteName] = useState<objectType | undefined>({});
  const bucketType = '';
  const [bucketList, setBucketList] = useState<objectType[]>([]);
  const [allBucketList, setAllBucketList] = useState<Array<objectType>>([]);
  const [connectionData, setConnectionData] = useState<objectType | undefined>();
  const [toggleWizardSection, setToggleWizardSection] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchBucket, setSearchBucket] = useState('');
  const [showEditDetailView, setShowEditDetailView] = useState(false);
  const [toggleForGetAPICall, setToggleForGetAPICall] = useState(false);
  const [selectedRow, setSelectedRow] = useState<objectType>();

  const closeHandler = (): void => {
    setOpen(false);
    setShowDetails(!showDetails);
  };

  const getBucketListType = useCallback((): void => {
    listS3Connector()
      .then((connectors) => {
        const mappedConnectors: Array<objectType> = connectors.map((connector) => ({
          uuid: connector.id,
          id: connector.id,
          label: connector.label || '',
          bucketName: connector.bucketName || '',
          region: connector.region || '',
          url: connector.url || '',
          accessKey: connector.accessKey || '',
          prefix: connector.prefix || '',
          insecureHttps: String(connector.insecureHttps ?? false),
          notes: connector.notes || '',
          storeType: ((connector as unknown as { storeType?: string }).storeType || 'S3'),
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
      id: bucketDeleteName?.uuid || '',
      iAmSure: true,
    };

    deleteS3Connector(objectToSendDeleteBucket).then((rawResponse) => {
      const response = rawResponse as { ok?: boolean };
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
        createSnackbar({
          key: '1',
          severity: 'error',
          label: t('label.delete_bucket_fail', 'The {{name}} has not been removed', {
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
    const volumeObject: objectType | undefined = bucketList.find((s, index) => index === i);
    setConnectionData(volumeObject);
    setShowEditDetailView(true);
    setShowDetails(true);
  };

  useEffect(() => {
    if (selectedRow !== undefined) {
      const getIndex = bucketList.findIndex((data: objectType) => data.uuid === selectedRow.uuid);
      const volumeObject: objectType | undefined = bucketList.find(
        (s, index) => index === getIndex,
      );
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
            setConnectionData={setConnectionData}
            bucketType={bucketType}
          />
        </ModalOverlay>
      )}
      {showEditDetailView && (
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
            {t('storages.s3Connectors', 'S3 connectors')}
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
            // type="outlined"
            label={t('storages.createNewS3', 'CREATE A NEW S3')}
            icon="PlusOutline"
            color="primary"
            onClick={(): void => {
              setToggleWizardSection(!toggleWizardSection);
              if (showDetails) setShowDetails(!showDetails);
            }}
          />
        </Row>
        {bucketDeleteName && (
          <BucketDeleteModel
            open={open}
            closeHandler={closeHandler}
            saveHandler={deleteHandler}
            BucketDetail={bucketDeleteName}
          />
        )}
        <Row width="100%" padding={{ all: 'large' }}>
          <Input
            disabled={bucketList.length === 0 && searchBucket.length === 0}
            backgroundColor="gray5"
            label={t('buckets.filter_buckets_list', 'Filter Buckets List')}
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
              const nextSelection: SingleSelection =
                selected.length > 0 ? [selected[0] as string] : [];
              setBucketselection(nextSelection);
              const selectedIndex = Number(selected[0]);
              if (Number.isNaN(selectedIndex)) {
                return;
              }
              const volumeObject: objectType | undefined = bucketList.find(
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
