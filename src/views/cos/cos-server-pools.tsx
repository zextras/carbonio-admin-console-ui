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
	Switch,
	Table,
	Padding,
	Input,
	Button,
	Icon,
	Modal,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';
import ListRow from '../list/list-row';
import Paging from '../components/paging';
import { useCosStore } from '../../store/cos/store';
import { getAllServers } from '../../services/get-all-servers-service';
import { modifyCos } from '../../services/modify-cos-service';
import { DISABLED, ENABLED } from '../../constants';
import { useMailstoreListStore } from '../../store/mailstore-list/store';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';

const CosServerPools: FC = () => {
	const [t] = useTranslation();
	const { cosId }: { cosId: string } = useParams();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [zimbraMailHostPool, setZimbraMailHostPool] = useState<boolean>(true);
	const [serverList, setServerList] = useState<Array<any>>([]);
	const [zimbraMailHostPoolList, setZimbraMailHostPoolList] = useState<Array<any>>([]);
	const [serverTableRows, setServerTableRows] = useState<Array<any>>([]);
	const [selectedTableRows, setSelectedTableRows] = useState<Array<any>>([]);
	const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const setCos = useCosStore((state) => state.setCos);
	const [searchServer, setSearchServer] = useState<string>('');
	const allMailStoreList = useMailstoreListStore((state) => state.allMailstoreList);

	useEffect(() => {
		if (allMailStoreList && allMailStoreList.length > 0) {
			setServerList(allMailStoreList);
		}
	}, [allMailStoreList]);

	useMemo(() => {
		if (serverList && serverList.length > 0) {
			const allRows = serverList.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="small" weight="light" key={item?.id} color="gray0">
						{item?.name}
					</Text>,
					<Text key={item?.id}>
						{zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c ? (
							<Text size="small" weight="light">
								{t('cos.enabled', 'Enabled')}
							</Text>
						) : (
							<Text size="small" weight="light" color="error">
								{t('cos.disabled', 'Disabled')}
							</Text>
						)}
					</Text>
				]
			}));
			setServerTableRows(allRows);
		}
	}, [serverList, zimbraMailHostPoolList, t]);

	const enable = useMemo(
		() =>
			selectedTableRows.length > 0 &&
			!zimbraMailHostPoolList.find((sp: any) => selectedTableRows[0] === sp?._content)?.c,
		[selectedTableRows, zimbraMailHostPoolList]
	);

	const disable = useMemo(
		() =>
			selectedTableRows.length > 0 &&
			zimbraMailHostPoolList.find((sp: any) => selectedTableRows[0] === sp?._content)?.c,
		[selectedTableRows, zimbraMailHostPoolList]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const list = cosInformation.filter((item: any) => item?.n === 'zimbraMailHostPool');
			if (list) {
				setZimbraMailHostPoolList(list);
			}
		}
	}, [cosInformation]);

	const onFilterApply = useCallback(
		(e) => {
			if (e === null) {
				return;
			}
			if (e === ENABLED) {
				const allRows = serverList
					.filter(
						(item: any) =>
							zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c === true
					)
					.map((item: any) => ({
						id: item?.id,
						columns: [
							<Text size="small" weight="light" key={item?.id} color="gray0">
								{item?.name}
							</Text>,
							<Text key={item?.id}>
								{zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c ? (
									<Text size="small" weight="light">
										{t('cos.enabled', 'Enabled')}
									</Text>
								) : (
									<Text size="small" weight="light" color="error">
										{t('cos.disabled', 'Disabled')}
									</Text>
								)}
							</Text>
						]
					}));
				setServerTableRows(allRows);
			}
			if (e === DISABLED) {
				const allRows = serverList
					.filter(
						(item: any) => !zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c
					)
					.map((item: any) => ({
						id: item?.id,
						columns: [
							<Text size="small" weight="light" key={item?.id} color="gray0">
								{item?.name}
							</Text>,
							<Text key={item?.id}>
								{zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c ? (
									<Text size="small" weight="light">
										{t('cos.enabled', 'Enabled')}
									</Text>
								) : (
									<Text size="small" weight="light" color="error">
										{t('cos.disabled', 'Disabled')}
									</Text>
								)}
							</Text>
						]
					}));
				setServerTableRows(allRows);
			}
		},
		[t, serverList, zimbraMailHostPoolList]
	);

	const tableHeader: any[] = useMemo(
		() => [
			{
				id: 'name_server',
				label: t('cos.name_server', 'Name Server'),
				width: '80%',
				bold: true
			},
			{
				id: 'status',
				label: t('cos.status', 'Status'),
				width: '20%',
				align: 'left',
				bold: true,
				items: [
					{ label: t('cos.enabled', 'Enabled'), value: 'enabled' },
					{ label: t('cos.disabled', 'Disabled'), value: 'disabled' }
				],
				onChange: (e: any): void => {
					onFilterApply(e);
				}
			}
		],
		[t, onFilterApply]
	);

	const onDisable = useCallback(() => {
		setOpenConfirmDialog(true);
	}, []);

	const onModifyCOS = useCallback(
		(body) => {
			modifyCos(body)
				.then((data) => {
					const cos: any = data?.cos[0];
					if (cos) {
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t(
								'label.the_last_changes_has_been_saved_successfully',
								'Changes have been saved successfully'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setCos(cos);
					}
					setOpenConfirmDialog(false);
					setSelectedTableRows([]);
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, setCos]
	);

	const onEnable = useCallback(() => {
		const attributes: any[] = [];
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		zimbraMailHostPoolList.forEach((item: any) => {
			attributes.push({
				n: 'zimbraMailHostPool',
				_content: item?._content
			});
		});
		attributes.push({
			n: 'zimbraMailHostPool',
			_content: selectedTableRows[0]
		});
		body.a = attributes;
		body.id = {
			_content: cosId
		};
		onModifyCOS(body);
	}, [selectedTableRows, zimbraMailHostPoolList, onModifyCOS, cosId]);

	const onDisableServer = useCallback(() => {
		const allServers = zimbraMailHostPoolList.filter(
			(item: any) => item?._content !== selectedTableRows[0]
		);
		const attributes: any[] = [];
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		if (allServers.length === 0) {
			attributes.push({
				n: 'zimbraMailHostPool',
				_content: ''
			});
		} else if (allServers.length > 0) {
			allServers.forEach((item: any) => {
				attributes.push({
					n: 'zimbraMailHostPool',
					_content: item?._content
				});
			});
		}
		body.a = attributes;
		body.id = {
			_content: cosId
		};
		onModifyCOS(body);
	}, [selectedTableRows, zimbraMailHostPoolList, onModifyCOS, cosId]);

	const hideConfirmDialog = useCallback(() => {
		setOpenConfirmDialog(false);
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchServerLists = useCallback(
		debounce((searchText, serverListItems) => {
			if (searchText !== '') {
				const allRows = serverListItems
					.filter((item: any) => item?.name.includes(searchText))
					.map((item: any) => ({
						id: item?.id,
						columns: [
							<Text size="small" weight="light" key={item?.id} color="gray0">
								{item?.name}
							</Text>,
							<Text key={item?.id}>
								{zimbraMailHostPoolList.find((sp: any) => item?.id === sp?._content)?.c ? (
									<Text size="small" weight="light">
										{t('cos.enabled', 'Enabled')}
									</Text>
								) : (
									<Text size="small" weight="light" color="error">
										{t('cos.disabled', 'Disabled')}
									</Text>
								)}
							</Text>
						]
					}));
				setServerTableRows(allRows);
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchServerLists(searchServer, serverList);
	}, [searchServer, searchServerLists, serverList]);

	useEffect(() => {
		if (zimbraMailHostPoolList && serverList.length > 0) {
			if (
				zimbraMailHostPoolList.length ===
				zimbraMailHostPoolList.filter((item: any) => !item?.c).length
			) {
				setZimbraMailHostPool(false);
			}
		}
	}, [zimbraMailHostPoolList, serverList]);

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ all: 'large' }}>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row
						orientation="horizontal"
						mainAlignment="flex-start"
						width="100%"
						padding={{ all: 'large' }}
					>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.server_pools', '"Server Pools')}
							</Text>
						</Row>
					</Row>
				</Container>
			</Row>
			<Divider />
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				padding={{ top: 'large' }}
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<ListRow>
						<Text size="extralarge" weight="bold">
							{t('cos.general_options', 'General Options')}
						</Text>
					</ListRow>
					<ListRow>
						<Padding bottom="large" top="large">
							<Switch
								value={zimbraMailHostPool}
								label={t(
									'cos.limt_serverpool_avaiable_create_user',
									'Limit server pool available for creating new users in this COS'
								)}
								onClick={(): void => {
									setZimbraMailHostPool(!zimbraMailHostPool);
								}}
							/>
						</Padding>
					</ListRow>
					{zimbraMailHostPool && (
						<>
							<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
								<Container orientation="vertical" mainAlignment="space-around" height="56px">
									<Row orientation="horizontal" width="100%">
										<Row
											padding={{ right: 'small' }}
											mainAlignment="flex-start"
											width="65%"
											crossAlignment="flex-start"
										>
											<Input
												value={searchServer}
												label={t('cos.search_a_specific_server', 'Search for a specific server')}
												CustomIcon={(): any => (
													<Icon icon="FunnelOutline" size="large" color="secondary" />
												)}
												onChange={(e: any): any => {
													setSearchServer(e.target.value);
												}}
											/>
										</Row>
										<Row padding={{ all: 'small' }} width="35%">
											<Padding left="small" right="large">
												<Button
													type="outlined"
													key="add-button"
													label={t('label.enable', 'enable')}
													color="primary"
													icon="CheckmarkCircleOutline"
													iconPlacement="right"
													disabled={!enable}
													onClick={onEnable}
													size="extralarge"
												/>
											</Padding>

											<Button
												type="outlined"
												key="add-button"
												label={t('label.disable', 'disable')}
												color="error"
												icon="CloseCircleOutline"
												iconPlacement="right"
												size="extralarge"
												disabled={!disable}
												onClick={onDisable}
											/>
										</Row>
									</Row>
								</Container>
							</Row>
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								height="calc(100vh - 340px)"
								padding={{ top: 'large' }}
							>
								<Table
									style={{ overflow: 'auto', height: '100%' }}
									multiSelect={false}
									rows={serverTableRows}
									headers={tableHeader}
									showCheckbox={false}
									selectedRows={selectedTableRows}
									onSelectionChange={(selected: any): void => setSelectedTableRows(selected)}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
							</Row>
							{/* <ListRow>
								<Divider />
							</ListRow>
							<ListRow>
								<Paging
									totalItem={1}
									pageSize={10}
									setOffset={(): void => {
										console.log('setOffset for paging');
									}}
								/>
							</ListRow> */}
						</>
					)}
				</Container>
			</Container>

			<Modal
				title={`${t('cos.disabling_pool', 'Disabling pool')}`}
				open={openConfirmDialog}
				showCloseIcon
				onClose={(): void => {
					setOpenConfirmDialog(false);
				}}
				customFooter={
					<Container orientation="horizontal" mainAlignment="space-between">
						<Button
							label={t('label.helo', 'Help')}
							type="outlined"
							color="primary"
							onClick={hideConfirmDialog}
						/>
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Padding all="small">
								<Button
									label={t('label.no_go_back', 'No, Go Back')}
									color="secondary"
									onClick={hideConfirmDialog}
								/>
							</Padding>
							<Button
								label={t('cos.yes_disable', 'Yes, Disable')}
								color="error"
								onClick={onDisableServer}
							/>
						</Container>
					</Container>
				}
			>
				<Padding all="medium">
					<Text overflow="break-word" weight="regular">
						{t('cos.create_cos_success_msg', {
							serverName: serverList.find((sp: any) => sp?.id === selectedTableRows[0])?.name,
							defaultValue:
								'You are disabling pool on {{serverName}}. All mailboxes will be not moved. Are you sure you want to delete it?'
						})}
					</Text>
				</Padding>
			</Modal>
		</Container>
	);
};

export default CosServerPools;
