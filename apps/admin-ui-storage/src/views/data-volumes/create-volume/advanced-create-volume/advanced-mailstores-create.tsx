/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DISABLED, ENABLED, NO, S3, YES } from '../../../../constants';
import { volumeTypeList } from '../../../utility/utils';
import { useAdvancedVolumeContext } from './create-advanced-volume-context';
import styles from './create-volume.module.css';

type DetailFieldProps = {
  label: string;
  value?: string | number | null;
};

function DetailField({ label, value }: Readonly<DetailFieldProps>) {
  return (
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
}

export function AdvancedMailstoresCreate({
  externalData,
}: Readonly<{
  externalData: string;
}>) {
  const { form } = useAdvancedVolumeContext();
  const { t } = useTranslation();
  const volTypeList = volumeTypeList(t);

  const volumeName = useSelector(form.store, (s) => s.values.volumeName);
  const volumeAllocation = useSelector(form.store, (s) => s.values.volumeAllocation);
  const bucketName = useSelector(form.store, (s) => s.values.bucketName);
  const unusedBucketType = useSelector(form.store, (s) => s.values.unusedBucketType);
  const bucketId = useSelector(form.store, (s) => s.values.bucketId);
  const tieringSupported = useSelector(form.store, (s) => s.values.tieringSupported);
  const volumeMain = useSelector(form.store, (s) => s.values.volumeMain);
  const prefix = useSelector(form.store, (s) => s.values.prefix);
  const useInfrequentAccess = useSelector(form.store, (s) => s.values.useInfrequentAccess);
  const useIntelligentTiering = useSelector(form.store, (s) => s.values.useIntelligentTiering);
  const isCurrent = useSelector(form.store, (s) => s.values.isCurrent);
  const centralized = useSelector(form.store, (s) => s.values.centralized);
  const path = useSelector(form.store, (s) => s.values.path);
  const isCompression = useSelector(form.store, (s) => s.values.isCompression);
  const compressionThreshold = useSelector(form.store, (s) => s.values.compressionThreshold);

  const isLocalBlockDevice = volumeAllocation === 'Local Block Device';
  const showTieringSettings = unusedBucketType === S3 && tieringSupported === true;
  const volumeType =
    volTypeList?.find((item: { label?: string; value?: number }) => item?.value === volumeMain)
      ?.label ?? '';

  return (
    <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <ds-text as="h2" weight="bold" size="medium" className={styles.reviewTitle}>
        {t('label.review_your_selections', 'Review your selections')}
      </ds-text>

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
              <DetailField label={t('label.volume_name', 'Volume Name')} value={volumeName} />
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
                value={volumeAllocation}
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

      {!isLocalBlockDevice && (
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
                <DetailField label={t('label.bucket_name', 'Bucket Name')} value={bucketName} />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large', right: 'large' }}
              >
                <DetailField label={t('label.type', 'Type')} value={unusedBucketType} />
              </Container>
              <Container
                mainAlignment="flex-start"
                crossAlignment="flex-start"
                padding={{ top: 'large' }}
              >
                <DetailField label={t('label.ID', 'ID')} value={bucketId} />
              </Container>
            </ListRow>
          </div>
        </div>
      )}

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
                <DetailField label={t('label.volume_path', 'Volume path')} value={path} />
              </Row>
              <ListRow>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ top: 'large', right: 'large' }}
                >
                  <DetailField
                    label={t('label.enable_compression', 'Enable Compression')}
                    value={isCompression ? YES : NO}
                  />
                </Container>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ top: 'large' }}
                >
                  <DetailField
                    label={t('label.volume_compression_thresold', 'Compression Threshold')}
                    value={isCompression ? compressionThreshold : DISABLED}
                  />
                </Container>
              </ListRow>
              <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
                <DetailField
                  label={t('label.volume_as_current', 'Volum as current')}
                  value={isCurrent ? YES : NO}
                />
              </Row>
            </>
          ) : (
            <>
              <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
                <DetailField
                  label={t('label.prefix_name', 'Prefix - all objects will have this prefix in their name')}
                  value={prefix}
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
                      value={useInfrequentAccess ? ENABLED : DISABLED}
                    />
                  </Container>
                  <Container
                    mainAlignment="flex-start"
                    crossAlignment="flex-start"
                    padding={{ top: 'large' }}
                  >
                    <DetailField
                      label={t('label.use_intelligent_tiering', 'Use Intelligent Tiering')}
                      value={useIntelligentTiering ? ENABLED : DISABLED}
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
                    value={isCurrent ? YES : NO}
                  />
                </Container>
                <Container
                  mainAlignment="flex-start"
                  crossAlignment="flex-start"
                  padding={{ top: 'large' }}
                >
                  <DetailField
                    label={t('label.centralized', 'Centralized')}
                    value={centralized ? YES : NO}
                  />
                </Container>
              </ListRow>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
