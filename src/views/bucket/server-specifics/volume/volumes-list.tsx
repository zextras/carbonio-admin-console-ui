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
import { NO, YES } from '../../../../constants';
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

const RelativeContainer = styled(Container)`
	position: relative;
`;

const VolumeListTable: FC<{
	volumes: Array<any>;
	selectedRows: any;
	onSelectionChange: any;
	headers: any;
	onClick: any;
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
						{v?.id}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.name}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.rootpath}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text color={v?.isCurrent ? 'text' : 'error'}>{v?.isCurrent ? YES : NO}</Text>
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text color={v?.compressBlobs ? 'text' : 'error'}>{v?.compressBlobs ? YES : NO}</Text>
					</Row>
				],
				clickable: true
			})),
		[onClick, volumes]
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
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>{t('label.empty_table', 'Empty Table')}</Text>
				</Row>
			)}
		</Container>
	);
};

const VolumesDetailPanel: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const context = useContext(VolumeContext);
	const { volumeDetail, setVolumeDetail } = context;
	const selectedServerName = useBucketVolumeStore((state) => state.selectedServerName);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const volIndexerHeaders = useMemo(() => indexerHeaders(t), [t]);
	const volPrimarySecondaryHeaders = useMemo(() => volTableHeader(t), [t]);
	const [priamryVolumeSelection, setPriamryVolumeSelection] = useState('');
	const [secondaryVolumeSelection, setSecondaryVolumeSelection] = useState('');
	const [indexerVolumeSelection, setIndexerVolumeSelection] = useState('');
	const [toggleWizardLocal, setToggleWizardLocal] = useState(false);
	const [toggleWizardExternal, setToggleWizardExternal] = useState(false);
	const [detailsVolume, setDetailsVolume] = useState(false);
	const [createMailstoresVolumeData, setCreateMailstoresVolumeData] = useState();
	const [modifyVolumeToggle, setmodifyVolumeToggle] = useState(false);
	const [toggleDetailPage, setToggleDetailPage] = useState(false);
	const serverList = useServerStore((state) => state.serverList);
	const [selectedServerId, setSelectedServerId] = useState<string>('');
	const [volume, setVolume] = useState<{
		compressBlobs: string;
		compressionThreshold: number;
		fbits: number;
		fgbits: number;
		id: number;
		isCurrent: true;
		mbits: number;
		mgbits: number;
		name: string;
		rootpath: string;
		type: number;
	}>({
		compressBlobs: '',
		compressionThreshold: 0,
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
	const [open, setOpen] = useState(false);
	const [detailData, setDetailData] = useState({
		name: '',
		id: 0,
		type: 0,
		compressBlobs: false,
		isCurrent: false,
		rootpath: '',
		compressionThreshold: ''
	});
	const [volumeList, setVolumeList] = useState<object | any>({
		primaries: [],
		indexes: [],
		secondaries: []
	});
	const createSnackbar = useSnackbar();

	const changeSelectedVolume = (): any => {
		if (volume?.type === 1 && volume.id !== 0) {
			const volumeObject: any = volumeList?.primaries.find((s: any) => s.id === volume.id);
			setVolume(volumeObject);
		} else if (volume?.type === 2 && volume.id !== 0) {
			const volumeObject: any = volumeList?.secondaries.find((s: any) => s.id === volume.id);
			setVolume(volumeObject);
		} else if (volume?.type === 10 && volume.id !== 0) {
			const volumeObject: any = volumeList?.indexes.find((s: any) => s.id === volume.id);
			setVolume(volumeObject);
		}
	};

	const closeHandler = (): any => {
		setOpen(false);
	};

	const getAllVolumesRequest = useCallback((): void => {
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
			.then((response: any) => {
				const primaries = response?.volume.filter((item: any) => item.type === 1);
				const secondaries = response?.volume.filter((item: any) => item.type === 2);
				const indexes = response?.volume.filter((item: any) => item.type === 10);
				setVolumeList({
					primaries,
					indexes,
					secondaries
				});
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.volume_detail_error', '{{message}}', {
						message: error
					}),
					autoHideTimeout: 5000
				});
			});
	}, [createSnackbar, t, selectedServerId]);

	const deleteHandler = (id: any): any => {
		soapFetch(
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
			.then((res: any) => {
				if (res?._jsns === 'urn:zimbraAdmin') {
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
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.volume_detail_error', '{{message}}', {
						message: error
					}),
					autoHideTimeout: 5000
				});
				setVolume({
					compressBlobs: '',
					compressionThreshold: 0,
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
	};

	useEffect(() => {
		getAllVolumesRequest();
	}, [getAllVolumesRequest]);

	const CreateVolumeRequest = async (attr: {
		id: string;
		name: string;
		type: number;
		rootpath: string;
		isCurrent: number;
		compressBlobs: number;
		compressionThreshold: string;
	}): Promise<any> => {
		await soapFetch(
			'CreateVolume',
			{
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxCore',
				action: 'CreateVolumeRequest',
				volume: attr
			},
			undefined,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			selectedServerId
		)
			.then(async (res: any) => {
				if (attr?.isCurrent === 1) {
					await fetchSoap('SetCurrentVolumeRequest', {
						_jsns: 'urn:zimbraAdmin',
						module: 'ZxCore',
						action: 'SetCurrentVolumeRequest',
						id: res?.volume[0]?.id,
						type: res?.volume[0]?.type
					})
						.then(() => {
							createSnackbar({
								key: '1',
								type: 'success',
								label: t('label.volume_active', '{{volumeName}} is Currently active', {
									volumeName: attr?.name
								})
							});
						})
						.catch((error) => {
							createSnackbar({
								key: 'error',
								type: 'error',
								label: t('label.volume_detail_error', '{{message}}', {
									message: error
								}),
								autoHideTimeout: 5000
							});
						});
				}
				getAllVolumesRequest();
				setToggleWizardLocal(false);
				setToggleWizardExternal(false);
				createSnackbar({
					key: '1',
					type: 'success',
					label: t('label.volume_created', 'Volume created successfully')
				});
				setToggleWizardLocal(false);
				setToggleWizardExternal(false);
				setDetailsVolume(false);
				return res;
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.volume_detail_error', '{{message}}', {
								message: error
						  }),
					autoHideTimeout: 5000
				});
				return error;
			});
	};

	const handleClick = (i: number, data: any): void => {
		const volumeObject: any = data.find((s: any, index: any) => index === i);
		setVolume(volumeObject);
		setToggleDetailPage(true);
	};

	useEffect(() => {
		if (serverList && serverList.length > 0) {
			const serverData = serverList.find((s: any) => s?.name === server);
			if (serverData && serverData?.id) {
				setSelectedServerId(serverData?.id);
			}
		}
	}, [serverList, server]);

	return (
		<>
			{toggleWizardExternal && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<CreateMailstoresVolume
						setToggleWizardExternal={setToggleWizardExternal}
						setToggleWizardLocal={setToggleWizardLocal}
						setDetailsVolume={setDetailsVolume}
						setCreateMailstoresVolumeData={setCreateMailstoresVolumeData}
						volName={selectedServerName}
						CreateVolumeRequest={CreateVolumeRequest}
					/>
				</AbsoluteContainer>
			)}
			{toggleWizardLocal && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<NewVolume
						setToggleWizardLocal={setToggleWizardLocal}
						setToggleWizardExternal={setToggleWizardExternal}
						setDetailsVolume={setDetailsVolume}
						setCreateMailstoresVolumeData={setCreateMailstoresVolumeData}
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
						changeSelectedVolume={changeSelectedVolume}
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
						changeSelectedVolume={changeSelectedVolume}
						getAllVolumesRequest={getAllVolumesRequest}
						selectedServerId={selectedServerId}
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
					height="calc(100vh - 200px)"
					padding={{ top: 'extralarge', bottom: 'large' }}
				>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							width="100%"
							mainAlignment="flex-end"
							orientation="horizontal"
							padding={{ top: 'small', right: 'large', left: 'large' }}
							style={{ gap: '16px' }}
						>
							<Button
								type="outlined"
								label={t('label.new_volume_button', 'NEW VOLUME')}
								icon="PlusOutline"
								color="primary"
								onClick={(): any => {
									setVolumeDetail({
										id: '',
										volumeName: '',
										volumeMain: 1,
										path: '',
										isCurrent: false,
										isCompression: false,
										compressionThreshold: 0,
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
							<Text>Primary</Text>
						</Row>
						<Row padding={{ horizontal: 'large', bottom: 'extralarge' }} width="100%">
							<VolumeListTable
								volumes={volumeList?.primaries}
								headers={volPrimarySecondaryHeaders}
								selectedRows={priamryVolumeSelection}
								onSelectionChange={(selected: any): any => {
									setPriamryVolumeSelection(selected);
								}}
								onClick={(i: any): any => {
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
							<Text>Secondary</Text>
						</Row>
						<Row padding={{ horizontal: 'large', bottom: 'extralarge' }} width="100%">
							<VolumeListTable
								volumes={volumeList?.secondaries}
								headers={volPrimarySecondaryHeaders}
								selectedRows={secondaryVolumeSelection}
								onSelectionChange={(selected: any): any => {
									setSecondaryVolumeSelection(selected);
								}}
								onClick={(i: any): any => {
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
							<Text>Indexer</Text>
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
								onSelectionChange={(selected: any): any => {
									setIndexerVolumeSelection(selected);
								}}
								onClick={(i: any): any => {
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
