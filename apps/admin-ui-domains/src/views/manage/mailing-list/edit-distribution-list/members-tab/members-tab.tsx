/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useStore } from '@tanstack/react-form';
import {
	Container,
	CustomHeaderFactory,
	HoverableRowFactory,
	Input,
	ListRow,
	Padding,
	Paging,
	Row,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { uniq } from 'lodash';
import { type ChangeEvent, type FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { RECORD_DISPLAY_LIMIT } from '../../../../../constants';
import { useAddDistributionListMember } from '../../../../../services/use-add-distribution-list-member';
import { useRemoveDistributionListMember } from '../../../../../services/use-remove-distribution-list-member';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import { useSearchWithDebounce } from '../../edit-mailing-detail/hooks/use-search-with-debounce';
import type { EditDistributionListFormApi } from '../types';
import { AddMemberRow } from './add-member-row';
import { filterMemberRows, pageRows, resolveNewMembers } from './filter-members';
import { buildMemberRow } from './member-row';
import { RemoveMemberModal } from './remove-member-modal';

type MembersTabProps = {
	form: EditDistributionListFormApi;
	selectedMailingList: any;
	isRequestInProgress: boolean;
	setIsRequestInProgress: (v: boolean) => void;
	searchUserLabelValue: string;
	isGlobalAdmin: boolean;
};

export const MembersTab: FC<MembersTabProps> = ({
	form,
	selectedMailingList,
	isRequestInProgress,
	setIsRequestInProgress,
	searchUserLabelValue,
	isGlobalAdmin
}) => {
	const dlm = useStore(form.store, (state) => state.values.dlm);
	const memberURL = useStore(form.store, (state) => state.values.memberURL);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const limit = 15;
	const [dlmTableRows, setDlmTableRows] = useState<Array<any>>([]);
	const [DLMPagedRows, setDLMPagedRows] = useState<Array<any>>([]);
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<any>>(
		[]
	);
	const [searchMember, setSearchMember] = useState('');
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [isShowMemberError, setIsShowMemberError] = useState(false);
	const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>('');
	const [offset, setOffset] = useState(0);
	const [DLMCurrentPage, setDLMSearchCurrentPage] = useState(1);
	const [filterMember, setFilterMember] = useState('');
	const [filteredDlmTableRows, setFilteredDlmTableRows] = useState<Array<any>>([]);
	const [isOpenDeleteMemberDialog, setIsOpenDeleteMemberDialog] = useState(false);
	const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

	const addMemberMutation = useAddDistributionListMember();
	const removeMemberMutation = useRemoveDistributionListMember();

	const memberHeaders: Array<any> = [
		{
			id: 'members',
			label: t('label.members', 'Members'),
			width: '80%',
			bold: true
		},
		!selectedMailingList?.dynamic
			? {
					id: 'actions',
					label: t('label.actions', 'Actions'),
					width: '20%',
					bold: false
				}
			: { id: 'actions', label: '', width: '0%', bold: false }
	];

	const searchMemberItems = searchMemberResult.map((item: any) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setSearchMember(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			const source = filterMember ? filterMemberRows(dlm, filterMember) : dlm;
			const rows = source.map((item: string) =>
				buildMemberRow(item, {
					dynamic: Boolean(selectedMailingList?.dynamic),
					deleteLabel: t('label.delete', 'Delete'),
					onDelete: (member): void => {
						setMemberToDelete(member);
						setIsOpenDeleteMemberDialog(true);
					},
					onSelect: (member): void => {
						setSelectedDistributionListMember([member]);
					}
				})
			);
			setDlmTableRows(rows);
			setDLMPagedRows(pageRows(rows, offset, limit));
		} else {
			setDlmTableRows([]);
			setDLMPagedRows([]);
			setOffset(0);
			setDLMSearchCurrentPage(1);
		}
	}, [dlm, offset, filterMember, selectedMailingList?.dynamic, t]);

	const getSearchMemberList = useCallback(
		(mem: string) => {
			const attrs =
				'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraMailStatus';
			const types = 'accounts,distributionlists,aliases';
			const query = `(&(!(zimbraAccountStatus=closed))(!(zimbraIsAdminGroup=TRUE))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)))`;

			searchDirectory({
				attr: attrs,
				type: types,
				domainName: '',
				query,
				offset: 0,
				limit: RECORD_DISPLAY_LIMIT,
				sortBy: 'name'
			})
				.then((data) => {
					const result: Array<any> = [];
					const dl = data?.dl;
					const account = data?.account;
					const alias = data?.alias;
					if (dl) {
						dl.map((item: any) => result.push(item));
					}
					if (account) {
						account.map((item: any) => result.push(item));
					}
					if (alias) {
						alias.map((item: any) => result.push(item));
					}
					setSearchMemberResult(result);
				})
				.catch((error) => {
					const snackbarConfig = generateSnackbarFromError(error, t);
					createSnackbar(snackbarConfig);
				});
		},
		[createSnackbar, t]
	);

	useSearchWithDebounce(searchMember, getSearchMemberList);

	const onAdd = useCallback((): void => {
		const resolution = resolveNewMembers(searchMember, dlm);
		switch (resolution.type) {
			case 'blank':
				setIsShowMemberError(true);
				setMemberErrorMessage(
					t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address')
				);
				return;
			case 'undefined':
				setMemberErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				setIsShowMemberError(true);
				return;
			case 'invalid':
				setIsShowMemberError(true);
				setMemberErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				return;
			case 'alreadyInList':
				setIsShowMemberError(true);
				setMemberErrorMessage(
					t(
						'label.distribution_list_already_in_list_error',
						'The Distribution List / User is already in the list'
					)
				);
				return;
		}

		const newMembers = resolution.members;
		if (newMembers.length === 0) return;
		setIsRequestInProgress(true);
		const addRequests = newMembers.map((item) =>
			addMemberMutation.mutateAsync({ listId: selectedMailingList?.id, member: item })
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
					const updatedDlm = uniq(dlm.concat(newMembers));
					form.setFieldValue('dlm', updatedDlm);
					setIsShowMemberError(false);
					setSearchMember('');
					setMemberErrorMessage('');
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.memberAddedSuccessfully',
							'Member has been added successfully'
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
		searchMember,
		t,
		dlm,
		selectedMailingList?.id,
		createSnackbar,
		form,
		setIsRequestInProgress,
		addMemberMutation
	]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const value = e.target.value;
		if (value != '') {
			setFilterMember(value);
			setDLMSearchCurrentPage(1);
			setOffset(0);
			const allRows = dlmTableRows.filter((item: any) =>
				item?.id.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredDlmTableRows(allRows);
			setDLMPagedRows(pageRows(allRows, 0, limit));
		} else {
			setFilterMember('');
			setDLMSearchCurrentPage(1);
			setOffset(0);
			setDLMPagedRows(pageRows(dlmTableRows, 0, limit));
			setFilteredDlmTableRows([]);
		}
	};

	const closeDeleteMemberHandler = useCallback(() => {
		setIsOpenDeleteMemberDialog(false);
		setMemberToDelete(null);
	}, []);

	const onDeleteMemberConfirm = useCallback(() => {
		if (!memberToDelete) return;
		setIsRequestInProgress(true);
		removeMemberMutation
			.mutateAsync({ listId: selectedMailingList?.id, member: memberToDelete })
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
					const updatedDlm = dlm.filter((item: any) => item !== memberToDelete);
					form.setFieldValue('dlm', updatedDlm);
					setSelectedDistributionListMember([]);
					if (DLMPagedRows.length === 1) {
						setDLMSearchCurrentPage(1);
						setOffset(0);
						setFilterMember('');
					}
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.memberDeletedSuccessfully',
							'Member has been removed successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsRequestInProgress(false);
				closeDeleteMemberHandler();
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
				closeDeleteMemberHandler();
			});
	}, [
		memberToDelete,
		selectedMailingList?.id,
		dlm,
		DLMPagedRows,
		createSnackbar,
		t,
		closeDeleteMemberHandler,
		form,
		setIsRequestInProgress,
		removeMemberMutation
	]);

	return (
		<>
			<Container
				padding={{ left: 'large', right: 'large', bottom: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 6.6rem)"
				background="white"
				width={'58.75rem'}
				style={{ overflow: 'auto' }}
			>
				{selectedMailingList?.dynamic && (
					<>
						<Row padding={{ bottom: 'medium', top: 'medium' }}>
							<ds-text as="h3" size="medium" weight="bold" color="gray0">
								{t('label.dynamic_mode', 'Dynamic Mode')}
							</ds-text>
						</Row>
						<ListRow padding={{ all: 'small' }}>
							<Container orientation="horizontal">
								<Container>
									<Input
										label={t('label.distribution_list_url', "Distribution List's URL")}
										value={memberURL}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											form.setFieldValue('memberURL', e.target.value);
										}}
										disabled={!isGlobalAdmin}
									/>
								</Container>
							</Container>
						</ListRow>
					</>
				)}
				{!selectedMailingList?.dynamic && (
					<>
						<Row padding={{ bottom: 'small', top: 'medium' }}>
							<ds-text as="h3" size="medium" weight="bold" color="gray0">
								{t('label.members', 'Members')}
							</ds-text>
						</Row>
						<ListRow>
							<AddMemberRow
								items={searchMemberItems}
								inputValue={searchMember}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setSearchMember(e.target.value);
								}}
								hasError={isShowMemberError}
								errorMessage={memberErrorMessage}
								onAdd={onAdd}
							/>
						</ListRow>
					</>
				)}
				<ds-divider />
				<ListRow>
					<Container
						padding={{
							top: 'extralarge',
							bottom: 'small'
						}}
						mainAlignment="flex-start"
					>
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ bottom: 'large' }}
							width="100%"
						>
							<ds-text as="h4" weight="bold" color="gray0">
								{t('domain.distributionList.members.membersList', 'Members List')}
							</ds-text>
						</Row>
						{(dlmTableRows.length > 0 || filterMember !== '') && (
							<ListRow>
								<Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
									<Input
										label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
										value={filterMember}
										backgroundColor="gray5"
										onChange={handleInputChange}
										CustomIcon={(): any => (
											<ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
										)}
									/>
								</Row>
							</ListRow>
						)}
						<Table
							rows={DLMPagedRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
							onSelectionChange={(selectedRows) => {
								setSelectedDistributionListMember(selectedRows);
							}}
						/>
						<Container
							style={{
								position: 'sticky',
								bottom: '-4rem'
							}}
						>
							<Container
								orientation="horizontal"
								mainAlignment="space-between"
								background="gray6"
								width="100%"
								padding={{ right: 'extralarge' }}
								height="auto"
							>
								<Container crossAlignment="flex-start">
									<Paging
										totalItem={filterMember ? filteredDlmTableRows.length : dlmTableRows.length}
										setOffset={setOffset}
										pageSize={limit}
										currentPageProp={DLMCurrentPage}
										onPageChange={setDLMSearchCurrentPage}
									/>
								</Container>
							</Container>
						</Container>
					</Container>
				</ListRow>

				{dlmTableRows.length === 0 && !selectedMailingList?.dynamic && filterMember !== '' && (
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
			{isOpenDeleteMemberDialog && (
				<RemoveMemberModal
					open={isOpenDeleteMemberDialog}
					memberName={memberToDelete}
					isRequestInProgress={isRequestInProgress}
					onCancel={closeDeleteMemberHandler}
					onConfirm={onDeleteMemberConfirm}
				/>
			)}
		</>
	);
};
