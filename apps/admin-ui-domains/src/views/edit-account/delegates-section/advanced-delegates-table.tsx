/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
	Button,
	Container,
	CustomHeaderFactory,
	HoverableRowFactory,
	Padding,
	Row,
	Table,
	useSnackbar,
} from '@zextras/ui-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS,
} from '../../../constants';
import { useBatchDelegates } from '../../../services/use-batch-delegates';
import { useAccountForm } from '../account-form-context';
import { AddDelegateWizard } from './add-delegate-wizard';
import {
	buildAdminRightEnvelope,
	buildDelegateRevoke,
	buildFolderGrant,
	type DelegateIdentity,
	type DelegateRow,
	getDelegateRightsType,
	getSendRights,
} from './utils';

type AdvancedDelegatesTableProps = {
	identitiesList: Array<any>;
	identityRows: Array<DelegateRow>;
	refetchGrants: () => void;
};

/**
 * Advanced delegates view: toolbar (add/edit/remove), the delegates table
 * with its empty state, and the add-delegate wizard.
 */
export const AdvancedDelegatesTable = ({
	identitiesList,
	identityRows,
	refetchGrants,
}: AdvancedDelegatesTableProps) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { form, folderList, deligateDetail, setDeligateDetail } = useAccountForm();
	const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);
	const batchDelegates = useBatchDelegates(accountDetail?.zimbraId);

	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedId, setSelectedId] = useState<string | undefined>();

	const headers = [
		{ id: 'accounts', label: t('label.Accounts', 'Accounts'), width: '30%', bold: true },
		{ id: 'type', label: t('label.Type', 'Type'), width: '20%', bold: true },
		{ id: 'rights', label: t('label.Rights', 'Rights'), width: '25%', bold: true },
		{ id: 'sharing-options', label: t('label.sharing_options', 'Sharing Options'), width: '25%', bold: true },
	];

	const handleCreateDelegate = (): void => {
		setEditMode(false);
		setDeligateDetail({});
		setShowCreateIdentity(true);
	};

	const selectedIdentity: DelegateIdentity | undefined = identitiesList.find(
		(o) => o?.grantee?.[0]?.id === selectedId,
	);
	const targetName: string = accountDetail?.zimbraMailDeliveryAddress;

	const showSnackbar = (severity: 'success' | 'error', label: string): void => {
		createSnackbar({
			key: severity,
			severity,
			label,
			autoHideTimeout: severity === 'error' ? 5000 : 3000,
			hideButton: true,
			replace: true,
		});
	};

	const showError = (error: Error): void => {
		showSnackbar(
			'error',
			error.message ||
				t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
		);
	};

	const handleEditDelegate = (): void => {
		if (!selectedIdentity) {
			return;
		}
		setEditMode(true);
		setDeligateDetail({
			...selectedIdentity,
			folderSelection: selectedIdentity.folder?.length ? 'all_folders' : '',
			delegeteRights: getDelegateRightsType(selectedIdentity),
		});
		setShowCreateIdentity(true);
	};

	const handleDeleteeDelegate = (): void => {
		if (!selectedIdentity) {
			return;
		}
		const { revokeUsrRigths, folderUsrRights } = buildDelegateRevoke(
			selectedIdentity,
			targetName,
			'all',
		);
		if (revokeUsrRigths.length === 0 && folderUsrRights.length === 0) {
			return;
		}
		batchDelegates.mutate(
			{
				reqObject: {
					RevokeRightRequest: revokeUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra',
				},
				otherAccount: targetName,
			},
			{
				onSuccess: (): void => {
					setSelectedId(undefined);
					showSnackbar(
						'success',
						t(
							'account_details.delegate_deleted_successfully',
							'Delegate`s rights deleted successfully',
						),
					);
				},
				onError: showError,
				onSettled: (): void => {
					refetchGrants();
				},
			},
		);
	};

	const handleCreateDelegateAPI = async (): Promise<void> => {
		const grantUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];
		const rightsType = deligateDetail?.delegeteRights;
		const grantee = deligateDetail?.grantee?.[0];

		if (
			rightsType === 'send_mails_only' ||
			rightsType === 'send_read_mails' ||
			rightsType === 'send_read_manage_mails'
		) {
			const sendRight = getSendRights(deligateDetail)[0];
			if (!sendRight) {
				showSnackbar('error', t('account_details.select_sending_option', 'Select a sending option'));
				return;
			}
			grantUsrRigths.push(
				buildAdminRightEnvelope({
					targetName,
					granteeType: grantee?.type,
					granteeName: grantee?.name,
					right: sendRight,
				}),
			);
		}
		if (
			rightsType === READ_MAILS_ONLY ||
			rightsType === SEND_READ_MAILS ||
			rightsType === MANAGE_NO_SEND ||
			rightsType === SEND_READ_MANAGE_MAILS
		) {
			const selectedFolderIds = folderList
				.filter((entry: any) => entry.selected)
				.map((obj: any) => obj.id);

			folderUsrRights.push(
				buildFolderGrant({
					folderIds:
						deligateDetail?.folderSelection === 'i_want_to_select' && selectedFolderIds.length > 0
							? selectedFolderIds.join(',')
							: '1',
					granteeType: grantee?.type,
					granteeName: grantee?.name,
					perm: rightsType === READ_MAILS_ONLY || rightsType === SEND_READ_MAILS ? 'r' : 'rwidxa',
				}),
			);
		}

		if (folderUsrRights.length === 0 && grantUsrRigths.length === 0) {
			return;
		}

		try {
			// Edit = revoke the old send rights/folder grants, then grant the new ones. The two batches
			// must run one after the other: sent together, the grant can be applied before the revoke
			// and the revoke then removes what was just granted.
			if (editMode && selectedIdentity) {
				const { revokeUsrRigths, folderUsrRights: folderRevokes } = buildDelegateRevoke(
					selectedIdentity,
					targetName,
					'send',
				);
				if (revokeUsrRigths.length > 0 || folderRevokes.length > 0) {
					await batchDelegates.mutateAsync({
						reqObject: {
							RevokeRightRequest: revokeUsrRigths,
							FolderActionRequest: folderRevokes,
							_jsns: 'urn:zimbra',
						},
						otherAccount: targetName,
					});
				}
			}
			await batchDelegates.mutateAsync({
				reqObject: {
					GrantRightRequest: grantUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra',
				},
				otherAccount: targetName,
			});
			setShowCreateIdentity(false);
			setSelectedId(undefined);
			showSnackbar(
				'success',
				editMode
					? t('account_details.delegate_updated_successfully', 'Delegate`s rights updated successfully')
					: t('account_details.delegate_created_successfully', 'Delegate`s rights created successfully'),
			);
		} catch (error) {
			showError(error as Error);
		} finally {
			refetchGrants();
		}
	};



	return (
		<Container mainAlignment="flex-start" padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}>
			{!showCreateIdentity && (
				<Row mainAlignment="flex-start" padding={{ left: 'small', bottom: 'extralarge' }} width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<ds-text as="h2" size="small" color="gray0" weight="bold">
							{t('label.delegates', 'DELEGATES')}
						</ds-text>
					</Row>
					<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
						<Padding right="large">
							<Button
								type="outlined"
								label={t('label.ADD_NEW', 'ADD NEW')}
								icon="PlusOutline"
								iconPlacement="right"
								color="primary"
								onClick={(): void => handleCreateDelegate()}
							/>
						</Padding>
						<Padding right="large">
							<Button
								type="outlined"
								label={t('label.EDIT', 'EDIT')}
								icon="Edit2Outline"
								iconPlacement="right"
								color="secondary"
								disabled={!selectedIdentity}
								onClick={(): void => handleEditDelegate()}
							/>
						</Padding>
						<Button
							type="outlined"
							label={t('label.REMOVE', 'REMOVE')}
							icon="CloseOutline"
							iconPlacement="right"
							color="error"
							disabled={!selectedIdentity}
							onClick={(): void => handleDeleteeDelegate()}
						/>
					</Row>
					<Row
						padding={{ top: 'large', left: 'large', bottom: 'extralarge' }}
						width="100%"
						mainAlignment="space-between"
					>
						{identityRows.length !== 0 && (
							<Table
								rows={identityRows}
								headers={headers}
								multiSelect={false}
								selectedRows={selectedId === undefined ? [] : [selectedId]}
								onSelectionChange={(ids) => setSelectedId(ids[0])}
								style={{ overflow: 'auto', height: '100%' }}
								RowFactory={HoverableRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
						)}
						{identityRows.length === 0 && (
							<Container orientation="column" crossAlignment="center" mainAlignment="center">
								<Row>
									<img src={logo} alt="logo" />
								</Row>
								<Row
									padding={{ top: 'extralarge' }}
									orientation="vertical"
									crossAlignment="center"
									style={{ textAlign: 'center' }}
								>
									<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
										{t('label.this_list_is_empty', 'This list is empty.')}
									</ds-text>
								</Row>
								<Row
									orientation="vertical"
									crossAlignment="center"
									style={{ textAlign: 'center' }}
									padding={{ top: 'small' }}
									width="53%"
								>
									<ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
										<Trans
											i18nKey="label.create_otp_list_msg"
											defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
											components={{ bold: <strong /> }}
										/>
									</ds-text>
								</Row>
							</Container>
						)}
					</Row>
				</Row>
			)}
			{showCreateIdentity && (
				<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
					<AddDelegateWizard
						editMode={editMode}
						onCancel={(): void => setShowCreateIdentity(false)}
						onAdd={(): void => void handleCreateDelegateAPI()}
					/>
				</Row>
			)}
		</Container>
	);
};
