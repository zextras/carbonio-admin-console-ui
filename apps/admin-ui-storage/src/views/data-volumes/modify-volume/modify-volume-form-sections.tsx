/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  Input,
  ListRow,
  Padding,
  Row,
  Select,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import React, { type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
} from '../../../constants';
import styles from './modify-volume.module.css';
import type { ModifyVolumeFormApi } from './types';

type ConnectorOption = { label: string; value: string };

type BucketSectionProps = {
  form: ModifyVolumeFormApi;
  connectorName: string;
  backupUnusedConnectorList: Array<ConnectorOption>;
  selectedConnectorOption: ConnectorOption | undefined;
  onUnusedConnectorListChange: (value: unknown) => void;
};

export function ModifyVolumeBucketSection({
  form,
  connectorName,
  backupUnusedConnectorList,
  selectedConnectorOption,
  onUnusedConnectorListChange,
}: Readonly<BucketSectionProps>) {
  const { t } = useTranslation();

  return (
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
                <ds-text className={styles.detailValue} weight="bold" size="small">
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
                <ds-text className={styles.detailValue} weight="bold" size="small">
                  {form.state.values.bucketConfigurationId}
                </ds-text>
              </div>
            </div>
          </Container>
        </ListRow>
        <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
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
        {backupUnusedConnectorList.length !== 0 && (
          <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
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
  );
}

type TieringSectionProps = {
  form: ModifyVolumeFormApi;
  openDocumentation: (url: string) => void;
};

export function ModifyVolumeTieringSection({
  form,
  openDocumentation,
}: Readonly<TieringSectionProps>) {
  const { t } = useTranslation();

  return (
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
        <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
          <Row width="100%" mainAlignment="flex-start" crossAlignment="center">
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
            <Tooltip
              placement="top"
              label={t(
                'storage.dataVolumes.amazonStorageDocumentation',
                'Amazon Storage Class Documentation',
              )}
            >
              <button
                type="button"
                className={styles.tieringDocIconButton}
                aria-label={t(
                  'label.use_infraquent_access_helptext',
                  'Open Amazon Storage Class Documentation',
                )}
                onClick={(): void => openDocumentation(AMAZON_USERGUIDE_STORAGE_CLASS_LINK)}
              >
                <ds-icon icon="ExternalLinkOutline" size="medium" color="primary" />
              </button>
            </Tooltip>
          </Row>
        </Row>
        <Row padding={{ top: 'small', left: 'small' }} width="100%" mainAlignment="flex-start">
          <Row width="52%" mainAlignment="flex-start" padding={{ left: 'extralarge' }}>
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
          <Row width="100%" mainAlignment="flex-start" crossAlignment="center">
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
            <Tooltip
              placement="top"
              label={t(
                'storage.dataVolumes.amazonTieringDocumentation',
                'Amazon Tiering Documentation',
              )}
            >
              <button
                type="button"
                className={styles.tieringDocIconButton}
                aria-label={t(
                  'label.use_intelligent_tiering_helptext',
                  'Open Amazon Tiering Documentation',
                )}
                onClick={(): void => openDocumentation(AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK)}
              >
                <ds-icon icon="ExternalLinkOutline" size="medium" color="primary" />
              </button>
            </Tooltip>
          </Row>
        </Row>
      </Container>
    </>
  );
}

type OptionsSectionProps = {
  form: ModifyVolumeFormApi;
  isLocalBlockDevice: boolean;
  volumeType: number;
  isAdvanced: boolean;
  isCurrentRef: RefObject<HTMLDivElement | null>;
  setIsCurrentToggle: (value: boolean) => void;
};

export function ModifyVolumeOptionsSection({
  form,
  isLocalBlockDevice,
  volumeType,
  isAdvanced,
  isCurrentRef,
  setIsCurrentToggle,
}: Readonly<OptionsSectionProps>) {
  const { t } = useTranslation();

  if (!isLocalBlockDevice) {
    return (
      <>
        <div className={styles.sectionHeader}>
          <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
            {t('label.options', 'OPTIONS')}
          </ds-text>
          <ds-divider className={styles.sectionDivider}></ds-divider>
        </div>
        <Container padding={{ horizontal: 'large', bottom: 'large' }} height="auto">
          <Row padding={{ top: 'large', left: 'small' }} mainAlignment="flex-start" width="100%">
            <form.Field name="isCurrent">
              {(field) => (
                <Tooltip
                  placement="top"
                  label={t(
                    'warning.is_current',
                    'Firstly, you have to set another volume as the current one.',
                  )}
                  maxWidth="auto"
                  disabled={!field.state.value}
                >
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
                    disabled={field.state.value}
                  />
                </Tooltip>
              )}
            </form.Field>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
          {t('label.options', 'OPTIONS')}
        </ds-text>
        <ds-divider className={styles.sectionDivider}></ds-divider>
      </div>
      <Container
        padding={{ horizontal: 'large' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="auto"
      >
        {volumeType !== 10 && (
          <>
            <Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
              <form.Field name="isCurrent">
                {(field) => (
                  <Tooltip
                    placement="top"
                    label={t(
                      'warning.is_current',
                      'Firstly, you have to set another volume as the current one.',
                    )}
                    maxWidth="auto"
                    disabled={!field.state.value}
                  >
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
                      disabled={field.state.value}
                    />
                  </Tooltip>
                )}
              </form.Field>
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
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
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
                        label={t('label.compression_threshold', 'Compression Threshold')}
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
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
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
    </>
  );
}
