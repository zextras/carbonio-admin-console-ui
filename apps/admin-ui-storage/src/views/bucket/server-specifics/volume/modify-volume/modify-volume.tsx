/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Displayer,
  Input,
  LabeledValue,
  Link,
  ListRow,
  Modal,
  Padding,
  Radio,
  Row,
  Select,
  Switch,
  Tooltip,
  useSnackbar,
} from '@zextras/ui-components';
import { soapFetch, useIsAdvanced, useStickyBarStore } from '@zextras/ui-shared';
import { isEmpty } from 'lodash-es';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  BucketVolume,
  Volume,
  type VolumeAllocationItem,
  VolumeType,
} from '../../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  INDEX,
  LOCAL_VALUE,
  PRIMARY,
  PRIMARY_TYPE_VALUE,
  SECONDARY,
  SECONDARY_TYPE_VALUE,
  UNUSED,
  USAGE_IN_EXTERNAL_BACKUP,
  ZIMBRA_ADMIN_URN,
} from '../../../../../constants';
import { fetchSoap, listS3Connector } from '../../../../../services/bucket-service';
import { BucketTypeItems, volumeAllocationList, volumeTypeList } from '../../../../utility/utils';
import {
  buildAdvancedUpdatePayload,
  isS3StoreType,
} from './modify-volume-payload';
import {
  handleAdvancedUpdateResponse,
  saveCeVolume,
  showVolumeSaveError,
  showVolumeSaveSuccess,
} from './modify-volume-save-handlers';

function buildBucketSelectItems(
  buckets: Array<BucketVolume>,
  getBucketTypeLabel: (storeTypeValue: string | undefined) => string | undefined,
): Array<{ label: string; value: string }> {
  return buckets.map((items) => {
    const volumeObject = getBucketTypeLabel(items?.storeType);
    return {
      label: `${volumeObject} | ${items?.label}`,
      value: items?.uuid ?? '',
    };
  });
}

function getVolumeBucketConfigurationId(volume: Volume | undefined): string | undefined {
  return volume?.bucketConfigurationId ?? volume?.uuid;
}

function isExternalVolume(volume: Volume | undefined): boolean {
  return (
    Boolean(getVolumeBucketConfigurationId(volume)) ||
    (volume?.storeType !== undefined && volume.storeType.toUpperCase() !== LOCAL_VALUE)
  );
}

function syncAdvancedVolumeByType(
  volumeType: number,
  volumes: Volume[],
  volumeDetailType: number | undefined,
  volumeDetailId: number | undefined,
  onExternalVolume: (volDetail: Volume) => void,
  onLocalVolume: () => void,
  setCurrentVolume: (volume: Volume | undefined) => void,
): void {
  if (volumeDetailType !== volumeType) {
    return;
  }

  const volDetail = volumes.find((items) => items?.id === volumeDetailId);
  if (isExternalVolume(volDetail)) {
    onExternalVolume(volDetail as Volume);
  } else {
    onLocalVolume();
  }
  setCurrentVolume(volumes.find((volume) => volume?.isCurrent));
}

type PreviousDetailState = {
  name: string;
  type: number | undefined;
  id: string;
  rootpath: string;
  compressBlobs: boolean;
  isCurrent: boolean;
  compressionThreshold: string;
  volumePrefix: string | undefined;
  infrequentAccessThreshold: number | string | undefined;
  bucketConfigurationId: string | undefined;
  useInfrequentAccess: boolean | undefined;
  useIntelligentTiering: boolean | undefined;
};

type VolumeDetailSnapshot = {
  name: string;
  id: number;
  type: number;
  compressBlobs: boolean;
  isCurrent: boolean;
  rootpath: string;
  compressionThreshold: string;
};

function buildUndoFormState(
  previousDetail: Partial<PreviousDetailState>,
  volumeDetail: VolumeDetailSnapshot,
  externalVolDetail: Volume,
): PreviousDetailState {
  return {
    name: previousDetail.name ?? volumeDetail.name ?? '',
    type: previousDetail.type,
    id: previousDetail.id ?? String(volumeDetail.id ?? ''),
    rootpath: previousDetail.rootpath ?? volumeDetail.rootpath ?? '',
    compressBlobs: previousDetail.compressBlobs ?? volumeDetail.compressBlobs ?? false,
    isCurrent: previousDetail.isCurrent ?? volumeDetail.isCurrent ?? false,
    compressionThreshold:
      previousDetail.compressionThreshold ?? String(volumeDetail.compressionThreshold ?? ''),
    volumePrefix: previousDetail.volumePrefix ?? externalVolDetail?.volumePrefix,
    infrequentAccessThreshold:
      previousDetail.infrequentAccessThreshold ?? externalVolDetail?.infrequentAccessThreshold,
    bucketConfigurationId:
      previousDetail.bucketConfigurationId ?? getVolumeBucketConfigurationId(externalVolDetail),
    useInfrequentAccess:
      previousDetail.useInfrequentAccess ?? externalVolDetail?.useInfrequentAccess,
    useIntelligentTiering:
      previousDetail.useIntelligentTiering ?? externalVolDetail?.useIntelligentTiering,
  };
}

function applyUndoVolumeType(
  previousType: number | undefined,
  volumeDetailType: number,
  volTypeList: VolumeType[] | undefined,
  setType: (type: VolumeAllocationItem | undefined) => void,
): void {
  if (previousType === undefined) {
    const volumeTypeObject = volTypeList?.find(
      (item: VolumeType) => item?.value === volumeDetailType,
    );
    setType(volumeTypeObject as VolumeAllocationItem);
    return;
  }

  const volumeObject = volTypeList?.find(
    (item: VolumeType) => item?.value === previousType,
  ) as VolumeAllocationItem | undefined;
  setType(volumeObject);
}

const ModifyVolume: FC<{
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
}> = ({
  volumeId,
  setmodifyVolumeToggle,
  getAllVolumesRequest,
  selectedServerId,
  volumeList,
  setOpen,
}) => {
  const { t } = useTranslation();

  const isAdvanced = useIsAdvanced();
  const volTypeList = useMemo(() => volumeTypeList(t, isAdvanced), [t, isAdvanced]);
  const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
  const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
  const [isDirty, setIsDirty] = useState(false);
  const [volumeDetail, setVolumeDetail] = useState<{
    name: string;
    id: number;
    type: number;
    compressBlobs: boolean;
    isCurrent: boolean;
    rootpath: string;
    compressionThreshold: string;
  }>({
    name: '',
    id: 0,
    type: 0,
    compressBlobs: false,
    isCurrent: false,
    rootpath: '',
    compressionThreshold: '',
  });
  const [name, setName] = useState<string>(volumeDetail?.name ?? '');
  const [type, setType] = useState<VolumeAllocationItem>();
  const [id, setId] = useState<string>(String(volumeDetail?.id ?? ''));
  const [rootpath, setRootpath] = useState<string>(volumeDetail?.rootpath ?? '');
  const [compressBlobs, setCompressBlobs] = useState<boolean>(volumeDetail?.compressBlobs ?? false);
  const [isCurrent, setIsCurrent] = useState<boolean>(volumeDetail?.isCurrent ?? false);
  const isCurrentRef = useRef<HTMLDivElement>(null);
  const [compressionThreshold, setCompressionThreshold] = useState<string>(
    String(volumeDetail?.compressionThreshold ?? ''),
  );
  const [previousDetail, setPreviousDetail] = useState<Partial<PreviousDetailState>>({});
  const [externalVolDetail, setExternalVolDetail] = useState<Volume>({});
  const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedBucket, setSelectedBucket] = useState<{ label: string; value: string } | undefined>();
  const [allocation, setAllocation] = useState<VolumeAllocationItem>();
  const [bucketName, setBucketName] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [bucketConfigurationId, setBucketConfigurationId] = useState<string | undefined>();
  const [tieringSupported, setTieringSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volumePrefix, setVolumePrefix] = useState<string | undefined>(
    externalVolDetail?.volumePrefix,
  );
  const [useInfrequentAccess, setUseInfrequentAccess] = useState<boolean | undefined>(
    externalVolDetail?.useInfrequentAccess,
  );
  const [useIntelligentTiering, setUseIntelligentTiering] = useState<boolean | undefined>(
    externalVolDetail?.useIntelligentTiering,
  );
  const [infrequentAccessThreshold, setInfrequentAccessThreshold] = useState<
    number | string | undefined
  >(externalVolDetail?.infrequentAccessThreshold);
  const [isCurrentToggle, setIsCurrentToggle] = useState<boolean>(false);
  const [currentVolume, setCurrentVolume] = useState<Volume>();
  const createSnackbar = useSnackbar();
  const { server } = useParams<{ server: string }>();
  const [isVolumeAllDetail, setIsVolumeAllDetail] = useState<Array<BucketVolume>>([]);
  const { isSticky, setIsSticky } = useStickyBarStore();

  const showTieringSettings = isS3StoreType(storeType) && tieringSupported;

  const labelMap: Record<number | string, string> = {
    1: PRIMARY,
    2: SECONDARY,
    10: INDEX,
  };

  const getBucketTypeLabel = useCallback(
    (storeTypeValue: string | undefined): string | undefined =>
      bucketTypeItems?.find(
        (item) => item?.value?.toLowerCase() === storeTypeValue?.toLowerCase(),
      )?.label,
    [bucketTypeItems],
  );

  function resetTieringFields(): void {
    setUseInfrequentAccess(false);
    setUseIntelligentTiering(false);
    setInfrequentAccessThreshold('');
  }

  function applyConnectorTiering(connector: BucketVolume | undefined): void {
    const supportsTiering = connector?.tieringSupported === true;
    setTieringSupported(supportsTiering);

    if (!supportsTiering) {
      resetTieringFields();
    }
  }

  const onUnusedBucketListChange = useCallback(
    (value: unknown): void => {
      if (typeof value !== 'string') {
        return;
      }

      const selectedBucketDetail = isVolumeAllDetail?.find(
        (item: BucketVolume) => item?.uuid === value,
      );
      const bucketOption = backupUnusedBucketList.find((item) => item.value === value);

      setSelectedBucket(bucketOption);
      setBucketName(selectedBucketDetail?.bucketName ?? '');
      setStoreType(selectedBucketDetail?.storeType ?? '');
      setBucketConfigurationId(selectedBucketDetail?.uuid ?? '');
      applyConnectorTiering(selectedBucketDetail);
    },
    [backupUnusedBucketList, isVolumeAllDetail],
  );

  function onInfrequentAccessToggle(): void {
    const newValue = !useInfrequentAccess;
    setUseInfrequentAccess(newValue);
    if (newValue) {
      setUseIntelligentTiering(false);
      return;
    }
    setInfrequentAccessThreshold('');
  }

  function onIntelligentTieringToggle(): void {
    const newValue = !useIntelligentTiering;
    setUseIntelligentTiering(newValue);
    if (newValue) {
      setUseInfrequentAccess(false);
    }
  }

  function hydrateExternalVolumeFields(volDetail: Volume): void {
    const bucketId = getVolumeBucketConfigurationId(volDetail);

    setExternalVolDetail({
      ...volDetail,
      bucketConfigurationId: bucketId,
    });
    setBucketConfigurationId(bucketId);
    setVolumePrefix(volDetail?.volumePrefix);
    setStoreType(volDetail?.storeType);
    setTieringSupported(volDetail.tieringSupported === true);
    setUseInfrequentAccess(volDetail?.useInfrequentAccess);
    setUseIntelligentTiering(volDetail?.useIntelligentTiering);
    setInfrequentAccessThreshold(volDetail?.infrequentAccessThreshold);
  }

  const updatePreviousDetail = (): void => {
    const latestData: PreviousDetailState = {
      name,
      type: type?.value,
      id,
      rootpath,
      compressBlobs,
      isCurrent,
      compressionThreshold,
      volumePrefix,
      infrequentAccessThreshold,
      bucketConfigurationId,
      useInfrequentAccess,
      useIntelligentTiering,
    };
    setPreviousDetail(latestData);
    setIsDirty(false);
  };

  const onSave = async (): Promise<void> => {
    setIsLoading(true);

    const finishSaveSuccess = (): void => {
      showVolumeSaveSuccess(createSnackbar, t);
      getAllVolumesRequest();
      setmodifyVolumeToggle(false);
      setIsLoading(false);
    };

    const finishSaveError = (): void => {
      showVolumeSaveError(createSnackbar, t);
      setmodifyVolumeToggle(false);
      setIsLoading(false);
    };

    try {
      if (isAdvanced) {
        const obj = buildAdvancedUpdatePayload(server ?? '', volumeDetail?.name, labelMap, {
          name,
          typeValue: type?.value,
          id,
          isCurrent,
          storeType,
          externalVolDetail,
          rootpath,
          compressBlobs,
          compressionThreshold,
          volumePrefix,
          bucketConfigurationId,
          useInfrequentAccess,
          infrequentAccessThreshold,
          useIntelligentTiering,
        });
        const res = await fetchSoap('zextras', obj);
        handleAdvancedUpdateResponse(res, server ?? '', {
          onSuccess: finishSaveSuccess,
          onError: finishSaveError,
        });
      } else {
        await saveCeVolume(
          {
            id,
            name,
            rootpath,
            typeValue: type?.value,
            compressBlobs,
            compressionThreshold,
            isCurrent,
          },
          selectedServerId,
          createSnackbar,
          t,
          {
            onSuccess: finishSaveSuccess,
            onModifyError: finishSaveError,
            onSetCurrentError: (): void => setIsLoading(false),
          },
        );
      }
    } catch {
      finishSaveError();
    }

    updatePreviousDetail();
  };

  const onUndo = (): void => {
    const undoState = buildUndoFormState(previousDetail, volumeDetail, externalVolDetail);

    setName(undoState.name);
    applyUndoVolumeType(undoState.type, volumeDetail.type, volTypeList, setType);
    setId(undoState.id);
    setRootpath(undoState.rootpath);
    setCompressBlobs(undoState.compressBlobs);
    setIsCurrent(undoState.isCurrent);
    setCompressionThreshold(undoState.compressionThreshold);
    setBucketConfigurationId(undoState.bucketConfigurationId);
    setVolumePrefix(undoState.volumePrefix);
    setInfrequentAccessThreshold(undoState.infrequentAccessThreshold);
    setUseInfrequentAccess(undoState.useInfrequentAccess);
    setUseIntelligentTiering(undoState.useIntelligentTiering);
    setIsDirty(false);
  };

  const onVolumeTypeChange = useCallback(
    (typeValue: number | null): void => {
      const volumeObject: VolumeAllocationItem | undefined = volTypeList?.find(
        (item: VolumeType): boolean => item?.value === typeValue,
      ) as VolumeAllocationItem | undefined;
      setType(volumeObject);
    },
    [volTypeList],
  );
  const buttons = [
    {
      align: 'right' as const,
      color: 'error',
      label: t('label.delete', 'delete'),
      loading: !volumeDetail?.id,
      onClick: (): void => {
        setOpen(true);
      },
    },
    {
      align: 'left' as const,
      icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
      onClick: (): void => {
        setIsSticky(!isSticky);
      },
    },
  ];

  const getAllBuckets = useCallback(() => {
    listS3Connector().then((values) => {
      const connectors: Array<BucketVolume> = values.map((items) => ({
        uuid: items.uuid,
        label: items.label || '',
        bucketName: items.bucketName || '',
        storeType: (items as unknown as { storeType?: string }).storeType || 'S3',
        tieringSupported:
          (items as unknown as { tieringSupported?: boolean }).tieringSupported ?? false,
        [USAGE_IN_EXTERNAL_BACKUP]:
          (items as unknown as { 'usage in external backup'?: string | Array<string> })[
            'usage in external backup'
          ] ?? UNUSED,
      }));

      if (connectors.length === 0) {
        return;
      }

      const currentBucketId = getVolumeBucketConfigurationId(externalVolDetail);
      const selectedConnector = connectors.find((bucket) => bucket?.uuid === currentBucketId);
      setBucketName(selectedConnector?.bucketName || '');
      setStoreType(externalVolDetail?.storeType ?? selectedConnector?.storeType);
      setBucketConfigurationId(currentBucketId);
      setTieringSupported(
        selectedConnector?.tieringSupported ?? externalVolDetail.tieringSupported ?? false,
      );

      const unusedConnectors = connectors.filter(
        (items) => !items[USAGE_IN_EXTERNAL_BACKUP] || items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED,
      );
      const selectableConnectors =
        currentBucketId && !unusedConnectors.some((item) => item.uuid === currentBucketId)
          ? [
              ...unusedConnectors,
              ...(selectedConnector ? [selectedConnector] : []),
            ]
          : unusedConnectors;
      const volUnusedBucketList = buildBucketSelectItems(selectableConnectors, getBucketTypeLabel);
      const currentBucketOption = volUnusedBucketList.find((item) => item.value === currentBucketId);

      setIsVolumeAllDetail(selectableConnectors);
      setBackupUnusedBucketList(volUnusedBucketList);
      setSelectedBucket(currentBucketOption);
    }).catch(() => undefined);
  }, [
    externalVolDetail,
    getBucketTypeLabel,
    setIsVolumeAllDetail,
  ]);

  useEffect(() => {
    if (volumeDetail !== undefined && volumeDetail?.name !== name) {
      setIsDirty(true);
    }

    if (
      externalVolDetail?.name !== undefined &&
      name !== undefined &&
      externalVolDetail?.name !== name
    ) {
      setIsDirty(true);
    }
  }, [externalVolDetail, name, volumeDetail]);

  useEffect(() => {
    if (
      volumeDetail !== undefined &&
      type?.value !== undefined &&
      volumeDetail?.type !== type?.value
    ) {
      setIsDirty(true);
    }
  }, [type?.value, volumeDetail]);

  useEffect(() => {
    if (volumeDetail !== undefined && String(volumeDetail?.id) !== id) {
      setIsDirty(true);
    }
  }, [volumeDetail, id]);

  useEffect(() => {
    if (volumeDetail !== undefined && volumeDetail?.rootpath !== rootpath) {
      setIsDirty(true);
    }
  }, [volumeDetail, rootpath]);

  useEffect(() => {
    if (volumeDetail !== undefined && volumeDetail?.compressBlobs !== compressBlobs) {
      setIsDirty(true);
    }
  }, [volumeDetail, compressBlobs]);

  useEffect(() => {
    if (volumeDetail !== undefined && volumeDetail?.isCurrent !== isCurrent) {
      setIsDirty(true);
    }
  }, [volumeDetail, isCurrent]);

  useEffect(() => {
    if (volumeDetail !== undefined && volumeDetail?.compressionThreshold !== compressionThreshold) {
      setIsDirty(true);
    }
  }, [volumeDetail, compressionThreshold]);

  useEffect(() => {
    if (externalVolDetail !== undefined && externalVolDetail?.volumePrefix !== volumePrefix) {
      setIsDirty(true);
    }
  }, [externalVolDetail, volumePrefix]);

  useEffect(() => {
    if (
      externalVolDetail !== undefined &&
      bucketConfigurationId &&
      getVolumeBucketConfigurationId(externalVolDetail) !== bucketConfigurationId
    ) {
      setIsDirty(true);
    }
  }, [bucketConfigurationId, externalVolDetail]);

  useEffect(() => {
    if (
      externalVolDetail !== undefined &&
      useInfrequentAccess !== undefined &&
      externalVolDetail?.useInfrequentAccess !== useInfrequentAccess
    ) {
      setIsDirty(true);
    }
  }, [externalVolDetail, useInfrequentAccess]);

  useEffect(() => {
    if (
      externalVolDetail !== undefined &&
      useIntelligentTiering !== undefined &&
      externalVolDetail?.useIntelligentTiering !== useIntelligentTiering
    ) {
      setIsDirty(true);
    }
  }, [externalVolDetail, useIntelligentTiering]);

  useEffect(() => {
    if (
      externalVolDetail !== undefined &&
      infrequentAccessThreshold !== undefined &&
      externalVolDetail?.infrequentAccessThreshold !== infrequentAccessThreshold
    ) {
      setIsDirty(true);
    }
  }, [externalVolDetail, infrequentAccessThreshold]);

  useEffect(() => {
    setName(volumeDetail?.name ?? '');
    const volumeTypeObject = volTypeList?.find(
      (item: VolumeType) => item?.value === volumeDetail?.type,
    );
    setType(volumeTypeObject as VolumeAllocationItem);
    setId(String(volumeDetail?.id ?? ''));
    setRootpath(volumeDetail?.rootpath ?? '');
    setCompressBlobs(volumeDetail?.compressBlobs ?? false);
    setIsCurrent(volumeDetail?.isCurrent ?? false);
    setCompressionThreshold(String(volumeDetail?.compressionThreshold ?? ''));
    setIsDirty(false);
  }, [volTypeList, volumeDetail]);

  useEffect(() => {
    if (!isEmpty(externalVolDetail)) {
      getAllBuckets();
    }
  }, [externalVolDetail]);

  useEffect(() => {
    setUseIntelligentTiering(externalVolDetail?.useIntelligentTiering);
    setUseInfrequentAccess(externalVolDetail?.useInfrequentAccess);
    setInfrequentAccessThreshold(externalVolDetail?.infrequentAccessThreshold);
  }, [
    externalVolDetail?.infrequentAccessThreshold,
    externalVolDetail?.useInfrequentAccess,
    externalVolDetail?.useIntelligentTiering,
  ]);

  useEffect(() => {
    if (!isAdvanced) {
      return;
    }

    syncAdvancedVolumeByType(
      1,
      volumeList.primaries,
      volumeDetail?.type,
      volumeDetail?.id,
      hydrateExternalVolumeFields,
      () => setExternalVolDetail({}),
      setCurrentVolume,
    );
    syncAdvancedVolumeByType(
      2,
      volumeList.secondaries,
      volumeDetail?.type,
      volumeDetail?.id,
      hydrateExternalVolumeFields,
      () => setExternalVolDetail({}),
      setCurrentVolume,
    );
    syncAdvancedVolumeByType(
      10,
      volumeList.indexes,
      volumeDetail?.type,
      volumeDetail?.id,
      hydrateExternalVolumeFields,
      () => setExternalVolDetail({}),
      setCurrentVolume,
    );
  }, [
    volumeList?.primaries,
    volumeDetail?.type,
    volumeList?.secondaries,
    volumeList?.indexes,
    isAdvanced,
    volumeDetail?.id,
  ]);

  useEffect(() => {
    const volumeTypeObject = volAllocationList?.find(
      (item: VolumeType) => item?.value === volumeDetail?.type,
    );
    setAllocation(volumeTypeObject);
  }, [volAllocationList, volumeDetail?.type]);

  // Maps volumeType (from advanced API) to numeric type value (1, 2, 10)
  function getNormalizedVolumeType(volData: Volume): number {
    if (isAdvanced && volData?.volumeType) {
      const volumeTypeStr = volData.volumeType?.toLowerCase();
      if (volumeTypeStr === 'primary') return 1;
      if (volumeTypeStr === 'secondary') return 2;
      if (volumeTypeStr === 'index') return 10;
    }
    // CE version returns type as numeric value
    return volData?.type ?? 0;
  }

  const getVolumeDetailData = useCallback(
    (volId: string): void => {
      if (isAdvanced) {
        const allVolumes = [
          ...volumeList.primaries,
          ...volumeList.secondaries,
          ...volumeList.indexes,
        ];
        const volData = allVolumes.find((v: Volume) => v?.id === Number(volId));
        if (volData) {
          setVolumeDetail({
            name: volData.name ?? '',
            id: volData.id ?? 0,
            type: getNormalizedVolumeType(volData),
            compressBlobs: volData.compressBlobs === 'true' || volData.compressBlobs === '1',
            isCurrent: volData.isCurrent === true || volData.isCurrent === 1,
            rootpath: volData.path ?? '',
            compressionThreshold: volData.compressionThreshold ?? '',
          });
          setmodifyVolumeToggle(true);
        }
        return;
      }
      setIsLoading(true);
      soapFetch(
        'GetVolume',
        {
          _jsns: ZIMBRA_ADMIN_URN,
          module: 'ZxPowerstore',
          id: volId,
        },
        {
          targetServer: selectedServerId,
        },
      )
        .then((response) => {
          const typedResponse = response as { volume: Volume[]; _jsns: string };
          const volData = typedResponse?.volume[0];
          setVolumeDetail({
            name: volData?.name ?? '',
            id: volData?.id ?? 0,
            type: getNormalizedVolumeType(volData),
            compressBlobs: Boolean(volData?.compressBlobs),
            isCurrent: Boolean(volData?.isCurrent),
            rootpath: volData?.rootpath ?? '',
            compressionThreshold: String(volData?.compressionThreshold ?? ''),
          });
          setmodifyVolumeToggle(true);
          setIsLoading(false);
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
          setIsLoading(false);
        });
    },
    [
      isAdvanced,
      volumeList,
      setVolumeDetail,
      setmodifyVolumeToggle,
      createSnackbar,
      t,
      getAllVolumesRequest,
      selectedServerId,
    ],
  );

  useEffect(() => {
    if (volumeId) getVolumeDetailData(String(volumeId));
  }, [volumeId, getVolumeDetailData]);

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
      <Container
        background="gray6"
        mainAlignment="flex-start"
        orientation="vertical"
        style={{ overflowY: 'auto' }}
      >
        <Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="4.15rem">
          <Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
            <ds-text as="h2" weight="bold">
              {t('label.volume_detail_page_title', '{{message}} Details', {
                message: volumeDetail?.name,
              })}
            </ds-text>
          </Row>
          <Row
            padding={{ all: 'small' }}
            width="50%"
            mainAlignment="flex-end"
            crossAlignment="flex-end"
          >
            <Padding right="small">
              {isDirty && (
                <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
              )}
            </Padding>
            {isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
          </Row>
          <Row padding={{ horizontal: 'small' }}>
            <Button
              type="ghost"
              color={'text'}
              icon="CloseOutline"
              onClick={(): void => setmodifyVolumeToggle(false)}
            />
          </Row>
        </Row>
        <ds-divider></ds-divider>
        <Displayer buttons={buttons} pinIcon={isSticky} />
        {Object.keys(externalVolDetail)?.length === 0 ? (
          <Container
            padding={{ horizontal: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <Row padding={{ top: 'small' }} width="100%">
              <Input
                label={t('label.volume_name', 'Volume Name')}
                value={name}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  setName(e?.target?.value)
                }
              />
            </Row>
            {volumeDetail?.type !== 10 && (
              <Row
                padding={{ top: 'large' }}
                width="100%"
                mainAlignment="center"
                crossAlignment="center"
                background="gray6"
              >
                <Row width={isAdvanced ? '48%' : '100%'}>
                  <Radio
                    label={t('label.primary_volume', 'This is a Primary Volume')}
                    value={PRIMARY_TYPE_VALUE}
                    checked={type?.value === 1}
                    onClick={(): void => onVolumeTypeChange(1)}
                    iconColor="primary"
                    disabled
                  />
                </Row>
                {isAdvanced && (
                  <Row width="48%">
                    <Radio
                      label={t('label.secondary_volume', 'This is a Secondary Volume')}
                      value={SECONDARY_TYPE_VALUE}
                      checked={type?.value === 2}
                      onClick={(): void => onVolumeTypeChange(2)}
                      iconColor="primary"
                      disabled
                    />
                  </Row>
                )}
              </Row>
            )}
            <Row padding={{ top: 'large' }} width="100%">
              <Input
                label={t('label.volume_id', 'Volume ID')}
                value={id}
                backgroundColor="gray6"
                disabled
                onChange={(): void => {}}
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <Input
                label={t('label.path', 'Path')}
                value={rootpath}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  setRootpath(e?.target?.value)
                }
              />
            </Row>
            <Padding top="extrasmall">
              <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                {t(
                  'the_change_will_not_move_the_data',

                  'The change will not move the data',
                )}
              </ds-text>
            </Padding>
            <Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
              {volumeDetail?.type !== 10 && (
                <>
                  <Row width="48%" mainAlignment="flex-start">
                    <Switch
                      value={compressBlobs}
                      label={t('label.enable_compression', 'Enable Compression')}
                      onClick={(): void => setCompressBlobs(!compressBlobs)}
                      iconColor="primary"
                    />
                    <Padding top="extrasmall">
                      <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                        {t(
                          'this_will_not_affect_data_already_stored',
                          'This will not affect data already stored',
                        )}
                      </ds-text>
                    </Padding>
                  </Row>
                  <Padding horizontal="small" />
                </>
              )}
              <Row width="48%" mainAlignment="flex-start">
                <Tooltip
                  placement="top"
                  label={t(
                    'warning.is_current',
                    'Firstly, you have to set another volume as the current one.',
                  )}
                  maxWidth="auto"
                  disabled={!isCurrent}
                >
                  <Switch
                    ref={isCurrentRef}
                    value={isCurrent}
                    label={t('label.set_as_current', 'Set as Current')}
                    onClick={(): void => {
                      !isCurrent && setIsCurrentToggle(true);
                    }}
                    iconColor="primary"
                  />
                </Tooltip>
              </Row>
            </Row>
            {volumeDetail?.type !== 10 && Object.keys(externalVolDetail)?.length === 0 && (
              <>
                <Row padding={{ top: 'small' }} width="50%">
                  <Input
                    label={t('label.compression_threshold', 'Compression Threshold')}
                    value={compressionThreshold}
                    backgroundColor="gray6"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      setCompressionThreshold(e?.target?.value)
                    }
                    color="secondary"
                  />
                </Row>
                <Padding top="extrasmall">
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                    {t(
                      'this_will_not_affect_data_already_stored',
                      'This will not affect data already stored',
                    )}
                  </ds-text>
                </Padding>
              </>
            )}
          </Container>
        ) : (
          <Container
            padding={{ horizontal: 'large', bottom: 'large' }}
            mainAlignment="flex-start"
            crossAlignment="flex-start"
          >
            <Row padding={{ top: 'small' }} width="100%">
              <LabeledValue
                label={t('label.volume_server_name', 'Server')}
                value={server ?? ''}
                backgroundColor="gray5"
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <Select
                items={volAllocationList}
                background="gray5"
                label={t('label.storage_type', 'Storage Type')}
                showCheckbox={false}
                defaultSelection={allocation}
                disabled
                onChange={(): void => {
                  // console.log('__');
                }}
              />
            </Row>
            <Row padding={{ top: 'large' }} width="100%">
              <Input
                label={t('label.volume_name', 'Volume Name')}
                value={name}
                backgroundColor="gray6"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  setName(e?.target?.value)
                }
              />
            </Row>
            {backupUnusedBucketList?.length !== 0 && (
              <>
                <Row padding={{ top: 'large' }} width="100%">
                  <Select
                    items={backupUnusedBucketList}
                    background="gray5"
                    label={t(
                      'label.volume_available_unused_Buckets_list_in_backup',
                      'Available Buckets List (that are not in use in the backup)',
                    )}
                    showCheckbox={false}
                    selection={selectedBucket ?? backupUnusedBucketList[0]}
                    onChange={onUnusedBucketListChange}
                  />
                </Row>
                <Padding top="extrasmall">
                  <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                    {t('the_change_will_not_move_the_data', 'The change will not move the data')}
                  </ds-text>
                </Padding>
              </>
            )}
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
                  value={storeType}
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
                  value={bucketConfigurationId}
                />
              </Container>
            </ListRow>
            {volumeDetail?.type !== 10 && (
              <Row
                padding={{ top: 'large' }}
                width="100%"
                mainAlignment="center"
                crossAlignment="center"
                background="gray6"
              >
                <Row width={isAdvanced ? '48%' : '100%'}>
                  <Radio
                    label={t('label.primary_volume', 'This is a Primary Volume')}
                    value={PRIMARY_TYPE_VALUE}
                    checked={type?.value === 1}
                    onClick={(): void => onVolumeTypeChange(1)}
                    iconColor="primary"
                    disabled
                  />
                </Row>
                {isAdvanced && (
                  <Row width="48%">
                    <Radio
                      label={t('label.secondary_volume', 'This is a Secondary Volume')}
                      value={SECONDARY_TYPE_VALUE}
                      checked={type?.value === 2}
                      onClick={(): void => onVolumeTypeChange(2)}
                      iconColor="primary"
                      disabled
                    />
                  </Row>
                )}
              </Row>
            )}
            <Row padding={{ top: 'large' }} width="100%">
              <Input
                inputName="prefix"
                label={t(
                  'label.prefix_name',
                  'Prefix - all objects will have this prefix in their name',
                )}
                value={volumePrefix}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  setVolumePrefix(e?.target?.value)
                }
              />
            </Row>
            <Padding top="extrasmall">
              <ds-text as="p" color="secondary" overflow="break-word" size="extrasmall">
                {t('the_change_will_not_move_the_data', 'The change will not move the data')}
              </ds-text>
            </Padding>
            {showTieringSettings && (
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
                        onClick={onInfrequentAccessToggle}
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
                      backgroundColor="gray5"
                      value={infrequentAccessThreshold}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                        setInfrequentAccessThreshold(e?.target?.value)
                      }
                      disabled={!useInfrequentAccess}
                    />
                  </Row>
                </Row>
                <Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
                  <Switch
                    value={useIntelligentTiering}
                    label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
                    onClick={onIntelligentTieringToggle}
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
              <Tooltip
                placement="top"
                label={t(
                  'warning.is_current',
                  'Firstly, you have to set another volume as the current one.',
                )}
                maxWidth="auto"
                disabled={!isCurrent}
              >
                <Switch
                  ref={isCurrentRef}
                  value={isCurrent}
                  label={t('label.set_as_current', 'Set as Current')}
                  onClick={(): void => {
                    !isCurrent && setIsCurrentToggle(true);
                  }}
                  iconColor="primary"
                />
              </Tooltip>
            </Row>
            <Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
              <ds-text as="p" color="secondary">
                {t(
                  'label.enable_current_helptext',
                  'Enabling this option will disable the current active volume.',
                )}
              </ds-text>
            </Row>
          </Container>
        )}
        <Modal
          open={isCurrentToggle && !isCurrent}
          title={t(
            'modal.iscurrent_confirm.title',
            'You are setting {{name}} as the current volume',
            {
              name,
            },
          )}
          onClose={(): void => setIsCurrentToggle(false)}
          onConfirm={(): void => {
            setIsCurrent(true);
            setIsCurrentToggle(false);
          }}
          confirmLabel={t('modal.iscurrent_confirm.confirm_label', 'YES, PROCEED')}
          onSecondaryAction={(): void => setIsCurrentToggle(false)}
          secondaryActionLabel={t('modal.iscurrent_confirm.secondary_label', 'NO, GO BACK')}
          showCloseIcon
        >
          <Padding vertical="small">
            <ds-text as="p">
              <Trans
                i18nKey="modal.iscurrent_confirm.body_message"
                defaults="The {{currentVolumeName}} is the current volume.<br />Are you sure you want to <strong>set {{name}} as current one</strong>?"
                components={{ break: <br />, bold: <strong /> }}
                values={{
                  type: type?.label,
                  currentVolumeName: currentVolume?.name,
                  name,
                }}
              />
            </ds-text>
          </Padding>
        </Modal>
      </Container>
    </>
  );
};

export default ModifyVolume;
