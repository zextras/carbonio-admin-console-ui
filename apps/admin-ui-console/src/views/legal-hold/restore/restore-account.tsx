/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Text,
	Divider,
	Input,
	Button,
	Table,
	DateTimePicker,
	useSnackbar,
	Padding,
	Switch
} from '@zextras/carbonio-design-system';
import { postSoapFetchRequest, soapFetch } from '@zextras/admin-ui-bootstrapper';
import { cloneDeep, debounce, unionBy } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { BackupAccountItem } from '../../../../types';
import {
	ERROR_LABLE,
	RECORD_DISPLAY_LIMIT,
	SUCCESS_LABLE,
	ZIMBRA_ADMIN_URN
} from '../../../constants';
import { accountListDirectory } from '../../../services/account-list-directory-service';
import { doRestoreOnNewLegalHoldAccount } from '../../../services/restore_new_legal_hold_account';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import DropDownInput from '../../components/dropDownInput';
import { formatedErrorMessage } from '../../utility/utils';

const RestoreAccountView: FC<{
	legalHoldAccount: BackupAccountItem | undefined;
	setIsShowRestoreView: (value: boolean) => void;
}> = ({ legalHoldAccount, setIsShowRestoreView }) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [searchAccount, setSearchAccount] = useState<string>('');
	const [unDelete, setUnDelete] = useState(false);
	const [legalHoldPrefix, setLegalHoldPrefix] = useState<string>('');
	const account = legalHoldAccount?.name ?? '';
	const accountId = legalHoldAccount?.id ?? '';
	const targetServers = legalHoldAccount?.serverName ?? '';
	const [accountList, setAccountList] = useState<any[]>([]);
	const [searchAccountResult, setSearchAccountResult] = useState<any[]>([]);
	const [isRequestInprogress, setIsRequestInprogress] = useState<boolean>(false);
	const offset = 0;
	const limit = RECORD_DISPLAY_LIMIT;
	const [tableRows, setTableRows] = useState<any[]>([]);
	const [selectedRow, setSelectedRow] = useState<any>([]);
	const [fromDate, setFromDate] = useState<Date | null>();
	const [undeleteFromDate, setUndeleteFromDate] = useState<Date | null>(
		new Date(legalHoldAccount?.creationTimestamp ?? '')
	);
	const [isEnableLeagalAccess, setIsEnableLeagalAccess] = useState<boolean>(false);
	const [isRestoreOprationComplete, setIsRestoreOprationComplete] = useState<boolean>(false);
	const [legalHoldAccountInformation, setLegalHoldAccountInformation] = useState<any>(null);

	const header = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '40%',
				bold: true
			},
			{
				id: 'email',
				label: t('label.email', 'Email'),
				width: '60%',
				bold: true
			}
		],
		[t]
	);

	const showSnackbar = useCallback(
		(key: string, severity: 'success' | 'info' | 'warning' | 'error', msg: string) => {
			createSnackbar({
				key,
				severity,
				label: msg,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const items = searchAccountResult.map((item) => ({
		id: item.id,
		label:
			item?.a.find((rec: Record<string, string>) => rec?.n === 'displayName')?._content ??
			item?.name,
		customComponent: [
			<Text
				size="small"
				key={item?.id}
				color="gray0"
				weight="regular"
				onClick={(): void => {
					setSearchAccount(item?.name);
				}}
			>
				{item?.name || ' '}
			</Text>
		]
	}));

	const getAccountList = useCallback(
		(searchStr: string) => {
			const type = 'distributionlists,accounts';
			const attrs = 'displayName,zimbraId';
			const query = `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
			accountListDirectory(attrs, type, '', searchStr === '' ? '' : query, offset, limit)
				.then((data) => {
					const accountListResponse =
						data?.account
							?.filter(
								(filteredAccount: Record<string, any>) =>
									filteredAccount?.id !== legalHoldAccount?.id
							)
							?.map((item: Record<string, any>) => {
								const holdItem = item;
								holdItem.type = 'usr';
								return holdItem;
							}) || [];
					const dlListResponse =
						data?.dl?.map((item: Record<string, any>) => {
							const holdItem = item;
							holdItem.type = 'grp';
							return holdItem;
						}) || [];
					const mergeAccounts = [...accountListResponse, ...dlListResponse];
					if (mergeAccounts && Array.isArray(mergeAccounts)) {
						setSearchAccountResult(mergeAccounts);
					}
				})
				.catch((error) => {
					showSnackbar(
						ERROR_LABLE,
						ERROR_LABLE,
						error
							? error?.error
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
					);
				});
		},
		[legalHoldAccount?.id, limit, showSnackbar, t]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchStr: string) => {
			getAccountList(searchStr);
		}, 700),
		[debounce, getAccountList]
	);

	useEffect(() => {
		if (searchAccount !== '') {
			searchAccountList(searchAccount);
		}
	}, [searchAccount, searchAccountList]);

	const callDeligateRequest = useCallback(
		(request: Array<unknown>) => {
			setIsRequestInprogress(true);
			Promise.all(request)
				.then((response) => Promise.all(response))
				.then(() => {
					setIsRequestInprogress(false);
					setIsEnableLeagalAccess(true);
					showSnackbar(
						SUCCESS_LABLE,
						SUCCESS_LABLE,
						t('legal_hold.permission_given_successfully', 'Permission given successfully')
					);
				});
		},
		[showSnackbar, t]
	);

	const enableLegalAccess = useCallback(() => {
		const requestItem: Array<unknown> = [];
		accountList.forEach((item) => {
			requestItem.push(
				postSoapFetchRequest(
					`/service/admin/soap/FolderActionRequest`,
					{
						_jsns: 'urn:zimbraMail',
						action: {
							op: 'grant',
							id: '1',
							grant: {
								perm: 'r',

								gt: item?.type ?? 'usr',
								d: item?.name,
								pw: ''
							}
						}
					},
					'FolderActionRequest',
					legalHoldAccountInformation?.id
				)
			);
		});
		callDeligateRequest(requestItem);
	}, [accountList, callDeligateRequest, legalHoldAccountInformation]);

	const onRemove = useCallback(() => {
		const updatedList = accountList.filter((item) => item?.id !== selectedRow[0]);
		setAccountList(updatedList);
	}, [accountList, selectedRow]);

	const onAdd = useCallback(() => {
		if (searchAccount !== '') {
			setSearchAccount('');
			const holdList = cloneDeep(accountList);
			const filterData = searchAccountResult.filter((item) => item?.name === searchAccount);
			setAccountList(unionBy([...holdList, ...filterData], 'id'));
		}
	}, [accountList, searchAccount, searchAccountResult]);

	const handleFromDateChange = useCallback(
		(d: Date | null) => {
			if (undeleteFromDate && d && d.getTime() < undeleteFromDate.getTime()) {
				setUndeleteFromDate(d);
			}
			setFromDate(d);
		},
		[undeleteFromDate]
	);

	const handleUndeleteFromDateChange = useCallback((d: Date | null) => {
		setUndeleteFromDate(d);
	}, []);

	useMemo(() => {
		if (accountList.length === 0) {
			setTableRows([]);
			return;
		}
		const accountListArr: Array<unknown> = [];
		accountList.forEach((item: any) => {
			accountListArr.push({
				id: item?.id,
				columns: [
					<Text
						size="small"
						key={item?.id}
						color="gray0"
						weight="regular"
						onClick={(): void => {
							setSelectedRow([item?.id]);
						}}
					>
						{item?.a.find((rec: Record<string, string>) => rec?.n === 'displayName')?._content ??
							item?.name}
					</Text>,
					<Text
						size="small"
						key={item?.name}
						color="gray0"
						weight="regular"
						onClick={(): void => {
							setSelectedRow([item?.id]);
						}}
					>
						{item?.name ?? ''}
					</Text>
				]
			});
		});
		setTableRows(accountListArr);
	}, [accountList]);

	const fixDate = useCallback(
		({ getDate, getUndeletedDate }: { getDate?: boolean; getUndeletedDate?: boolean }) => {
			let returnTimestamp;
			const creationTimestamp = legalHoldAccount?.creationTimestamp;
			const deletedTimestamp = legalHoldAccount?.deletedTimestamp;
			if (getDate) {
				returnTimestamp = fromDate?.setHours(23, 59, 59, 999);
			}
			if (getUndeletedDate && unDelete) {
				returnTimestamp = undeleteFromDate?.setHours(0, 0, 0, 0);
			}

			if (returnTimestamp && returnTimestamp > new Date().getTime()) {
				returnTimestamp = new Date().getTime();
			}

			if (returnTimestamp && deletedTimestamp && returnTimestamp > deletedTimestamp) {
				returnTimestamp = deletedTimestamp;
			}

			if (returnTimestamp && creationTimestamp && returnTimestamp < creationTimestamp) {
				returnTimestamp = creationTimestamp;
			}
			return returnTimestamp;
		},
		[
			fromDate,
			legalHoldAccount?.creationTimestamp,
			legalHoldAccount?.deletedTimestamp,
			unDelete,
			undeleteFromDate
		]
	);

	const onRestore = useCallback(() => {
		if (legalHoldPrefix === '') {
			showSnackbar(
				ERROR_LABLE,
				ERROR_LABLE,
				t('legal_hold.legal_hold_prefix_blank_error', 'Legal Hold prefix should not be blank')
			);
			return;
		}
		if (account === '') {
			showSnackbar(
				ERROR_LABLE,
				ERROR_LABLE,
				t('legal_hold.legal_hold_account_blank_error', 'Legal Hold account should not be blank')
			);
			return;
		}
		if (fromDate === undefined || fromDate === null) {
			showSnackbar(
				ERROR_LABLE,
				ERROR_LABLE,
				t('legal_hold.legal_hold_fromdate_blank_error', 'Legal Hold from date should not be blank')
			);
			return;
		}
		const destinationAccount = `${legalHoldPrefix}_${account}`;
		const sourceAccountId = accountId;
		const getDate = fixDate({ getDate: true });
		const getUndeletedDate = fixDate({ getUndeletedDate: true });
		if (getDate) {
			setIsRequestInprogress(true);
			doRestoreOnNewLegalHoldAccount(
				sourceAccountId,
				destinationAccount,
				getDate,
				getUndeletedDate,
				unDelete,
				targetServers
			)
				.then(() => {
					setIsRequestInprogress(false);
					setIsRestoreOprationComplete(true);
					showSnackbar(
						SUCCESS_LABLE,
						SUCCESS_LABLE,
						t('legal_hold.account_successful_restored', 'Account successfully restored')
					);
					if (tableRows.length === 0) {
						setIsShowRestoreView(false);
					} else {
						soapFetch(`GetAccount`, {
							_jsns: ZIMBRA_ADMIN_URN,
							account: {
								by: 'name',
								_content: destinationAccount
							}
						}).then((data: any) => {
							if (Array.isArray(data?.account)) {
								setLegalHoldAccountInformation(data?.account[0]);
							}
						});
					}
				})
				.catch((err) => {
					setIsRequestInprogress(false);
					const formatedMessage = formatedErrorMessage(err);
					showSnackbar(
						ERROR_LABLE,
						ERROR_LABLE,
						formatedMessage?.message ??
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
					);
				});
		}
	}, [
		account,
		accountId,
		fixDate,
		fromDate,
		legalHoldPrefix,
		setIsShowRestoreView,
		showSnackbar,
		t,
		tableRows.length,
		targetServers,
		unDelete
	]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '2.625rem',
				right: '0',
				bottom: '0',
				left: `${'max(calc(100% - 43.125rem), 0.75rem)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				maxHeight: '100%',
				overflow: 'hidden',
				boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)'
			}}
		>
			<Container mainAlignment="flex-start">
				<Row
					mainAlignment="flex-start"
					crossAlignment="center"
					orientation="horizontal"
					background="white"
					width="fill"
					height="3.5rem"
				>
					<Row padding={{ horizontal: 'small' }}></Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text size="medium" overflow="ellipsis" weight="bold">
							{t('legal_hold.restore', 'Restore')} {' - '}
							{legalHoldAccount?.name}
						</Text>
					</Row>

					<Row padding={{ right: 'extrasmall', left: 'small' }}>
						<Button
							type="ghost"
							color={'text'}
							size="medium"
							icon="CloseOutline"
							onClick={(): void => {
								setIsShowRestoreView(false);
							}}
						/>
					</Row>
				</Row>
				<Row>
					<Divider color="gray2" />
				</Row>
				<Container
					padding={{ all: 'extralarge' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100vh - 14.5rem)"
					style={{ overflow: 'auto' }}
					background="gray6"
				>
					<Container
						orientation="horizontal"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{ bottom: 'small' }}
					>
						<Container crossAlignment="flex-start" width={'7rem'}>
							<Text size="small" overflow="ellipsis" weight="bold">
								{t('label.server', 'Server Name')} :
							</Text>
						</Container>
						<Container width={'20rem'} crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Text size="small" overflow="ellipsis">
								{legalHoldAccount?.serverName}
							</Text>
						</Container>
					</Container>
					<Container
						orientation="horizontal"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{ bottom: 'small' }}
					>
						<Container crossAlignment="flex-start" width={'7rem'}>
							<Text size="small" overflow="ellipsis" weight="bold">
								{t('label.account_id', 'Account Id')} :
							</Text>
						</Container>
						<Container width={'20rem'} crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Text size="small" overflow="ellipsis">
								{legalHoldAccount?.id}
							</Text>
						</Container>
					</Container>

					<Container
						orientation="horizontal"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{ bottom: 'small' }}
					>
						<Container crossAlignment="flex-start" width={'7rem'}>
							<Text size="small" overflow="ellipsis" weight="bold">
								{t('label.created_date', 'Created Date')} :
							</Text>
						</Container>
						<Container width={'20rem'} crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Text size="small" overflow="ellipsis">
								{moment(legalHoldAccount?.creationTimestamp).format('DD/MM/YYYY')}
							</Text>
						</Container>
					</Container>

					{legalHoldAccount?.deletedTimestamp && (
						<Container
							orientation="horizontal"
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							height="auto"
						>
							<Container crossAlignment="flex-start" width={'7rem'}>
								<Text size="small" overflow="ellipsis" weight="bold">
									{t('label.deleted_date', 'Deleted Date')} :
								</Text>
							</Container>
							<Container width={'20rem'} crossAlignment="flex-start" padding={{ left: 'small' }}>
								<Text size="small" overflow="ellipsis">
									{moment(legalHoldAccount?.deletedTimestamp).format('DD/MM/YYYY')}
								</Text>
							</Container>
						</Container>
					)}

					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{ top: 'large' }}
					>
						<Text size="small" overflow="ellipsis" weight="bold">
							{t('legal_hold.restore_settings', 'Restore Settings')}
						</Text>
					</Container>
					<Container
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ bottom: 'large', top: 'large' }}
						height="auto"
					>
						<Container crossAlignment="flex-start">
							<Input
								label={t('legal_hold.legalhold_prefix', 'Legal Hold prefix')}
								backgroundColor="gray5"
								value={legalHoldPrefix}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setLegalHoldPrefix(e.target.value);
								}}
							/>
						</Container>

						<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
							<Input
								label={t('label.account', 'Account')}
								backgroundColor="gray5"
								value={account}
								disabled
							/>
						</Container>
					</Container>
					<Container
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ bottom: 'extralarge' }}
						height="auto"
					>
						<Container crossAlignment="flex-start">
							<DateTimePicker
								className="fffff"
								width="fill"
								label={t('label.account_status_on ', 'Account status on')}
								onChange={handleFromDateChange}
								dateFormat="dd/MM/yyyy"
								includeTime={false}
								minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
								maxDate={
									legalHoldAccount?.deletedTimestamp
										? new Date(legalHoldAccount.deletedTimestamp)
										: new Date()
								}
							/>
						</Container>
					</Container>

					<Container
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ bottom: 'extralarge' }}
						height="auto"
					>
						<Container crossAlignment="flex-start">
							<Switch
								label={t('legal_hold.include_items_deleted', 'Include items deleted')}
								value={unDelete}
								onClick={(): void => {
									setUnDelete(!unDelete);
								}}
								iconColor="primary"
							/>
						</Container>
					</Container>

					{unDelete && (
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							padding={{ bottom: 'extralarge' }}
							height="auto"
						>
							<Container crossAlignment="flex-start">
								<DateTimePicker
									className="fffff"
									width="fill"
									isClearable
									label={t('label.include_items_deleted_after', 'Include items deleted after')}
									onChange={handleUndeleteFromDateChange}
									dateFormat="dd/MM/yyyy"
									includeTime={false}
									selected={undeleteFromDate}
									minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
									maxDate={fromDate}
								/>
							</Container>
						</Container>
					)}

					<Container
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						height="auto"
						padding={{ top: 'medium', bottom: 'large' }}
					>
						<Text size="small" overflow="ellipsis" weight="bold">
							{t('legal_hold.legal_access', 'Legal Access')}
						</Text>
					</Container>

					<Container crossAlignment="flex-start" height="auto">
						<Container
							crossAlignment="flex-start"
							padding={{ right: 'medium' }}
							orientation="horizontal"
							mainAlignment="space-between"
							height="auto"
						>
							<Container width="70%" padding={{ right: 'medium' }} height="auto">
								<DropDownInput
									width="100%"
									items={items}
									inputLabel={t('label.search_an_account', 'Search an Account')}
									size="medium"
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setSearchAccount(e.target.value);
									}}
									inputValue={searchAccount}
									isCustomIcon={false}
								/>
							</Container>
							<Container width="auto" crossAlignment="flex-end" height="auto">
								<Button
									type="outlined"
									size="large"
									label={t('label.add', 'Add')}
									color="primary"
									onClick={onAdd}
								/>
							</Container>
							<Container
								width="auto"
								crossAlignment="flex-end"
								mainAlignment="flex-end"
								height="auto"
							>
								<Button
									type="ghost"
									size="large"
									label={t('label.remove', 'Remove')}
									color="error"
									onClick={onRemove}
									disabled={accountList.length === 0}
								/>
							</Container>
						</Container>
					</Container>

					<Container
						mainAlignment="flex-start"
						padding={{ top: 'medium', bottom: 'large' }}
						height="auto"
					>
						<Table
							rows={tableRows}
							headers={header}
							showCheckbox={false}
							multiSelect={false}
							selectedRows={selectedRow}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
					{accountList.length === 0 && (
						<Container crossAlignment="center" mainAlignment="flex-start" padding={{ all: '3rem' }}>
							<Padding all="medium">
								<Text
									color="gray1"
									overflow="break-word"
									weight="regular"
									size="large"
									style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
								>
									{t('label.this_list_is_empty', 'This list is empty.')}
								</Text>
							</Padding>
						</Container>
					)}
					<Container mainAlignment="flex-start" height="auto">
						<Button
							size="large"
							type="outlined"
							color="primary"
							label={t('legal_hold.restore', 'Restore')}
							onClick={onRestore}
							disabled={isRequestInprogress || isRestoreOprationComplete}
							width="fill"
						/>
					</Container>
					<Container height="auto" padding={{ top: 'medium', bottom: 'large' }}>
						<Text size="small" overflow="ellipsis" weight="light" color="gray0">
							{t(
								'legal_hold.you_must_restore_the_account_before_enable_legal_hold',
								'You must restore the account before enabling the Legal Hold'
							)}
						</Text>
					</Container>
				</Container>
			</Container>
			<Container
				mainAlignment="flex-end"
				crossAlignment="flex-end"
				height="auto"
				background="gray6"
				padding={{ all: 'large' }}
			>
				<Button
					size="large"
					type="default"
					color="primary"
					label={t('legal_hold.give_permission', 'Give Permission')}
					onClick={enableLegalAccess}
					disabled={
						accountList.length === 0 ||
						isRequestInprogress ||
						!isRestoreOprationComplete ||
						legalHoldAccountInformation === null ||
						isEnableLeagalAccess
					}
				/>
			</Container>
		</Container>
	);
};

export default RestoreAccountView;
