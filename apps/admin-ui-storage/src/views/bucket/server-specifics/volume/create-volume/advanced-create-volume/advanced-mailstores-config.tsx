/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { ChangeEvent, FC, useCallback, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { AdvancedMailstoresConfigProps } from '../../../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  EMPTY_TYPE_VALUE,
  PRIMARY_TYPE_VALUE,
  S3,
  SECONDARY_TYPE_VALUE,
} from '../../../../../../constants';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const AdvancedMailstoresConfig: FC<AdvancedMailstoresConfigProps> = ({ onSelection, externalData, setCompleteLoading }) => {
  const context = useContext(AdvancedVolumeContext);
  const { t } = useTranslation();
  const { advancedVolumeDetail, setAdvancedVolumeDetail, setIsAllocationToggle } = context;
  const [primaryRadio, setPrimaryRadio] = useState(false);
  const [secondaryRadio, setSecondaryRadio] = useState(false);
  const isLocalBlockDevice = advancedVolumeDetail?.volumeAllocation === 'Local Block Device';
  const showTieringSettings =
    advancedVolumeDetail?.unusedBucketType === S3 && advancedVolumeDetail?.tieringSupported === true;

  const changeVolDetail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAdvancedVolumeDetail((prev) => ({ ...prev, [e?.target?.name]: e?.target?.value }));
    },
    [setAdvancedVolumeDetail],
  );

  useEffect(() => {
    if (primaryRadio) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: PRIMARY_TYPE_VALUE }));
      onSelection({ volumeMain: PRIMARY_TYPE_VALUE }, true);
    } else if (secondaryRadio) {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: SECONDARY_TYPE_VALUE }));
      onSelection({ volumeMain: SECONDARY_TYPE_VALUE }, true);
    } else {
      setAdvancedVolumeDetail((prev) => ({ ...prev, volumeMain: EMPTY_TYPE_VALUE }));
      onSelection({ volumeMain: EMPTY_TYPE_VALUE }, true);
    }
  }, [onSelection, primaryRadio, secondaryRadio, setAdvancedVolumeDetail]);

  useEffect(() => {
    if (advancedVolumeDetail?.volumeMain === PRIMARY_TYPE_VALUE) {
      setPrimaryRadio(true);
    } else if (advancedVolumeDetail?.volumeMain === SECONDARY_TYPE_VALUE) {
      setSecondaryRadio(true);
    }
  }, [advancedVolumeDetail?.volumeMain]);

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
  }, [advancedVolumeDetail?.useInfrequentAccess, advancedVolumeDetail?.infrequentAccessThreshold, onSelection, setAdvancedVolumeDetail]);

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

  const changeSwitchCentralized = useCallback((): void => {
    setAdvancedVolumeDetail((prev) => ({
      ...prev,
      centralized: !advancedVolumeDetail?.centralized,
    }));
    onSelection({ centralized: !advancedVolumeDetail?.centralized }, true);
  }, [advancedVolumeDetail?.centralized, onSelection, setAdvancedVolumeDetail]);

  useEffect(() => {
    if (advancedVolumeDetail?.volumeMain !== 0) {
      setCompleteLoading(true);
      setIsAllocationToggle(false);
    } else {
      setCompleteLoading(false);
      setIsAllocationToggle(true);
    }
  }, [
    advancedVolumeDetail?.prefix,
    advancedVolumeDetail?.volumeMain,
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
          value={advancedVolumeDetail?.volumeAllocation}
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_name', 'Volume Name')}
          value={advancedVolumeDetail?.volumeName}
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
            value={advancedVolumeDetail?.bucketName}
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
            value={advancedVolumeDetail?.unusedBucketType}
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
            value={advancedVolumeDetail?.bucketId}
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
            checked={primaryRadio}
            onClick={(): void => {
              setPrimaryRadio(!primaryRadio);
              setSecondaryRadio(false);
            }}
            iconColor="primary"
          />
        </Row>
        <Row width="48%">
          <Radio
            label={t('label.secondary_volume', 'This is a Secondary Volume')}
            value={SECONDARY_TYPE_VALUE}
            checked={secondaryRadio}
            onClick={(): void => {
              setSecondaryRadio(!secondaryRadio);
              setPrimaryRadio(false);
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
          value={advancedVolumeDetail?.prefix}
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
