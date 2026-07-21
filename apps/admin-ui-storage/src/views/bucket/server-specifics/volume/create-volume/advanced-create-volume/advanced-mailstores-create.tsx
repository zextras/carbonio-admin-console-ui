/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row } from '@zextras/ui-components';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DISABLED, ENABLED, INDEX_TYPE_VALUE, NO, S3, YES } from '../../../../../../constants';
import { volumeTypeList } from '../../../../../utility/utils';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import styles from './create-volume.module.css';

type DetailFieldProps = {
  label: string;
  value?: string | number | null;
};

const DetailField: FC<DetailFieldProps> = ({ label, value }) => (
  <div className={styles.detailItem}>
    <ds-text size="small" color="gray1">
      {label}
    </ds-text>
    <div className={styles.detailValueRow}>
      <ds-text className={styles.detailValue} size="small" weight="bold">
        {value ?? ''}
      </ds-text>
    </div>
  </div>
);

const AdvancedMailstoresCreate: FC<{
  externalData: string;
  setCompleteLoading: (v: boolean) => void;
}> = ({ externalData, setCompleteLoading }) => {
  const context = useContext(AdvancedVolumeContext);
  const { t } = useTranslation();
  const { advancedVolumeDetail } = context;
  const volTypeList = useMemo(() => volumeTypeList(t, true), [t]);
  const [volumeType, setVolumeType] = useState<string>('');
  const isLocalBlockDevice = advancedVolumeDetail?.volumeAllocation === 'Local Block Device';
  const isIndexVolume = advancedVolumeDetail?.volumeMain === INDEX_TYPE_VALUE;
  const showTieringSettings =
    !isLocalBlockDevice &&
    advancedVolumeDetail?.unusedBucketType === S3 &&
    advancedVolumeDetail?.tieringSupported === true;
  const showBucketSection = !isLocalBlockDevice && !!advancedVolumeDetail?.bucketName;

  useEffect(() => {
    if (isLocalBlockDevice) {
      const hasBasics =
        !!advancedVolumeDetail?.volumeAllocation &&
        !!advancedVolumeDetail?.volumeName &&
        !!advancedVolumeDetail?.path &&
        !!volumeType;
      const compressionOk =
        isIndexVolume ||
        !advancedVolumeDetail?.isCompression ||
        !!advancedVolumeDetail?.compressionThreshold;
      setCompleteLoading(hasBasics && compressionOk);
      return;
    }

    if (
      advancedVolumeDetail?.volumeAllocation &&
      advancedVolumeDetail?.volumeName &&
      advancedVolumeDetail?.unusedBucketType &&
      volumeType
    ) {
      setCompleteLoading(true);
    } else {
      setCompleteLoading(false);
    }
  }, [advancedVolumeDetail, isIndexVolume, isLocalBlockDevice, setCompleteLoading, volumeType]);

  useEffect(() => {
    const volumeTypeObject = volTypeList?.find(
      (item: { label?: string; value?: number }) => item?.value === advancedVolumeDetail?.volumeMain,
    )?.label;
    setVolumeType(volumeTypeObject ?? '');
  }, [advancedVolumeDetail?.volumeMain, volTypeList]);


  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <ds-text as="h2" weight="bold" size="medium" className={styles.reviewTitle}>
        {t('label.review_your_selections', 'Review your selections')}
      </ds-text>

      {/* DEFINITION card */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <ds-text as="span" weight="bold" size="small" color="gray0">
            {t('label.definition', 'DEFINITION')}
          </ds-text>
        </div>
        <div className={styles.reviewCardBody}>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large' }}
            >
              <DetailField label={t('label.volume_server_name', 'Server')} value={externalData} />
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large' }}
            >
              <DetailField
                label={t('label.volume_name', 'Volume Name')}
                value={advancedVolumeDetail?.volumeName}
              />
            </Container>
          </ListRow>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large' }}
            >
              <DetailField
                label={t('label.storage_type', 'Storage Type')}
                value={advancedVolumeDetail?.volumeAllocation}
              />
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large' }}
            >
              <DetailField label={t('label.type_of_volume', 'Type of Volume')} value={volumeType} />
            </Container>
          </ListRow>
        </div>
      </div>

      {/* BUCKET card */}
      { showBucketSection && (
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <ds-text as="span" weight="bold" size="small" color="gray0">
              {t('label.bucket', 'BUCKET')}
            </ds-text>
          </div>
          <div className={styles.reviewCardBody}>
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <DetailField
                  label={t('label.bucket_name', 'Bucket Name')}
                  value={advancedVolumeDetail?.bucketName}
                />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <DetailField
                  label={t('label.type', 'Type')}
                  value={advancedVolumeDetail?.unusedBucketType}
                />
              </Container>
            </ListRow>
            <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
              <DetailField label={t('label.ID', 'ID')} value={advancedVolumeDetail?.bucketId} />
            </Row>
          </div>
        </div>
      )
      }

      {/* CONFIGURATION card */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <ds-text as="span" weight="bold" size="small" color="gray0">
            {t('label.configuration', 'CONFIGURATION')}
          </ds-text>
        </div>
        <div className={styles.reviewCardBody}>
          {isLocalBlockDevice ? (
        <>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <DetailField
              label={t('label.volume_path', 'Volume path')}
              value={advancedVolumeDetail?.path}
            />
          </Row>
          {!isIndexVolume && (
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <DetailField
                  label={t('label.enable_compression', 'Enable Compression')}
                  value={advancedVolumeDetail?.isCompression ? YES : NO}
                />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <DetailField
                  label={t('label.volume_compression_thresold', 'Compression Threshold')}
                  value={
                    advancedVolumeDetail?.isCompression
                      ? `${advancedVolumeDetail?.compressionThreshold ?? ''}`
                      : DISABLED
                  }
                />
              </Container>
            </ListRow>
          )}
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <DetailField
              label={t('label.volume_as_current', 'Volum as current')}
              value={advancedVolumeDetail?.isCurrent ? YES : NO}
            />
          </Row>
        </>
      ) : (
        <>
          <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
            <DetailField
              label={t(
                'label.prefix_name',
                'Prefix - all objects will have this prefix in their name',
              )}
              value={advancedVolumeDetail?.prefix}
            />
          </Row>
          {showTieringSettings && (
            <ListRow>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <DetailField
                  label={t('label.infrequent_access', 'Infrequent access')}
                  value={advancedVolumeDetail?.useInfrequentAccess ? ENABLED : DISABLED}
                />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <DetailField
                  label={t('label.use_intelligent_tiering', 'Use Intelligent Tiering')}
                  value={advancedVolumeDetail?.useIntelligentTiering ? ENABLED : DISABLED}
                />
              </Container>
            </ListRow>
          )}
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large', right: 'large' }}
            >
              <DetailField
                label={t('label.volume_as_current', 'Volum as current')}
                value={advancedVolumeDetail?.isCurrent ? YES : NO}
              />
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ top: 'large' }}
            >
              <DetailField
                label={t('label.centralized', 'Centralized')}
                value={advancedVolumeDetail?.centralized ? YES : NO}
              />
            </Container>
          </ListRow>
        </>
      )}
        </div>
      </div>
      
    </Container>
  );
};

export default AdvancedMailstoresCreate;
