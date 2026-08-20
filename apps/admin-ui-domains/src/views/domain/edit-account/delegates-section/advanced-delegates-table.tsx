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

import logo from '../../../../assets/gardian.svg';
import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS,
} from '../../../../constants';
import { batchService } from '../../../../services/batch-service';
import { useAccountForm } from '../account-form-context';
import { AddDelegateWizard } from './add-delegate-wizard';
import {
	buildFolderGrant,
	buildFolderRevoke,
	buildGrantRight,
	buildRevokeRight,
	type DelegateRow,
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

	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

	const handleEditDelegate = (): void => {
		setEditMode(true);
		const selectedDelegate = identitiesList.find((o) => o?.grantee?.[0].id === selectedRows[0]);
		selectedDelegate.folderSelection = selectedDelegate?.folder?.length ? 'all_folders' : '';
		if (!selectedDelegate?.folder?.length) {
			selectedDelegate.delegeteRights = SEND_MAILS_ONLY;
		} else if (
			selectedDelegate?.folder?.length &&
			selectedDelegate?.folder?.[0]?.perm === 'r' &&
			!selectedDelegate?.right?.length
		) {
			selectedDelegate.delegeteRights = READ_MAILS_ONLY;
		} else if (selectedDelegate?.folder?.[0]?.perm === 'r') {
			selectedDelegate.delegeteRights = SEND_READ_MAILS;
		} else if (
			selectedDelegate?.folder?.[0]?.perm === 'rwidxa' &&
			!selectedDelegate?.right?.length
		) {
			selectedDelegate.delegeteRights = MANAGE_NO_SEND;
		} else if (selectedDelegate?.folder?.[0]?.perm === 'rwidxa') {
			selectedDelegate.delegeteRights = SEND_READ_MANAGE_MAILS;
		}
		setDeligateDetail(selectedDelegate);
		setShowCreateIdentity(true);
	};

	const handleDeleteeDelegate = (): void => {
		const selectedDelegate = identitiesList.find((o) => o?.grantee?.[0].id === selectedRows[0]);
		const revokeUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];

		if (selectedDelegate) {
			if (selectedDelegate?.folder?.length) {
				selectedDelegate.folder.forEach((ele: any) => {
					folderUsrRights.push(buildFolderRevoke(ele));
				});
			}
			if (selectedDelegate?.right?.[0]?._content) {
				revokeUsrRigths.push(
					buildRevokeRight({
						targetName: accountDetail?.zimbraMailDeliveryAddress,
						granteeType: selectedDelegate?.grantee?.[0]?.type,
						granteeName: selectedDelegate?.grantee?.[0]?.name,
						right: selectedDelegate?.right?.[0]?._content,
					}),
				);
			}

			if (revokeUsrRigths.length > 0 || folderUsrRights.length > 0) {
				batchService(
					{
						RevokeRightRequest: revokeUsrRigths,
						FolderActionRequest: folderUsrRights,
						_jsns: 'urn:zimbra',
					},
					accountDetail?.zimbraMailDeliveryAddress,
				);

				if (revokeUsrRigths.length > 0) setShowCreateIdentity(false);

				refetchGrants();
			}

			if (!editMode) {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate`s rights deleted successfully',
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true,
				});
			}
		}
	};

	const handleCreateDelegateAPI = (): void => {
		if (editMode) {
			handleDeleteeDelegate();
		}

		const grantUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];

		if (
			deligateDetail?.delegeteRights &&
			(deligateDetail?.delegeteRights === 'send_mails_only' ||
				deligateDetail?.delegeteRights === 'send_read_mails' ||
				deligateDetail?.delegeteRights === 'send_read_manage_mails')
		) {
			grantUsrRigths.push(
				buildGrantRight({
					targetName: accountDetail?.zimbraMailDeliveryAddress,
					granteeType: deligateDetail?.grantee?.[0]?.type,
					granteeName: deligateDetail?.grantee?.[0]?.name,
					right: deligateDetail?.right?.[0]?._content,
				}),
			);
		}
		if (
			deligateDetail?.delegeteRights &&
			(deligateDetail?.delegeteRights === READ_MAILS_ONLY ||
				deligateDetail?.delegeteRights === SEND_READ_MAILS ||
				deligateDetail?.delegeteRights === MANAGE_NO_SEND ||
				deligateDetail?.delegeteRights === SEND_READ_MANAGE_MAILS)
		) {
			const selectedFolders = folderList.filter((entry: any) => entry.selected);
			const folderIds = selectedFolders.map((obj: any) => obj.id);

			folderUsrRights.push(
				buildFolderGrant({
					folderIds: deligateDetail?.folderSelection === 'all_folders' ? '1' : folderIds.join(','),
					granteeType: deligateDetail?.grantee?.[0]?.type,
					granteeName: deligateDetail?.grantee?.[0]?.name,
					perm:
						deligateDetail?.delegeteRights === READ_MAILS_ONLY ||
						deligateDetail?.delegeteRights === SEND_MAILS_ONLY
							? 'r'
							: 'rwidxa',
				}),
			);
		}

		if (folderUsrRights.length > 0 || grantUsrRigths.length > 0) {
			batchService(
				{
					GrantRightRequest: grantUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra',
				},
				accountDetail?.zimbraMailDeliveryAddress,
			).then(() => {
				refetchGrants();
				setShowCreateIdentity(false);

				createSnackbar({
					key: 'success',
					severity: 'success',
					label: editMode
						? t('account_details.delegate_updated_successfully', 'Delegate`s rights updated successfully')
						: t('account_details.delegate_created_successfully', 'Delegate`s rights created successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true,
				});
			});
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
								onClick={(): void => handleEditDelegate()}
							/>
						</Padding>
						<Button
							type="outlined"
							label={t('label.REMOVE', 'REMOVE')}
							icon="CloseOutline"
							iconPlacement="right"
							color="error"
							disabled={!selectedRows?.length}
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
								onSelectionChange={setSelectedRows}
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
						onCancel={(): void => setShowCreateIdentity(false)}
						onAdd={(): void => handleCreateDelegateAPI()}
					/>
				</Row>
			)}
		</Container>
	);
};
