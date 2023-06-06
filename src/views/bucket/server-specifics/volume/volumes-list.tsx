/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Divider,
	Table,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest,
	soapFetch
} from '@zextras/carbonio-shell-ui';
import {
	NO,
	YES,
	CUSTOM_S3,
	S3,
	FILEBLOB,
	CENTRALIZED,
	OPENIO,
	SWIFT,
	ALIBABA,
	CEPH,
	CLOUDIAN,
	EMC,
	SCALITYS3,
	LOCAL_VALUE
} from '../../../../constants';
import { AbsoluteContainer } from '../../../components/styled';
import ServerVolumeDetailsPanel from './server-volume-details-panel';
import { fetchSoap } from '../../../../services/bucket-service';
import IndexerVolumeTable from './indexer-volume-table';
import { volTableHeader, indexerHeaders } from '../../../utility/utils';
import { useBucketVolumeStore } from '../../../../store/bucket-volume/store';
import NewVolume from './create-volume/new-volume';
import ModifyVolume from './modify-volume/modify-volume';
import DeleteVolumeModel from './delete-volume-model';
import { useServerStore } from '../../../../store/server/store';
import CreateMailstoresVolume from './create-volume/advanced-create-volume/create-mailstores-volume';
import { VolumeContext } from './create-volume/volume-context';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { createVoume } from '../../../../services/create-volume-service';
import { setCurrentVolumeRequest } from '../../../../services/set-current-volume-service';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import { Volume, objAll, objectType } from '../../../../../types';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const VolumeListTable: FC<{
	volumes: Array<Volume>;
	selectedRows: string[];
	onSelectionChange: (selected: string[]) => void;
	headers: {
		id: string;
		label: string;
		width: string;
		bold: boolean;
		align: string;
	}[];
	onClick: (i: number) => void;
}> = ({ volumes, selectedRows, onSelectionChange, headers, onClick }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: v?.id,
				columns: [
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text weight="light">{v?.id}</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text weight="light">{v?.name}</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text weight="light">
							{v?.storeType === LOCAL_VALUE
								? t('volume.volume_allocation_list.local_block_device', 'Local Block Device')
								: t('volume.volume_allocation_list.object_storage', 'Object Storage')}
						</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text weight="light">
							{v?.storeType === LOCAL_VALUE
								? v?.path
								: t('label.prefix_volume', 'Prefix - {{volumePrefix}}', {
										volumePrefix: v?.volumePrefix
								  })}
						</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text color={v?.isCurrent ? 'text' : 'error'} weight="light">
							{v?.isCurrent ? YES : NO}
						</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text color={v?.compressBlobs ? 'text' : 'error'} weight="light">
							{v?.compressBlobs ? YES : NO}
						</Text>
					</Row>
				],
				clickable: true
			})),
		[onClick, t, volumes]
	);

	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={headers}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
				RowFactory={CustomRowFactory}
				HeaderFactory={CustomHeaderFactory}
			/>
			{tableRows?.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>{t('label.empty_table', 'Empty Table')}</Text>
				</Row>
			)}
		</Container>
	);
};

const VolumesDetailPanel: FC = () => {
	const { server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const context = useContext(VolumeContext);
	const { setVolumeDetail } = context;
	const { isVolumeAllDetail, selectedServerName } = useBucketVolumeStore((state) => state);
	const isAdvanced = useAuthIsAdvanced((state) => state?.isAdvanced);
	const volIndexerHeaders = useMemo(() => indexerHeaders(t), [t]);
	const volPrimarySecondaryHeaders = useMemo(() => volTableHeader(t), [t]);
	const [priamryVolumeSelection, setPriamryVolumeSelection] = useState<string[]>([]);
	const [secondaryVolumeSelection, setSecondaryVolumeSelection] = useState<string[]>([]);
	const [indexerVolumeSelection, setIndexerVolumeSelection] = useState<string[]>([]);
	const [toggleWizardLocal, setToggleWizardLocal] = useState(false);
	const [toggleWizardExternal, setToggleWizardExternal] = useState(false);
	const [modifyVolumeToggle, setmodifyVolumeToggle] = useState<boolean>(false);
	const [toggleDetailPage, setToggleDetailPage] = useState<boolean>(false);
	const serverList = useServerStore((state) => state.serverList);
	const [selectedServerId, setSelectedServerId] = useState<string>('');
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
		type: 0
	});
	const [open, setOpen] = useState<boolean>(false);
	const [detailData, setDetailData] = useState<objAll>({
		name: '',
		id: 0,
		type: 0,
		compressBlobs: false,
		isCurrent: false,
		rootpath: '',
		compressionThreshold: ''
	});
	const [volumeList, setVolumeList] = useState<{
		primaries: Volume[];
		indexes: Volume[];
		secondaries: Volume[];
	}>({
		primaries: [],
		indexes: [],
		secondaries: []
	});
	const createSnackbar = useSnackbar();

	const changeSelectedVolume = (): void => {
		if (detailData?.type === 1 && detailData?.id !== 0) {
			const volumeObject: Volume | undefined = volumeList?.primaries?.find(
				(s: Volume) => s?.id === detailData?.id
			);
			setVolume(volumeObject);
		} else if (detailData?.type === 2 && detailData?.id !== 0) {
			const volumeObject: Volume | undefined = volumeList?.secondaries?.find(
				(s: Volume) => s?.id === detailData?.id
			);
			setVolume(volumeObject);
		} else if (detailData?.type === 10 && detailData?.id !== 0) {
			const volumeObject: Volume | undefined = volumeList?.indexes?.find(
				(s: Volume) => s?.id === detailData?.id
			);
			setVolume(volumeObject);
		}
	};

	const closeHandler = (): void => {
		setOpen(false);
	};

	const getAllVolumesRequest = useCallback((): void => {
		if (isAdvanced) {
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'getAllVolumes',
				targetServers: selectedServerName
			})
				.then((res) => {
					const result = JSON.parse(res?.Body?.response?.content);
					const getAllVolResponse = Object.keys(result?.response).map(
						(key) => result?.response[key]
					)[0];
					if (getAllVolResponse?.ok) {
						const primaries = getAllVolResponse?.response?.primaries;
						const secondaries = getAllVolResponse?.response?.secondaries;
						const indexes = getAllVolResponse?.response?.indexes;
						setVolumeList({
							primaries,
							indexes,
							secondaries
						});
					} else {
						createSnackbar({
							key: '1',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: 'Something went wrong, please try again'
							})
						});
					}
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
				});
		} else {
			soapFetch(
				'GetAllVolumes',
				{
					_jsns: 'urn:zimbraAdmin'
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				selectedServerId
			)
				.then((response) => {
					const typedResponse = response as { volume: Volume[]; _jsns: string };
					const primaries = typedResponse?.volume?.filter((item: Volume) => item?.type === 1);
					const secondaries = typedResponse?.volume?.filter((item: Volume) => item?.type === 2);
					const indexes = typedResponse?.volume?.filter((item: Volume) => item?.type === 10);
					setVolumeList({
						primaries,
						indexes,
						secondaries
					});
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
				});
		}
	}, [isAdvanced, selectedServerName, selectedServerId, createSnackbar, t]);

	const deleteHandler = async (data: { name: string; id: number }): Promise<void> => {
		if (isAdvanced) {
			await fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'doDeleteVolume',
				targetServers: selectedServerName,
				volumeName: data?.name
			})
				.then((res) => {
					const result = JSON.parse(res?.Body?.response?.content);
					const deleteResponse = Object.keys(result?.response).map(
						(key) => result?.response[key]
					)[0];
					if (deleteResponse?.ok) {
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.volume_deleted', 'Volume deleted successfully')
						});
						getAllVolumesRequest();
						setOpen(false);
						setToggleDetailPage(false);
					} else {
						createSnackbar({
							key: '1',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: 'Something went wrong, please try again'
							})
						});
						setOpen(false);
						setToggleDetailPage(false);
					}
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
					getAllVolumesRequest();
					setOpen(false);
					setToggleDetailPage(false);
				});
		} else {
			const { id } = data;
			await soapFetch(
				'DeleteVolume',
				{
					_jsns: 'urn:zimbraAdmin',
					module: 'ZxCore',
					action: 'DeleteVolumeRequest',
					id
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				selectedServerId
			)
				.then((res) => {
					const typeResponse = res as { _jsns: string };
					if (typeResponse?._jsns === 'urn:zimbraAdmin') {
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.volume_deleted', 'Volume deleted successfully')
						});
					}
					getAllVolumesRequest();
					setOpen(false);
					setToggleDetailPage(false);
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
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
						type: 0
					});
					getAllVolumesRequest();
					setOpen(false);
					setToggleDetailPage(false);
				});
		}
	};

	useEffect(() => {
		getAllVolumesRequest();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const CreateAdvancedRequest = async (attr: Volume): Promise<void> => {
		const bucketDetails = isVolumeAllDetail?.filter(
			(items: objectType) => items?.uuid === attr?.bucketConfigurationId
		);
		const obj: { [key: string]: string | boolean | number | undefined } = {};
		obj._jsns = 'urn:zimbraAdmin';
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
				const result = JSON.parse(res?.Body?.response?.content);
				if (result?.ok) {
					if (result?.response[selectedServerName]?.ok) {
						getAllVolumesRequest();
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.volume_created_msg', 'The volume has been created successfully')
						});
						setToggleWizardLocal(false);
						setToggleWizardExternal(false);
					} else {
						createSnackbar({
							key: '1',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: result?.response[selectedServerName]?.error?.message
							})
						});
					}
				} else {
					createSnackbar({
						key: '1',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						})
					});
				}
				return res;
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.volume_detail_error', '{{message}}', {
								message: 'Something went wrong, please try again'
						  }),
					autoHideTimeout: 5000
				});
				return error;
			});
	};

	const CreateVolumeRequest = async (attr: Volume): Promise<void> => {
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
					_jsns: 'urn:zimbraAdmin',
					module: 'ZxPowerstore',
					action: 'doCreateVolume',
					targetServers: selectedServerName,
					volumeName: attr?.name,
					volumeType: volType,
					storeType: 'FILE_BLOB',
					volumePath: attr?.rootpath,
					volumeCompressed: attr?.compressBlobs,
					volumeThreshold: attr?.compressionThreshold,
					isCurrent: attr?.isCurrent === 1
				},
				'zextras'
			).then(async (res: { Body: { response: { content: string } } }) => {
				const result = JSON.parse(res?.Body?.response?.content);
				const responseData = Object.values(result?.response)[0];
				const typeRes = responseData as { ok: boolean; error: string };
				if (typeRes && typeRes?.ok === true) {
					if (attr?.isCurrent) {
						await postSoapFetchRequest(
							`/service/admin/soap/zextras`,
							{
								_jsns: 'urn:zimbraAdmin',
								module: 'ZxPowerstore',
								action: 'doUpdateVolume',
								currentVolumeName: attr?.name,
								volumeCurrent: true
							},
							'zextras'
						)
							.then(() => {
								createSnackbar({
									key: '1',
									type: 'success',
									label: t('label.volume_active', '{{volumeName}} is Currently active', {
										volumeName: attr?.name
									})
								});
							})
							.catch(() => {
								createSnackbar({
									key: 'error',
									type: 'error',
									label: t('label.volume_detail_error', '{{message}}', {
										message: 'Something went wrong, please try again'
									}),
									autoHideTimeout: 5000
								});
							});
					}
					getAllVolumesRequest();
					createSnackbar({
						key: '1',
						type: 'success',
						label: t('label.volume_created_msg', 'The volume has been created successfully')
					});
					setToggleWizardLocal(false);
					setToggleWizardExternal(false);
				} else if (typeRes && typeRes?.ok === false && typeRes?.error) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
				}
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
											type: 'success',
											label: t('label.volume_active', '{{volumeName}} is Currently active', {
												volumeName: attr?.name
											})
										});
									})
									.catch(() => {
										createSnackbar({
											key: 'error',
											type: 'error',
											label: t('label.volume_detail_error', '{{message}}', {
												message: 'Something went wrong, please try again'
											}),
											autoHideTimeout: 5000
										});
									});
							}
						}
					}
					getAllVolumesRequest();
					createSnackbar({
						key: '1',
						type: 'success',
						label: t('label.volume_created_msg', 'The volume has been created successfully')
					});
					setToggleWizardLocal(false);
					setToggleWizardExternal(false);
					return res;
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.volume_detail_error', '{{message}}', {
									message: 'Something went wrong, please try again'
							  }),
						autoHideTimeout: 5000
					});
					return error;
				});
		}
	};

	const handleClick = (i: number, data: Volume[]): void => {
		const volumeObject = data?.find((s: Volume, index: number) => index === i);
		const typeVol = volumeObject as Volume;
		setVolume(typeVol);
		setToggleDetailPage(true);
	};

	useEffect(() => {
		if (serverList && serverList?.length > 0) {
			const serverData = serverList?.find((s: { name?: string }) => s?.name === server);
			if (serverData && serverData?.id) {
				setSelectedServerId(serverData?.id);
			}
		}
	}, [serverList, server]);

	useEffect(() => {
		changeSelectedVolume();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modifyVolumeToggle, detailData, volumeList]);

	return (
		<>
			{toggleWizardExternal && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<CreateMailstoresVolume
						setToggleWizardExternal={setToggleWizardExternal}
						setToggleWizardLocal={setToggleWizardLocal}
						volName={selectedServerName}
						CreateAdvancedRequest={CreateAdvancedRequest}
					/>
				</AbsoluteContainer>
			)}
			{toggleWizardLocal && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<NewVolume
						setToggleWizardLocal={setToggleWizardLocal}
						setToggleWizardExternal={setToggleWizardExternal}
						volName={selectedServerName}
						CreateVolumeRequest={CreateVolumeRequest}
					/>
				</AbsoluteContainer>
			)}
			{toggleDetailPage && volume && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<ServerVolumeDetailsPanel
						volumeDetail={volume}
						setToggleDetailPage={setToggleDetailPage}
						modifyVolumeToggle={modifyVolumeToggle}
						setmodifyVolumeToggle={setmodifyVolumeToggle}
						setOpen={setOpen}
						detailData={detailData}
						setDetailData={setDetailData}
						getAllVolumesRequest={getAllVolumesRequest}
						selectedServerId={selectedServerId}
					/>
				</AbsoluteContainer>
			)}
			{modifyVolumeToggle && volume && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<ModifyVolume
						volumeDetail={detailData}
						setmodifyVolumeToggle={setmodifyVolumeToggle}
						getAllVolumesRequest={getAllVolumesRequest}
						selectedServerId={selectedServerId}
						volumeList={volumeList}
					/>
				</AbsoluteContainer>
			)}

			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto' }}
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
					<Text size="extralarge" weight="bold">
						{t('volume.serverName_volumes', '{{serverName}} Volumes', {
							serverName: selectedServerName
						})}
					</Text>
				</Row>
				<Divider />
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
										volumeAllocation: 0
									});
									isAdvanced
										? setToggleWizardExternal(!toggleWizardExternal)
										: setToggleWizardLocal(!toggleWizardLocal);
								}}
							/>
						</Row>
						<Row
							width="100%"
							mainAlignment="flex-start"
							orientation="horizontal"
							padding={{ horizontal: 'large', top: 'large', bottom: 'large' }}
						>
							<Text>{t('volume.primary_helperText', 'Primary')}</Text>
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
							/>
						</Row>

						<Row
							width="100%"
							mainAlignment="flex-start"
							orientation="horizontal"
							padding={{
								horizontal: 'large',
								bottom: 'large',
								top: 'small'
							}}
						>
							<Text>{t('volume.secondary_helperText', 'Secondary')}</Text>
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
							/>
						</Row>
						<Row
							width="100%"
							mainAlignment="flex-start"
							orientation="horizontal"
							padding={{ horizontal: 'large', bottom: 'large' }}
						>
							<Text>{t('volume.indexer_helperText', 'Indexer')}</Text>
						</Row>
						<Row
							padding={{
								horizontal: 'large',
								bottom: 'extralarge'
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
							/>
						</Row>
					</Container>
				</Container>
			</RelativeContainer>
		</>
	);
};

export default VolumesDetailPanel;
