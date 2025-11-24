/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest, soapFetch } from '@zextras/admin-ui-bootstrap';
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
	useSnackbar
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
	APPOINTMENT,
	CONTACT,
	DOCUMENT,
	MESSAGE,
	SERVER,
	VOLUME_INDEX_TYPE,
	ZIMBRA_ADMIN_URN
} from '../../../constants';
import { fetchSoap } from '../../../services/bucket-service';
import { setCoreAttributes } from '../../../services/set-core-attributes';
import { useServerStore } from '../../../store/server/store';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import ModalOverlay from '../../components/ModalOverlay';
import ListRow from '../../list/list-row';

import CreateHsmPolicy from './create-hsm-policy/create-hsm-policy';
import DeleteHsmPolicy from './delete-policy/delete-hsm-policy';
import EditHsmPolicy from './edit-hsm-policy/edit-hsm-policy';

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
	const [isZxPowerstoreMoveSchedulingEnabled, setIsZxPowerstoreMoveSchedulingEnabled] =
		useState<boolean>(false);
	const [powerstoreMoveSchedulerValue, setPowerstoreMoveSchedulerValue] = useState<string>('');
	const [powerstoreSpaceThreshold, setPowerstoreSpaceThreshold] = useState<number>(0);
	const [deduplicateAfterScheduledMoveBlobs, setDeduplicateAfterScheduledMoveBlobs] =
		useState<boolean>(false);
	const [oldValues, setOldValues] = useState<any>({});
	const [volumeList, setVolumeList] = useState<any>([]);
	const createSnackbar = useSnackbar();
	const [selectedPolicies, setSelectedPolicies] = useState<any>([]);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isVolumeInProgress, setIsVolumeInProgress] = useState<boolean>(false);
	const [isEditSaveInProgress, setIsEditSaveInProgress] = useState<boolean>(false);
	const timer = useRef<number>(0);
	const storageNotLicenced = t(
		'label.storage_hsm_not_licensed',
		'Cannot complete operation: storages_hsm not licensed.'
	);
	const errorMessage = t(
		'label.something_wrong_error_msg',
		'Something went wrong. Please try again.'
	);

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

	const showSnackbar = useCallback(
		(key: string, severity: 'success' | 'info' | 'warning' | 'error', message: string) => {
			createSnackbar({
				key,
				severity,
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const getHSMPolicyList = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxPowerstore',
			action: 'getHSMPolicy',
			targetServers: server
		}).then((res: any) => {
			if (res?.Body?.response?.content) {
				const content = JSON.parse(res?.Body?.response?.content);
				if (
					content?.response?.[server]?.response?.policies &&
					Array.isArray(content?.response?.[server]?.response?.policies) &&
					content?.response?.[server]?.response?.policies?.length > 0
				) {
					setPolicies(content?.response?.[server]?.response?.policies);
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

	const doClickAction = useCallback((): void => { }, []);

	const doDoubleClickAction = useCallback((): void => {
		setShowEditHsmPolicyView(true);
	}, []);

	const handleClick = useCallback(
		(event: any) => {
			event.stopPropagation();
			clearTimeout(timer.current);
			if (event.detail === 1) {
				timer.current = setTimeout(doClickAction, 300);
			} else if (event.detail === 2) {
				doDoubleClickAction();
			}
		},
		[doClickAction, doDoubleClickAction]
	);

	useEffect(() => {
		if (policies.length > 0) {
			const allRows = policies.map((item: any) => ({
				id: item?.hsmQuery,
				columns: [
					<Text
						size="small"
						weight="regular"
						key={item?.hsmQuery}
						onClick={(e: { stopPropagation: () => void }): void => {
							e.stopPropagation();
							setSelectedPolicies([item?.hsmQuery]);
							handleClick(e);
						}}
					>
						{getHSMType(item?.hsmType)}
						{item?.hsmQuery}
					</Text>
				]
			}));
			setPoliciesRow(allRows);
		} else {
			setPoliciesRow([]);
		}
	}, [handleClick, policies]);

	const setValuesFromAttributes = useCallback((attributes: any) => {
		if (!attributes) return;
		const olderValues: any = {};
		if (attributes) {
			if (attributes?.powerstoreMoveScheduler) {
				const schedulePattern = attributes?.powerstoreMoveScheduler?.value?.['cron-pattern'];
				const pattern = schedulePattern || '';
				setPowerstoreMoveSchedulerValue(pattern);
				olderValues.powerstoreMoveSchedulerValue = pattern;
			}
			if (attributes?.ZxPowerstore_SpaceThreshold) {
				const spaceThreshold = attributes?.ZxPowerstore_SpaceThreshold?.value;
				const val = spaceThreshold || 0;
				setPowerstoreSpaceThreshold(val);
				olderValues.powerstoreSpaceThreshold = val;
			}

			if (attributes?.deduplicateAfterScheduledMoveBlobs) {
				const duplicate = attributes?.deduplicateAfterScheduledMoveBlobs;
				const val = !!duplicate?.value;
				setDeduplicateAfterScheduledMoveBlobs(val);
				olderValues.deduplicateAfterScheduledMoveBlobs = val;
			}

			if (attributes?.ZxPowerstore_MoveSchedulingEnabled) {
				const moveScheduling = attributes?.ZxPowerstore_MoveSchedulingEnabled?.value;
				const val = moveScheduling === true;
				setIsZxPowerstoreMoveSchedulingEnabled(val);
				olderValues.isZxPowerstoreMoveSchedulingEnabled = val;
			}
			setOldValues(olderValues);
		}
	}, []);

	const getZxPowerStoreServers = useCallback(() => {
		getSoapFetchRequest(
			`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`
		).then((data: any) => {
			const serv = data?.servers;
			if (serv && serv.length > 0) {
				const object: Array<unknown> = Object.values(serv).map((i: any) => Object.values(i)[0]);
				const selectedServer = object.find((sItem: any) => sItem.name === server);
				if (selectedServer) {
					const values: Record<string, any> = selectedServer;
					if (values) {
						const attributes = values?.ZxPowerstore?.attributes;
						setValuesFromAttributes(attributes);
					}
				}
				setIsDirty(false);
			}
		});
	}, [server, setValuesFromAttributes]);

	const getAllVolumes = useCallback(() => {
		const serverId: any = serverList.find((item: any) => item?.name === server);
		setIsVolumeInProgress(true);
		setVolumeList([]);
		if (serverId) {
			soapFetch(
				'GetAllVolumes',
				{
					_jsns: ZIMBRA_ADMIN_URN
				},
				{
					targetServer: serverId
				}
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
		setIsZxPowerstoreMoveSchedulingEnabled(oldValues?.isZxPowerstoreMoveSchedulingEnabled);
		setPowerstoreMoveSchedulerValue(oldValues?.powerstoreMoveSchedulerValue);
		setPowerstoreSpaceThreshold(oldValues?.powerstoreSpaceThreshold);
		setDeduplicateAfterScheduledMoveBlobs(oldValues?.deduplicateAfterScheduledMoveBlobs);
		setIsDirty(false);
	}, [
		oldValues?.isZxPowerstoreMoveSchedulingEnabled,
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
					'cron-enabled': isZxPowerstoreMoveSchedulingEnabled
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
			},
			ZxPowerstore_MoveSchedulingEnabled: {
				value: isZxPowerstoreMoveSchedulingEnabled,
				objectName: server,
				configType: SERVER
			}
		};
		setCoreAttributes(body)
			.then((data: any) => {
				setIsRequestInProgress(false);
				if ((data?.errors && Array.isArray(data?.errors)) || data?.error) {
					let errMessage = errorMessage;
					if (data?.errors && Array.isArray(data?.errors) && data?.errors[0]?.error) {
						errMessage = data?.errors[0]?.error;
					} else if (data?.error) {
						errMessage = data?.error;
					}
					showSnackbar('error', 'error', errMessage);
				} else {
					setIsDirty(false);
					setOldValues((prev: any) => ({
						...prev,
						isZxPowerstoreMoveSchedulingEnabled,
						powerstoreMoveSchedulerValue,
						powerstoreSpaceThreshold,
						deduplicateAfterScheduledMoveBlobs
					}));
					showSnackbar(
						'success',
						'success',
						t(
							'label.the_last_changes_has_been_saved_successfully',
							'Changes have been saved successfully'
						)
					);
				}
			})
			.catch((error: any) => {
				setIsRequestInProgress(false);
				showSnackbar('error', 'error', error ? error?.error : errorMessage);
			});
	}, [
		powerstoreMoveSchedulerValue,
		isZxPowerstoreMoveSchedulingEnabled,
		server,
		powerstoreSpaceThreshold,
		deduplicateAfterScheduledMoveBlobs,
		errorMessage,
		showSnackbar,
		t
	]);

	useEffect(() => {
		if (
			oldValues.isZxPowerstoreMoveSchedulingEnabled !== undefined &&
			oldValues.isZxPowerstoreMoveSchedulingEnabled !== isZxPowerstoreMoveSchedulingEnabled
		) {
			setIsDirty(true);
		}
	}, [oldValues.isZxPowerstoreMoveSchedulingEnabled, isZxPowerstoreMoveSchedulingEnabled]);

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
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxPowerstore',
				action: 'removeHSMPolicy',
				targetServers: server,
				hsmPolicy: `${getHSMType(hType?.hsmType)}${selectedPolicies[0]}`.trim()
			})
				.then((res: any) => {
					setIsRequestInProgress(false);
					if (res?.Body?.response?.content) {
						const info = JSON.parse(res?.Body?.response?.content);
						getHSMPolicyList();
						if (info?.response?.[server]?.ok) {
							setSelectedPolicies([]);
							setShowDeletePolicyView(false);
							setIsEditSaveInProgress(false);
							if (isEditSave) {
								setShowEditHsmPolicyView(false);
								showSnackbar(
									'success',
									'success',
									t('hsm.edit_hsm_policy_success', 'HSM Policy updated successfully')
								);
							} else {
								showSnackbar(
									'success',
									'success',
									t('hsm.hsm_policy_correctly_deleted', 'HSM Policy was correctly deleted')
								);
							}
						}
					}
				})
				.catch((error) => {
					setIsRequestInProgress(false);
					setIsEditSaveInProgress(false);
					showSnackbar('error', 'error', error?.message ? error?.message : errorMessage);
				});
		},
		[policies, server, selectedPolicies, getHSMPolicyList, showSnackbar, t, errorMessage]
	);

	const generatePolicyString = useCallback((hsmPolicyDetail: any) => {
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
				policy += `${item?.option}:-${item?.dateScale}${item?.scale} `;
			});
		}
		if (hsmPolicyDetail?.sourceVolume?.length > 0) {
			policy += ` source:${hsmPolicyDetail?.sourceVolume.map((item: any) => item?.id).toString()}`;
		}
		if (hsmPolicyDetail?.destinationVolume?.length > 0) {
			policy += ` destination:${hsmPolicyDetail?.destinationVolume
				.map((item: any) => item?.id)
				.toString()}`;
		}
		return policy;
	}, []);

	const parseResponse = useCallback(
		(isEditSave: boolean | undefined, info: any, isRunOperation?: boolean) => {
			if (info?.ok) {
				if (isEditSave) {
					onDeletePolicy(isEditSave);
				} else {
					setShowCreateHsmPolicyView(false);
					getHSMPolicyList();
					if (isRunOperation) {
						showSnackbar(
							'success',
							'success',
							t('hsm.policies_executed_successfully', 'HSM policies executed successfully')
						);
					} else {
						showSnackbar(
							'success',
							'success',
							t('hsm.policies_added_successfully', 'Policies have been added successfully')
						);
					}
				}
			} else if (info?.error && info?.error?.code === 'MODULE_OR_FEATURE_NOT_LICENSED') {
				setIsEditSaveInProgress(false);
				showSnackbar('error', 'error', storageNotLicenced);
			} else if (info?.error?.message) {
				setIsEditSaveInProgress(false);
				showSnackbar('error', 'error', info?.error?.message);
			} else if (info?.exception?.message) {
				setIsEditSaveInProgress(false);
				showSnackbar('error', 'error', info?.exception?.message);
			}
		},
		[getHSMPolicyList, onDeletePolicy, showSnackbar, storageNotLicenced, t]
	);

	const hsmPolicyOperation = useCallback(
		(hsmPolicyDetail?: any, isEditSave?: boolean, isRunCustomPolicy?: boolean) => {
			const request: any = {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxPowerstore',
				action: isRunCustomPolicy ? 'doMoveBlobs' : 'setHSMPolicy',
				targetServers: server,
				policyToAdd: true
			};
			if (isRunCustomPolicy) {
				request.command = 'start';
			}
			if (hsmPolicyDetail) {
				if (
					hsmPolicyDetail?.isContactEnabled === false &&
					hsmPolicyDetail?.isDocumentEnabled === false &&
					hsmPolicyDetail?.isEventEnabled === false &&
					hsmPolicyDetail?.isMessageEnabled === false
				) {
					showSnackbar(
						'error',
						'error',
						t('hsm.select_at_least_one_item', 'Select at least one item')
					);
					return;
				}
				if (hsmPolicyDetail?.policyCriteria.length === 0) {
					showSnackbar(
						'error',
						'error',
						t('hsm.add_at_least_one_criteria', 'Add at least one criteria')
					);
					return;
				}
				const policy = generatePolicyString(hsmPolicyDetail);
				request.hsmPolicy = policy.trim();
			}
			fetchSoap('zextras', {
				...request
			})
				.then((res: any) => {
					if (res?.Body?.response?.content) {
						const info = JSON.parse(res?.Body?.response?.content);
						parseResponse(isEditSave, info?.response?.[server], isRunCustomPolicy);
					}
				})
				.catch((error) => {
					setIsEditSaveInProgress(false);
					showSnackbar('error', 'error', error?.message ? error?.message : errorMessage);
				});
		},
		[errorMessage, generatePolicyString, parseResponse, server, showSnackbar, t]
	);

	const createHSMpolicy = useCallback(
		(hsmPolicyDetail: any, isEditSave?: boolean) => {
			hsmPolicyOperation(hsmPolicyDetail, isEditSave);
		},
		[hsmPolicyOperation]
	);

	const runCustomHSMpolicy = useCallback(
		(hsmPolicyDetail: any) => {
			hsmPolicyOperation(hsmPolicyDetail, undefined, true);
		},
		[hsmPolicyOperation]
	);

	const onEditSave = useCallback(
		(editDetail: any) => {
			setIsEditSaveInProgress(true);
			createHSMpolicy(editDetail, true);
		},
		[createHSMpolicy]
	);

	const runAllHSMpolicy = useCallback(() => {
		hsmPolicyOperation(undefined, undefined, true);
	}, [hsmPolicyOperation]);

	return (
		<Container mainAlignment="flex-start" width="100%">
			<Row
				takeAvailableSpace
				mainAlignment="flex-start"
				width="100%"
				padding={{ left: 'large', right: 'large', bottom: 'medium', top: 'medium' }}
			>
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="2.5rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{
									<Trans
										i18nKey="hsm.name_hsm_policies"
										defaults="<bold>{{serverName}} HSM Policies</bold>"
										components={{ bold: <strong /> }}
										values={{
											serverName: server
										}}
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
				height="calc(100vh - 10.625rem)"
			>
				<ListRow>
					<Padding top="large" bottom="large">
						<Text size="medium" weight="regular">
							{t('hsm.scheduling', 'Scheduling')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							label={t('hsm.enable_scheduler', 'Enable Scheduler')}
							value={isZxPowerstoreMoveSchedulingEnabled}
							onClick={(): void =>
								setIsZxPowerstoreMoveSchedulingEnabled(!isZxPowerstoreMoveSchedulingEnabled)
							}
							iconColor="primary"
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input
							label={`${t('hsm.schedule', 'Schedule')} (${t(
								'hsm.example_shedule',
								'E.g. 0 2 * * 3'
							)})`}
							backgroundColor="gray5"
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
						iconColor="primary"
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

				<Row mainAlignment="flex-start" width="100%">
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						padding={{ top: 'large' }}
					>
						<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
							<Row
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
								style={{ alignSelf: 'end' }}
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('hsm.hsm_policies_list', 'HSM Policies List')}
								</Text>
							</Row>
							<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
								<Padding right="medium">
									<Button
										label={t('hsm.new', 'New')}
										icon=""
										type="outlined"
										color="primary"
										onClick={(): void => {
											setShowCreateHsmPolicyView(true);
										}}
										loading={isVolumeInProgress}
										disabled={isVolumeInProgress}
									/>
								</Padding>
								<Padding right="medium">
									<Button
										label={t('hsm.run_all', 'Run All')}
										type="outlined"
										icon=""
										color="primary"
										onClick={(): void => {
											runAllHSMpolicy();
										}}
										disabled={policiesRow.length === 0}
										loading={isVolumeInProgress}
									/>
								</Padding>
								<Button
									label={t('hsm.delete', 'Delete')}
									color="error"
									type="outlined"
									icon=""
									onClick={(): void => {
										setShowDeletePolicyView(true);
									}}
									disabled={selectedPolicies.length === 0}
									loading={isVolumeInProgress}
								/>
							</Row>
						</Row>
					</Container>
				</Row>
				<ListRow>
					<Padding left="extrasmall" bottom="medium">
						<Text size="small" weight="light" color="gray0">
							{t(
								'hsm.default_hsm_policy_warning_message',
								'At least one policy will always stay up. If you delete the last one, another will be generated'
							)}
						</Text>
					</Padding>
				</ListRow>

				<ListRow>
					<Table
						rows={policiesRow}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedPolicies}
						HeaderFactory={CustomHeaderFactory}
						RowFactory={CustomRowFactory}
					/>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('hsm.minimum_space_threshold', 'Minimum Space Threshold')}
							backgroundColor="gray5"
							value={powerstoreSpaceThreshold}
							onChange={(e: any): void => {
								setPowerstoreSpaceThreshold(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
			</Container>
			{showCreateHsmPolicyView && (
				<ModalOverlay open={showCreateHsmPolicyView}>
					<CreateHsmPolicy
						setShowCreateHsmPolicyView={setShowCreateHsmPolicyView}
						volumeList={volumeList}
						createHSMpolicy={createHSMpolicy}
						runCustomHSMpolicy={runCustomHSMpolicy}
					/>
				</ModalOverlay>
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
