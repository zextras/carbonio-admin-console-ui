/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { S3ConnectorVolume, Volume } from '../../../../types';
import { useGetVolume } from '../../../services/use-get-volume';
import { useGetVolumeAdvanced } from '../../../services/use-get-volume-advanced';
import { useListS3Connectors } from '../../../services/use-list-s3-connectors';
import { useShowErrorSnackbar } from '../../../services/use-show-error-snackbar';
import { ModifyVolumeForm } from './modify-volume-form';

type VolumeDetailSnapshot = {
  name: string;
  id: number;
  type: number;
  compressBlobs: boolean;
  isCurrent: boolean;
  rootpath: string;
  compressionThreshold: string;
};

function getVolumeConnectorConfigurationId(volume: Volume | undefined): string | undefined {
  return volume?.bucketConfigurationId ?? volume?.uuid;
}

function isExternalVolume(volume: Volume | undefined): boolean {
  return (
    Boolean(getVolumeConnectorConfigurationId(volume)) ||
    (volume?.storeType !== undefined && volume.storeType.toUpperCase() !== 'LOCAL')
  );
}

function getNormalizedVolumeType(volData: Volume, isAdvanced: boolean): number {
  if (isAdvanced && volData?.volumeType) {
    const volumeTypeStr = volData.volumeType?.toLowerCase();
    if (volumeTypeStr === 'primary') return 1;
    if (volumeTypeStr === 'secondary') return 2;
    if (volumeTypeStr === 'index') return 10;
  }
  return volData?.type ?? 0;
}

function buildVolumeDetail(
  volData: Volume,
  isAdvanced: boolean,
): VolumeDetailSnapshot {
  return {
    name: volData.name ?? '',
    id: volData.id ?? 0,
    type: getNormalizedVolumeType(volData, isAdvanced),
    compressBlobs: isAdvanced
      ? volData.compressBlobs === 'true' || volData.compressBlobs === '1'
      : Boolean(volData.compressBlobs),
    isCurrent: isAdvanced
      ? volData.isCurrent === true || volData.isCurrent === 1
      : Boolean(volData.isCurrent),
    rootpath: isAdvanced ? (volData.path ?? '') : (volData.rootpath ?? ''),
    compressionThreshold: isAdvanced
      ? (volData.compressionThreshold ?? '')
      : String(volData.compressionThreshold ?? ''),
  };
}

function isVolumeInUse(volume: Volume | undefined): boolean {
  const value = volume?.inUse;
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function ModifyVolume({
  volumeId,
  volumeName,
  setmodifyVolumeToggle,
  getAllVolumesRequest,
  selectedServerId,
  volumeList,
  setOpen,
}: Readonly<{
  volumeId: string | number | undefined;
  volumeName?: string;
  setmodifyVolumeToggle: (newValue: boolean) => void;
  getAllVolumesRequest: () => void;
  selectedServerId: string | number | undefined;
  volumeList: {
    primaries: Volume[];
    indexes: Volume[];
    secondaries: Volume[];
  };
  setOpen: (newValue: boolean) => void;
}>) {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const { server } = useParams<{ server: string }>();

  const { data: s3Connectors = [] } = useListS3Connectors();

  const selectedVolumeFromList: Volume | undefined = [
    ...volumeList.primaries,
    ...volumeList.secondaries,
    ...volumeList.indexes,
  ].find((v: Volume) => v?.id === Number(volumeId));

  const selectedVolumeName = volumeName ?? selectedVolumeFromList?.name ?? '';

  const getVolumeQuery = useGetVolume(
    String(volumeId ?? ''),
    String(selectedServerId ?? ''),
    !isAdvanced && Boolean(volumeId),
  );

  const getAdvancedVolumeQuery = useGetVolumeAdvanced(
    String(selectedVolumeName ?? ''),
    String(server ?? ''),
    isAdvanced && Boolean(selectedVolumeName) && Boolean(server),
  );

  const activeVolumeQuery = isAdvanced ? getAdvancedVolumeQuery : getVolumeQuery;

  useShowErrorSnackbar(activeVolumeQuery, {
    label: t('label.volume_detail_error', '{{message}}', {
      message: 'Something went wrong, please try again',
    }),
    onAction: getAllVolumesRequest,
  });

  const volData: Volume | undefined = isAdvanced
    ? getAdvancedVolumeQuery.data ?? selectedVolumeFromList
    : getVolumeQuery.data?.volume?.[0];

  const volumeDetail: VolumeDetailSnapshot | undefined = volData
    ? buildVolumeDetail(volData, isAdvanced)
    : undefined;

  const isExt = volData ? isExternalVolume(volData) : false;
  const externalVolDetail: Volume = isExt && volData ? volData : {};
  const isExternal = isExt;
  const volumeInUse = isVolumeInUse(volData);

  const sameTypeVolumesByType: Record<number, Array<Volume>> = {
    1: volumeList.primaries,
    2: volumeList.secondaries,
    10: volumeList.indexes,
  };
  const sameTypeVolumes = sameTypeVolumesByType[Number(volumeDetail?.type)] ?? [];
  const currentVolumeName = sameTypeVolumes.find(
    (v) => v?.isCurrent === true || v?.isCurrent === 1,
  )?.name;

  if (!volumeDetail) {
    return (
      <Container background="gray6" mainAlignment="center" orientation="vertical">
        <ds-spinner></ds-spinner>
      </Container>
    );
  }

    return (
    <ModifyVolumeForm
      volumeDetail={volumeDetail}
      externalVolDetail={externalVolDetail}
      isExternal={isExternal}
      isAdvanced={isAdvanced}
      server={server}
      selectedServerId={String(selectedServerId ?? '')}
      s3Connectors={s3Connectors as Array<S3ConnectorVolume>}
      volumeType={volumeDetail.type}
      volumeId={String(volumeId)}
      volumeInUse={volumeInUse}
      currentVolumeName={currentVolumeName}
      setmodifyVolumeToggle={setmodifyVolumeToggle}
      getAllVolumesRequest={getAllVolumesRequest}
      setOpen={setOpen}
    />
  );
}
