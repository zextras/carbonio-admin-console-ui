/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  Input,
  Link,
  ListRow,
  Modal,
  Padding,
  Row,
  Select,
  Switch,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type S3ConnectorVolume, type Volume } from '../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  INDEX,
  LOCAL_VALUE,
  PRIMARY,
  SECONDARY,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
} from '../../../constants';
import { fetchSoap } from '../../../services/s3-connector-service';
import { S3ConnectorTypeItems } from '../../utility/utils';
import styles from './modify-volume.module.css';
import { buildAdvancedUpdatePayload, isS3StoreType } from './modify-volume-payload';
import {
  handleAdvancedUpdateResponse,
  saveCeVolume,
  showVolumeSaveError,
  showVolumeSaveSuccess,
} from './modify-volume-save-handlers';
import { modifyVolumeSchema } from './schema';
import type { ModifyVolumeFormValues } from './types';
import { VerifyVolumeChangesModal } from './verify-volume-changes-modal';

type VolumeDetailSnapshot = {
  name: string;
  id: number;
  type: number;
  compressBlobs: boolean;
  isCurrent: boolean;
  rootpath: string;
  compressionThreshold: string;
};

type ConnectorOption = { label: string; value: string };

function buildConnectorSelectItems(
  connectors: Array<S3ConnectorVolume>,
): Array<ConnectorOption> {
  return connectors.map((items) => ({
    label: items?.label ?? '',
    value: items?.uuid ?? '',
  }));
}

function getVolumeConnectorConfigurationId(volume: Volume | undefined): string | undefined {
  return volume?.bucketConfigurationId ?? volume?.uuid;
}

export type ModifyVolumeFormProps = {
  readonly volumeDetail: VolumeDetailSnapshot;
  readonly externalVolDetail: Volume;
  readonly isExternal: boolean;
  readonly isAdvanced: boolean;
  readonly server: string | undefined;
  readonly selectedServerId: string;
  readonly s3Connectors: Array<S3ConnectorVolume>;
  readonly volumeType: number;
  readonly volumeId: string;
  readonly currentVolumeName?: string;
  readonly setmodifyVolumeToggle: (newValue: boolean) => void;
  readonly getAllVolumesRequest: () => void;
  readonly setOpen: (newValue: boolean) => void;
};

export function ModifyVolumeForm({
  volumeDetail,
  externalVolDetail,
  isExternal,
  isAdvanced,
  server,
  selectedServerId,
  s3Connectors,
  volumeType,
  volumeId,
  currentVolumeName,
  setmodifyVolumeToggle,
  getAllVolumesRequest,
  setOpen,
}: ModifyVolumeFormProps) {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const connectorTypeItems = S3ConnectorTypeItems(t);
  const isCurrentRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentToggle, setIsCurrentToggle] = useState(false);
  const [connectorName, setConnectorName] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [tieringSupported, setTieringSupported] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const labelMap: Record<number | string, string> = {
    1: PRIMARY,
    2: SECONDARY,
    10: INDEX,
  };

  const getConnectorTypeLabel = (storeTypeValue: string | undefined): string | undefined =>
    connectorTypeItems?.find((item) => item?.value?.toLowerCase() === storeTypeValue?.toLowerCase())
      ?.label;

  const currentConnectorId = getVolumeConnectorConfigurationId(externalVolDetail);

  const connectors: Array<S3ConnectorVolume> =
    isExternal && !isEmpty(s3Connectors)
      ? s3Connectors.map((items) => ({
          uuid: items.uuid,
          label: items.label || '',
          bucketName: items.bucketName || '',
          storeType: (items as unknown as { storeType?: string }).storeType || 'S3',
          tieringSupported:
            (items as unknown as { tieringSupported?: boolean }).tieringSupported ?? false,
          [USAGE_IN_EXTERNAL_BACKUP]:
            (items as unknown as { 'usage in external backup'?: string | Array<string> })[
              'usage in external backup'
            ] ?? UNUSED,
        }))
      : [];

  const selectedConnector = connectors.find((connector) => connector?.uuid === currentConnectorId);

  const unusedConnectors = connectors.filter(
    (items) => !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
  );
  const selectableConnectors =
    currentConnectorId && !unusedConnectors.some((item) => item.uuid === currentConnectorId)
      ? [...unusedConnectors, ...(selectedConnector ? [selectedConnector] : [])]
      : unusedConnectors;

  const backupUnusedConnectorList = buildConnectorSelectItems(selectableConnectors);
  const selectedConnectorOption = backupUnusedConnectorList.find(
    (item) => item.value === currentConnectorId,
  );
  const isVolumeAllDetail = selectableConnectors;

  const [prevConnectorUuid, setPrevConnectorUuid] = useState<string | undefined>();
  if (
    isExternal &&
    !isEmpty(s3Connectors) &&
    selectedConnector &&
    selectedConnector.uuid !== prevConnectorUuid
  ) {
    setPrevConnectorUuid(selectedConnector.uuid);
    setConnectorName(selectedConnector.bucketName ?? '');
    setStoreType(selectedConnector.storeType ?? '');
    setTieringSupported(selectedConnector.tieringSupported === true);
  }

  const typeValue = volumeType;
  const id = String(volumeDetail.id ?? volumeId);
  const showTieringSettings = isS3StoreType(storeType) && tieringSupported;
  const roleBadge = labelMap[volumeDetail.type]?.toUpperCase() ?? '';
  const volumeRoleLabel =
    volumeDetail.type === 1
      ? t('label.primary_volume_role', 'Primary Volume')
      : volumeDetail.type === 2
      ? t('label.secondary_volume_role', 'Secondary Volume')
      : volumeDetail.type === 10
      ? t('label.index_volume_role', 'Index Volume')
      : '';

  const isObjectStorage = !(
    storeType?.toUpperCase() === LOCAL_VALUE || (!storeType && !isExternal)
  );
  const isLocalBlockDevice = !isObjectStorage;
  const storageTypeLabel = isObjectStorage
    ? (getConnectorTypeLabel(storeType) ?? storeType ?? '')
    : t('volume.volume_allocation_list.local_block_device', 'Local Block Device');
  const showOptionsSection =
    Object.keys(externalVolDetail)?.length > 0 || volumeDetail?.type !== 10;

  const form = useForm({
    defaultValues: {
      name: volumeDetail.name ?? '',
      rootpath: volumeDetail.rootpath ?? '',
      compressBlobs: volumeDetail.compressBlobs ?? false,
      isCurrent: volumeDetail.isCurrent ?? false,
      compressionThreshold: String(volumeDetail.compressionThreshold ?? ''),
      volumePrefix: externalVolDetail?.volumePrefix ?? '',
      bucketConfigurationId: currentConnectorId ?? '',
      useInfrequentAccess: externalVolDetail?.useInfrequentAccess ?? false,
      useIntelligentTiering: externalVolDetail?.useIntelligentTiering ?? false,
      infrequentAccessThreshold: String(externalVolDetail?.infrequentAccessThreshold ?? ''),
    } as ModifyVolumeFormValues,
    validators: {
      onChange: modifyVolumeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      const finishSaveSuccess = (): void => {
        showVolumeSaveSuccess(createSnackbar, t);
        getAllVolumesRequest();
        setmodifyVolumeToggle(false);
        setIsLoading(false);
      };

      const finishSaveError = (): void => {
        showVolumeSaveError(createSnackbar, t);
        setmodifyVolumeToggle(false);
        setIsLoading(false);
      };

      try {
        if (isAdvanced) {
          const obj = buildAdvancedUpdatePayload(server ?? '', volumeDetail.name, labelMap, {
            name: value.name,
            typeValue,
            id,
            isCurrent: value.isCurrent,
            storeType,
            externalVolDetail,
            rootpath: value.rootpath,
            compressBlobs: value.compressBlobs,
            compressionThreshold: value.compressionThreshold,
            volumePrefix: value.volumePrefix,
            bucketConfigurationId: value.bucketConfigurationId,
            useInfrequentAccess: value.useInfrequentAccess,
            infrequentAccessThreshold: value.infrequentAccessThreshold,
            useIntelligentTiering: value.useIntelligentTiering,
          });
          const res = await fetchSoap('zextras', obj);
          handleAdvancedUpdateResponse(res, server ?? '', {
            onSuccess: () => {
              finishSaveSuccess();
              form.reset(value);
            },
            onError: finishSaveError,
          });
        } else {
          await saveCeVolume(
            {
              id,
              name: value.name,
              rootpath: value.rootpath,
              typeValue,
              compressBlobs: value.compressBlobs,
              compressionThreshold: value.compressionThreshold,
              isCurrent: value.isCurrent,
            },
            selectedServerId,
            createSnackbar,
            t,
            {
              onSuccess: () => {
                finishSaveSuccess();
                form.reset(value);
              },
              onModifyError: finishSaveError,
              onSetCurrentError: (): void => setIsLoading(false),
            },
          );
        }
      } catch {
        finishSaveError();
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const onUnusedConnectorListChange = (value: unknown): void => {
    if (typeof value !== 'string') return;

    const selectedConnectorDetail = isVolumeAllDetail?.find(
      (item: S3ConnectorVolume) => item?.uuid === value,
    );

    setConnectorName(selectedConnectorDetail?.bucketName ?? '');
    setStoreType(selectedConnectorDetail?.storeType ?? '');
    form.setFieldValue('bucketConfigurationId', selectedConnectorDetail?.uuid ?? '');

    const supportsTiering = selectedConnectorDetail?.tieringSupported === true;
    setTieringSupported(supportsTiering);
    if (!supportsTiering) {
      form.setFieldValue('useInfrequentAccess', false);
      form.setFieldValue('useIntelligentTiering', false);
      form.setFieldValue('infrequentAccessThreshold', '');
    }
  };

  const changedFields: Array<{ label: string; value: string }> = [];
  const initialVolumePrefix = externalVolDetail?.volumePrefix ?? '';
  const initialBucketConfigId = currentConnectorId ?? '';

  if (form.state.values.volumePrefix !== initialVolumePrefix) {
    changedFields.push({
      label: t('label.prefix_name', 'Prefix'),
      value: form.state.values.volumePrefix || t('label.not_set', 'Not set'),
    });
  }
  if (form.state.values.bucketConfigurationId !== initialBucketConfigId) {
    const selectedConnectorOption = backupUnusedConnectorList.find(
      (item) => item.value === form.state.values.bucketConfigurationId,
    );
    changedFields.push({
      label: t('storage.dataVolumes.availableS3ConnectorsList', 'Available S3 Connectors List'),
      value:
        selectedConnectorOption?.label ||
        form.state.values.bucketConfigurationId ||
        t('label.not_set', 'Not set'),
    });
  }

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
      <Container
        background="gray6"
        mainAlignment="flex-start"
        orientation="vertical"
        style={{ overflowY: 'auto' }}
      >
        <Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="4.15rem">
          <Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ds-text as="h2" weight="bold">
                {t('label.volume_details', 'Volume details')}
              </ds-text>
              {roleBadge && <div className={styles.roleBadge}>{roleBadge}</div>}
            </div>
          </Row>
          <Row
            padding={{ all: 'small' }}
            width="50%"
            mainAlignment="flex-end"
            crossAlignment="flex-end"
          >
            <Padding right="small">
              {isDirty && (
                <Button
                  label={t('label.cancel', 'Cancel')}
                  color="secondary"
                  onClick={(): void => form.reset()}
                />
              )}
            </Padding>
            {isDirty && (
              <Button
                label={t('label.save', 'Save')}
                color="primary"
                onClick={(): void => {
                  if (changedFields.length > 0) {
                    setShowVerifyModal(true);
                  } else {
                    void form.handleSubmit();
                  }
                }}
              />
            )}
          </Row>
          <Row padding={{ horizontal: 'small' }}>
            {!isDirty && (
              <Button
                type="outlined"
                color="error"
                label={t('label.delete', 'Delete')}
                icon="Trash2Outline"
                onClick={(): void => setOpen(true)}
                style={{ marginRight: '0.5rem' }}
              />
            )}
            <Button
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={(): void => setmodifyVolumeToggle(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>

        {/* GENERAL section - always shown */}
        <div className={styles.sectionHeader}>
          <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
            {t('label.general', 'GENERAL')}
          </ds-text>
          <ds-divider className={styles.sectionDivider}></ds-divider>
        </div>
        <Container
          padding={{ horizontal: 'large' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          height="auto"
        >
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large', left: 'small' }}
            >
              <div className={styles.detailItem}>
                <ds-text size="small" color="gray1">
                  {t('label.volume_id', 'Volume ID')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} size="small">
                    {id}
                  </ds-text>
                </div>
              </div>
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large' }}
            >
              <div className={styles.detailItem}>
                <ds-text size="small" color="gray1">
                  {t('label.server', 'Server')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} size="small">
                    {server ?? ''}
                  </ds-text>
                </div>
              </div>
            </Container>
          </ListRow>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large', left: 'small' }}
            >
              <div className={styles.detailItem}>
                <ds-text size="small" color="gray1">
                  {t('label.volume_role', 'Volume role')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} size="small">
                    {volumeRoleLabel}
                  </ds-text>
                </div>
              </div>
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large' }}
            >
              <div className={styles.detailItem}>
                <ds-text size="small" color="gray1">
                  {t('label.storage_type', 'Storage type')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} size="small">
                    {storageTypeLabel}
                  </ds-text>
                </div>
              </div>
            </Container>
          </ListRow>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large' }}
            >
              <form.Field name="name">
                {(field) => (
                  <Input
                    label={t('label.volume_name', 'Volume name')}
                    value={field.state.value}
                    backgroundColor="gray6"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </Container>
            {isLocalBlockDevice && (
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <form.Field name="rootpath">
                  {(field) => (
                    <Input
                      label={t('label.path', 'Path')}
                      value={field.state.value}
                      backgroundColor="gray6"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                        field.handleChange(e.target.value)
                      }
                    />
                  )}
                </form.Field>
              </Container>
            )}
          </ListRow>
        </Container>

        {/* BUCKET section - only for object storage */}
        {isObjectStorage && (
          <>
            <div className={styles.sectionHeader}>
              <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
                {t('label.bucket', 'BUCKET')}
              </ds-text>
              <ds-divider className={styles.sectionDivider}></ds-divider>
            </div>
            <Container
              padding={{ horizontal: 'large' }}
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              height="auto"
            >
              <ListRow>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ top: 'large', right: 'large', left: 'small' }}
                >
                  <div className={styles.detailItem}>
                    <ds-text size="small" color="gray1">
                      {t('label.bucket_name', 'Bucket name')}
                    </ds-text>
                    <div className={styles.detailValueRow}>
                      <ds-text className={styles.detailValue} size="small">
                        {connectorName}
                      </ds-text>
                    </div>
                  </div>
                </Container>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ top: 'large' }}
                >
                  <div className={styles.detailItem}>
                    <ds-text size="small" color="gray1">
                      {t('storage.dataVolume.s3ConnectorId', 'S3 Connector ID')}
                    </ds-text>
                    <div className={styles.detailValueRow}>
                      <ds-text className={styles.detailValue} size="small">
                        {form.state.values.bucketConfigurationId}
                      </ds-text>
                    </div>
                  </div>
                </Container>
              </ListRow>
              <Row
                mainAlignment="flex-start"
                padding={{ top: 'large', left: 'small' }}
                width="100%"
              >
                <form.Field name="volumePrefix">
                  {(field) => (
                    <Input
                      inputName="prefix"
                      label={t(
                        'label.prefix_name',
                        'Prefix - all objects will have this prefix in their name',
                      )}
                      value={field.state.value}
                      backgroundColor="gray5"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                        field.handleChange(e.target.value)
                      }
                    />
                  )}
                </form.Field>
                <Padding top="extrasmall">
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                    {t('the_change_will_not_move_the_data', 'The change will not move the data')}
                  </ds-text>
                </Padding>
              </Row>
              {backupUnusedConnectorList?.length !== 0 && (
                <Row
                  mainAlignment="flex-start"
                  padding={{ top: 'large', left: 'small' }}
                  width="100%"
                >
                  <Select
                    items={backupUnusedConnectorList}
                    background="gray5"
                    label={t(
                      'storage.dataVolumes.availableS3ConnectorsList',
                      'Available S3 Connectors List (that are not in use in the backup)',
                    )}
                    showCheckbox={false}
                    selection={selectedConnectorOption ?? backupUnusedConnectorList[0]}
                    onChange={onUnusedConnectorListChange}
                  />
                </Row>
              )}
            </Container>
          </>
        )}

        {/* CONFIGURATION section - only for object storage with tiering support */}
        {isObjectStorage && showTieringSettings && (
          <>
            <div className={styles.sectionHeader}>
              <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
                {t('label.configuration', 'CONFIGURATION')}
              </ds-text>
              <ds-divider className={styles.sectionDivider}></ds-divider>
            </div>
            <Container
              padding={{ horizontal: 'large', left: 'large' }}
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              height="auto"
            >
              <Row
                padding={{ top: 'large' }}
                mainAlignment="flex-start"
                width="100%"
                background="gray6"
              >
                <Row width="48.5%" mainAlignment="flex-start">
                  <Row mainAlignment="flex-start" width="100%">
                    <form.Field name="useInfrequentAccess">
                      {(field) => (
                        <Switch
                          value={field.state.value}
                          label={t('label.use_infraquent_access', 'Use infrequent access')}
                          onClick={(): void => {
                            const newValue = !field.state.value;
                            field.handleChange(newValue);
                            if (newValue) {
                              form.setFieldValue('useIntelligentTiering', false);
                            } else {
                              form.setFieldValue('infrequentAccessThreshold', '');
                            }
                          }}
                          iconColor="primary"
                        />
                      )}
                    </form.Field>
                  </Row>
                  <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
                    <Link
                      color="secondary"
                      href={AMAZON_USERGUIDE_STORAGE_CLASS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Trans
                        i18nKey="label.use_infraquent_access_helptext"
                        defaults="<underline>Amazon Storage Class Documentation</underline>"
                        components={{ underline: <u /> }}
                      />
                    </Link>
                  </Row>
                </Row>
                <Padding horizontal="small" />
                <Row width="48.5%" mainAlignment="flex-start">
                  <form.Field name="infrequentAccessThreshold">
                    {(field) => (
                      <Input
                        inputName="infrequentAccessThreshold"
                        label={t('label.bytes_size_threshold', 'Bytes Size Threshold')}
                        type="number"
                        backgroundColor="gray5"
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                          field.handleChange(e.target.value)
                        }
                        disabled={!form.state.values.useInfrequentAccess}
                      />
                    )}
                  </form.Field>
                </Row>
              </Row>
              <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
                <form.Field name="useIntelligentTiering">
                  {(field) => (
                    <Switch
                      value={field.state.value}
                      label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
                      onClick={(): void => {
                        const newValue = !field.state.value;
                        field.handleChange(newValue);
                        if (newValue) {
                          form.setFieldValue('useInfrequentAccess', false);
                        }
                      }}
                      iconColor="primary"
                    />
                  )}
                </form.Field>
              </Row>
              <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
                <Link
                  color="secondary"
                  href={AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Trans
                    i18nKey="label.use_intelligent_tiering_helptext"
                    defaults="<underline>Amazon Tiering Documentation</underline>"
                    components={{ underline: <u /> }}
                  />
                </Link>
              </Row>
            </Container>
          </>
        )}

        {/* OPTIONS section - conditional */}
        {showOptionsSection && (
          <>
            <div className={styles.sectionHeader}>
              <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
                {t('label.options', 'OPTIONS')}
              </ds-text>
              <ds-divider className={styles.sectionDivider}></ds-divider>
            </div>
            {isLocalBlockDevice ? (
              <Container
                padding={{ horizontal: 'large' }}
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                height="auto"
              >
                {volumeDetail?.type !== 10 && (
                  <>
                    <Row
                      mainAlignment="flex-start"
                      padding={{ top: 'large', left: 'small' }}
                      width="100%"
                    >
                      <Tooltip
                        placement="top"
                        label={t(
                          'warning.is_current',
                          'Firstly, you have to set another volume as the current one.',
                        )}
                        maxWidth="auto"
                        disabled={form.state.values.isCurrent}
                      >
                        <form.Field name="isCurrent">
                          {(field) => (
                            <Switch
                              ref={isCurrentRef}
                              value={field.state.value}
                              label={t('label.set_as_current', 'Set as Current')}
                              onClick={(): void => {
                                if (!field.state.value) {
                                  setIsCurrentToggle(true);
                                }
                              }}
                              iconColor="primary"
                            />
                          )}
                        </form.Field>
                      </Tooltip>
                    </Row>
                    <Row
                      padding={{ top: 'large', left: 'small' }}
                      width="100%"
                      mainAlignment="flex-start"
                      background="gray6"
                    >
                      <Row mainAlignment="flex-start" width={isAdvanced ? '50%' : '100%'}>
                        <form.Field name="compressBlobs">
                          {(field) => (
                            <Switch
                              value={field.state.value}
                              label={t('label.enable_compression', 'Enable Compression')}
                              onClick={(): void => field.handleChange(!field.state.value)}
                              iconColor="primary"
                            />
                          )}
                        </form.Field>
                        <Padding top="extrasmall" left="2rem">
                          <ds-text
                            as="p"
                            color="secondary"
                            overflow="break-word"
                            size="extrasmall"
                          >
                            {t(
                              'this_will_not_affect_data_already_stored',
                              'This will not affect data already stored',
                            )}
                          </ds-text>
                        </Padding>
                      </Row>
                      <Row mainAlignment="flex-start" width="48%">
                        <Row padding={{ top: 'small' }} width="100%">
                          <form.Field name="compressionThreshold">
                            {(field) => (
                              <Input
                                label={t(
                                  'label.compression_threshold',
                                  'Compression Threshold',
                                )}
                                value={field.state.value}
                                backgroundColor="gray6"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                  if (/^\d*$/.test(e.target.value)) {
                                    field.handleChange(e.target.value);
                                  }
                                }}
                                color="secondary"
                                disabled={!form.state.values.compressBlobs}
                              />
                            )}
                          </form.Field>
                        </Row>
                        <Padding top="extrasmall">
                          <ds-text
                            as="p"
                            color="secondary"
                            overflow="break-word"
                            size="extrasmall"
                          >
                            {t(
                              'this_will_not_affect_data_already_stored',
                              'This will not affect data already stored',
                            )}
                          </ds-text>
                        </Padding>
                      </Row>
                    </Row>
                  </>
                )}
              </Container>
            ) : (
              <Container padding={{ horizontal: 'large', bottom: 'large' }} height="auto">
                <Row
                  padding={{ top: 'large', left: 'small' }}
                  mainAlignment="flex-start"
                  width="100%"
                >
                  <Tooltip
                    placement="top"
                    label={t(
                      'warning.is_current',
                      'Firstly, you have to set another volume as the current one.',
                    )}
                    maxWidth="auto"
                    disabled={form.state.values.isCurrent}
                  >
                    <form.Field name="isCurrent">
                      {(field) => (
                        <Switch
                          ref={isCurrentRef}
                          value={field.state.value}
                          label={t('label.set_as_current', 'Set as Current')}
                          onClick={(): void => {
                            if (!field.state.value) {
                              setIsCurrentToggle(true);
                            }
                          }}
                          iconColor="primary"
                        />
                      )}
                    </form.Field>
                  </Tooltip>
                </Row>
                <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
                  <ds-text as="p" color="secondary">
                    {t(
                      'label.enable_current_helptext',
                      'Enabling this option will disable the current active volume.',
                    )}
                  </ds-text>
                </Row>
              </Container>
            )}
          </>
        )}

        <Modal
          open={isCurrentToggle && !form.state.values.isCurrent}
          title={t(
            'modal.iscurrent_confirm.title',
            'You are setting {{name}} as the current volume',
            { name: form.state.values.name },
          )}
          onClose={(): void => setIsCurrentToggle(false)}
          onConfirm={(): void => {
            form.setFieldValue('isCurrent', true);
            setIsCurrentToggle(false);
          }}
          confirmLabel={t('modal.iscurrent_confirm.confirm_label', 'YES, PROCEED')}
          onSecondaryAction={(): void => setIsCurrentToggle(false)}
          secondaryActionLabel={t('modal.iscurrent_confirm.secondary_label', 'NO, GO BACK')}
          showCloseIcon
        >
          <Padding vertical="small">
            <ds-text as="p">
              <Trans
                i18nKey="modal.iscurrent_confirm.body_message"
                defaults="The {{currentVolumeName}} is the current volume.<br />Are you sure you want to <strong>set {{name}} as current one</strong>?"
                components={{ break: <br />, bold: <strong /> }}
                values={{
                  name: form.state.values.name,
                  currentVolumeName: currentVolumeName ?? '',
                }}
              />
            </ds-text>
          </Padding>
        </Modal>
      </Container>
      <VerifyVolumeChangesModal
        open={showVerifyModal}
        changedFields={changedFields}
        closeHandler={(): void => setShowVerifyModal(false)}
        applyHandler={async (): Promise<void> => {
          setShowVerifyModal(false);
          await form.handleSubmit();
        }}
      />
    </>
  );
}
