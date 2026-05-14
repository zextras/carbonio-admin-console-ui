/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, LabeledValue, Padding, Row, Select } from '@zextras/ui-components';
import { ChangeEvent, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { objectType } from '../../../../../../../types';
import {
  EXTERNAL_TYPE_VALUE,
  LOCAL_TYPE_VALUE,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
} from '../../../../../../constants';
import { listS3Connector } from '../../../../../../services/bucket-service';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { BucketTypeItems, volumeAllocationList } from '../../../../../utility/utils';
import { VolumeContext } from '../volume-context';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const AdvancedMailstoresDefinition: FC<{
  externalData: string;
  setCompleteLoading: (newValue: boolean) => void;
  setToggleNextBtn: (newValue: boolean) => void;
}> = ({ externalData, setToggleNextBtn, setCompleteLoading }) => {
  const { t } = useTranslation();
  const context = useContext(VolumeContext);
  const advancedContext = useContext(AdvancedVolumeContext);
  const { volumeDetail, setVolumeDetail } = context;
  const { advancedVolumeDetail, setAdvancedVolumeDetail } = advancedContext;
  const { setIsAllocationToggle, isVolumeAllDetail, setIsVolumeAllDetail } = useBucketVolumeStore(
    (state) => state,
  );
  const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
  const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
  const [allocation, setAllocation] = useState<{ label: string; value: number } | undefined>();
  const [unusedType, setUnusedType] = useState<{ label: string; value: string } | undefined>();
  const [errName, setErrName] = useState(true);
  const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const changeVolName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setVolumeDetail((prev: objectType) => ({ ...prev, volumeName: e?.target?.value }));
      setAdvancedVolumeDetail((prev: objectType) => ({ ...prev, volumeName: e?.target?.value }));
      if (e?.target?.value !== '') {
        setErrName(true);
      } else {
        setErrName(false);
      }
    },
    [setAdvancedVolumeDetail, setVolumeDetail],
  );

  const onVolAllocationChange = (v: unknown): void => {
    if (typeof v !== 'number') {
      return;
    }

    setVolumeDetail((prev: objectType) => ({ ...prev, volumeAllocation: v }));
    const volumeTypeObject = volAllocationList?.find(
      (item: { label: string; value?: number }) => item?.value === v,
    )?.label;
    setAdvancedVolumeDetail((prev: objectType) => ({
      ...prev,
      volumeAllocation: volumeTypeObject,
    }));
    if (v === LOCAL_TYPE_VALUE) {
      setToggleNextBtn(true);
    } else {
      setToggleNextBtn(false);
    }
  };

  const onUnusedBucketListChange = (e: unknown): void => {
    if (typeof e !== 'string') {
      return;
    }

    const selectedBucketDetail = isVolumeAllDetail?.filter(
      (item: objectType) => item?.uuid === e,
    )[0];
    setAdvancedVolumeDetail((prev: objectType) => ({
      ...prev,
      bucketName: selectedBucketDetail?.bucketName,
      unusedBucketType: selectedBucketDetail?.storeType,
      bucketId: selectedBucketDetail?.uuid,
    }));
  };

  const getBucketListType = useCallback((): void => {
    listS3Connector().then((values) => {
      const connectors: Array<objectType> = values.map((items) => ({
        uuid: items.uuid,
        label: items.label || '',
        bucketName: items.bucketName || '',
        storeType: (items as unknown as { storeType?: string }).storeType || 'S3',
        notes: items.notes || '',
      }));

      const volUnusedBucketList: Array<{ label: string; value: string }> = [];
      const allData = connectors
        .filter(
          (items: objectType) =>
            !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
        )
        .map((items: objectType) => {
          const volumeObject: string | undefined = bucketTypeItems?.find(
            (s) => s?.value?.toLowerCase() === items?.storeType?.toLowerCase(),
          )?.label;
          volUnusedBucketList.push({
            label: `${volumeObject} | ${items?.label}`,
            value: items?.uuid,
          });
          return items;
        });
      setIsVolumeAllDetail(allData);
      setBackupUnusedBucketList(volUnusedBucketList);
    });
  }, [bucketTypeItems, setIsVolumeAllDetail]);

  useEffect(() => {
    const volumeTypeObject = volAllocationList?.find(
      (item: { label: string; value?: number }) => item?.value === volumeDetail?.volumeAllocation,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                selection={unusedType || backupUnusedBucketList[0]!}
                onChange={onUnusedBucketListChange}
              />
            </Row>
          )}
      </Container>
    </>
  );
};

export default AdvancedMailstoresDefinition;
