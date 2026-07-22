/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  Input,
  ListRow,
  Padding,
  Radio,
  Row,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import { type ChangeEvent, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AdvancedMailstoresConfigProps } from '../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  COMPRESSION_THRESHOLD_UNIT,
  INDEX_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  S3,
  SECONDARY_TYPE_VALUE,
} from '../../../../constants';
import { useAdvancedVolumeContext } from './create-advanced-volume-context';
import styles from './create-volume.module.css';

function CompressionThresholdIcon() {
  return (
    <ds-text as="span" color="secondary">
      {COMPRESSION_THRESHOLD_UNIT}
    </ds-text>
  );
}

export function AdvancedMailstoresConfig({
  onSelection,
  externalData,
}: AdvancedMailstoresConfigProps) {
  const { form } = useAdvancedVolumeContext();
  const { t } = useTranslation();

  const openDocumentation = useCallback((url: string): void => {
    if (globalThis.window === undefined) {
      return;
    }
    globalThis.window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const volumeName = useSelector(form.store, (s) => s.values.volumeName);
  const volumeAllocation = useSelector(form.store, (s) => s.values.volumeAllocation);
  const bucketName = useSelector(form.store, (s) => s.values.bucketName);
  const unusedBucketType = useSelector(form.store, (s) => s.values.unusedBucketType);
  const bucketId = useSelector(form.store, (s) => s.values.bucketId);
  const tieringSupported = useSelector(form.store, (s) => s.values.tieringSupported);
  const prefix = useSelector(form.store, (s) => s.values.prefix);
  const volumeMain = useSelector(form.store, (s) => s.values.volumeMain);
  const useInfrequentAccess = useSelector(form.store, (s) => s.values.useInfrequentAccess);
  const useIntelligentTiering = useSelector(form.store, (s) => s.values.useIntelligentTiering);
  const infrequentAccessThreshold = useSelector(
    form.store,
    (s) => s.values.infrequentAccessThreshold,
  );
  const isCurrent = useSelector(form.store, (s) => s.values.isCurrent);
  const centralized = useSelector(form.store, (s) => s.values.centralized);
  const path = useSelector(form.store, (s) => s.values.path);
  const isCompression = useSelector(form.store, (s) => s.values.isCompression);
  const compressionThreshold = useSelector(form.store, (s) => s.values.compressionThreshold);

  const isLocalBlockDevice = volumeAllocation === 'Local Block Device';
  const showTieringSettings = unusedBucketType === S3 && tieringSupported === true;

  const changeVolDetail = (e: ChangeEvent<HTMLInputElement>): void => {
    form.setFieldValue(
      e.target.name as 'prefix' | 'infrequentAccessThreshold' | 'path' | 'compressionThreshold',
      e.target.value,
    );
  };

  useEffect(() => {
    if (showTieringSettings) {
      return;
    }
    form.setFieldValue('useInfrequentAccess', false);
    form.setFieldValue('useIntelligentTiering', false);
    onSelection({ useInfrequentAccess: false }, true);
    onSelection({ useIntelligentTiering: false }, true);
  }, [onSelection, form, showTieringSettings]);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large' }}
      >
        <div className={styles.detailItem}>
          <ds-text size="small" color="gray1">
            {t('label.volume_server_name', 'Server')}
          </ds-text>
          <div className={styles.detailValueRow}>
            <ds-text className={styles.detailValue} weight="bold" size="small">
              {externalData}
            </ds-text>
          </div>
        </div>
      </Container>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'large' }}>
        <div className={styles.detailItem}>
          <ds-text size="small" color="gray1">
            {t('label.storage_type', 'Storage Type')}
          </ds-text>
          <div className={styles.detailValueRow}>
            <ds-text className={styles.detailValue} weight="bold" size="small">
              {volumeAllocation}
            </ds-text>
          </div>
        </div>
      </Container>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <div className={styles.detailItem}>
          <ds-text size="small" color="gray1">
            {t('label.volume_name', 'Volume Name')}
          </ds-text>
          <div className={styles.detailValueRow}>
            <ds-text className={styles.detailValue} weight="bold" size="small">
              {volumeName}
            </ds-text>
          </div>
        </div>
      </Row>
      {!isLocalBlockDevice && (
        <>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large' }}
            >
              <div className={styles.detailItem}>
                <ds-text size="small" color="gray1">
                  {t('label.bucket_name', 'Bucket Name')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} weight="bold" size="small">
                    {bucketName}
                  </ds-text>
                </div>
              </div>
            </Container>
          </ListRow>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <div className={styles.detailItem}>
              <ds-text size="small" color="gray1">
                {t('label.ID', 'ID')}
              </ds-text>
              <div className={styles.detailValueRow}>
                <ds-text className={styles.detailValue} weight="bold" size="small">
                  {bucketId}
                </ds-text>
              </div>
            </div>
          </Row>
        </>
      )}
      <ds-divider className={styles.sectionDivider}></ds-divider>
      <div className={styles.sectionHeader}>
        <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
          {t('label.volume_type', 'Volume Type')}
        </ds-text>
      </div>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Radio
          label={t('storage.dataVolume.primaryVolume', 'Primary Volume')}
          value={PRIMARY_TYPE_VALUE.toString()}
          checked={volumeMain === PRIMARY_TYPE_VALUE}
          onClick={(): void => {
            form.setFieldValue(
              'volumeMain',
              volumeMain === PRIMARY_TYPE_VALUE ? 0 : PRIMARY_TYPE_VALUE,
            );
            onSelection(
              { volumeMain: volumeMain === PRIMARY_TYPE_VALUE ? 0 : PRIMARY_TYPE_VALUE },
              true,
            );
          }}
          iconColor="primary"
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Radio
          label={t('storage.dataVolume.secondaryVolume', 'Secondary Volume')}
          value={SECONDARY_TYPE_VALUE}
          checked={volumeMain === SECONDARY_TYPE_VALUE}
          onClick={(): void => {
            form.setFieldValue(
              'volumeMain',
              volumeMain === SECONDARY_TYPE_VALUE ? 0 : SECONDARY_TYPE_VALUE,
            );
            onSelection(
              { volumeMain: volumeMain === SECONDARY_TYPE_VALUE ? 0 : SECONDARY_TYPE_VALUE },
              true,
            );
          }}
          iconColor="primary"
        />
      </Row>
      {isLocalBlockDevice && (
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Radio
            label={t('storage.dataVolume.indexVolume', 'Index Volume')}
            value={INDEX_TYPE_VALUE}
            checked={volumeMain === INDEX_TYPE_VALUE}
            onClick={(): void => {
              form.setFieldValue(
                'volumeMain',
                volumeMain === INDEX_TYPE_VALUE ? 0 : INDEX_TYPE_VALUE,
              );
              onSelection(
                { volumeMain: volumeMain === INDEX_TYPE_VALUE ? 0 : INDEX_TYPE_VALUE },
                true,
              );
            }}
            iconColor="primary"
          />
        </Row>
      )}

      <div className={styles.sectionHeader}>
        <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
          {t('label.volume_options', 'Volume Options')}
        </ds-text>
        <ds-divider className={styles.sectionDivider}></ds-divider>
      </div>
      {isLocalBlockDevice ? (
        <>
          <Row padding={{ top: 'large' }} width="100%">
            <Input
              inputName="path"
              label={t('label.volume_path', 'Volume path')}
              value={path}
              backgroundColor="gray5"
              onChange={changeVolDetail}
            />
          </Row>
          {volumeMain !== INDEX_TYPE_VALUE && (
            <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
              <Row width="32%" mainAlignment="flex-start">
                <Switch
                  value={isCompression}
                  label={t('label.enable_compression', 'Enable Compression')}
                  onClick={(): void => {
                    const newValue = !isCompression;
                    form.setFieldValue('isCompression', newValue);
                    if (!newValue) {
                      form.setFieldValue('compressionThreshold', '');
                    }
                    onSelection({ isCompression: newValue }, true);
                  }}
                  iconColor="primary"
                />
              </Row>
              <Padding horizontal="small" />
              <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="65%">
                <Input
                  inputName="compressionThreshold"
                  label={t('label.volume_compression_thresold', 'Compression Threshold')}
                  value={compressionThreshold}
                  backgroundColor="gray5"
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    if (/^\d*$/.test(e.target.value)) {
                      form.setFieldValue('compressionThreshold', e.target.value);
                    }
                  }}
                  disabled={!isCompression}
                  CustomIcon={CompressionThresholdIcon}
                />
              </Row>
            </Row>
          )}
        </>
      ) : (
        <>
          <Row padding={{ top: 'large' }} width="100%">
            <Input
              inputName="prefix"
              label={t(
                'label.prefix_name',
                'Prefix - all objects will have this prefix in their name',
              )}
              value={prefix}
              backgroundColor="gray5"
              onChange={changeVolDetail}
            />
          </Row>
          {showTieringSettings && (
            <>
              <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
                <Row width="100%" mainAlignment="flex-start" crossAlignment="center">
                  <Switch
                    value={useInfrequentAccess}
                    label={t('label.use_infraquent_access', 'Use infrequent access')}
                    onClick={(): void => {
                      const newValue = !useInfrequentAccess;
                      form.setFieldValue('useInfrequentAccess', newValue);
                      if (newValue) {
                        form.setFieldValue('useIntelligentTiering', false);
                      } else {
                        form.setFieldValue('infrequentAccessThreshold', '');
                      }
                      onSelection({ useInfrequentAccess: newValue }, true);
                      if (newValue) {
                        onSelection({ useIntelligentTiering: false }, true);
                      }
                      if (!newValue) {
                        onSelection({ infrequentAccessThreshold: '' }, true);
                      }
                    }}
                    iconColor="primary"
                  />
                  <Tooltip placement="top" label={t('storage.dataVolumes.amazonStorageDocumentation', 'Amazon Storage Class Documentation')}>
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
                  <Input
                    inputName="infrequentAccessThreshold"
                    label={t('label.bytes_size_threshold', 'Bytes Size Threshold')}
                    type="number"
                    value={infrequentAccessThreshold || ''}
                    backgroundColor="gray5"
                    onChange={changeVolDetail}
                    disabled={!useInfrequentAccess}
                  />
                </Row>
              </Row>
              <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%" crossAlignment="center">
                <Switch
                  value={useIntelligentTiering}
                  label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
                  onClick={(): void => {
                    const newValue = !useIntelligentTiering;
                    form.setFieldValue('useIntelligentTiering', newValue);
                    if (newValue) {
                      form.setFieldValue('useInfrequentAccess', false);
                    }
                    onSelection({ useIntelligentTiering: newValue }, true);
                    if (newValue) {
                      onSelection({ useInfrequentAccess: false }, true);
                    }
                  }}
                  iconColor="primary"
                />
                <Tooltip placement="top" label={t('storage.dataVolumes.amazonTieringDocumentation', 'Amazon Tiering Documentation')}>
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
            </>
          )}
        </>
      )}
      <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
        <Switch
          value={isCurrent}
          label={t('label.set_as_current', 'Set as Current')}
          onClick={(): void => {
            const newValue = !isCurrent;
            form.setFieldValue('isCurrent', newValue);
            onSelection({ isCurrent: newValue }, true);
          }}
          iconColor="primary"
        />
      </Row>
      <Row mainAlignment="flex-start" width="100%" padding={{ left: '2rem' }}>
        <ds-text as="p" color="secondary">
          {t(
            'label.enable_current_helptext',
            'Enabling this option will disable the current active volume.',
          )}
        </ds-text>
      </Row>
      {!isLocalBlockDevice && (
        <>
          <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
            <Switch
              value={centralized}
              label={t('label.storage_centralized', 'I want this Storage to be centralized')}
              onClick={(): void => {
                const newValue = !centralized;
                form.setFieldValue('centralized', newValue);
                onSelection({ centralized: newValue }, true);
              }}
              iconColor="primary"
            />
          </Row>
          <Row mainAlignment="flex-start" width="100%" padding={{ left: '2rem' }}>
            <ds-text
              as="p"
              color="secondary"
              style={{ whiteSpace: 'pre-line', width: '100%' }}
              overflow="break-word"
            >
              <Trans
                i18nKey="label.storage_centralized_helpertext"
                defaults="<bold>Use the CLI to manage the centralization.</bold> Centralized data becomes useful when two or more servers need access to the same data. By keeping data in one place, it's easier to manage both the hardware and the data itself. "
                components={{ bold: <strong /> }}
              />
            </ds-text>
          </Row>
        </>
      )}
    </Container>
  );
}
