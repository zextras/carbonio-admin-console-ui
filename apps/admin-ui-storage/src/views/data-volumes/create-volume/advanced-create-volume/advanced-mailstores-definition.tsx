/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, Padding, Row, Select } from '@zextras/ui-components';
import { type ChangeEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { S3ConnectorVolume, VolumeAllocationItem } from '../../../../../types';
import {
  EXTERNAL_TYPE_VALUE,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
} from '../../../../constants';
import { useListS3Connectors } from '../../../../services/use-list-s3-connectors';
import { S3ConnectorTypeItems, volumeAllocationList } from '../../../utility/utils';
import { VolumeContext } from '../volume-context';
import { useAdvancedVolumeContext } from './create-advanced-volume-context';
import styles from './create-volume.module.css';

type AdvancedMailstoresDefinitionProps = {
  readonly externalData: string;
};

export function AdvancedMailstoresDefinition({
  externalData,
}: AdvancedMailstoresDefinitionProps) {
  const { t } = useTranslation();
  const { form: volumeForm } = useContext(VolumeContext);
  const { form } = useAdvancedVolumeContext();
  const { data: connectors = [] } = useListS3Connectors();
  const volAllocationList = volumeAllocationList(t);
  const connectorTypeItems = S3ConnectorTypeItems(t);
  const [errName, setErrName] = useState(true);

  const isVolumeAllDetail: Array<S3ConnectorVolume> = connectors
    .map((items) => ({
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
    }))
    .filter(
      (items: S3ConnectorVolume) =>
        !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
    );

  function getConnectorTypeLabel(storeType: string | undefined): string | undefined {
    return connectorTypeItems?.find(
      (item) => item?.value?.toLowerCase() === storeType?.toLowerCase(),
    )?.label;
  }

  const backupUnusedConnectorList: Array<{ label: string; value: string }> = isVolumeAllDetail.map(
    (items: S3ConnectorVolume) => {
      const volumeObject = getConnectorTypeLabel(items?.storeType);
      return {
        label: `${volumeObject} | ${items?.label}`,
        value: items?.uuid ?? '',
      };
    },
  );

  const volumeName = useSelector(form.store, (s) => s.values.volumeName);
  const volumeAllocation = useSelector(form.store, (s) => s.values.volumeAllocation);
  const bucketId = useSelector(form.store, (s) => s.values.bucketId);
  const basicVolumeAllocation = useSelector(volumeForm.store, (s) => s.values.volumeAllocation);

  const allocation = volAllocationList?.find(
    (item: VolumeAllocationItem) => item?.value === basicVolumeAllocation,
  );
  const unusedType = backupUnusedConnectorList?.find((item) => item?.value === bucketId);

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

  const onUnusedConnectorListChange = (e: unknown): void => {
    if (typeof e !== 'string') {
      return;
    }

    const selectedConnectorDetail = isVolumeAllDetail?.find(
      (item: S3ConnectorVolume) => item?.uuid === e,
    );
    form.setFieldValue('bucketName', selectedConnectorDetail?.bucketName ?? '');
    form.setFieldValue('unusedBucketType', selectedConnectorDetail?.storeType ?? '');
    form.setFieldValue('bucketId', selectedConnectorDetail?.uuid ?? '');
    form.setFieldValue('tieringSupported', selectedConnectorDetail?.tieringSupported ?? false);
    if (!selectedConnectorDetail?.tieringSupported) {
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

    const defaultConnector = backupUnusedConnectorList?.[0]?.value;
    if (typeof defaultConnector === 'string' && defaultConnector !== '') {
      onUnusedConnectorListChange(defaultConnector);
    }
  }, [bucketId, backupUnusedConnectorList, onUnusedConnectorListChange, basicVolumeAllocation]);

  return (
    <Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
      <Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start" crossAlignment="flex-start">
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
      {basicVolumeAllocation === EXTERNAL_TYPE_VALUE && backupUnusedConnectorList?.length !== 0 && (
        <Row padding={{ top: 'large' }} width="100%">
          <Select
            items={backupUnusedConnectorList}
            background="gray5"
            label={t(
              'label.volume_available_unused_Buckets_list_in_backup',
              'Available Buckets List (that are not in use in the backup)',
            )}
            showCheckbox={false}
            selection={unusedType || backupUnusedConnectorList[0]}
            onChange={onUnusedConnectorListChange}
          />
        </Row>
      )}
    </Container>
  );
}
