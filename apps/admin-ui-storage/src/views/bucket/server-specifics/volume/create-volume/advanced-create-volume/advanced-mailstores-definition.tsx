/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, LabeledValue, Padding, Row, Select } from '@zextras/ui-components';
import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  AdvancedVolumeWizardDetail,
  BucketVolume,
  VolumeAllocationItem,
  VolumeWizardDetail,
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
  const context = useContext(VolumeContext);
  const advancedContext = useContext(AdvancedVolumeContext);
  const { volumeDetail, setVolumeDetail } = context;
  const { advancedVolumeDetail, setAdvancedVolumeDetail, setIsAllocationToggle } = advancedContext;
  const [isVolumeAllDetail, setIsVolumeAllDetail] = useState<Array<BucketVolume>>([]);
  const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
  const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
  const [allocation, setAllocation] = useState<VolumeAllocationItem>();
  const [unusedType, setUnusedType] = useState<{ label: string; value: string } | undefined>();
  const [errName, setErrName] = useState(true);
  const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const changeVolName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setVolumeDetail((prev: VolumeWizardDetail) => ({ ...prev, volumeName: e?.target?.value }));
      setAdvancedVolumeDetail((prev: AdvancedVolumeWizardDetail) => ({
        ...prev,
        volumeName: e?.target?.value,
      }));
      if (e?.target?.value === '') {
        setErrName(false);
      } else {
        setErrName(true);
      }
    },
    [setAdvancedVolumeDetail, setVolumeDetail],
  );

  const onVolAllocationChange = useCallback(
    (v: unknown): void => {
      if (typeof v !== 'number') {
        return;
      }

      setVolumeDetail((prev: VolumeWizardDetail) => ({ ...prev, volumeAllocation: v }));
      const volumeTypeObject = volAllocationList?.find(
        (item: VolumeAllocationItem) => item?.value === v,
      )?.label;
      setAdvancedVolumeDetail((prev: AdvancedVolumeWizardDetail) => ({
        ...prev,
        volumeAllocation: volumeTypeObject,
      }));
      if (v === LOCAL_TYPE_VALUE) {
        setToggleNextBtn(true);
      } else {
        setToggleNextBtn(false);
      }
    },
    [setAdvancedVolumeDetail, setToggleNextBtn, setVolumeDetail, volAllocationList],
  );

  useEffect(() => {
    if (volumeDetail?.volumeAllocation) {
      return;
    }

    const defaultAllocation = volAllocationList?.[0]?.value;
    if (typeof defaultAllocation === 'number') {
      onVolAllocationChange(defaultAllocation);
    }
  }, [onVolAllocationChange, volAllocationList, volumeDetail?.volumeAllocation]);

  const onUnusedBucketListChange = useCallback(
    (e: unknown): void => {
      if (typeof e !== 'string') {
        return;
      }

      const selectedBucketDetail = isVolumeAllDetail?.find((item: BucketVolume) => item?.uuid === e);
      setAdvancedVolumeDetail((prev: AdvancedVolumeWizardDetail) => ({
        ...prev,
        bucketName: selectedBucketDetail?.bucketName,
        unusedBucketType: selectedBucketDetail?.storeType,
        bucketId: selectedBucketDetail?.uuid,
        tieringSupported: selectedBucketDetail?.tieringSupported,
        useInfrequentAccess: selectedBucketDetail?.tieringSupported
          ? prev.useInfrequentAccess
          : false,
        useIntelligentTiering: selectedBucketDetail?.tieringSupported
          ? prev.useIntelligentTiering
          : false,
      }));
    },
    [isVolumeAllDetail, setAdvancedVolumeDetail],
  );

  useEffect(() => {
    if (volumeDetail?.volumeAllocation !== EXTERNAL_TYPE_VALUE) {
      return;
    }

    if (advancedVolumeDetail?.bucketId) {
      return;
    }

    const defaultBucket = backupUnusedBucketList?.[0]?.value;
    if (typeof defaultBucket === 'string' && defaultBucket !== '') {
      onUnusedBucketListChange(defaultBucket);
    }
  }, [
    advancedVolumeDetail?.bucketId,
    backupUnusedBucketList,
    onUnusedBucketListChange,
    volumeDetail?.volumeAllocation,
  ]);

  function getBucketTypeLabel(storeType: string | undefined): string | undefined {
    return bucketTypeItems?.find((item) => item?.value?.toLowerCase() === storeType?.toLowerCase())
      ?.label;
  }

  const getBucketListType = useCallback((): void => {
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
  }, [getBucketTypeLabel, setIsVolumeAllDetail]);

  useEffect(() => {
    const volumeTypeObject = volAllocationList?.find(
      (item: VolumeAllocationItem) => item?.value === volumeDetail?.volumeAllocation,
    );
    setAllocation(volumeTypeObject);
  }, [volAllocationList, volumeDetail?.volumeAllocation]);

  useEffect(() => {
    if (volumeDetail?.volumeName && volumeDetail?.volumeAllocation) {
      if (volumeDetail?.volumeAllocation === LOCAL_TYPE_VALUE) {
        setCompleteLoading(true);
        setIsAllocationToggle(true);
      } else if (advancedVolumeDetail?.unusedBucketType && backupUnusedBucketList?.length !== 0) {
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
    advancedVolumeDetail?.unusedBucketType,
    advancedVolumeDetail.volumeAllocation,
    backupUnusedBucketList?.length,
    setCompleteLoading,
    setIsAllocationToggle,
    volumeDetail?.volumeAllocation,
    volumeDetail?.volumeName,
  ]);

  useEffect(() => {
    const volumeTypeObject = backupUnusedBucketList?.find(
      (item) => item?.value === advancedVolumeDetail?.bucketId,
    );
    setUnusedType(volumeTypeObject);
  }, [
    backupUnusedBucketList,
    advancedVolumeDetail?.unusedBucketType,
    advancedVolumeDetail?.bucketId,
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
          value={volumeDetail?.volumeName}
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
      {advancedVolumeDetail?.volumeAllocation !== undefined &&
        volumeDetail?.volumeAllocation === EXTERNAL_TYPE_VALUE &&
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
