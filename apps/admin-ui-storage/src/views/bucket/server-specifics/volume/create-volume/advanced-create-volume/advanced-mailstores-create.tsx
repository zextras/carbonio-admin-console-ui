/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, LabeledValue, ListRow, Row } from '@zextras/ui-components';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DISABLED, ENABLED, NO, S3, YES } from '../../../../../../constants';
import { volumeTypeList } from '../../../../../utility/utils';
import { useAdvancedVolumeContext } from './create-advanced-volume-context';

export const AdvancedMailstoresCreate: FC<{
  externalData: string;
  setCompleteLoading: (v: boolean) => void;
}> = ({ externalData, setCompleteLoading }) => {
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

  const showTieringSettings = unusedBucketType === S3 && tieringSupported === true;
  const volumeType = volTypeList?.find(
    (item: { label?: string; value?: number }) => item?.value === volumeMain,
  )?.label ?? '';

  useEffect(() => {
    if (volumeAllocation && volumeName && unusedBucketType && volumeType) {
      setCompleteLoading(true);
    } else {
      setCompleteLoading(false);
    }
  }, [volumeAllocation, volumeName, unusedBucketType, volumeType, setCompleteLoading]);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_server_name', 'Server')}
          backgroundColor="gray6"
          value={externalData}
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_allocation', 'Allocation')}
          backgroundColor="gray6"
          value={volumeAllocation}
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_name', 'Volume Name')}
          value={volumeName}
          backgroundColor="gray6"
        />
      </Row>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ top: 'large', right: 'large' }}
        >
          <LabeledValue
            label={t('label.bucket_name', 'Bucket Name')}
            backgroundColor="gray6"
            value={bucketName}
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
            value={unusedBucketType}
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
            value={bucketId}
          />
        </Container>
      </ListRow>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.type_of_volume', 'Type of Volume')}
          value={volumeType}
          backgroundColor="gray6"
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t(
            'label.prefix_name',
            'Prefix - all objects will have this prefix in their name',
          )}
          value={prefix}
          backgroundColor="gray6"
        />
      </Row>
      {showTieringSettings && (
        <>
          <Row padding={{ top: 'large' }} width="100%">
            <LabeledValue
              label={t('label.infrequent_access', 'Infrequent access')}
              value={useInfrequentAccess ? ENABLED : DISABLED}
              backgroundColor="gray6"
            />
          </Row>
          <Row padding={{ top: 'large' }} width="100%">
            <LabeledValue
              label={t('label.use_intelligent_tiering', 'Use Intelligent Tiering')}
              value={useIntelligentTiering ? ENABLED : DISABLED}
              backgroundColor="gray6"
            />
          </Row>
        </>
      )}
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_as_current', 'Volum as current')}
          value={isCurrent ? YES : NO}
          backgroundColor="gray6"
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.centralized', 'Centralized')}
          value={centralized ? YES : NO}
          backgroundColor="gray6"
        />
      </Row>
    </Container>
  );
};


