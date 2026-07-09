/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, LabeledValue, Padding, Row, Select } from '@zextras/ui-components';
import { type ChangeEvent, type FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  BucketVolume,
  VolumeAllocationItem,
} from '../../../../../../../types';
import {
  EXTERNAL_TYPE_VALUE,
  LOCAL_TYPE_VALUE,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
} from '../../../../../../constants';
import { listS3Connector } from '../../../../../../services/bucket-service';
import { BucketTypeItems, volumeAllocationList } from '../../../../../utility/utils';
import { VolumeContext } from '../volume-context';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

type AdvancedMailstoresDefinitionProps = {
  externalData: string;
  setCompleteLoading: (newValue: boolean) => void;
  setToggleNextBtn: (newValue: boolean) => void;
};

const AdvancedMailstoresDefinition: FC<AdvancedMailstoresDefinitionProps> = ({
  externalData,
  setToggleNextBtn,
  setCompleteLoading,
}) => {
  const { t } = useTranslation();
  const { form: volumeForm } = useContext(VolumeContext);
  const { form, setIsAllocationToggle } = useContext(AdvancedVolumeContext);
  const [isVolumeAllDetail, setIsVolumeAllDetail] = useState<Array<BucketVolume>>([]);
  const volAllocationList = volumeAllocationList(t);
  const bucketTypeItems = BucketTypeItems(t);
  const [allocation, setAllocation] = useState<VolumeAllocationItem>();
  const [unusedType, setUnusedType] = useState<{ label: string; value: string } | undefined>();
  const [errName, setErrName] = useState(true);
  const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const volumeName = useSelector(form.store, (s) => s.values.volumeName);
  const volumeAllocation = useSelector(form.store, (s) => s.values.volumeAllocation);
  const bucketId = useSelector(form.store, (s) => s.values.bucketId);
  const unusedBucketType = useSelector(form.store, (s) => s.values.unusedBucketType);
  const basicVolumeAllocation = useSelector(volumeForm.store, (s) => s.values.volumeAllocation);

  const changeVolName = (e: ChangeEvent<HTMLInputElement>) => {
    volumeForm.setFieldValue('volumeName', e?.target?.value);
    form.setFieldValue('volumeName', e?.target?.value);
    if (e?.target?.value === '') {
      setErrName(false);
    } else {
      setErrName(true);
    }
  };

  const onVolAllocationChange = (v: unknown): void => {
    if (typeof v !== 'number') {
      return;
    }

    volumeForm.setFieldValue('volumeAllocation', v);
    const volumeTypeObject = volAllocationList?.find(
      (item: VolumeAllocationItem) => item?.value === v,
    )?.label;
    form.setFieldValue('volumeAllocation', volumeTypeObject ?? '');
    if (v === LOCAL_TYPE_VALUE) {
      setToggleNextBtn(true);
    } else {
      setToggleNextBtn(false);
    }
  };

  useEffect(() => {
    if (form.state.values.volumeAllocation) {
      return;
    }

    const defaultAllocation = volAllocationList?.[0]?.value;
    if (typeof defaultAllocation === 'number') {
      onVolAllocationChange(defaultAllocation);
    }
  }, [onVolAllocationChange, volAllocationList, volumeAllocation]);

  const onUnusedBucketListChange = (e: unknown): void => {
    if (typeof e !== 'string') {
      return;
    }

    const selectedBucketDetail = isVolumeAllDetail?.find((item: BucketVolume) => item?.uuid === e);
    form.setFieldValue('bucketName', selectedBucketDetail?.bucketName ?? '');
    form.setFieldValue('unusedBucketType', selectedBucketDetail?.storeType ?? '');
    form.setFieldValue('bucketId', selectedBucketDetail?.uuid ?? '');
    form.setFieldValue('tieringSupported', selectedBucketDetail?.tieringSupported ?? false);
    if (!selectedBucketDetail?.tieringSupported) {
      form.setFieldValue('useInfrequentAccess', false);
      form.setFieldValue('useIntelligentTiering', false);
    }
  };

  useEffect(() => {
    if (basicVolumeAllocation !== EXTERNAL_TYPE_VALUE) {
      return;
    }

    if (bucketId) {
      return;
    }

    const defaultBucket = backupUnusedBucketList?.[0]?.value;
    if (typeof defaultBucket === 'string' && defaultBucket !== '') {
      onUnusedBucketListChange(defaultBucket);
    }
  }, [
    bucketId,
    backupUnusedBucketList,
    onUnusedBucketListChange,
    basicVolumeAllocation,
  ]);

  function getBucketTypeLabel(storeType: string | undefined): string | undefined {
    return bucketTypeItems?.find((item) => item?.value?.toLowerCase() === storeType?.toLowerCase())
      ?.label;
  }

  const getBucketListType = (): void => {
    listS3Connector().then((values) => {
      const connectors: Array<BucketVolume> = values.map((items) => ({
        uuid: items.uuid,
        label: items.label || '',
        bucketName: items.bucketName || '',
        storeType: (items as unknown as { storeType?: string }).storeType || 'S3',
        notes: items.notes || '',
        tieringSupported:
          (items as unknown as { tieringSupported?: boolean }).tieringSupported ?? false,
        [USAGE_IN_EXTERNAL_BACKUP]:
          (items as unknown as { 'usage in external backup'?: string | Array<string> })[
            'usage in external backup'
          ] ?? UNUSED,
      }));

      const allData = connectors.filter(
        (items: BucketVolume) =>
          !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
      );

      const volUnusedBucketList: Array<{ label: string; value: string }> = allData.map(
        (items: BucketVolume) => {
          const volumeObject = getBucketTypeLabel(items?.storeType);
          return {
            label: `${volumeObject} | ${items?.label}`,
            value: items?.uuid ?? '',
          };
        },
      );
      setIsVolumeAllDetail(allData);
      setBackupUnusedBucketList(volUnusedBucketList);
    });
  };

  useEffect(() => {
    const volumeTypeObject = volAllocationList?.find(
      (item: VolumeAllocationItem) => item?.value === basicVolumeAllocation,
    );
    setAllocation(volumeTypeObject);
  }, [volAllocationList, basicVolumeAllocation]);

  useEffect(() => {
    if (volumeName && basicVolumeAllocation) {
      if (basicVolumeAllocation === LOCAL_TYPE_VALUE) {
        setCompleteLoading(true);
        setIsAllocationToggle(true);
      } else if (unusedBucketType && backupUnusedBucketList?.length !== 0) {
        setCompleteLoading(true);
        setIsAllocationToggle(false);
      } else {
        setCompleteLoading(false);
        setIsAllocationToggle(true);
      }
    } else {
      setCompleteLoading(false);
      setIsAllocationToggle(true);
    }
  }, [
    unusedBucketType,
    basicVolumeAllocation,
    backupUnusedBucketList?.length,
    setCompleteLoading,
    setIsAllocationToggle,
    volumeName,
  ]);

  useEffect(() => {
    const volumeTypeObject = backupUnusedBucketList?.find(
      (item) => item?.value === bucketId,
    );
    setUnusedType(volumeTypeObject);
  }, [
    backupUnusedBucketList,
    unusedBucketType,
    bucketId,
    isVolumeAllDetail,
  ]);

  useEffect(() => {
    getBucketListType();
  }, []);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Row padding={{ top: 'large' }} width="100%">
        <LabeledValue
          label={t('label.volume_server_name', 'Server')}
          backgroundColor="gray6"
          value={externalData}
        />
      </Row>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
        <Input
          inputName="volumeName"
          label={t('label.volume_name', 'Volume Name')}
          backgroundColor="gray5"
          value={volumeName}
          onChange={changeVolName}
          hasError={!errName}
        />
        {!errName && (
          <Padding top="extrasmall">
            <ds-text as="span" color="error" overflow="break-word" size="extrasmall">
              {t('buckets.invalid_volume_name', 'Volume name is required.')}
            </ds-text>
          </Padding>
        )}
      </Row>
      <Row padding={{ top: 'large' }} width="100%">
        <Select
          items={volAllocationList}
          background="gray5"
          label={t('label.storage_type', 'Storage Type')}
          showCheckbox={false}
          selection={allocation || volAllocationList[0]}
          onChange={onVolAllocationChange}
        />
      </Row>
      {basicVolumeAllocation === EXTERNAL_TYPE_VALUE &&
        backupUnusedBucketList?.length !== 0 && (
          <Row padding={{ top: 'large' }} width="100%">
            <Select
              items={backupUnusedBucketList}
              background="gray5"
              label={t(
                'label.volume_available_unused_Buckets_list_in_backup',
                'Available Buckets List (that are not in use in the backup)',
              )}
              showCheckbox={false}
              selection={unusedType || backupUnusedBucketList[0]}
              onChange={onUnusedBucketListChange}
            />
          </Row>
        )}
    </Container>
  );
};

export default AdvancedMailstoresDefinition;
