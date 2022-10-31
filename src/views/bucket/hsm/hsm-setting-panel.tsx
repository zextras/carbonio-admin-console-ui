/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Button,
	Padding,
	Text,
	Divider,
	Switch,
	Input,
	Table,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest,
	soapFetch
} from '@zextras/carbonio-shell-ui';
import { fetchSoap } from '../../../services/bucket-service';
import ListRow from '../../list/list-row';
import CreateHsmPolicy from './create-hsm-policy/create-hsm-policy';
import EditHsmPolicy from './edit-hsm-policy/edit-hsm-policy';
import DeleteHsmPolicy from './delete-policy/delete-hsm-policy';
import { useServerStore } from '../../../store/server/store';
import {
	APPOINTMENT,
	CONTACT,
	DOCUMENT,
	MESSAGE,
	SERVER,
	VOLUME_INDEX_TYPE
} from '../../../constants';
import { updateBackup } from '../../../services/update-backup';

const HSMsettingPanel: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [policies, setPolicies] = useState<any>([]);
	const [policiesRow, setPoliciesRow] = useState<any>([]);
	const [showCreateHsmPolicyView, setShowCreateHsmPolicyView] = useState<boolean>(false);
	const [showEditHsmPolicyView, setShowEditHsmPolicyView] = useState<boolean>(false);
	const [showDeletePolicyView, setShowDeletePolicyView] = useState<boolean>(false);
	const serverList = useServerStore((state) => state.serverList);
	const [isPowerstoreMoveSchedulerEnabled, setIsPowerstoreMoveSchedulerEnabled] =
		useState<boolean>(false);
	const [powerstoreMoveSchedulerValue, setPowerstoreMoveSchedulerValue] = useState<string>('');
	const [powerstoreSpaceThreshold, setPowerstoreSpaceThreshold] = useState<number>(0);
	const [deduplicateAfterScheduledMoveBlobs, setDeduplicateAfterScheduledMoveBlobs] =
		useState<boolean>(false);
	const [oldValues, setOldValues] = useState<any>({});
	const [volumeList, setVolumeList] = useState<any>([]);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [selectedPolicies, setSelectedPolicies] = useState<Array<any>>([]);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isVolumeInProgress, setIsVolumeInProgress] = useState<boolean>(false);
	const [isEditSaveInProgress, setIsEditSaveInProgress] = useState<boolean>(false);

	const headers = useMemo(
		() => [
			{
				id: 'plicy',
				label: t('hsm.policy_name', 'Policy Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const getHSMPolicyList = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxPowerstore',
			action: 'getHSMPolicy',
			targetServer: server
		}).then((res: any) => {
			if (res?.Body?.response?.content) {
				const content = JSON.parse(res?.Body?.response?.content);
				if (
					content?.response?.policies &&
					Array.isArray(content?.response?.policies) &&
					content?.response?.policies?.length > 0
				) {
					setPolicies(content?.response?.policies);
				} else {
					setPolicies([]);
				}
			}
		});
	}, [server]);

	useEffect(() => {
		getHSMPolicyList();
	}, [server, getHSMPolicyList]);

	const getHSMType = (hsmType: Array<any>): string => {
		let hsmTypeString = '';
		if (hsmType.length > 0) {
			const item: string[] = [];
			if (hsmType.length === 4) {
				hsmTypeString = 'document,message,contact,appointment:';
			} else {
				hsmType.forEach((element: any) => {
					if (element === 5) {
						item.push(MESSAGE);
					} else if (element === 8) {
						item.push(DOCUMENT);
					} else if (element === 11) {
						item.push(APPOINTMENT);
					} else if (element === 6) {
						item.push(CONTACT);
					}
				});
				hsmTypeString = `${item.join()}:`;
			}
		}
		return hsmTypeString;
	};

	useEffect(() => {
		if (policies.length > 0) {
			const allRows = policies.map((item: any) => ({
				id: item?.hsmQuery,
				columns: [
					<Text size="medium" weight="bold" key={item?.hsmQuery} color="#828282">
						{getHSMType(item?.hsmType)}
						{item?.hsmQuery}
					</Text>
				]
			}));
			setPoliciesRow(allRows);
		} else {
			setPoliciesRow([]);
		}
	}, [policies]);

	const getZxPowerStoreServers = useCallback(() => {
		getSoapFetchRequest(
			`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`
		).then((data: any) => {
			const serv = data?.servers;
			if (serv && serv.length > 0) {
				const olderValues: any = {};
				serverList.forEach((item: any) => {
					const id = item?.id;
					const selectedServer = serv.find((sItem: any) => sItem[id]);
					if (selectedServer && selectedServer[id]) {
						const values = selectedServer[id];
						if (values) {
							const attributes = values?.ZxPowerstore?.attributes;
							if (attributes) {
								if (attributes?.powerstoreMoveScheduler) {
									const schedulerEnabled =
										attributes?.powerstoreMoveScheduler?.value?.['cron-enabled'];
									if (schedulerEnabled) {
										setIsPowerstoreMoveSchedulerEnabled(true);
										olderValues.isPowerstoreMoveSchedulerEnabled = true;
									} else {
										setIsPowerstoreMoveSchedulerEnabled(false);
										olderValues.isPowerstoreMoveSchedulerEnabled = false;
									}

									const schedulePattern =
										attributes?.powerstoreMoveScheduler?.value?.['cron-pattern'];
									if (schedulePattern) {
										setPowerstoreMoveSchedulerValue(schedulePattern);
										olderValues.powerstoreMoveSchedulerValue = schedulePattern;
									} else {
										setPowerstoreMoveSchedulerValue('');
										olderValues.powerstoreMoveSchedulerValue = '';
									}
								}
								if (attributes?.ZxPowerstore_SpaceThreshold) {
									const spaceThreshold = attributes?.ZxPowerstore_SpaceThreshold?.value;
									if (spaceThreshold) {
										setPowerstoreSpaceThreshold(spaceThreshold);
										olderValues.powerstoreSpaceThreshold = spaceThreshold;
									} else {
										setPowerstoreSpaceThreshold(0);
										olderValues.powerstoreSpaceThreshold = 0;
									}
								}

								if (attributes?.deduplicateAfterScheduledMoveBlobs) {
									const duplicate = attributes?.deduplicateAfterScheduledMoveBlobs;
									if (duplicate) {
										setDeduplicateAfterScheduledMoveBlobs(true);
										olderValues.deduplicateAfterScheduledMoveBlobs = true;
									} else {
										setDeduplicateAfterScheduledMoveBlobs(false);
										olderValues.deduplicateAfterScheduledMoveBlobs = false;
									}
								}
							}
						}
					}
				});
				setOldValues(olderValues);
				setIsDirty(false);
			}
		});
	}, [serverList]);

	const getAllVolumes = useCallback(() => {
		const serverId = serverList.find((item: any) => item?.name === server);
		setIsVolumeInProgress(true);
		setVolumeList([]);
		if (serverId) {
			soapFetch(
				'GetAllVolumes',
				{
					_jsns: 'urn:zimbraAdmin'
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				serverId
			).then((response: any) => {
				setIsVolumeInProgress(false);
				if (response?.volume && response?.volume.length > 0) {
					setVolumeList(response?.volume.filter((item: any) => item.type !== VOLUME_INDEX_TYPE));
				}
			});
		}
	}, [server, serverList]);

	useEffect(() => {
		if (server && serverList && serverList.length > 0) {
			getZxPowerStoreServers();
			getAllVolumes();
		}
	}, [server, getZxPowerStoreServers, serverList, getAllVolumes]);

	const onCancel = useCallback(() => {
		setIsPowerstoreMoveSchedulerEnabled(oldValues?.isPowerstoreMoveSchedulerEnabled);
		setPowerstoreMoveSchedulerValue(oldValues?.powerstoreMoveSchedulerValue);
		setPowerstoreSpaceThreshold(oldValues?.powerstoreSpaceThreshold);
		setDeduplicateAfterScheduledMoveBlobs(oldValues?.deduplicateAfterScheduledMoveBlobs);
		setIsDirty(false);
	}, [
		oldValues?.isPowerstoreMoveSchedulerEnabled,
		oldValues?.powerstoreMoveSchedulerValue,
		oldValues?.powerstoreSpaceThreshold,
		oldValues?.deduplicateAfterScheduledMoveBlobs
	]);

	const onSave = useCallback(() => {
		setIsRequestInProgress(true);
		const body: any = {
			powerstoreMoveScheduler: {
				value: {
					'cron-pattern': powerstoreMoveSchedulerValue,
					'cron-enabled': isPowerstoreMoveSchedulerEnabled
				},
				objectName: server,
				configType: SERVER
			},
			ZxPowerstore_SpaceThreshold: {
				value: powerstoreSpaceThreshold,
				objectName: server,
				configType: SERVER
			},
			deduplicateAfterScheduledMoveBlobs: {
				value: deduplicateAfterScheduledMoveBlobs,
				objectName: server,
				configType: SERVER
			}
		};
		updateBackup(body)
			.then((data: any) => {
				setIsRequestInProgress(false);
				if ((data?.errors && Array.isArray(data?.errors)) || data?.error) {
					let errorMessage = t(
						'label.something_wrong_error_msg',
						'Something went wrong. Please try again.'
					);
					if (data?.errors && Array.isArray(data?.errors) && data?.errors[0]?.error) {
						errorMessage = data?.errors[0]?.error;
					} else if (data?.error) {
						errorMessage = data?.error;
					}
					createSnackbar({
						key: 'error',
						type: 'error',
						label: errorMessage,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					setIsDirty(false);
					setOldValues((prev: any) => ({
						...prev,
						isPowerstoreMoveSchedulerEnabled,
						powerstoreMoveSchedulerValue,
						powerstoreSpaceThreshold,
						deduplicateAfterScheduledMoveBlobs
					}));
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
				}
			})
			.catch((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error
						? error?.error
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		powerstoreMoveSchedulerValue,
		isPowerstoreMoveSchedulerEnabled,
		powerstoreSpaceThreshold,
		server,
		deduplicateAfterScheduledMoveBlobs,
		createSnackbar,
		t
	]);

	useEffect(() => {
		if (
			oldValues.isPowerstoreMoveSchedulerEnabled !== undefined &&
			oldValues.isPowerstoreMoveSchedulerEnabled !== isPowerstoreMoveSchedulerEnabled
		) {
			setIsDirty(true);
		}
	}, [oldValues.isPowerstoreMoveSchedulerEnabled, isPowerstoreMoveSchedulerEnabled]);

	useEffect(() => {
		if (
			oldValues.powerstoreMoveSchedulerValue !== undefined &&
			oldValues.powerstoreMoveSchedulerValue !== powerstoreMoveSchedulerValue
		) {
			setIsDirty(true);
		}
	}, [oldValues.powerstoreMoveSchedulerValue, powerstoreMoveSchedulerValue]);

	useEffect(() => {
		if (
			oldValues.powerstoreSpaceThreshold !== undefined &&
			oldValues.powerstoreSpaceThreshold !== powerstoreSpaceThreshold
		) {
			setIsDirty(true);
		}
	}, [oldValues.powerstoreSpaceThreshold, powerstoreSpaceThreshold]);

	useEffect(() => {
		if (
			oldValues.deduplicateAfterScheduledMoveBlobs !== undefined &&
			oldValues.deduplicateAfterScheduledMoveBlobs !== deduplicateAfterScheduledMoveBlobs
		) {
			setIsDirty(true);
		}
	}, [oldValues.deduplicateAfterScheduledMoveBlobs, deduplicateAfterScheduledMoveBlobs]);

	const onDeletePolicy = useCallback(
		(isEditSave?: boolean) => {
			setIsRequestInProgress(true);
			const hType = policies.find((item: any) => item?.hsmQuery === selectedPolicies[0]);
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'removeHSMPolicy',
				targetServer: server,
				hsmPolicy: `${getHSMType(hType?.hsmType)}${selectedPolicies[0]}`
			})
				.then((res: any) => {
					setIsRequestInProgress(false);
					if (res?.Body?.response?.content) {
						const info = JSON.parse(res?.Body?.response?.content);
						getHSMPolicyList();
						if (info?.ok) {
							setSelectedPolicies([]);
							setShowDeletePolicyView(false);
							setIsEditSaveInProgress(false);
							if (isEditSave) {
								setShowEditHsmPolicyView(false);
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t('hsm.edit_hsm_policy_success', 'HSM Policy updated successfully'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							} else {
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t('hsm.hsm_policy_correctly_deleted', 'HSM Policy was correctly deleted'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
						}
					}
				})
				.catch((error) => {
					setIsRequestInProgress(false);
					setIsEditSaveInProgress(false);
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
		[server, selectedPolicies, t, createSnackbar, getHSMPolicyList, policies]
	);

	const createHSMpolicy = useCallback(
		(hsmPolicyDetail: any, isEditSave?: boolean) => {
			let policy = '';
			const criteriaScale: string[] = [];
			if (hsmPolicyDetail?.isAllEnabled) {
				policy += 'document,message,contact,appointment:';
			} else {
				if (hsmPolicyDetail?.isMessageEnabled) {
					criteriaScale.push('message');
				}
				if (hsmPolicyDetail?.isEventEnabled) {
					criteriaScale.push('appointment');
				}
				if (hsmPolicyDetail?.isContactEnabled) {
					criteriaScale.push('contact');
				}
				if (hsmPolicyDetail?.isDocumentEnabled) {
					criteriaScale.push('document');
				}
			}
			if (criteriaScale.length > 0) {
				policy += `${criteriaScale.toString()}:`;
			}
			if (hsmPolicyDetail?.policyCriteria.length > 0) {
				hsmPolicyDetail?.policyCriteria.forEach((item: any, index: number) => {
					if (item?.option === 'before') {
						policy += `${item?.option}:-${item?.dateScale}${item?.scale} `;
					} else if (item?.option === 'after') {
						policy += `${item?.option}:${item?.dateScale}${item?.scale} `;
					} else if (item?.option === 'larger' || item?.option === 'smaller') {
						policy += `${item?.option}:${item?.dateScale}${item?.scale} `;
					}
				});
			}
			if (hsmPolicyDetail?.sourceVolume?.length > 0) {
				policy += ` source:${hsmPolicyDetail?.sourceVolume
					.map((item: any) => item?.id)
					.toString()}`;
			}
			if (hsmPolicyDetail?.destinationVolume?.length > 0) {
				policy += ` destination:${hsmPolicyDetail?.destinationVolume
					.map((item: any) => item?.id)
					.toString()}`;
			}
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				action: 'setHSMPolicy',
				targetServer: server,
				hsmPolicy: policy,
				policyToAdd: true
			})
				.then((res: any) => {
					if (res?.Body?.response?.content) {
						const info = JSON.parse(res?.Body?.response?.content);
						if (info?.ok) {
							if (isEditSave) {
								onDeletePolicy(isEditSave);
							} else {
								setShowCreateHsmPolicyView(false);
								getHSMPolicyList();
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t(
										'hsm.policies_added_successfully',
										'Policies have been added successfully'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
						}
					}
				})
				.catch((error) => {
					setIsEditSaveInProgress(false);
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
		[server, createSnackbar, t, getHSMPolicyList, onDeletePolicy]
	);

	const onEditSave = useCallback(
		(editDetail: any) => {
			setIsEditSaveInProgress(true);
			createHSMpolicy(editDetail, true);
		},
		[createHSMpolicy]
	);
	return (
		<Container mainAlignment="flex-start" width="100%">
			<Row
				takeAvwidth="fill"
				mainAlignment="flex-start"
				width="100%"
				padding={{ left: 'large', right: 'large', bottom: 'medium', top: 'medium' }}
			>
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="40px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{
									<Trans
										i18nKey="hsm.name_hsm_policies"
										defaults="<bold>{{serverName}} HSM Policies</bold>"
										components={{ bold: <strong />, serverName: server }}
									/>
								}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button
									label={t('label.save', 'Save')}
									color="primary"
									onClick={onSave}
									disabled={isRequestInProgress}
									loading={isRequestInProgress}
								/>
							)}
						</Row>
					</Row>
				</Container>
			</Row>

			<ListRow>
				<Divider />
			</ListRow>
			<Container
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				padding={{ all: 'large' }}
				style={{ overflow: 'auto' }}
				height="calc(100vh - 160px)"
			>
				<ListRow>
					<Padding bottom="large">
						<Text size="medium" weight="regular">
							{t('hsm.scheduling', 'Scheduling')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							label={t('hsm.enable_scheduler', 'Enable Scheduler')}
							value={isPowerstoreMoveSchedulerEnabled}
							onClick={(): void =>
								setIsPowerstoreMoveSchedulerEnabled(!isPowerstoreMoveSchedulerEnabled)
							}
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input
							label={t('hsm.schedule', 'Schedule')}
							background="gray5"
							value={powerstoreMoveSchedulerValue}
							onChange={(e: any): void => {
								setPowerstoreMoveSchedulerValue(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Switch
						label={t(
							'hsm.apply_duplication_after_scheduledhsm',
							'Apply Deduplication after scheduled HSM'
						)}
						value={deduplicateAfterScheduledMoveBlobs}
						onClick={(): void =>
							setDeduplicateAfterScheduledMoveBlobs(!deduplicateAfterScheduledMoveBlobs)
						}
					/>
				</ListRow>
				<ListRow>
					<Container
						padding={{ left: 'extralarge' }}
						crossAlignment="flex-start"
						mainAlignment="flex-start"
					>
						<Padding left="small">
							<Text size="extrasmall" weight="regular" color="secondary">
								{t(
									'hsm.this_function_allow_save_disk_copy_msg',
									'This function allows you to save disk space by storing a single copy of an item.'
								)}
							</Text>
						</Padding>
					</Container>
				</ListRow>

				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						padding={{ top: 'large', bottom: 'large' }}
					>
						<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
							<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('hsm.hsm_policies_list', 'HSM Policies List')}
								</Text>
							</Row>
							<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
								<Padding right="small">
									<Button
										label={t('hsm.delete', 'Delete')}
										color="error"
										type="outlined"
										icon="CloseOutline"
										height={36}
										onClick={(): void => {
											setShowDeletePolicyView(true);
										}}
										disabled={selectedPolicies.length === 0}
									/>
								</Padding>
								<Padding right="small">
									<Button
										label={t('hsm.edit', 'Edit')}
										type="outlined"
										icon="EditOutline"
										color="secondary"
										height={36}
										onClick={(): void => {
											setShowEditHsmPolicyView(true);
										}}
										disabled={selectedPolicies.length === 0 || isVolumeInProgress}
										loading={isVolumeInProgress}
									/>
								</Padding>
								<Button
									label={t('hsm.new_policy', 'New Policy')}
									icon="Plus"
									type="outlined"
									color="primary"
									height={36}
									onClick={(): void => {
										setShowCreateHsmPolicyView(true);
									}}
									loading={isVolumeInProgress}
									disabled={isVolumeInProgress}
								/>
							</Row>
						</Row>
					</Container>
				</Row>

				<ListRow>
					<Table
						rows={policiesRow}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedPolicies}
						onSelectionChange={(selected: any): void => setSelectedPolicies(selected)}
					/>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('hsm.minimum_space_threshold', 'Minimum Space Threshold')}
							background="gray5"
							value={powerstoreSpaceThreshold}
							onChange={(e: any): void => {
								setPowerstoreSpaceThreshold(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
			</Container>
			{showCreateHsmPolicyView && (
				<CreateHsmPolicy
					setShowCreateHsmPolicyView={setShowCreateHsmPolicyView}
					volumeList={volumeList}
					createHSMpolicy={createHSMpolicy}
				/>
			)}
			{showEditHsmPolicyView && (
				<EditHsmPolicy
					setShowEditHsmPolicyView={setShowEditHsmPolicyView}
					policies={policies}
					selectedPolicies={selectedPolicies[0]}
					volumeList={volumeList}
					onEditSave={onEditSave}
					isEditSaveInProgress={isEditSaveInProgress}
				/>
			)}
			{showDeletePolicyView && (
				<DeleteHsmPolicy
					showDeletePolicyView={showDeletePolicyView}
					setShowDeletePolicyView={setShowDeletePolicyView}
					selectedPolicies={selectedPolicies[0]}
					onDeletePolicy={onDeletePolicy}
					isRequestInProgress={isRequestInProgress}
					policies={policies}
				/>
			)}
		</Container>
	);
};

export default HSMsettingPanel;
