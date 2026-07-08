/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Container,
  Input,
  LabeledValue,
  Link,
  ListRow,
  Padding,
  Radio,
  Row,
  Switch,
} from '@zextras/ui-components';
import { type ChangeEvent, type FC, useContext, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AdvancedMailstoresConfigProps } from '../../../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  PRIMARY_TYPE_VALUE,
  S3,
  SECONDARY_TYPE_VALUE,
} from '../../../../../../constants';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const AdvancedMailstoresConfig: FC<AdvancedMailstoresConfigProps> = ({ onSelection, externalData, setCompleteLoading }) => {
  const { form, setIsAllocationToggle } = useContext(AdvancedVolumeContext);
  const { t } = useTranslation();

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
  const infrequentAccessThreshold = useSelector(form.store, (s) => s.values.infrequentAccessThreshold);
  const isCurrent = useSelector(form.store, (s) => s.values.isCurrent);
  const centralized = useSelector(form.store, (s) => s.values.centralized);

  const isLocalBlockDevice = volumeAllocation === 'Local Block Device';
  const showTieringSettings = unusedBucketType === S3 && tieringSupported === true;

  const changeVolDetail = (e: ChangeEvent<HTMLInputElement>): void => {
    form.setFieldValue(e.target.name as 'prefix' | 'infrequentAccessThreshold', e.target.value);
  };

  useEffect(() => {
    if (volumeMain !== 0) {
      setCompleteLoading(true);
      setIsAllocationToggle(false);
    } else {
      setCompleteLoading(false);
      setIsAllocationToggle(true);
    }
  }, [prefix, volumeMain, setCompleteLoading, setIsAllocationToggle]);

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
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_server_name', 'Server')}
          backgroundColor="gray6"
          value={externalData}
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.storage_type', 'Storage Type')}
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
      <Row
        padding={{ top: 'large' }}
        width="100%"
        mainAlignment="center"
        crossAlignment="center"
        background="gray6"
      >
        <Row width="48%">
          <Radio
            label={t('label.primary_volume', 'This is a Primary Volume')}
            value={PRIMARY_TYPE_VALUE.toString()}
            checked={volumeMain === PRIMARY_TYPE_VALUE}
            onClick={(): void => {
              form.setFieldValue('volumeMain', volumeMain === PRIMARY_TYPE_VALUE ? 0 : PRIMARY_TYPE_VALUE);
              onSelection({ volumeMain: volumeMain === PRIMARY_TYPE_VALUE ? 0 : PRIMARY_TYPE_VALUE }, true);
            }}
            iconColor="primary"
          />
        </Row>
        <Row width="48%">
          <Radio
            label={t('label.secondary_volume', 'This is a Secondary Volume')}
            value={SECONDARY_TYPE_VALUE}
            checked={volumeMain === SECONDARY_TYPE_VALUE}
            onClick={(): void => {
              form.setFieldValue('volumeMain', volumeMain === SECONDARY_TYPE_VALUE ? 0 : SECONDARY_TYPE_VALUE);
              onSelection({ volumeMain: volumeMain === SECONDARY_TYPE_VALUE ? 0 : SECONDARY_TYPE_VALUE }, true);
            }}
            iconColor="primary"
          />
        </Row>
      </Row>
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
                value={infrequentAccessThreshold || ''}
                backgroundColor="gray5"
                onChange={changeVolDetail}
                disabled={!useInfrequentAccess}
              />
            </Row>
          </Row>
          <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
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
          <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
            <ds-text as="p" color="secondary" style={{ whiteSpace: 'pre-line', width: '100%' }} overflow="break-word">
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
