/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, useSnackbar } from '@zextras/ui-components';
import { soapFetch, useIsAdvanced, useStickyBarStore } from '@zextras/ui-shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import type { S3ConnectorVolume, Volume } from '../../../../types';
import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { useListS3Connectors } from '../../../services/use-list-s3-connectors';
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

function findExternalVolumeData(
  volumeList: { primaries: Volume[]; secondaries: Volume[]; indexes: Volume[] },
  volumeDetail: VolumeDetailSnapshot,
): { externalVolDetail: Volume; isExternal: boolean } {
  const allVolumes = [...volumeList.primaries, ...volumeList.secondaries, ...volumeList.indexes];
  const volData = allVolumes.find((v: Volume) => v?.id === volumeDetail.id);

  if (volData && isExternalVolume(volData)) {
    return { externalVolDetail: volData, isExternal: true };
  }
  return { externalVolDetail: {}, isExternal: false };
}

export function ModifyVolume({
  volumeId,
  setmodifyVolumeToggle,
  getAllVolumesRequest,
  selectedServerId,
  volumeList,
  setOpen,
}: Readonly<{
  volumeId: any;
  setmodifyVolumeToggle: (newValue: boolean) => void;
  getAllVolumesRequest: () => void;
  selectedServerId: any;
  volumeList: {
    primaries: Volume[];
    indexes: Volume[];
    secondaries: Volume[];
  };
  setOpen: (newValue: boolean) => void;
}>) {
  const { t } = useTranslation();
  const isAdvanced = useIsAdvanced();
  const createSnackbar = useSnackbar();
  const { server } = useParams<{ server: string }>();
  const { isSticky, setIsSticky } = useStickyBarStore();

  const [volumeDetail, setVolumeDetail] = useState<VolumeDetailSnapshot | undefined>();
  const [externalVolDetail, setExternalVolDetail] = useState<Volume>({});
  const [isExternal, setIsExternal] = useState(false);

  const { data: s3Connectors = [] } = useListS3Connectors();

  useEffect(() => {
    if (!volumeId) return;

    if (isAdvanced) {
      const allVolumes = [
        ...volumeList.primaries,
        ...volumeList.secondaries,
        ...volumeList.indexes,
      ];
      const volData = allVolumes.find((v: Volume) => v?.id === Number(volumeId));
      if (volData) {
        const detail: VolumeDetailSnapshot = {
          name: volData.name ?? '',
          id: volData.id ?? 0,
          type: getNormalizedVolumeType(volData, true),
          compressBlobs: volData.compressBlobs === 'true' || volData.compressBlobs === '1',
          isCurrent: volData.isCurrent === true || volData.isCurrent === 1,
          rootpath: volData.path ?? '',
          compressionThreshold: volData.compressionThreshold ?? '',
        };
        setVolumeDetail(detail);
        const { externalVolDetail: extVol, isExternal: isExt } = findExternalVolumeData(
          volumeList,
          detail,
        );
        setExternalVolDetail(extVol);
        setIsExternal(isExt);
        setmodifyVolumeToggle(true);
      }
      return;
    }

    soapFetch(
      'GetVolume',
      {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        id: String(volumeId),
      },
      {
        targetServer: selectedServerId,
      },
    )
      .then((response) => {
        const typedResponse = response as { volume: Volume[]; _jsns: string };
        const volData = typedResponse?.volume[0];
        if (!volData) return;

        const detail: VolumeDetailSnapshot = {
          name: volData.name ?? '',
          id: volData.id ?? 0,
          type: getNormalizedVolumeType(volData, false),
          compressBlobs: Boolean(volData.compressBlobs),
          isCurrent: Boolean(volData.isCurrent),
          rootpath: volData.rootpath ?? '',
          compressionThreshold: String(volData.compressionThreshold ?? ''),
        };
        setVolumeDetail(detail);
        setIsExternal(isExternalVolume(volData));
        setExternalVolDetail(isExternalVolume(volData) ? volData : {});
        setmodifyVolumeToggle(true);
      })
      .catch(() => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.volume_detail_error', '{{message}}', {
            message: 'Something went wrong, please try again',
          }),
          autoHideTimeout: 5000,
        });
        getAllVolumesRequest();
      });
  }, [
    volumeId,
    isAdvanced,
    volumeList,
    selectedServerId,
    setmodifyVolumeToggle,
    createSnackbar,
    t,
    getAllVolumesRequest,
  ]);

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
      setmodifyVolumeToggle={setmodifyVolumeToggle}
      getAllVolumesRequest={getAllVolumesRequest}
      setOpen={setOpen}
      isSticky={isSticky}
      setIsSticky={setIsSticky}
    />
  );
}
