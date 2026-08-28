/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useStore } from '@tanstack/react-form';
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
import { uniq } from 'lodash';
import { type ChangeEvent, type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../../assets/helmet_logo.svg';
import { ASC, DESC } from '../../../../../constants';
import { useDistributionListAction } from '../../../../../services/use-distribution-list-action';
import { useTableFilter } from '../../edit-mailing-detail/hooks/use-table-filter';
import { useGalContactTypeResolver } from '../gal-contact-type-resolver';
import { resolveNewMembers } from '../members-tab/filter-members';
import type { EditDistributionListFormApi } from '../types';
import { useGalEmailSearch } from '../use-gal-email-search';
import { buildOwnerRow } from './owner-row';
import { sortOwnersByName } from './owner-type';
import { RemoveOwnerModal } from './remove-owner-modal';

type OwnersTabProps = {
	form: EditDistributionListFormApi;
	selectedMailingList: any;
	isRequestInProgress: boolean;
	setIsRequestInProgress: (v: boolean) => void;
	searchUserLabelValue: string;
};

export const OwnersTab: FC<OwnersTabProps> = ({
	form,
	selectedMailingList,
	isRequestInProgress,
	setIsRequestInProgress,
	searchUserLabelValue
}) => {
	const ownersList = useStore(form.store, (state) => state.values.ownersList);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const [ownerSortOrder, setOwnerSortOrder] = useState<typeof ASC | typeof DESC>(ASC);
	const [selectedOwnerListMember, setSelectedOwnerListMember] = useState<Array<any>>([]);
	const [isShowOwnerError, setIsShowOwnerError] = useState(false);
	const [ownerErrorMessage, setOwnerErrorMessage] = useState<string | null>('');
	const [isOpenDeleteOwnerDialog, setIsOpenDeleteOwnerDialog] = useState(false);
	const [ownerToDelete, setOwnerToDelete] = useState<any>(null);

	const actionMutation = useDistributionListAction(selectedMailingList?.id ?? '');

	const { searchValue: searchOwner, setSearchValue: setSearchOwner, items: searchOwnerList } =
		useGalEmailSearch();

	const getOwnerType = useGalContactTypeResolver();

	const ownerHeaders: Array<any> = [
		{
			id: 'owners',
			label: t('label.owners', 'Owners'),
			width: '80%',
			bold: true,
			sortable: true,
			onSortChange: (id: string, order: typeof ASC | typeof DESC): void => {
				setOwnerSortOrder(order);
			}
		},
		{
			id: 'actions',
			label: t('label.actions', 'Actions'),
			width: '20%',
			bold: true
		}
	];

	/* rows derived during render: built ascending, reversed for descending */
	const ownerTableRows: Array<any> = (() => {
		const rows = sortOwnersByName(ownersList ?? []).map((item: any) =>
			buildOwnerRow(item, {
				deleteLabel: t('label.delete', 'Delete'),
				onDelete: (owner): void => {
					setOwnerToDelete(owner);
					setIsOpenDeleteOwnerDialog(true);
				},
				onSelect: (ownerName): void => {
					setSelectedOwnerListMember([ownerName]);
				}
			})
		);
		return ownerSortOrder === ASC ? rows : [...rows].reverse();
	})();

	const {
		filterValue: filterOwner,
		filteredRows: filteredOwnerRows,
		handleFilterChange: handleInputChangeOwner
	} = useTableFilter(ownerTableRows);

	const onAddOwner = (): void => {
		const resolution = resolveNewMembers(
			searchOwner,
			ownersList.map((item: any) => item?.name)
		);
		switch (resolution.type) {
			case 'blank':
				setIsShowOwnerError(true);
				setOwnerErrorMessage(
					t('domain.distributionList.blankEmailErrorMsg', 'Please enter at least one email address')
				);
				return;
			case 'undefined':
				setIsShowOwnerError(true);
				setOwnerErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				return;
			case 'invalid':
				setIsShowOwnerError(true);
				setOwnerErrorMessage(
					t(
						'domain.distributionList.invalidEmailErrorMsg',
						'The account does not exist. Please check the spelling and try again.'
					)
				);
				return;
			case 'alreadyInList':
				setIsShowOwnerError(true);
				setOwnerErrorMessage(
					t(
						'label.distribution_list_already_in_list_error',
						'The Distribution List / User is already in the list'
					)
				);
				return;
		}

		setIsShowOwnerError(false);
		const newOwners = resolution.members.map((item) => ({ name: item, id: item }));
		setIsRequestInProgress(true);
		const addOwnerRequests = newOwners.map((owner: any) =>
			actionMutation.mutateAsync({
				dl: {
					by: 'id',
					_content: selectedMailingList?.id
				},
				action: {
					op: 'addOwners',
					owner: {
						by: 'name',
						type: getOwnerType(owner?.name),
						_content: owner?.name
					}
				}
			})
		);
		Promise.all(addOwnerRequests)
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
					const updatedOwners = uniq(ownersList.concat(newOwners));
					form.setFieldValue('ownersList', updatedOwners);
					setSearchOwner('');
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.ownerAddedSuccessfully',
							'Owner has been added successfully'
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
	};

	const closeDeleteOwnerHandler = () => {
		setIsOpenDeleteOwnerDialog(false);
		setOwnerToDelete(null);
	};

	const onDeleteOwnerConfirm = () => {
		if (!ownerToDelete) return;
		setIsRequestInProgress(true);
		actionMutation
			.mutateAsync({
				dl: {
					by: 'id',
					_content: selectedMailingList?.id
				},
				action: {
					op: 'removeOwners',
					owner: {
						by: 'name',
						type: getOwnerType(ownerToDelete?.name),
						_content: ownerToDelete?.name
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
					const updatedOwners = ownersList.filter(
						(item: any) => item?.name !== ownerToDelete?.name
					);
					form.setFieldValue('ownersList', updatedOwners);
					setSelectedOwnerListMember([]);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'domain.distributionList.ownerDeletedSuccessfully',
							'Owner has been removed successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsRequestInProgress(false);
				closeDeleteOwnerHandler();
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
				closeDeleteOwnerHandler();
			});
	};

	return (
		<>
			<Container
				padding={{ left: 'large', right: 'large', bottom: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 3.6rem)"
				background="white"
				width={'58.75rem'}
				style={{ overflow: 'auto' }}
			>
				<Row padding={{ top: 'medium' }}>
					<ds-text as="h4" weight="bold" color="gray0">
						{t('domain.distributionList.manageOwners', 'Manage owners')}
					</ds-text>
				</Row>
				<ListRow padding={{ top: 'small' }}>
					<ds-text
						as="p"
						size="small"
						color="gray0"
						style={{ whiteSpace: 'normal' }}
						overflow="break-word"
					>
						{t(
							'label.owners_description_msg_1',
							'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
						)}
					</ds-text>
				</ListRow>

				<ListRow>
					<Container orientation="vertical" mainAlignment="flex-start" background="gray6">
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="100%"
							padding={{ top: 'large' }}
						>
							<DropDownInput
								width="100%"
								items={searchOwnerList}
								inputLabel={t(
									'domain.distributionList.addOwnersByEmail',
									'Add owners by email address'
								)}
								size="medium"
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setSearchOwner(e.target.value);
								}}
								inputValue={searchOwner}
								isCustomIcon={false}
								hasError={isShowOwnerError}
							/>
						</Row>
						{isShowOwnerError && (
							<Row
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width="100%"
								padding={{ top: 'small' }}
							>
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding right={'0'}>
										<ds-text as="span" size="extrasmall" weight="regular" color="error">
											{ownerErrorMessage}
										</ds-text>
									</Padding>
								</Container>
							</Row>
						)}
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="100%"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<Button
								icon="Plus"
								key="add-button"
								label={t('domain.distributionList.addOwners', 'Add Owners')}
								color="primary"
								iconPlacement="left"
								onClick={onAddOwner}
								size="medium"
							/>
						</Row>
					</Container>
				</ListRow>
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
								{t('domain.distributionList.ownersList', 'Owners List')}
							</ds-text>
						</Row>
						{ownerTableRows.length > 0 && (
							<ListRow>
								<Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
									<Input
										label={t('label.filter', 'Filter') + ' ' + t('label.address', 'Address')}
										value={filterOwner}
										backgroundColor="gray5"
										onChange={handleInputChangeOwner}
										CustomIcon={(): any => (
											<ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
										)}
									/>
								</Row>
							</ListRow>
						)}
						<Table
							rows={filterOwner ? filteredOwnerRows : ownerTableRows}
							headers={ownerHeaders}
							showCheckbox={false}
							selectedRows={selectedOwnerListMember}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>

				{ownerTableRows.length === 0 && (
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
										{t('label.there_are_no_owners', "There aren't owners here.")}
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
			{isOpenDeleteOwnerDialog && (
				<RemoveOwnerModal
					open={isOpenDeleteOwnerDialog}
					ownerName={ownerToDelete?.name}
					isRequestInProgress={isRequestInProgress}
					onCancel={closeDeleteOwnerHandler}
					onConfirm={onDeleteOwnerConfirm}
				/>
			)}
		</>
	);
};
