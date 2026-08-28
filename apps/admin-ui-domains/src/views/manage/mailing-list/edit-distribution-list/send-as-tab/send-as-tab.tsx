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
	DropDownInput,
	HoverableRowFactory,
	Input,
	ListRow,
	Padding,
	Row,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { sortedUniq, uniq } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { useDistributionListAction } from '../../../../../services/use-distribution-list-action';
import { useTableFilter } from '../../edit-mailing-detail/hooks/use-table-filter';
import { FilterColumnIcon } from '../../filter-column-icon';
import { resolveNewMembers } from '../members-tab/filter-members';
import type { EditDistributionListFormApi } from '../types';
import { useGalEmailSearch } from '../use-gal-email-search';
import { EditPermissionModal } from './edit-permission-modal';
import {
	PermissionLevelRadioGroup,
	type PermissionLevelValue
} from './permission-level-radio-group';
import { RemoveSenderModal } from './remove-sender-modal';
import { buildSendAsRow } from './send-as-row';

type SendAsTabProps = {
	form: EditDistributionListFormApi;
	selectedMailingList: any;
	isRequestInProgress: boolean;
	setIsRequestInProgress: (v: boolean) => void;
	searchUserLabelValue: string;
};

const SEND_ACL_BY_PERMISSION: Record<PermissionLevelValue, string> = {
	sendAs: 'sendAsDistList',
	sendOnBehalfOf: 'sendOnBehalfOfDistList'
};

export const SendAsTab: FC<SendAsTabProps> = ({
	form,
	selectedMailingList,
	isRequestInProgress,
	setIsRequestInProgress,
	searchUserLabelValue
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const sendEmailsList = useSelector(form.store, (state) => state.values.sendEmails);


	const [selectedSendEmail, setSelectedSendEmail] = useState<Array<any>>([]);
	const [radioPermisionValue, setRadioPermisionValue] = useState<PermissionLevelValue>('sendAs');
	const [isOpenDeleteSendEmailDialog, setIsOpenDeleteSendEmailDialog] = useState(false);
	const [sendEmailToDelete, setSendEmailToDelete] = useState<any>(null);
	const [isOpenEditPermissionDialog, setIsOpenEditPermissionDialog] = useState(false);
	const [editingEmailItem, setEditingEmailItem] = useState<any>(null);
	const [editPermissionValue, setEditPermissionValue] = useState<PermissionLevelValue>('sendAs');
	const [isShowSendEmailError, setIsShowSendEmailError] = useState(false);
	const [sendEmailErrorMessage, setSendEmailErrorMessage] = useState<string | null>('');

	const actionMutation = useDistributionListAction(selectedMailingList?.id ?? '');

	const sendEmailTableRows: Array<any> = (sendEmailsList ?? []).map((item: any) =>
		buildSendAsRow(item, {
			editLabel: t('label.edit', 'Edit'),
			deleteLabel: t('label.delete', 'Delete'),
			sendAsLabel: t('domain.distributionList.sendAs.sendAs', 'Send As'),
			sendOnBehalfOfLabel: t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of'),
			onEdit: (emailItem): void => {
				setEditingEmailItem(emailItem);
				setEditPermissionValue(emailItem?.sendAcl === 'sendAsDistList' ? 'sendAs' : 'sendOnBehalfOf');
				setIsOpenEditPermissionDialog(true);
			},
			onDelete: (emailItem): void => {
				setSendEmailToDelete(emailItem);
				setIsOpenDeleteSendEmailDialog(true);
			},
			onSelect: (name): void => {
				setSelectedSendEmail([name]);
			}
		})
	);

	const {
		filterValue: filterSendEmail,
		filteredRows: filteredSendEmailRows,
		handleFilterChange: handleInputChangeSendEmail
	} = useTableFilter(sendEmailTableRows);

	const { searchValue: sendEmailItem, setSearchValue: setSendEmailItem, items: sendItems } =
		useGalEmailSearch();

	const sendEmailHeaders: Array<any> = useMemo(
		() => [
			{
				id: 'sendEmail',
				label: t('domain.distributionList.sendAs.authorizedSenders', 'Authorized senders'),
				width: '50%',
				bold: true
			},
			{
				id: 'sendAcl',
				label: t('domain.distributionList.sendAs.permissionLevel', 'Permission level'),
				width: '30%',
				bold: true
			},
			{
				id: 'actions',
				label: t('label.actions', 'Actions'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);


	const onAddSendEmail = useCallback(() => {
		const resolution = resolveNewMembers(
			sendEmailItem,
			sendEmailsList.map((item: any) => item?.name)
		);
		switch (resolution.type) {
			case 'blank':
				setIsShowSendEmailError(true);
				setSendEmailErrorMessage(
					t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address')
				);
				return;
			case 'undefined':
			case 'invalid':
				setIsShowSendEmailError(true);
				setSendEmailErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				return;
			case 'alreadyInList':
				setIsShowSendEmailError(true);
				setSendEmailErrorMessage(
					t(
						'label.distribution_list_already_in_list_error',
						'The Distribution List / User is already in the list'
					)
				);
				return;
		}

		setIsShowSendEmailError(false);
		setSendEmailItem('');
		const withAcl = resolution.members.map((item) => ({
			name: item,
			sendAcl: SEND_ACL_BY_PERMISSION[radioPermisionValue]
		}));
		const sortedList = sortedUniq(withAcl);
		const newSenders = sortedList.filter(
			(item: any) => !sendEmailsList.some((s: any) => s?.name === item?.name)
		);
		if (newSenders.length === 0) return;
		setIsRequestInProgress(true);
		const addRequests = newSenders.map((item: any) =>
			actionMutation.mutateAsync({
				dl: {
					by: 'id',
					_content: selectedMailingList?.id
				},
				action: {
					op: 'grantRights',
					right: {
						right: item?.sendAcl,
						grantee: {
							by: 'name',
							type: 'email',
							_content: item?.name
						}
					}
				}
			})
		);
		Promise.all(addRequests)
			.then((responses: any) => {
				const fault = responses.find((r: any) => r?.Fault);
				if (fault) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: fault?.Fault?.Reason?.Text,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					const updatedEmails = uniq(sendEmailsList.concat(newSenders));
					form.setFieldValue('sendEmails', updatedEmails);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.sendAs.senderAddedSuccessfully',
							'Authorized sender has been added successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsRequestInProgress(false);
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsRequestInProgress(false);
			});
	}, [
		sendEmailItem,
		createSnackbar,
		t,
		sendEmailsList,
		radioPermisionValue,
		selectedMailingList?.id,
		form,
		setIsRequestInProgress,
		actionMutation,
		setSendEmailItem
	]);

	const closeDeleteSendEmailHandler = useCallback(() => {
		setIsOpenDeleteSendEmailDialog(false);
		setSendEmailToDelete(null);
	}, []);

	const onDeleteSendEmailConfirm = useCallback(() => {
		if (!sendEmailToDelete) return;
		setIsRequestInProgress(true);
		actionMutation
			.mutateAsync({
				dl: {
					by: 'id',
					_content: selectedMailingList?.id
				},
				action: {
					op: 'revokeRights',
					right: {
						right: sendEmailToDelete?.sendAcl,
						grantee: {
							by: 'name',
							type: 'email',
							_content: sendEmailToDelete?.name
						}
					}
				}
			})
			.then((response: any) => {
				if (response?.Fault) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: response?.Fault?.Reason?.Text,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					const updatedEmails = sendEmailsList.filter(
						(item: any) =>
							!(
								item?.name === sendEmailToDelete?.name &&
								item?.sendAcl === sendEmailToDelete?.sendAcl
							)
					);
					form.setFieldValue('sendEmails', updatedEmails);
					setSelectedSendEmail([]);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.sendAs.senderRemovedSuccessfully',
							'Authorized sender has been removed successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsRequestInProgress(false);
				closeDeleteSendEmailHandler();
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsRequestInProgress(false);
				closeDeleteSendEmailHandler();
			});
	}, [
		sendEmailToDelete,
		selectedMailingList?.id,
		sendEmailsList,
		createSnackbar,
		t,
		closeDeleteSendEmailHandler,
		form,
		setIsRequestInProgress,
		actionMutation
	]);

	const closeEditPermissionHandler = useCallback(() => {
		setIsOpenEditPermissionDialog(false);
	}, []);

	const onEditPermissionSaveChanges = useCallback((): void => {
		if (!editingEmailItem) {
			return;
		}
		const newAcl = SEND_ACL_BY_PERMISSION[editPermissionValue];
		if (editingEmailItem?.sendAcl === newAcl) {
			setEditingEmailItem(null);
			setIsOpenEditPermissionDialog(false);
			return;
		}
		if (
			sendEmailsList.some((s: any) => s?.name === editingEmailItem?.name && s?.sendAcl === newAcl)
		) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t(
					'label.distribution_list_already_in_list_error',
					'The Distribution List / User is already in the list'
				),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		setIsRequestInProgress(true);
		const dl: any = { by: 'id', _content: selectedMailingList?.id };
		const revokeAction: any = {
			op: 'revokeRights',
			right: {
				right: editingEmailItem?.sendAcl,
				grantee: {
					by: 'name',
					type: 'email',
					_content: editingEmailItem?.name
				}
			}
		};
		const grantAction: any = {
			op: 'grantRights',
			right: {
				right: newAcl,
				grantee: {
					by: 'name',
					type: 'email',
					_content: editingEmailItem?.name
				}
			}
		};
		actionMutation
			.mutateAsync({ dl, action: revokeAction })
			.then((revokeRes: any) => {
				if (revokeRes?.Fault) {
					throw new Error(revokeRes?.Fault?.Reason?.Text);
				}
				return actionMutation.mutateAsync({ dl, action: grantAction });
			})
			.then((grantRes: any) => {
				if (grantRes?.Fault) {
					throw new Error(grantRes?.Fault?.Reason?.Text);
				}
				const updatedList = sendEmailsList.map((item: any) =>
					item?.name === editingEmailItem?.name ? { ...item, sendAcl: newAcl } : item
				);
				form.setFieldValue('sendEmails', updatedList);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'domain.distributionList.sendAs.permissionUpdatedSuccessfully',
						'Permission level has been updated successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setEditingEmailItem(null);
				setIsOpenEditPermissionDialog(false);
				setIsRequestInProgress(false);
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsRequestInProgress(false);
			});
	}, [
		editingEmailItem,
		editPermissionValue,
		sendEmailsList,
		selectedMailingList?.id,
		createSnackbar,
		t,
		form,
		setIsRequestInProgress,
		actionMutation
	]);

	return (
		<>
			<Container
				padding={{ left: 'large', right: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 6rem)"
				background="white"
				width={'58.75rem'}
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="vertical"
					padding={{ bottom: 'medium', top: 'medium' }}
				>
					<ds-text as="h3" size="medium" color="gray0" weight="bold">
						{t(`domain.distributionList.managePermission`, `Manage permissions`)}
					</ds-text>
					<ds-text
						as="p"
						size="small"
						color="gray0"
						style={{ marginTop: '0.5rem' }}
						overflow="break-word"
					>
						{t(
							'domain.distributionList.sendAs.managePermissionDescriptionMsg',
							'Allow others to send emails as this distribution list'
						)}
					</ds-text>
				</Row>
				<Container padding={{ bottom: 'large' }} height={'auto'}>
					<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
						<DropDownInput
							items={sendItems}
							inputLabel={t(
								'domain.distributionList.sendAs.addSendersByEmail',
								'Add senders by email address'
							)}
							size="medium"
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setSendEmailItem(e.target.value);
							}}
							inputValue={sendEmailItem}
							isCustomIcon={false}
							hasError={isShowSendEmailError}
						/>
					</Row>
					{isShowSendEmailError && (
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="100%"
							padding={{ top: 'small' }}
						>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
								<Padding right={'0'}>
									<ds-text as="span" size="extrasmall" weight="regular" color="error">
										{sendEmailErrorMessage}
									</ds-text>
								</Padding>
							</Container>
						</Row>
					)}
					<Container mainAlignment="flex-start">
						<Row width="100%" padding={{ top: 'extralarge' }} mainAlignment="flex-start">
							<ds-text as="h4" size="small" color="gray0" weight="bold">
								{t('domain.distributionList.sendAs.permissionLevel', 'Permission level')}
							</ds-text>
						</Row>
						<Row
							width="100%"
							padding={{ top: 'large', bottom: 'large' }}
							mainAlignment="flex-start"
						>
							<PermissionLevelRadioGroup
								value={radioPermisionValue}
								onChange={setRadioPermisionValue}
							/>
						</Row>
					</Container>
					<Container mainAlignment="flex-start">
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="100%"
							padding={{ bottom: 'large' }}
						>
							<Button
								icon="Plus"
								key="add-button"
								label={t('domain.distributionList.sendAs.addAccount', 'ADD ACCOUNT')}
								color="primary"
								iconPlacement="left"
								onClick={(): void => onAddSendEmail()}
								size="medium"
								disabled={!radioPermisionValue}
							/>
						</Row>
					</Container>
					<Row width="100%" padding={{ top: 'medium' }}>
						<ds-divider color="gray2" />
					</Row>

					<ListRow>
						<Container padding={{ bottom: 'large', top: 'extralarge' }}>
							<Row
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ bottom: 'large' }}
								width="100%"
							>
								<ds-text as="h4" weight="bold" color="gray0">
									{t(
										'domain.distributionList.sendAs.authorizedSendersList',
										'Authorized senders from this distribution list'
									)}
								</ds-text>
							</Row>
							{sendEmailTableRows.length > 0 && (
								<ListRow>
									<Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
										<Input
											label={t('domain.distributionList.sendAs.searchSenders', 'Search senders')}
											value={filterSendEmail}
											backgroundColor="gray5"
											onChange={handleInputChangeSendEmail}
											CustomIcon={FilterColumnIcon}
										/>
									</Row>
								</ListRow>
							)}
							<Table
								rows={filterSendEmail ? filteredSendEmailRows : sendEmailTableRows}
								headers={sendEmailHeaders}
								showCheckbox={false}
								selectedRows={selectedSendEmail}
								RowFactory={HoverableRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
						</Container>
					</ListRow>

					{sendEmailTableRows.length === 0 && (
						<ListRow padding={{ all: 'small' }}>
							<Container
								background="gray6"
								height="fit-content"
								mainAlignment="center"
								crossAlignment="center"
							>
								<Padding value="57px 0 0 0" width="100%">
									<Row mainAlignment="center" width="100%">
										<img src={helmetLogo} alt="logo" />
									</Row>
								</Padding>
								<Padding vertical="extralarge" width="100%">
									<Row mainAlignment="center" width="100%">
										<ds-text as="p" size="large" color="secondary" weight="regular">
											{t('label.there_are_not_member_here', "There aren't members here.")}
										</ds-text>
									</Row>
									<Row mainAlignment="center" width="100%">
										<ds-text as="p" size="large" color="secondary" weight="regular">
											{searchUserLabelValue}
										</ds-text>
									</Row>
								</Padding>
							</Container>
						</ListRow>
					)}
				</Container>
			</Container>
			{isOpenEditPermissionDialog && (
				<EditPermissionModal
					open={isOpenEditPermissionDialog}
					value={editPermissionValue}
					isRequestInProgress={isRequestInProgress}
					onValueChange={setEditPermissionValue}
					onCancel={closeEditPermissionHandler}
					onSaveChanges={onEditPermissionSaveChanges}
				/>
			)}
			{isOpenDeleteSendEmailDialog && (
				<RemoveSenderModal
					open={isOpenDeleteSendEmailDialog}
					sender={sendEmailToDelete}
					isRequestInProgress={isRequestInProgress}
					onCancel={closeDeleteSendEmailHandler}
					onConfirm={onDeleteSendEmailConfirm}
				/>
			)}
		</>
	);
};
