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
  Displayer,
  Input,
  LabeledValue,
  Link,
  ListRow,
  Modal,
  Padding,
  Radio,
  Row,
  Select,
  Switch,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  type S3ConnectorVolume,
  type Volume,
  type VolumeAllocationItem,
  type VolumeType,
} from '../../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  INDEX,
  PRIMARY,
  PRIMARY_TYPE_VALUE,
  SECONDARY,
  SECONDARY_TYPE_VALUE,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
} from '../../../../../constants';
import { fetchSoap } from '../../../../../services/s3-connector-service';
import { S3ConnectorTypeItems, volumeAllocationList } from '../../../../utility/utils';
import {
  buildAdvancedUpdatePayload,
  isS3StoreType,
} from './modify-volume-payload';
import {
  handleAdvancedUpdateResponse,
  saveCeVolume,
  showVolumeSaveError,
  showVolumeSaveSuccess,
} from './modify-volume-save-handlers';
import { modifyVolumeSchema } from './schema';
import type { ModifyVolumeFormValues } from './types';

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
  getConnectorTypeLabel: (storeTypeValue: string | undefined) => string | undefined,
): Array<ConnectorOption> {
  return connectors.map((items) => {
    const volumeObject = getConnectorTypeLabel(items?.storeType);
    return {
      label: `${volumeObject} | ${items?.label}`,
      value: items?.uuid ?? '',
    };
  });
}

function getVolumeConnectorConfigurationId(volume: Volume | undefined): string | undefined {
  return volume?.bucketConfigurationId ?? volume?.uuid;
}

export type ModifyVolumeFormProps = {
  volumeDetail: VolumeDetailSnapshot;
  externalVolDetail: Volume;
  isExternal: boolean;
  isAdvanced: boolean;
  server: string | undefined;
  selectedServerId: string;
  s3Connectors: Array<S3ConnectorVolume>;
  volumeType: number;
  volumeId: string;
  setmodifyVolumeToggle: (newValue: boolean) => void;
  getAllVolumesRequest: () => void;
  setOpen: (newValue: boolean) => void;
  isSticky: boolean;
  setIsSticky: (value: boolean) => void;
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
  setmodifyVolumeToggle,
  getAllVolumesRequest,
  setOpen,
  isSticky,
  setIsSticky,
}: ModifyVolumeFormProps) {
  const { t } = useTranslation();
  const createSnackbar = useSnackbar();
  const volAllocationList = volumeAllocationList(t);
  const connectorTypeItems = S3ConnectorTypeItems(t);
  const isCurrentRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentToggle, setIsCurrentToggle] = useState(false);
  const [connectorName, setConnectorName] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [tieringSupported, setTieringSupported] = useState(false);

  const labelMap: Record<number | string, string> = {
    1: PRIMARY,
    2: SECONDARY,
    10: INDEX,
  };

  const getConnectorTypeLabel = (
    storeTypeValue: string | undefined,
  ): string | undefined =>
    connectorTypeItems?.find(
      (item) => item?.value?.toLowerCase() === storeTypeValue?.toLowerCase(),
    )?.label;

  const currentConnectorId = getVolumeConnectorConfigurationId(externalVolDetail);

  const connectors: Array<S3ConnectorVolume> = isExternal && !isEmpty(s3Connectors)
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

  const backupUnusedConnectorList = buildConnectorSelectItems(selectableConnectors, getConnectorTypeLabel);
  const selectedConnectorOption = backupUnusedConnectorList.find((item) => item.value === currentConnectorId);
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
              form.reset(value, { keepDefaultValues: true });
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
                form.reset(value, { keepDefaultValues: true });
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

  const buttons = [
    {
      align: 'right' as const,
      color: 'error',
      label: t('label.delete', 'delete'),
      loading: !volumeDetail?.id,
      onClick: (): void => setOpen(true),
    },
    {
      align: 'left' as const,
      icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
      onClick: (): void => setIsSticky(!isSticky),
    },
  ];

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
            <ds-text as="h2" weight="bold">
              {t('label.volume_detail_page_title', '{{message}} Details', {
                message: volumeDetail?.name,
              })}
            </ds-text>
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
                onClick={(): void => { void form.handleSubmit(); }}
              />
            )}
          </Row>
          <Row padding={{ horizontal: 'small' }}>
            <Button
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={(): void => setmodifyVolumeToggle(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>
        <Displayer buttons={buttons} pinIcon={isSticky} />
        {!isExternal ? (
          <Container
            padding={{ horizontal: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <Row padding={{ top: 'small' }} width="100%">
              <form.Field name="name">
                {(field) => (
                  <Input
                    label={t('label.volume_name', 'Volume Name')}
                    value={field.state.value}
                    backgroundColor="gray5"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </Row>
            {volumeDetail?.type !== 10 && (
              <Row
                padding={{ top: 'large' }}
                width="100%"
                mainAlignment="center"
                crossAlignment="center"
                background="gray6"
              >
                <Row width={isAdvanced ? '48%' : '100%'}>
                  <Radio
                    label={t('label.primary_volume', 'This is a Primary Volume')}
                    value={PRIMARY_TYPE_VALUE}
                    checked={typeValue === 1}
                    onClick={(): void => {}}
                    iconColor="primary"
                    disabled
                  />
                </Row>
                {isAdvanced && (
                  <Row width="48%">
                    <Radio
                      label={t('label.secondary_volume', 'This is a Secondary Volume')}
                      value={SECONDARY_TYPE_VALUE}
                      checked={typeValue === 2}
                      onClick={(): void => {}}
                      iconColor="primary"
                      disabled
                    />
                  </Row>
                )}
              </Row>
            )}
            <Row padding={{ top: 'large' }} width="100%">
              <Input
                label={t('label.volume_id', 'Volume ID')}
                value={id}
                backgroundColor="gray6"
                disabled
                onChange={(): void => {}}
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <form.Field name="rootpath">
                {(field) => (
                  <Input
                    label={t('label.path', 'Path')}
                    value={field.state.value}
                    backgroundColor="gray5"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </Row>
            <Padding top="extrasmall">
              <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                {t('the_change_will_not_move_the_data', 'The change will not move the data')}
              </ds-text>
            </Padding>
            <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
              {volumeDetail?.type !== 10 && (
                <>
                  <Row width="48%" mainAlignment="flex-start">
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
                    <Padding top="extrasmall">
                      <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                        {t(
                          'this_will_not_affect_data_already_stored',
                          'This will not affect data already stored',
                        )}
                      </ds-text>
                    </Padding>
                  </Row>
                  <Padding horizontal="small" />
                </>
              )}
              <Row width="48%" mainAlignment="flex-start">
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
            </Row>
            {volumeDetail?.type !== 10 && !isExternal && (
              <>
                <Row padding={{ top: 'small' }} width="50%">
                  <form.Field name="compressionThreshold">
                    {(field) => (
                      <Input
                        label={t('label.compression_threshold', 'Compression Threshold')}
                        value={field.state.value}
                        backgroundColor="gray6"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                          if (/^\d*$/.test(e.target.value)) {
                            field.handleChange(e.target.value);
                          }
                        }}
                        color="secondary"
                      />
                    )}
                  </form.Field>
                </Row>
                <Padding top="extrasmall">
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                    {t(
                      'this_will_not_affect_data_already_stored',
                      'This will not affect data already stored',
                    )}
                  </ds-text>
                </Padding>
              </>
            )}
          </Container>
        ) : (
          <Container
            padding={{ horizontal: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <Row padding={{ top: 'small' }} width="100%">
              <LabeledValue
                label={t('label.volume_server_name', 'Server')}
                value={server ?? ''}
                backgroundColor="gray5"
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <Select
                items={volAllocationList}
                background="gray5"
                label={t('label.storage_type', 'Storage Type')}
                showCheckbox={false}
                defaultSelection={
                  volAllocationList?.find(
                    (item: VolumeType) => item?.value === volumeDetail?.type,
                  ) as VolumeAllocationItem | undefined
                }
                disabled
                onChange={(): void => {}}
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <form.Field name="name">
                {(field) => (
                  <Input
                    label={t('label.volume_name', 'Volume Name')}
                    value={field.state.value}
                    backgroundColor="gray6"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </Row>
            {backupUnusedConnectorList?.length !== 0 && (
              <>
                <Row padding={{ top: 'large' }} width="100%">
                  <Select
                    items={backupUnusedConnectorList}
                    background="gray5"
                    label={t(
                      'label.volume_available_unused_Buckets_list_in_backup',
                      'Available Buckets List (that are not in use in the backup)',
                    )}
                    showCheckbox={false}
                    selection={selectedConnectorOption ?? backupUnusedConnectorList[0]}
                    onChange={onUnusedConnectorListChange}
                  />
                </Row>
                <Padding top="extrasmall">
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                    {t('the_change_will_not_move_the_data', 'The change will not move the data')}
                  </ds-text>
                </Padding>
              </>
            )}
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <LabeledValue
                  label={t('label.bucket_name', 'Bucket Name')}
                  backgroundColor="gray6"
                  value={connectorName}
                />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <LabeledValue
                  label={t('label.type', 'Type')}
                  backgroundColor="gray6"
                  value={storeType}
                />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <LabeledValue
                  label={t('label.ID', 'ID')}
                  backgroundColor="gray6"
                  value={form.state.values.bucketConfigurationId}
                />
              </Container>
            </ListRow>
            {volumeDetail?.type !== 10 && (
              <Row
                padding={{ top: 'large' }}
                width="100%"
                mainAlignment="center"
                crossAlignment="center"
                background="gray6"
              >
                <Row width={isAdvanced ? '48%' : '100%'}>
                  <Radio
                    label={t('label.primary_volume', 'This is a Primary Volume')}
                    value={PRIMARY_TYPE_VALUE}
                    checked={typeValue === 1}
                    onClick={(): void => {}}
                    iconColor="primary"
                    disabled
                  />
                </Row>
                {isAdvanced && (
                  <Row width="48%">
                    <Radio
                      label={t('label.secondary_volume', 'This is a Secondary Volume')}
                      value={SECONDARY_TYPE_VALUE}
                      checked={typeValue === 2}
                      onClick={(): void => {}}
                      iconColor="primary"
                      disabled
                    />
                  </Row>
                )}
              </Row>
            )}
            <Row padding={{ top: 'large' }} width="100%">
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
            </Row>
            <Padding top="extrasmall">
              <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                {t('the_change_will_not_move_the_data', 'The change will not move the data')}
              </ds-text>
            </Padding>
            {showTieringSettings && (
              <>
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
              </>
            )}
            <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
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
                values={{ name: form.state.values.name }}
              />
            </ds-text>
          </Padding>
        </Modal>
      </Container>
    </>
  );
}
