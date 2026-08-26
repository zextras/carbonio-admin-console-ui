/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
	Button,
	Checkbox,
	ChipInput,
	ChipInputProps,
	Container,
	Row,
	useSnackbar,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { cloneDeep, filter, find, findIndex, map, pullAt } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { batchService } from '../../../services/batch-service';
import { useAccountListDirectory } from '../../../services/use-account-list-directory';
import CustomChip from '../../components/customChip';
import { isValidEmail } from '../../utility/utils';
import { useAccountForm } from '../account-form-context';
import { RightsTable } from './rights-table';
import {
	buildDelegateRows,
	buildDelegateSearchQuery,
	buildSimplifiedGrantBatch,
	buildSimplifiedRevokeBatch,
	type DelegateRightsType,
	parseDelegateDirectoryOptions,
	selectDelegatesForRemoval,
} from './utils';

const DELEGATE_SEARCH_ATTRS =
	'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';

type SimplifiedRightsPanelProps = {
	identitiesList: Array<any>;
	identityRows: ReturnType<typeof buildDelegateRows>;
	refetchGrants: () => void;
};

/**
 * Simplified delegates view: chip search over the directory, right checkboxes
 * and the three rights tables (read/write, read only, send) with revoke.
 */
export const SimplifiedRightsPanel = ({
	identitiesList,
	identityRows,
	refetchGrants,
}: SimplifiedRightsPanelProps) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { form } = useAccountForm();
	const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

	const [selectedAccounts, setSelectedAccounts] = useState<any>([]);
	const [simpleSelectedList, setSimpleSelectedList] = useState<any>([]);
	const [readRightCheck, setReadRightCheck] = useState<boolean>(false);
	const [readWriteRightCheck, setReadWriteRightCheck] = useState<boolean>(false);
	const [sendRightCheck, setSendRightCheck] = useState<boolean>(false);
	const [sendBehalfRightCheck, setSendBehalfRightCheck] = useState<boolean>(false);
	const [readWriteSelectedRows, setReadWriteSelectedRows] = useState<Array<string>>([]);
	const [readSelectedRows, setReadSelectedRows] = useState<Array<string>>([]);
	const [sendSelectedRows, setSendSelectedRows] = useState<Array<string>>([]);
	const [searchText, setSearchText] = useState('');

	const debouncedSearch = useDebouncedValue(searchText, 700);
	const searchQuery = buildDelegateSearchQuery(debouncedSearch ?? '');

	const { data: options = [] } = useAccountListDirectory(
		{
			attr: DELEGATE_SEARCH_ATTRS,
			type: 'distributionlists,accounts',
			domainName: '',
			query: searchQuery,
			offset: 0,
			limit: 10,
			select: (res: any) => parseDelegateDirectoryOptions(res, accountDetail?.zimbraId),
		},
		searchQuery.length > 2,
	);

	const filterOptions = ({ textContent }: { textContent: string | null }): void => {
		setSearchText(textContent ?? '');
	};

	const readWriteRows = filter(identityRows, { writeFolder: true, readFolder: true });
	const readRows = filter(identityRows, { writeFolder: false, readFolder: true });
	const sendRows = filter(identityRows, { sendRights: true });

	const addAccountGroupRights = (): void => {
		const { revokeUsrRigths, grantUsrRigths, folderUsrRights } = buildSimplifiedGrantBatch(
			simpleSelectedList,
			{ sendRightCheck, sendBehalfRightCheck, readWriteRightCheck, readRightCheck },
			accountDetail?.zimbraMailDeliveryAddress,
		);

		batchService(
			{
				RevokeRightRequest: revokeUsrRigths,
				GrantRightRequest: grantUsrRigths,
				FolderActionRequest: folderUsrRights,
				_jsns: 'urn:zimbra',
			},
			accountDetail?.zimbraMailDeliveryAddress,
		).then(() => {
			refetchGrants();
		});
		setSelectedAccounts([]);
		setSimpleSelectedList([]);
		setReadRightCheck(false);
		setReadWriteRightCheck(false);
		setSendRightCheck(false);
	};

	const handleSimpleDeleteDelegate = (single: boolean, rightsType: DelegateRightsType): void => {
		const selectedRowsByType: Record<DelegateRightsType, Array<string>> = {
			readWrite: readWriteSelectedRows,
			read: readSelectedRows,
			send: sendSelectedRows,
		};
		const selectedRowId = selectedRowsByType[rightsType][0];
		const selectedDelegateArr = selectDelegatesForRemoval(
			rightsType,
			single,
			selectedRowId,
			identitiesList,
			identityRows,
		);
		if (rightsType === 'readWrite') {
			setReadWriteSelectedRows([]);
		} else if (rightsType === 'read') {
			setReadSelectedRows([]);
		} else if (rightsType === 'send') {
			setSendSelectedRows([]);
		}

		const { revokeUsrRigths, folderUsrRights } = buildSimplifiedRevokeBatch(
			selectedDelegateArr,
			rightsType,
			accountDetail?.zimbraMailDeliveryAddress,
		);

		if (revokeUsrRigths.length > 0 || folderUsrRights.length > 0) {
			batchService(
				{
					RevokeRightRequest: revokeUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra',
				},
				accountDetail?.zimbraMailDeliveryAddress,
			).then(() => {
				refetchGrants();
			});

			createSnackbar({
				key: 'success',
				severity: 'success',
				label: t('account_details.delegate_deleted_successfully', 'Delegate deleted successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true,
			});
		}
	};

	return (
		<Container
			mainAlignment="flex-start"
			height="auto"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row padding={{ right: 'extralarge', bottom: 'large', top: 'large' }} mainAlignment="flex-start" width="100%">
				<ds-text as="h2" size="small" color="gray0" weight="bold">
					{t(`label.delegate's_rights`, `Delegate's Rights`)}
				</ds-text>
			</Row>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" style={{ gap: '0.625rem' }}>
				<ChipInput
					placeholder={t(
						'account_details.start_typing_account',
						'Start typing an Account / Group to add it to the rights',
					)}
					options={options}
					disableOptions
					background="gray5"
					bottomBorderColor="gray3"
					onInputType={filterOptions as NonNullable<ChipInputProps['onInputType']>}
					value={selectedAccounts}
					onChange={(contacts: any): void => {
						const data: any = [];
						let listArr = cloneDeep(simpleSelectedList);
						map(contacts, (contact: any) => {
							data.push(contact);
							if (!find(listArr, { label: contact.label }) && find(options, { label: contact.label })) {
								listArr.push(find(options, { label: contact.label }));
							}
						});
						const pullIndex: any = [];
						map(listArr, (ele: any, index) => {
							const indexEle = findIndex(contacts, { label: ele.label });
							if (indexEle < 0) {
								pullIndex.push(index);
							}
						});
						if (pullIndex.length) {
							listArr = pullAt(listArr, pullIndex);
						}
						setSimpleSelectedList(listArr);
						const filterData: any = [];
						map(data, (ele) => {
							if (isValidEmail(ele.label ?? '')) filterData.push(ele);
						});
						setSelectedAccounts(filterData);

						setSearchText('');
					}}
					requireUniqueChips
					ChipComponent={CustomChip}
					maxChips={null}
				/>
			</Container>
			<Container mainAlignment="flex-start">
				<Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
					<Row width="50%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<ds-text as="h2" size="small" color="gray0" weight="bold">
							{t('label.read_options', 'Read options')}
						</ds-text>
					</Row>
					<Row width="50%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<ds-text as="h2" size="small" color="gray0" weight="bold">
							{t('label.sending_options', 'Send options')}
						</ds-text>
					</Row>
					<Row width="25%" mainAlignment="flex-start">
						<Checkbox
							iconColor="primary"
							value={readWriteRightCheck}
							onClick={(): void => {
								if (!readWriteRightCheck) {
									setReadRightCheck(false);
								}
								setReadWriteRightCheck(!readWriteRightCheck);
							}}
							label={t('account_details.read_write', 'Read / Write')}
						/>
					</Row>
					<Row width="25%" mainAlignment="flex-start">
						<Checkbox
							iconColor="primary"
							value={readRightCheck}
							onClick={(): void => {
								if (!readRightCheck) {
									setReadWriteRightCheck(false);
								}
								setReadRightCheck(!readRightCheck);
							}}
							label={t('account_details.read_only', 'Read Only')}
						/>
					</Row>
					<Row width="25%" mainAlignment="flex-start">
						<Checkbox
							iconColor="primary"
							value={sendRightCheck}
							onClick={(): void => {
								if (!sendRightCheck) {
									setSendBehalfRightCheck(false);
								}
								setSendRightCheck(!sendRightCheck);
							}}
							label={t('account_details.send_check', 'Send')}
						/>
					</Row>
					<Row width="25%" mainAlignment="flex-start">
						<Checkbox
							iconColor="primary"
							value={sendBehalfRightCheck}
							onClick={(): void => {
								if (!sendBehalfRightCheck) {
									setSendRightCheck(false);
								}
								setSendBehalfRightCheck(!sendBehalfRightCheck);
							}}
							label={t('account_details.send_on_behalf_of_check', 'Send on Behalf of')}
						/>
					</Row>
				</Row>
			</Container>
			<Container mainAlignment="flex-start">
				<Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
					<Button
						label={t(
							'account_details.add_the_account_group_with_selected_rights',
							'ADD THE ACCOUNT / GROUP WITH SELECTED RIGHTS',
						)}
						onClick={(): void => addAccountGroupRights()}
						width="fill"
						type="outlined"
						disabled={
							!(
								sendRightCheck ||
								readRightCheck ||
								readWriteRightCheck ||
								sendBehalfRightCheck
							) || !selectedAccounts?.length
						}
					/>
				</Row>
			</Container>
			<Row width="100%" padding={{ top: 'medium' }}>
				<ds-divider></ds-divider>
			</Row>
			<Container mainAlignment="flex-start" height="auto" padding={{ bottom: '3rem' }}>
				<Container
					width="100%"
					padding={{ top: 'large', left: 'large' }}
					mainAlignment="space-between"
					crossAlignment="flex-start"
					height="auto"
					orientation="horizontal"
				>
					<RightsTable
						title={
							<Trans
								i18nKey="account_details.account_with_read_write_rights"
								defaults="Accounts with <bold>Read/Write</bold> rights"
								components={{ bold: <strong /> }}
							/>
						}
						rows={readWriteRows}
						hasAny={findIndex(identityRows, { writeFolder: true, readFolder: true }) >= 0}
						selected={readWriteSelectedRows}
						onSelectionChange={setReadWriteSelectedRows}
						onRemove={(): void => handleSimpleDeleteDelegate(true, 'readWrite')}
						onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'readWrite')}
					/>
					<RightsTable
						title={
							<Trans
								i18nKey="account_details.account_with_read_only_rights"
								defaults="Accounts with <bold>Read Only</bold> rights"
								components={{ bold: <strong /> }}
							/>
						}
						rows={readRows}
						hasAny={findIndex(identityRows, { writeFolder: false, readFolder: true }) >= 0}
						selected={readSelectedRows}
						onSelectionChange={setReadSelectedRows}
						onRemove={(): void => handleSimpleDeleteDelegate(true, 'read')}
						onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'read')}
					/>
					<RightsTable
						title={
							<Trans
								i18nKey="account_details.account_with_send_rights"
								defaults="Account with <bold>SendAs/SendonBehalf</bold> rights on"
								components={{ bold: <strong /> }}
							/>
						}
						rows={sendRows}
						hasAny={findIndex(identityRows, { sendRights: true }) >= 0}
						selected={sendSelectedRows}
						onSelectionChange={setSendSelectedRows}
						onRemove={(): void => handleSimpleDeleteDelegate(true, 'send')}
						onRemoveAll={(): void => handleSimpleDeleteDelegate(false, 'send')}
					/>
				</Container>
			</Container>
		</Container>
	);
};
