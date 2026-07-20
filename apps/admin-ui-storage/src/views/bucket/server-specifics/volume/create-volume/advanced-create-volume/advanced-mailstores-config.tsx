/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  Input,
  Link,
  ListRow,
  Padding,
  Radio,
  Row,
  Switch,
} from '@zextras/ui-components';
import { ChangeEvent, FC, useCallback, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AdvancedMailstoresConfigProps } from '../../../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  COMPRESSION_THRESHOLD_UNIT,
  EMPTY_TYPE_VALUE,
  INDEX_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  S3,
  SECONDARY_TYPE_VALUE,
} from '../../../../../../constants';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import styles from './create-volume.module.css';

const AdvancedMailstoresConfig: FC<AdvancedMailstoresConfigProps> = ({
  onSelection,
  externalData,
  setCompleteLoading,
}) => {
  const context = useContext(AdvancedVolumeContext);
  const { t } = useTranslation();
  const { advancedVolumeDetail, setAdvancedVolumeDetail } = context;
  const setIsAllocationToggle = useBucketVolumeStore((state) => state?.setIsAllocationToggle);
  const [primaryRadio, setPrimaryRadio] = useState(false);
  const [secondaryRadio, setSecondaryRadio] = useState(false);
  const [indexRadio, setIndexRadio] = useState(false);
  const [errPath, setErrPath] = useState(true);
  const [errCompressionThreshold, setErrCompressionThreshold] = useState(true);
  const isLocalBlockDevice = advancedVolumeDetail?.volumeAllocation === 'Local Block Device';
  const showTieringSettings =
    advancedVolumeDetail?.unusedBucketType === S3 && advancedVolumeDetail?.tieringSupported === true;
  const showBucketMeta = !isLocalBlockDevice && !!advancedVolumeDetail?.bucketName;
  const isIndexVolume = indexRadio || advancedVolumeDetail?.volumeMain === INDEX_TYPE_VALUE;

  const changeVolDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAdvancedVolumeDetail((prev) => ({ ...prev, [e?.target?.name]: e?.target?.value }));
    },
    [setAdvancedVolumeDetail],
  );

  const changeVolPath = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAdvancedVolumeDetail((prev) => ({ ...prev, path: e?.target?.value }));
      onSelection({ path: e?.target?.value }, true);
      setErrPath(e?.target?.value !== '');
    },
    [onSelection, setAdvancedVolumeDetail],
  );

  const changeVolCompThreshold = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const regex = /^[0-9]*$/;
      if (!regex.test(e?.target?.value)) {
        return;
      }
      setAdvancedVolumeDetail((prev) => ({ ...prev, compressionThreshold: e?.target?.value }));
      onSelection({ compressionThreshold: e?.target?.value }, true);
      setErrCompressionThreshold(e?.target?.value !== '');
    },
    [onSelection, setAdvancedVolumeDetail],
  );

  useEffect(() => {
    if (primaryRadio) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: PRIMARY_TYPE_VALUE }));
      onSelection({ volumeMain: PRIMARY_TYPE_VALUE }, true);
    } else if (secondaryRadio) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: SECONDARY_TYPE_VALUE }));
      onSelection({ volumeMain: SECONDARY_TYPE_VALUE }, true);
    } else if (indexRadio) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: INDEX_TYPE_VALUE }));
      onSelection({ volumeMain: INDEX_TYPE_VALUE }, true);
    } else {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: EMPTY_TYPE_VALUE }));
      onSelection({ volumeMain: EMPTY_TYPE_VALUE }, true);
    }
  }, [indexRadio, onSelection, primaryRadio, secondaryRadio, setAdvancedVolumeDetail]);

  useEffect(() => {
    if (advancedVolumeDetail?.volumeMain === PRIMARY_TYPE_VALUE) {
      setPrimaryRadio(true);
      setSecondaryRadio(false);
      setIndexRadio(false);
    } else if (advancedVolumeDetail?.volumeMain === SECONDARY_TYPE_VALUE) {
      setSecondaryRadio(true);
      setPrimaryRadio(false);
      setIndexRadio(false);
    } else if (advancedVolumeDetail?.volumeMain === INDEX_TYPE_VALUE) {
      setIndexRadio(true);
      setPrimaryRadio(false);
      setSecondaryRadio(false);
    }
  }, [advancedVolumeDetail?.volumeMain]);

  useEffect(() => {
    if (!advancedVolumeDetail?.isCompression) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, compressionThreshold: '' }));
      onSelection({ compressionThreshold: '' }, true);
      setErrCompressionThreshold(true);
    }
  }, [advancedVolumeDetail?.isCompression, onSelection, setAdvancedVolumeDetail]);

  const changeSwitchInfraquentAccess = useCallback((): void => {
    const newValue = !advancedVolumeDetail?.useInfrequentAccess;
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      useInfrequentAccess: newValue,
      useIntelligentTiering: newValue ? false : prev.useIntelligentTiering,
      infrequentAccessThreshold: newValue ? advancedVolumeDetail?.infrequentAccessThreshold : '',
    }));
    onSelection({ useInfrequentAccess: newValue }, true);
    if (newValue) {
      onSelection({ useIntelligentTiering: false }, true);
    }
    if (!newValue) {
      onSelection({ infrequentAccessThreshold: '' }, true);
    }
  }, [
    advancedVolumeDetail?.useInfrequentAccess,
    advancedVolumeDetail?.infrequentAccessThreshold,
    onSelection,
    setAdvancedVolumeDetail,
  ]);

  const changeSwitchInfraquentTiering = useCallback((): void => {
    const newValue = !advancedVolumeDetail?.useIntelligentTiering;
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      useIntelligentTiering: newValue,
      useInfrequentAccess: newValue ? false : prev.useInfrequentAccess,
    }));
    onSelection({ useIntelligentTiering: newValue }, true);
    if (newValue) {
      onSelection({ useInfrequentAccess: false }, true);
    }
  }, [advancedVolumeDetail?.useIntelligentTiering, onSelection, setAdvancedVolumeDetail]);

  const changeSwitchIsCurrent = useCallback((): void => {
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      isCurrent: !advancedVolumeDetail?.isCurrent,
    }));
    onSelection({ isCurrent: !advancedVolumeDetail?.isCurrent }, true);
  }, [advancedVolumeDetail?.isCurrent, onSelection, setAdvancedVolumeDetail]);

  const changeSwitchIsCompression = useCallback((): void => {
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      isCompression: !advancedVolumeDetail?.isCompression,
    }));
    onSelection({ isCompression: !advancedVolumeDetail?.isCompression }, true);
  }, [advancedVolumeDetail?.isCompression, onSelection, setAdvancedVolumeDetail]);

  const changeSwitchCentralized = useCallback((): void => {
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      centralized: !advancedVolumeDetail?.centralized,
    }));
    onSelection({ centralized: !advancedVolumeDetail?.centralized }, true);
  }, [advancedVolumeDetail?.centralized, onSelection, setAdvancedVolumeDetail]);

  useEffect(() => {
    if (isLocalBlockDevice) {
      const hasVolumeType = advancedVolumeDetail?.volumeMain !== 0 && advancedVolumeDetail?.volumeMain;
      const hasPath = !!advancedVolumeDetail?.path;
      const compressionOk =
        !advancedVolumeDetail?.isCompression || !!advancedVolumeDetail?.compressionThreshold;
      const isComplete = !!(hasVolumeType && hasPath && (isIndexVolume || compressionOk));
      setCompleteLoading(isComplete);
      setIsAllocationToggle(false);
      return;
    }

    if (advancedVolumeDetail?.volumeMain !== 0) {
      setCompleteLoading(true);
      setIsAllocationToggle(false);
    } else {
      setCompleteLoading(false);
      setIsAllocationToggle(true);
    }
  }, [
    advancedVolumeDetail?.compressionThreshold,
    advancedVolumeDetail?.isCompression,
    advancedVolumeDetail?.path,
    advancedVolumeDetail?.prefix,
    advancedVolumeDetail?.volumeMain,
    isIndexVolume,
    isLocalBlockDevice,
    setCompleteLoading,
    setIsAllocationToggle,
  ]);

  useEffect(() => {
    if (showTieringSettings) {
      return;
    }

    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      useInfrequentAccess: false,
      useIntelligentTiering: false,
    }));
    onSelection({ useInfrequentAccess: false }, true);
    onSelection({ useIntelligentTiering: false }, true);
  }, [onSelection, setAdvancedVolumeDetail, showTieringSettings]);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <ListRow>
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
              <ds-text className={styles.detailValue} size="small">
                {externalData}
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
              {t('label.storage_type', 'Storage Type')}
            </ds-text>
            <div className={styles.detailValueRow}>
              <ds-text className={styles.detailValue} size="small">
                {advancedVolumeDetail?.volumeAllocation}
              </ds-text>
            </div>
          </div>
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <div className={styles.detailItem}>
          <ds-text size="small" color="gray1">
            {t('label.volume_name', 'Volume Name')}
          </ds-text>
          <div className={styles.detailValueRow}>
            <ds-text className={styles.detailValue} size="small">
              {advancedVolumeDetail?.volumeName}
            </ds-text>
          </div>
        </div>
      </Row>
      {showBucketMeta && (
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
                  <ds-text className={styles.detailValue} size="small">
                    {advancedVolumeDetail?.bucketName}
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
                  {t('label.type', 'Type')}
                </ds-text>
                <div className={styles.detailValueRow}>
                  <ds-text className={styles.detailValue} size="small">
                    {advancedVolumeDetail?.unusedBucketType}
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
                <ds-text className={styles.detailValue} size="small">
                  {advancedVolumeDetail?.bucketId}
                </ds-text>
              </div>
            </div>
          </Row>
        </>
      )}

      <div className={styles.sectionHeader}>
        <ds-text className={styles.sectionHeaderLabel} weight="bold" size="small">
          {t('label.volume_type', 'Volume Type')}
        </ds-text>
        <ds-divider className={styles.sectionDivider}></ds-divider>
      </div>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Radio
          label={t('storage.dataVolume.primaryVolume', 'Primary Volume')}
          value={PRIMARY_TYPE_VALUE.toString()}
          checked={primaryRadio}
          onClick={(): void => {
            setPrimaryRadio(!primaryRadio);
            setSecondaryRadio(false);
            setIndexRadio(false);
          }}
          iconColor="primary"
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Radio
          label={t('storage.dataVolume.secondaryVolume', 'Secondary Volume')}
          value={SECONDARY_TYPE_VALUE}
          checked={secondaryRadio}
          onClick={(): void => {
            setSecondaryRadio(!secondaryRadio);
            setPrimaryRadio(false);
            setIndexRadio(false);
          }}
          iconColor="primary"
        />
      </Row>
      {isLocalBlockDevice && (
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Radio
            label={t('storage.dataVolume.indexVolume', 'Index Volume')}
            value={INDEX_TYPE_VALUE}
            checked={indexRadio}
            onClick={(): void => {
              setIndexRadio(!indexRadio);
              setPrimaryRadio(false);
              setSecondaryRadio(false);
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
          <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
            <Input
              inputName="path"
              label={t('label.volume_path', 'Volume path')}
              backgroundColor="gray5"
              value={advancedVolumeDetail?.path}
              onChange={changeVolPath}
              hasError={!errPath}
            />
            {!errPath && (
              <Padding top="extrasmall">
                <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                  {t('buckets.invalid_volume_path', 'path is required')}
                </ds-text>
              </Padding>
            )}
          </Row>
          {!isIndexVolume && (
            <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
              <Row width="32%" mainAlignment="flex-start">
                <Switch
                  value={advancedVolumeDetail?.isCompression}
                  label={t('label.enable_compression', 'Enable Compression')}
                  onClick={changeSwitchIsCompression}
                  iconColor="primary"
                />
              </Row>
              <Padding horizontal="small" />
              <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="65%">
                <Input
                  inputName="compressionThreshold"
                  label={t('label.volume_compression_thresold', 'Compression Threshold')}
                  backgroundColor="gray5"
                  value={advancedVolumeDetail?.compressionThreshold}
                  onChange={changeVolCompThreshold}
                  hasError={!errCompressionThreshold}
                  disabled={!advancedVolumeDetail?.isCompression}
                  CustomIcon={(): any => (
                    <ds-text as="span" color="secondary">
                      {COMPRESSION_THRESHOLD_UNIT}
                    </ds-text>
                  )}
                />
                {!errCompressionThreshold && (
                  <Padding top="extrasmall">
                    <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
                      {t(
                        'buckets.invalid_compression_thresold',
                        'Compression Threshold is required',
                      )}
                    </ds-text>
                  </Padding>
                )}
              </Row>
            </Row>
          )}
        </>
      ) : (
        <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
          <Input
            inputName="prefix"
            label={t(
              'label.prefix_name',
              'Prefix - all objects will have this prefix in their name',
            )}
            value={advancedVolumeDetail?.prefix}
            backgroundColor="gray5"
            onChange={changeVolDetail}
          />
        </Row>
      )}

      {showTieringSettings && !isLocalBlockDevice && (
        <>
          <Row
            padding={{ top: 'large' }}
            mainAlignment="flex-start"
            width="100%"
            background="gray6"
          >
            <Row width="48.5%" mainAlignment="flex-start">
              <Row mainAlignment="flex-start" width="100%">
                <Switch
                  value={advancedVolumeDetail?.useInfrequentAccess}
                  label={t('label.use_infraquent_access', 'Use infrequent access')}
                  onClick={changeSwitchInfraquentAccess}
                  iconColor="primary"
                />
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
              <Input
                inputName="infrequentAccessThreshold"
                label={t('label.bytes_size_threshold', 'Bytes Size Threshold')}
                type="number"
                value={advancedVolumeDetail?.infrequentAccessThreshold || ''}
                backgroundColor="gray5"
                onChange={changeVolDetail}
                disabled={!advancedVolumeDetail?.useInfrequentAccess}
              />
            </Row>
          </Row>
          <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
            <Switch
              value={advancedVolumeDetail?.useIntelligentTiering}
              label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
              onClick={changeSwitchInfraquentTiering}
              iconColor="primary"
            />
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
        <Switch
          value={advancedVolumeDetail?.isCurrent}
          label={t('label.set_as_current', 'Set as Current')}
          onClick={changeSwitchIsCurrent}
          iconColor="primary"
        />
      </Row>
      <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
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
              value={advancedVolumeDetail?.centralized}
              label={t('label.storage_centralized', 'I want this Storage to be centralized')}
              onClick={changeSwitchCentralized}
              iconColor="primary"
            />
          </Row>
          <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
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
};

export default AdvancedMailstoresConfig;
