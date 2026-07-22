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
  ListRow,
  Modal,
  Padding,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import React, { useCallback, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type S3ConnectorVolume, type Volume } from '../../../../types';
import {
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
import {
  ModifyVolumeBucketSection,
  ModifyVolumeOptionsSection,
  ModifyVolumeTieringSection,
} from './modify-volume-form-sections';
import { buildAdvancedUpdatePayload, isS3StoreType } from './modify-volume-payload';
import {
  handleAdvancedUpdateResponse,
  saveCeVolume,
  showVolumeSaveError,
  showVolumeSaveSuccess,
} from './modify-volume-save-handlers';
import { modifyVolumeSchema } from './schema';
import type { ModifyVolumeFormApi, ModifyVolumeFormValues } from './types';
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

function mapS3Connectors(s3Connectors: Array<S3ConnectorVolume>): Array<S3ConnectorVolume> {
  return s3Connectors.map((items) => ({
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
  }));
}

function getSelectableConnectors(
  connectors: Array<S3ConnectorVolume>,
  currentConnectorId: string | undefined,
  selectedConnector: S3ConnectorVolume | undefined,
): Array<S3ConnectorVolume> {
  const unusedConnectors = connectors.filter(
    (items) => !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
  );

  if (
    currentConnectorId &&
    !unusedConnectors.some((item) => item.uuid === currentConnectorId) &&
    selectedConnector
  ) {
    return [...unusedConnectors, selectedConnector];
  }

  return unusedConnectors;
}

function buildChangedFields(
  t: (key: string, fallback: string) => string,
  values: ModifyVolumeFormValues,
  initialVolumePrefix: string,
  initialBucketConfigId: string,
  backupUnusedConnectorList: Array<ConnectorOption>,
): Array<{ label: string; value: string }> {
  const changedFields: Array<{ label: string; value: string }> = [];

  if (values.volumePrefix !== initialVolumePrefix) {
    changedFields.push({
      label: t('label.prefix_name', 'Prefix'),
      value: values.volumePrefix || t('label.not_set', 'Not set'),
    });
  }

  if (values.bucketConfigurationId !== initialBucketConfigId) {
    const selectedOption = backupUnusedConnectorList.find(
      (item) => item.value === values.bucketConfigurationId,
    );
    changedFields.push({
      label: t('storage.dataVolumes.availableS3ConnectorsList', 'Available S3 Connectors List'),
      value:
        selectedOption?.label || values.bucketConfigurationId || t('label.not_set', 'Not set'),
    });
  }

  return changedFields;
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
}: Readonly<ModifyVolumeFormProps>) {
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

  const openDocumentation = useCallback((url: string): void => {
    if (globalThis.window === undefined) {
      return;
    }
    globalThis.window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const currentConnectorId = getVolumeConnectorConfigurationId(externalVolDetail);

  const connectors: Array<S3ConnectorVolume> =
    isExternal && !isEmpty(s3Connectors) ? mapS3Connectors(s3Connectors) : [];

  const selectedConnector = connectors.find((connector) => connector?.uuid === currentConnectorId);
  const selectableConnectors = getSelectableConnectors(
    connectors,
    currentConnectorId,
    selectedConnector,
  );

  const backupUnusedConnectorList = buildConnectorSelectItems(selectableConnectors);
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
  const volumeRoleLabelByType: Record<number, string> = {
    1: t('label.primary_volume_role', 'Primary Volume'),
    2: t('label.secondary_volume_role', 'Secondary Volume'),
    10: t('label.index_volume_role', 'Index Volume'),
  };
  const volumeRoleLabel = volumeRoleLabelByType[Number(volumeDetail.type)] ?? '';

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
  const selectedBucketConfigurationId = useSelector(
    form.store,
    (state) => state.values.bucketConfigurationId,
  );
  const selectedConnectorOption = backupUnusedConnectorList.find(
    (item) => item.value === selectedBucketConfigurationId,
  );

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

  const changedFields = buildChangedFields(
    t,
    form.state.values,
    externalVolDetail?.volumePrefix ?? '',
    currentConnectorId ?? '',
    backupUnusedConnectorList,
  );

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
      <Container
        background="gray6"
        mainAlignment="flex-start"
        orientation="vertical"
      >
        <Row mainAlignment="space-between" crossAlignment="center" width="100%" height="4.15rem">
          <Row
            mainAlignment="flex-start"
            crossAlignment="center"
            padding={{ all: 'large' }}
            takeAvailableSpace
          >
            <ds-text as="h2" weight="bold">
              {t('label.volume_details', 'Volume details')}
            </ds-text>
            {roleBadge && (
              <Padding left="small">
                <div className={styles.roleBadge}>{roleBadge}</div>
              </Padding>
            )}
          </Row>
          <Row
            padding={{ all: 'small' }}
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
              color="text"
              icon="CloseOutline"
              onClick={(): void => setmodifyVolumeToggle(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>
        <Container
          background="gray6"
          mainAlignment="flex-start"
          orientation="vertical"
          style={{ overflowY: 'auto' }}
        >

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
                  <ds-text className={styles.detailValue} weight='bold' size="small">
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
                  <ds-text className={styles.detailValue} weight='bold' size="small">
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
                  <ds-text className={styles.detailValue} weight='bold' size="small">
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
                  <ds-text className={styles.detailValue} weight='bold' size="small">
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
                <Padding top="extrasmall">
                  <ds-text as="span" color="secondary" overflow="break-word" size="extrasmall">
                    {t(
                      'storage.dataVolumes.volumePathMustExistHint',
                      'The volume must already exist',
                    )}
                  </ds-text>
                </Padding>
              </Container>
            )}
          </ListRow>
        </Container>

        {/* BUCKET section - only for object storage */}
        {isObjectStorage && (
          <ModifyVolumeBucketSection
            form={form as ModifyVolumeFormApi}
            connectorName={connectorName}
            backupUnusedConnectorList={backupUnusedConnectorList}
            selectedConnectorOption={selectedConnectorOption}
            onUnusedConnectorListChange={onUnusedConnectorListChange}
          />
        )}

        {/* CONFIGURATION section - only for object storage with tiering support */}
        {isObjectStorage && showTieringSettings && (
          <ModifyVolumeTieringSection
            form={form as ModifyVolumeFormApi}
            openDocumentation={openDocumentation}
          />
        )}

        {/* OPTIONS section - conditional */}
        {showOptionsSection && (
          <ModifyVolumeOptionsSection
            form={form as ModifyVolumeFormApi}
            isLocalBlockDevice={isLocalBlockDevice}
            volumeType={volumeDetail.type}
            isAdvanced={isAdvanced}
            isCurrentRef={isCurrentRef}
            setIsCurrentToggle={setIsCurrentToggle}
          />
        )}
        </Container>

        <Modal
          open={isCurrentToggle && !form.state.values.isCurrent}
          title={t(
            'modal.iscurrent_confirm.title',
            'You are setting {{name}} as the current volume',
            { name: form.state.values.name },
          )}
          onClose={(): void => setIsCurrentToggle(false)}
          customFooter={
            <Container orientation="horizontal" mainAlignment="flex-end">
              <Row style={{ gap: '0.5rem' }}>
                <Button
                  label={t('modal.iscurrent_confirm.secondary_label', 'NO, GO BACK')}
                  color="primary"
                  type="outlined"
                  onClick={(): void => setIsCurrentToggle(false)}
                />
                <Button
                  label={t('modal.iscurrent_confirm.confirm_label', 'YES, PROCEED')}
                  color="primary"
                  onClick={(): void => {
                    form.setFieldValue('isCurrent', true);
                    setIsCurrentToggle(false);
                  }}
                />
              </Row>
            </Container>
          }
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
      {showVerifyModal && (
        <VerifyVolumeChangesModal
          open={showVerifyModal}
          changedFields={changedFields}
          closeHandler={(): void => setShowVerifyModal(false)}
          applyHandler={async (): Promise<void> => {
            setShowVerifyModal(false);
            await form.handleSubmit();
          }}
        />
      )}
    </>
  );
}
