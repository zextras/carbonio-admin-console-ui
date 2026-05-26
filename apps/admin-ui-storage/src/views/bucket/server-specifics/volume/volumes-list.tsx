/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ModalOverlay,
  Row,
  Table,
  THeader,
  useSnackbar,
} from '@zextras/ui-components';
import {
  postSoapFetchRequest,
  soapFetch,
  useAllServers,
  useIsAdvanced,
} from '@zextras/ui-shared';
import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Volume } from '../../../../../types';
import {
  ALIBABA,
  CENTRALIZED,
  CEPH,
  CLOUDIAN,
  CUSTOM_S3,
  EMC,
  FILEBLOB,
  FLEX_START,
  LOCAL_VALUE,
  NO,
  OPENIO,
  S3,
  SCALITYS3,
  SWIFT,
  YES,
  ZIMBRA_ADMIN_URN,
} from '../../../../constants';
import { fetchSoap } from '../../../../services/bucket-service';
import { createVoume } from '../../../../services/create-volume-service';
import { setCurrentVolumeRequest } from '../../../../services/set-current-volume-service';
import { useBucketVolumeStore } from '../../../../store/bucket-volume/store';
import { indexerHeaders, volTableHeader } from '../../../utility/utils';
import CreateMailstoresVolume from './create-volume/advanced-create-volume/create-mailstores-volume';
import NewVolume from './create-volume/new-volume';
import { VolumeContext } from './create-volume/volume-context';
import DeleteVolumeModel from './delete-volume-model';
import IndexerVolumeTable from './indexer-volume-table';
import ModifyVolume from './modify-volume/modify-volume';

type SoapContentResponse = {
  Body?: {
    response?: {
      content?: string;
    };
  };
};

const VolumeListTable: FC<{
  volumes: Array<Volume>;
  selectedRows: Array<string>;
  onSelectionChange: (selected: string[]) => void;
  headers: THeader[];
  onClick: (i: number) => void;
  isAdvanced: boolean;
}> = ({ volumes, selectedRows, onSelectionChange, headers, onClick, isAdvanced }) => {
  const [t] = useTranslation();
  const tableRows = useMemo(
    () =>
      volumes.map((v, i) => {
        const columns = [
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="regular">
              {v?.id}
            </ds-text>
          </Row>,
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="light">
              {v?.name}
            </ds-text>
          </Row>,
          isAdvanced && (
            <Row
              key={i}
              onClick={(): void => {
                onClick(i);
              }}
              style={{ textAlign: 'left', justifyContent: FLEX_START }}
            >
              <ds-text as="span" size="small" weight="light">
                {v?.storeType === LOCAL_VALUE
                  ? t('volume.volume_allocation_list.local_block_device', 'Local Block Device')
                  : t('volume.volume_allocation_list.object_storage', 'Object Storage')}
              </ds-text>
            </Row>
          ),
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" size="small" weight="light">
              {v?.storeType === LOCAL_VALUE ? v?.path : v?.rootpath}
            </ds-text>
          </Row>,
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" color={v?.isCurrent ? 'text' : 'error'} size="small" weight="light">
              {v?.isCurrent ? YES : NO}
            </ds-text>
          </Row>,
          <Row
            key={i}
            onClick={(): void => {
              onClick(i);
            }}
            style={{ textAlign: 'left', justifyContent: FLEX_START }}
          >
            <ds-text as="span" color={v?.compressed ? 'text' : 'error'} size="small" weight="light">
              {v?.compressed ? YES : NO}
            </ds-text>
          </Row>,
        ];

        return {
          id: String(v?.id ?? ''),
          columns: columns.filter((column) => column !== false), // Changed filter condition to remove false instead of null
          clickable: true,
        };
      }),
    [onClick, t, volumes, isAdvanced],
  );

  return (
    <Container crossAlignment="flex-start">
      <Table
        headers={headers}
        rows={tableRows}
        showCheckbox={false}
        multiSelect={false}
        selectedRows={selectedRows as [] | [string]}
        onSelectionChange={onSelectionChange}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
      {tableRows?.length === 0 && (
        <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
          <ds-text as="p">{t('label.empty_table', 'Empty Table')}</ds-text>
        </Row>
      )}
    </Container>
  );
};

const VolumesDetailPanel: FC = () => {
  const { server } = useParams();
  const [t] = useTranslation();
  const context = useContext(VolumeContext);
  const { setVolumeDetail } = context;
  const { isVolumeAllDetail, selectedServerName } = useBucketVolumeStore((state) => state);
  const isAdvanced = useIsAdvanced();
  const volIndexerHeaders = useMemo(() => indexerHeaders(t, isAdvanced), [t, isAdvanced]);
  const volPrimarySecondaryHeaders = useMemo(() => volTableHeader(t, isAdvanced), [t, isAdvanced]);
  const [priamryVolumeSelection, setPriamryVolumeSelection] = useState<string[]>([]);
  const [secondaryVolumeSelection, setSecondaryVolumeSelection] = useState<string[]>([]);
  const [indexerVolumeSelection, setIndexerVolumeSelection] = useState<string[]>([]);
  const [toggleWizardLocal, setToggleWizardLocal] = useState(false);
  const [toggleWizardExternal, setToggleWizardExternal] = useState(false);
  const [modifyVolumeToggle, setmodifyVolumeToggle] = useState<boolean>(false);
  const { data: serverList = [] } = useAllServers();
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<Volume | undefined>({
    compressBlobs: '',
    compressionThreshold: '',
    fbits: 0,
    fgbits: 0,
    id: 0,
    isCurrent: true,
    mbits: 0,
    mgbits: 0,
    name: '',
    rootpath: '',
    type: 0,
  });
  const [open, setOpen] = useState<boolean>(false);
  const [volumeList, setVolumeList] = useState<{
    primaries: Volume[];
    indexes: Volume[];
    secondaries: Volume[];
  }>({
    primaries: [],
    indexes: [],
    secondaries: [],
  });
  const createSnackbar = useSnackbar();

  const closeHandler = (): void => {
    setOpen(false);
  };

  const mapAdvancedVolume = useCallback((vol: any): Volume => {
    const volumeTypeMap: Record<string, number> = {
      primary: 1,
      secondary: 2,
      index: 10,
    };
    return {
      ...vol,
      rootpath: vol?.path ?? vol?.rootpath,
      path: vol?.path,
      type: volumeTypeMap[vol?.volumeType] ?? vol?.type,
      compressBlobs: vol?.compressed ?? vol?.compressBlobs,
      compressionThreshold: vol?.threshold ?? vol?.compressionThreshold,
      compressed: vol?.compressed,
      bucketConfigurationId: vol?.uuid ?? vol?.bucketConfigurationId,
    };
  }, []);

  const getAllVolumesRequest = useCallback((): void => {
    if (isAdvanced) {
      fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'getAllVolumes',
        targetServers: selectedServerName
      })
        .then((res) => {
          const typedRes = res as SoapContentResponse;
          const result = JSON.parse(typedRes?.Body?.response?.content || '{}');
          const advancedResponse = result?.response ?? result;
          const getAllVolResponse = advancedResponse?.response ?? advancedResponse;
          if (result?.ok ?? advancedResponse?.ok) {
            const primaries = getAllVolResponse?.primaries?.map(mapAdvancedVolume) ?? [];
            const secondaries = getAllVolResponse?.secondaries?.map(mapAdvancedVolume) ?? [];
            const indexes = getAllVolResponse?.indexes?.map(mapAdvancedVolume) ?? [];
            setVolumeList({
              primaries,
              indexes,
              secondaries,
            });
          } else {
            createSnackbar({
              key: '1',
              severity: 'error',

              label: t('label.volume_detail_error', '{{message}}', {
                message: 'Something went wrong, please try again',
              }),
            });
          }
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
        });
    } else {
      soapFetch(
        'GetAllVolumes',
        {
          _jsns: ZIMBRA_ADMIN_URN,
        },
        {
          targetServer: selectedServerId,
        },
      )
        .then((response) => {
          const typedResponse = response as { volume: Volume[]; _jsns: string };
          const primaries = typedResponse?.volume?.filter((item: Volume) => item?.type === 1);
          const secondaries = typedResponse?.volume?.filter((item: Volume) => item?.type === 2);
          const indexes = typedResponse?.volume?.filter((item: Volume) => item?.type === 10);
          setVolumeList({
            primaries,
            indexes,
            secondaries,
          });
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
        });
    }
  }, [isAdvanced, selectedServerId, createSnackbar, t, mapAdvancedVolume]);

  const deleteHandler = async (data: Volume | undefined): Promise<void> => {
    if (!data) {
      return;
    }
    if (isAdvanced) {
      await fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'doDeleteVolume',
        targetServers: selectedServerName,
        volumeName: data?.name,
      })
        .then((res) => {
          const typedRes = res as SoapContentResponse;
          const result = JSON.parse(typedRes?.Body?.response?.content || '{}');
          const deleteResponse = Object.keys(result?.response).map(
            (key) => result?.response[key],
          )[0];
          if (deleteResponse?.ok) {
            createSnackbar({
              key: '1',
              severity: 'success',
              label: t('label.volume_deleted', 'Volume deleted successfully'),
            });
            getAllVolumesRequest();
            setmodifyVolumeToggle(false);
            setOpen(false);
          } else {
            createSnackbar({
              key: '1',
              severity: 'error',
              label: t('label.volume_detail_error', '{{message}}', {
                message: 'Something went wrong, please try again',
              }),
            });
            setOpen(false);
          }
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
          setOpen(false);
        });
    } else {
      const { id } = data;
      await soapFetch(
        'DeleteVolume',
        {
          _jsns: ZIMBRA_ADMIN_URN,
          module: 'ZxCore',
          action: 'DeleteVolumeRequest',
          id,
        },
        {
          targetServer: selectedServerId,
        },
      )
        .then((res) => {
          const typeResponse = res as { _jsns: string };
          if (typeResponse?._jsns === ZIMBRA_ADMIN_URN) {
            createSnackbar({
              key: '1',
              severity: 'success',
              label: t('label.volume_deleted', 'Volume deleted successfully'),
            });
          }
          getAllVolumesRequest();
          setmodifyVolumeToggle(false);
          setOpen(false);
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
          setVolume({
            compressBlobs: '',
            compressionThreshold: '',
            fbits: 0,
            fgbits: 0,
            id: 0,
            isCurrent: true,
            mbits: 0,
            mgbits: 0,
            name: '',
            rootpath: '',
            type: 0,
          });
          setmodifyVolumeToggle(false);
          getAllVolumesRequest();
          setOpen(false);
        });
    }
  };

  useEffect(() => {
    if (selectedServerId) {
      getAllVolumesRequest();
    }
  }, [selectedServerId, getAllVolumesRequest]);

  const CreateAdvancedRequest = async (attr: Volume): Promise<void> => {
    const bucketDetails = isVolumeAllDetail?.filter(
      (items) => items?.uuid === attr?.bucketConfigurationId,
    );
    const obj: { [key: string]: string | boolean | number | undefined } = {};
    obj._jsns = ZIMBRA_ADMIN_URN;
    obj.module = 'ZxPowerstore';
    obj.action = 'doCreateVolume';
    obj.targetServers = selectedServerName;
    obj.volumeName = attr?.volumeName;
    obj.volumeType = attr?.volumeType;
    obj.storeType = attr?.storeType;
    obj.isCurrent = attr?.isCurrent === 1;
    obj.accessKey = bucketDetails[0]?.accessKey;
    obj.secret = bucketDetails[0]?.secret;
    obj.bucketName = bucketDetails[0]?.bucketName;
    obj.url = bucketDetails[0]?.url;

    if (
      attr?.storeType?.toUpperCase() === ALIBABA?.toUpperCase() ||
      attr?.storeType?.toUpperCase() === CEPH?.toUpperCase() ||
      attr?.storeType?.toUpperCase() === CLOUDIAN?.toUpperCase() ||
      attr?.storeType?.toUpperCase() === EMC?.toUpperCase() ||
      attr?.storeType?.toUpperCase() === SCALITYS3?.toUpperCase() ||
      attr?.storeType?.toUpperCase() === CUSTOM_S3?.toUpperCase()
    ) {
      obj.bucketConfigurationId = attr?.bucketConfigurationId;
      obj.volumePrefix = attr?.volumePrefix;
      obj.centralized = attr?.centralized;
    }
    if (attr?.storeType?.toUpperCase() === S3?.toUpperCase()) {
      obj.bucketConfigurationId = attr?.bucketConfigurationId;
      obj.volumePrefix = attr?.volumePrefix;
      obj.centralized = attr?.centralized;
      obj.useInfrequentAccess = attr?.useInfrequentAccess;
      obj.infrequentAccessThreshold = attr?.infrequentAccessThreshold;
      obj.useIntelligentTiering = attr?.useIntelligentTiering;
    }
    // TODO : Fileblob, Centeralized, Open IO, Swift Mocks needs to be provided this is for future reference only
    if (attr?.storeType?.toUpperCase() === FILEBLOB?.toUpperCase()) {
      obj.volumePath = '';
      obj.volumeCompressed = false;
      obj.volumeThreshold = 4096;
    }
    if (attr?.storeType?.toUpperCase() === CENTRALIZED?.toUpperCase()) {
      obj.serverName = attr?.serverName;
    }
    if (attr?.storeType?.toUpperCase() === OPENIO?.toUpperCase()) {
      obj.url = '';
      obj.account = '';
      obj.namespace = '';
      obj.proxyPort = 1;
      obj.accountPort = 1;
      obj.ecd = '';
      obj.centralized = attr?.centralized;
    }
    if (attr?.storeType?.toUpperCase() === SWIFT?.toUpperCase()) {
      obj.url = '';
      obj.username = '';
      obj.password = '';
      obj.authenticationMethod = '';
      obj.authenticationMethodScope = '';
      obj.tenantId = '';
      obj.tenantName = '';
      obj.domain = '';
      obj.proxyHost = '';
      obj.proxyPort = 0;
      obj.proxyUsername = '';
      obj.proxyPassword = '';
      obj.publicHost = '';
      obj.privateHost = '';
      obj.region = '';
      obj.maxDeleteObjectsCount = 10;
      obj.centralized = attr?.centralized;
    }

    await fetchSoap('zextras', obj)
      .then(async (res) => {
        const typedRes = res as SoapContentResponse;
        const result = JSON.parse(typedRes?.Body?.response?.content || '{}');
        if (result?.ok) {
          if (result?.response[selectedServerName]?.ok) {
            getAllVolumesRequest();
            createSnackbar({
              key: '1',
              severity: 'success',

              label: t('label.volume_created_msg', 'The volume has been created successfully'),
            });
            setToggleWizardLocal(false);
            setToggleWizardExternal(false);
          } else {
            createSnackbar({
              key: '1',
              severity: 'error',
              label: t('label.volume_detail_error', '{{message}}', {
                message: result?.response[selectedServerName]?.error?.message,
              }),
            });
          }
        } else {
          createSnackbar({
            key: '1',
            severity: 'error',
            label: t('label.volume_detail_error', '{{message}}', {
              message: 'Something went wrong, please try again',
            }),
          });
        }
        return typedRes;
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.volume_detail_error', '{{message}}', {
              message: 'Something went wrong, please try again',
            }),
          autoHideTimeout: 5000,
        });
        return error;
      });
  };

  const CreateVolumeRequest = async (attr: Volume): Promise<void> => {
    setIsLoading(true);
    if (isAdvanced) {
      let volType = 'primary';
      if (attr?.type === 2) {
        volType = 'secondary';
      } else if (attr?.type === 10) {
        volType = 'index';
      }
      postSoapFetchRequest(
        `/service/admin/soap/zextras`,
        {
          _jsns: ZIMBRA_ADMIN_URN,
          module: 'ZxPowerstore',
          action: 'doCreateVolume',
          targetServers: selectedServerName,
          volumeName: attr?.name,
          volumeType: volType,
          storeType: 'FILE_BLOB',
          volumePath: attr?.rootpath,
          volumeCompressed: attr?.compressBlobs,
          volumeThreshold: attr?.compressionThreshold,
          isCurrent: attr?.isCurrent === 1,
        },
        'zextras',
        // @ts-expect-error - needs a fix
      ).then(async (res: { Body: { response: { content: string } } }): Promise<void> => {
        const result = JSON.parse(res?.Body?.response?.content);
        const responseData = Object.values(result?.response)[0];
        const typeRes = responseData as { ok: boolean; error: string };
        if (typeRes && typeRes?.ok === true) {
          if (attr?.isCurrent) {
            await postSoapFetchRequest(
              `/service/admin/soap/zextras`,
              {
                _jsns: ZIMBRA_ADMIN_URN,
                module: 'ZxPowerstore',
                action: 'doUpdateVolume',
                currentVolumeName: attr?.name,
                volumeCurrent: true,
              },
              'zextras',
            )
              .then(() => {
                createSnackbar({
                  key: '1',
                  severity: 'success',
                  label: t('label.volume_active', '{{volumeName}} is Currently active', {
                    volumeName: attr?.name,
                  }),
                });
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
              });
          }
          getAllVolumesRequest();
          createSnackbar({
            key: '1',
            severity: 'success',
            label: t('label.volume_created_msg', 'The volume has been created successfully'),
          });
          setToggleWizardLocal(false);
          setToggleWizardExternal(false);
        } else if (typeRes && typeRes?.ok === false && typeRes?.error) {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t('label.volume_detail_error', '{{message}}', {
              message: 'Something went wrong, please try again',
            }),
            autoHideTimeout: 5000,
          });
        }
        setIsLoading(false);
      });
    } else {
      await createVoume(attr)
        .then(async (res) => {
          if (res?.volume && Array.isArray(res?.volume)) {
            const vol = res?.volume[0];

            if (vol && vol?.id) {
              if (attr?.isCurrent === 1) {
                await setCurrentVolumeRequest(vol?.id, vol?.type)
                  .then(() => {
                    createSnackbar({
                      key: '1',
                      severity: 'success',
                      label: t('label.volume_active', '{{volumeName}} is Currently active', {
                        volumeName: attr?.name,
                      }),
                    });
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
                  });
              }
            }
          }
          getAllVolumesRequest();
          createSnackbar({
            key: '1',
            severity: 'success',
            label: t('label.volume_created_msg', 'The volume has been created successfully'),
          });
          setToggleWizardLocal(false);
          setToggleWizardExternal(false);
          setIsLoading(false);
          return res;
        })
        .catch((error) => {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: error?.message
              ? error?.message
              : t('label.volume_detail_error', '{{message}}', {
                message: 'Something went wrong, please try again',
              }),
            autoHideTimeout: 5000,
          });
          setIsLoading(false);
          return error;
        });
    }
  };

  const handleClick = (i: number, data: Volume[]): void => {
    const volumeObject = data?.find((s: Volume, index: number) => index === i);
    const typeVol = volumeObject as Volume;
    setVolume(typeVol);
    setmodifyVolumeToggle(true);
  };

  useEffect(() => {
    if (serverList && serverList?.length > 0) {
      const lookupName = server || selectedServerName;
      const serverData = serverList?.find((s: { name?: string }) => s?.name === lookupName);
      if (serverData && serverData?.id) {
        setSelectedServerId(serverData?.id);
      }
    }
  }, [serverList, server, selectedServerName]);

  return (
    <>
      {toggleWizardExternal && (
        <ModalOverlay open={toggleWizardExternal}>
          <CreateMailstoresVolume
            setToggleWizardExternal={setToggleWizardExternal}
            setToggleWizardLocal={setToggleWizardLocal}
            volName={selectedServerName}
            CreateAdvancedRequest={CreateAdvancedRequest}
          />
        </ModalOverlay>
      )}
      {toggleWizardLocal && (
        <ModalOverlay open={toggleWizardLocal}>
          <NewVolume
            setToggleWizardLocal={setToggleWizardLocal}
            setToggleWizardExternal={setToggleWizardExternal}
            volName={selectedServerName}
            CreateVolumeRequest={CreateVolumeRequest}
            isLoading={isLoading}
          />
        </ModalOverlay>
      )}
      {modifyVolumeToggle && volume && (
        <ModalOverlay open={modifyVolumeToggle}>
          <ModifyVolume
            volumeId={volume?.id ?? 0}
            setOpen={setOpen}
            setmodifyVolumeToggle={setmodifyVolumeToggle}
            getAllVolumesRequest={getAllVolumesRequest}
            selectedServerId={selectedServerId}
            volumeList={volumeList}
          />
        </ModalOverlay>
      )}

      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        style={{ overflowY: 'auto', position: 'relative' }}
        background="white"
      >
        {open && (
          <DeleteVolumeModel
            open={open}
            closeHandler={closeHandler}
            deleteHandler={deleteHandler}
            volumeDetail={volume}
          />
        )}
        <Row mainAlignment="flex-start" padding={{ all: 'large' }}>
          <ds-text as="h2" weight="bold">
            {t('volume.serverName_volumes', '{{serverName}} Volumes', {
              serverName: selectedServerName,
            })}
          </ds-text>
        </Row>
        <ds-divider></ds-divider>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          width="100%"
          height="calc(100vh - 12.5rem)"
          padding={{ top: 'extralarge', bottom: 'large' }}
        >
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              width="100%"
              mainAlignment="flex-end"
              orientation="horizontal"
              padding={{ top: 'small', right: 'large', left: 'large' }}
              style={{ gap: '1rem' }}
            >
              <Button
                type="outlined"
                label={t('label.new_volume_button', 'NEW VOLUME')}
                icon="PlusOutline"
                color="primary"
                onClick={(): void => {
                  setVolumeDetail({
                    id: '',
                    volumeName: '',
                    volumeMain: 1,
                    path: '',
                    isCurrent: false,
                    isCompression: false,
                    compressionThreshold: '',
                    volumeAllocation: 0,
                  });
                  if (isAdvanced) {
                    setToggleWizardExternal(!toggleWizardExternal);
                  } else {
                    setToggleWizardLocal(!toggleWizardLocal);
                  }
                }}
              />
            </Row>
            <Row
              width="100%"
              mainAlignment="flex-start"
              orientation="horizontal"
              padding={{ horizontal: 'large', top: 'large', bottom: 'large' }}
            >
              <ds-text as="h3">{t('volume.primary_helperText', 'Primary')}</ds-text>
            </Row>
            <Row padding={{ horizontal: 'large', bottom: 'extralarge' }} width="100%">
              <VolumeListTable
                volumes={volumeList?.primaries}
                headers={volPrimarySecondaryHeaders}
                selectedRows={priamryVolumeSelection}
                onSelectionChange={(selected: string[]): void => {
                  setPriamryVolumeSelection(selected);
                }}
                onClick={(i: number): void => {
                  handleClick(i, volumeList?.primaries);
                }}
                isAdvanced={isAdvanced}
              />
            </Row>
            {isAdvanced && (
              <>
                <Row
                  width="100%"
                  mainAlignment="flex-start"
                  orientation="horizontal"
                  padding={{
                    horizontal: 'large',
                    bottom: 'large',
                    top: 'small',
                  }}
                >
                  <ds-text as="h3">{t('volume.secondary_helperText', 'Secondary')}</ds-text>
                </Row>
                <Row padding={{ horizontal: 'large', bottom: 'extralarge' }} width="100%">
                  <VolumeListTable
                    volumes={volumeList?.secondaries}
                    headers={volPrimarySecondaryHeaders}
                    selectedRows={secondaryVolumeSelection}
                    onSelectionChange={(selected: string[]): void => {
                      setSecondaryVolumeSelection(selected);
                    }}
                    onClick={(i: number): void => {
                      handleClick(i, volumeList?.secondaries);
                    }}
                    isAdvanced={isAdvanced}
                  />
                </Row>
              </>
            )}

            <Row
              width="100%"
              mainAlignment="flex-start"
              orientation="horizontal"
              padding={{ horizontal: 'large', bottom: 'large' }}
            >
              <ds-text as="h3">{t('volume.indexer_helperText', 'Indexer')}</ds-text>
            </Row>
            <Row
              padding={{
                horizontal: 'large',
                bottom: 'extralarge',
              }}
              width="100%"
            >
              <IndexerVolumeTable
                volumes={volumeList?.indexes}
                headers={volIndexerHeaders}
                selectedRows={indexerVolumeSelection}
                onSelectionChange={(selected: string[]): void => {
                  setIndexerVolumeSelection(selected);
                }}
                onClick={(i: number): void => {
                  handleClick(i, volumeList?.indexes);
                }}
                isAdvanced={isAdvanced}
              />
            </Row>
          </Container>
        </Container>
      </Container>
    </>
  );
};

export default VolumesDetailPanel;
