/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Input,
  LabeledValue,
  ListRow,
  Padding,
  Row,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { isEmpty } from 'lodash-es';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BackupArchivingStore, BucketItem, SelectOption } from '../../../../../types';
import {
  LOCAL_VALUE,
  MANAGE_EXTERNAL_VOLUME,
  MOUNTPOINT,
  MOVE_TO_EXTERNAL_BUCKET,
  MOVE_TO_LOCAL_MOUNT_POINT,
  S3,
  S3_BUCKET,
} from '../../../../constants';
import { useListBuckets } from '../../../../services/use-list-buckets';
import { useMigrateVolume } from '../../../../services/use-migrate-volume';
import type { BackupConfigFormApi } from '../types';

type VolumeManagementProps = {
  form: BackupConfigFormApi;
  allowSetBackup: boolean;
  isBackupInitialized: boolean;
  serverName: string;
  backupArchivingStore: BackupArchivingStore;
  isBackArchivingStoreEmpty: boolean;
};

function getManageExternalVolumeBucketList(
  selectedManageBucketId: string,
  bucketListOption: Array<SelectOption>,
  matchedBucket: BucketItem | undefined,
): SelectOption {
  if (selectedManageBucketId) {
    return bucketListOption.find((opt) => opt.value === selectedManageBucketId) ?? ({} as SelectOption);
  }
  if (matchedBucket) {
    return { label: `${matchedBucket?.storeType} | ${matchedBucket?.bucketName}`, value: matchedBucket?.uuid };
  }
  return {} as SelectOption;
}

export const VolumeManagement = ({
  form,
  allowSetBackup,
  isBackupInitialized,
  serverName,
  backupArchivingStore,
  isBackArchivingStoreEmpty,
}: VolumeManagementProps) => {
  const [t] = useTranslation();
  const migrateMutation = useMigrateVolume(serverName);
  const createSnackbar = useSnackbar();
  const { data: bucketData } = useListBuckets(serverName);

  const bucketList: Array<BucketItem> = bucketData?.buckets ?? [];
  const bucketListOption: Array<SelectOption> = bucketList.map((item) => ({
    label: `${item?.storeType} | ${item?.bucketName}`,
    value: item?.uuid,
  }));

  const [isShowSetExternalVolume, setIsShowSetExternalVolume] = useState(false);
  const [isManageExternalVolumeEnable, setIsManageExternalVolumeEnable] = useState(false);
  const [externalVolume, setExternalVolume] = useState<SelectOption>({
    label: t('label.mountpoint', 'Mountpoint'),
    value: MOUNTPOINT,
  });
  const [destinationSelected, setDestinationSelected] = useState<SelectOption>({
    label: t('label.manage_external_volume_and_move_all', 'MANAGE EXTERNAL VOLUME and Move All Items to Local Path'),
    value: MANAGE_EXTERNAL_VOLUME,
  });
  const [selectedBucketId, setSelectedBucketId] = useState<string>('');
  const [selectedManageBucketId, setSelectedManageBucketId] = useState<string>('');
  const [manageExternalVolumeNewLocalMountpoint, setManageExternalVolumeNewLocalMountpoint] =
    useState('');
  const [rootVolumePath, setRootVolumePath] = useState('');

  const externalVolumeOptions: Array<SelectOption> = [
    { label: t('label.mountpoint', 'Mountpoint'), value: MOUNTPOINT },
    { label: t('label.s3_bucket', 'S3 Bucket'), value: S3_BUCKET },
  ];

  const destinationOptions: Array<SelectOption> = [
    {
      label: t('label.manage_external_volume_and_move_all', 'MANAGE EXTERNAL VOLUME and Move All Items to Local Path'),
      value: MANAGE_EXTERNAL_VOLUME,
    },
    { label: t('label.move_item_to_an_external_bucket', 'Move Items to an External Bucket'), value: MOVE_TO_EXTERNAL_BUCKET },
    { label: t('label.move_item_to_a_local_mountpoint', 'Move Items to a Local Mountpoint'), value: MOVE_TO_LOCAL_MOUNT_POINT },
  ];

  const manageExternalVolumeType = backupArchivingStore?.storeType ?? '';
  const manageExternalVolumeLocalMountpoint = backupArchivingStore?.volumeRootPath ?? '';

  const matchedBucket =
    !isEmpty(backupArchivingStore) && backupArchivingStore?.bucketConfigurationId
      ? bucketList.find((item) => item?.uuid === backupArchivingStore?.bucketConfigurationId)
      : undefined;

  const bucketConfiguration: SelectOption = selectedBucketId
    ? bucketListOption.find((opt) => opt.value === selectedBucketId) ?? bucketListOption[0] ?? ({} as SelectOption)
    : bucketListOption[0] ?? ({} as SelectOption);

  const manageExternalVolumeBucketList: SelectOption = getManageExternalVolumeBucketList(
    selectedManageBucketId,
    bucketListOption,
    matchedBucket,
  );

  const onMigrate = (body: Record<string, unknown>) => {
    migrateMutation.mutate(body, {
      onSuccess: (res) => {
        if (res?.error?.details) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: res?.error?.message ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        } else {
          setIsShowSetExternalVolume(false);
          setIsManageExternalVolumeEnable(false);
          createSnackbar({
            key: 'info',
            severity: 'info',
            label: t('label.operation_now_in_queue', 'The operation is now in the queue'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        }
      },
    });
  };

  const onSaveSetExternal = () => {
    const body: Record<string, unknown> = {
      storeType: externalVolume?.value === MOUNTPOINT ? LOCAL_VALUE : S3,
      volumeRootPath: externalVolume?.value === MOUNTPOINT ? rootVolumePath : '',
      bucketConfigurationId: externalVolume?.value === MOUNTPOINT ? '' : bucketConfiguration?.value,
      targetServers: [serverName],
    };
    if (externalVolume?.value === S3_BUCKET) {
      body.useInfrequentAccess = true;
      body.infrequentAcccessThreshold = 0;
      body.useIntelligentTiering = true;
    }
    onMigrate(body);
  };

  const onSaveManageExternalVolume = () => {
    const body: Record<string, unknown> = {};
    if (isManageExternalVolumeEnable && destinationSelected?.value === MANAGE_EXTERNAL_VOLUME) {
      body.storeType = 'default';
      body.backup_volume_decommission = true;
    } else if (
      isManageExternalVolumeEnable &&
      destinationSelected?.value === MOVE_TO_EXTERNAL_BUCKET
    ) {
      body.bucketConfigurationId = manageExternalVolumeBucketList?.value;
      body.storeType = 'S3';
    } else if (
      isManageExternalVolumeEnable &&
      destinationSelected?.value === MOVE_TO_LOCAL_MOUNT_POINT
    ) {
      body.volumeRootPath = manageExternalVolumeNewLocalMountpoint;
      body.storeType = 'LOCAL';
    }
    body.targetServers = [serverName];
    onMigrate(body);
  };

  const isSetManageExternalButtonVisible = isManageExternalVolumeEnable || isShowSetExternalVolume;

  return (
    <>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <form.Field name="backupDestPath">
            {(field) => (
              <Input
                isRequired
                label={t(
                  'backup.local_volume_reload_if_you_changed_this_value',
                  'Local Volume (reload if you changed this value)',
                )}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ top: 'large' }}>
          <form.Field name="spaceThreshold">
            {(field) => (
              <Input
                label={t('backup.space_threshold_mb', 'Space Threshold (MB)')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                disabled={!allowSetBackup}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
      {!isBackArchivingStoreEmpty && (
        <Container>
          <ListRow>
            <Container padding={{ top: 'large' }}>
              <LabeledValue
                label={t('backup.external_volume', 'External Volume')}
                value={manageExternalVolumeType}
                backgroundColor="gray5"
              />
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ top: 'large', bottom: 'large' }}>
              <LabeledValue
                label={t('backup.bucket_configuration', 'Bucket Configuration')}
                value={
                  manageExternalVolumeType.startsWith('LOCAL')
                    ? manageExternalVolumeLocalMountpoint
                    : manageExternalVolumeBucketList?.label
                }
                backgroundColor="gray5"
              />
            </Container>
          </ListRow>
        </Container>
      )}
      {isShowSetExternalVolume && (
        <ListRow>
          <Container padding={{ top: 'large', bottom: 'large' }}>
            <Select
              items={externalVolumeOptions}
              background="gray5"
              label={t('label.select_an_external_volume', 'Select an External Volume')}
              showCheckbox={false}
              onChange={(v) => {
                const it = externalVolumeOptions.find((item) => item.value === v);
                if (it) setExternalVolume(it);
              }}
              selection={externalVolume}
              disabled={!allowSetBackup}
            />
          </Container>
        </ListRow>
      )}
      {isShowSetExternalVolume && externalVolume?.value === MOUNTPOINT && (
        <Container>
          <Input
            label={t('label.path', 'Path')}
            value={rootVolumePath || ''}
            backgroundColor="gray5"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRootVolumePath(e.target.value)}
          />
        </Container>
      )}
      {isShowSetExternalVolume && externalVolume?.value === S3_BUCKET && (
        <Select
          items={bucketListOption}
          background="gray5"
          label={t('label.select_a_bucket_configuration', 'Select a Bucket Configuration')}
          showCheckbox={false}
          selection={bucketConfiguration}
          onChange={(v) => setSelectedBucketId(v ?? '')}
          disabled={!allowSetBackup}
        />
      )}
      {isShowSetExternalVolume && (
        <Row padding={{ all: 'large' }} width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
          <Padding right="small">
            <Button
              label={t('label.cancel', 'Cancel')}
              color="secondary"
              onClick={() => setIsShowSetExternalVolume(false)}
              disabled={!allowSetBackup}
            />
          </Padding>
          <Button
            label={t('label.migrate', 'Migrate')}
            color="primary"
            onClick={onSaveSetExternal}
            disabled={migrateMutation.isPending || !allowSetBackup}
            loading={migrateMutation.isPending}
          />
        </Row>
      )}
      {isManageExternalVolumeEnable && (
        <ListRow>
          <Container padding={{ bottom: 'large' }}>
            <Select
              items={destinationOptions}
              background="gray5"
              label={t('label.destination', 'Destination')}
              showCheckbox={false}
              onChange={(v) => {
                const it = destinationOptions.find((item) => item.value === v);
                if (it) setDestinationSelected(it);
              }}
              selection={destinationSelected}
              disabled={!allowSetBackup}
            />
          </Container>
        </ListRow>
      )}
      {isManageExternalVolumeEnable && destinationSelected?.value === MOVE_TO_EXTERNAL_BUCKET && (
        <Container>
          <ListRow>
            <Container padding={{ bottom: 'large' }}>
              <Select
                items={bucketListOption}
                background="gray5"
                label={t('backup.bucket_list', 'Buckets List')}
                showCheckbox={false}
                selection={manageExternalVolumeBucketList}
                onChange={(v) => setSelectedManageBucketId(v ?? '')}
                disabled={!allowSetBackup}
              />
            </Container>
          </ListRow>
        </Container>
      )}
      {isManageExternalVolumeEnable && destinationSelected?.value === MOVE_TO_LOCAL_MOUNT_POINT && (
        <Container>
          <ListRow>
            <Container padding={{ bottom: 'large' }}>
              <Input
                isRequired
                label={t('backup.local_mountpoint', 'Local Mountpoint')}
                value={manageExternalVolumeNewLocalMountpoint || ''}
                backgroundColor="gray5"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setManageExternalVolumeNewLocalMountpoint(e.target.value)
                }
              />
            </Container>
          </ListRow>
        </Container>
      )}
      {isManageExternalVolumeEnable && (
        <Row width="100%">
          <Container padding={{ right: 'extrasmall' }} mainAlignment="flex-start" crossAlignment="flex-start" width="50%">
            <Button
              label={t('label.cancel', 'Cancel')}
              color="secondary"
              width="fill"
              onClick={() => setIsManageExternalVolumeEnable(false)}
              disabled={!allowSetBackup}
            />
          </Container>
          <Button
            label={t('label.migrate', 'Migrate')}
            color="primary"
            width="fit"
            onClick={onSaveManageExternalVolume}
            disabled={migrateMutation.isPending || !allowSetBackup}
            loading={migrateMutation.isPending}
          />
        </Row>
      )}
      <ListRow>
        <Container padding={{ top: 'large' }} style={{ display: 'block' }}>
          {!isSetManageExternalButtonVisible && (
            <Button
              type="outlined"
              label={
                isBackArchivingStoreEmpty
                  ? t('backup.set_external_volume', 'Set external volume')
                  : t('backup.manage_external_volume', 'Manage external volume')
              }
              color="primary"
              icon="HardDriveOutline"
              iconPlacement="right"
              size="large"
              style={{ width: '100%' }}
              width="fill"
              disabled={!isBackupInitialized || !allowSetBackup}
              onClick={() => {
                if (isBackArchivingStoreEmpty) {
                  setIsShowSetExternalVolume(true);
                  setIsManageExternalVolumeEnable(false);
                } else {
                  setIsManageExternalVolumeEnable(true);
                  setIsShowSetExternalVolume(false);
                }
              }}
            />
          )}
        </Container>
      </ListRow>
    </>
  );
};
