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
	Padding,
	Button,
	Switch,
	Input,
	Icon,
	Table,
	useScreenMode,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	useDomainInformation
} from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import RestoreAccountView from './restore/restore-account';
import { BackupAccountItem, DomainResponse, LegalHolds } from '../../../types';
import logo from '../../assets/ninja_robo.svg';
import {
	ERROR_LABLE,
	MAX_DOMAIN_DISPLAY,
	MOBILE,
	RECORD_DISPLAY_LIMIT,
	SET,
	UNSET
} from '../../constants';
import { getLegalHoldList } from '../../services/get-legal-hold-list';
import { getDomainList } from '../../services/search-domain-service';
import { setUnsetLegalHold } from '../../services/set-unset-legalhold';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import DropDownInput from '../components/dropDownInput';
import OverlayDivision from '../components/overlayDivision';
import Paging from '../components/paging';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import ListRow from '../list/list-row';

const ovelayStyle = styled(Container)`
	width: 20rem;
	right: 0;
	bottom: 0;
	height: 8rem;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
`;

const AbsoluteContainerItem = styled(Container)`
	position: absolute;
	z-index: 1;
	top: 8rem;
`;

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

const LegalHoldPanel: FC = () => {
	const [t] = useTranslation();
	const screenMode = useScreenMode();
	const [totalItem, setTotalItem] = useState(1);
	const accountLimit = RECORD_DISPLAY_LIMIT;
	const [accountOffset, setAccountOffset] = useState<number>(0);
	const createSnackbar = useContext(SnackbarManagerContext);
	const [accounts, setAccounts] = useState<Array<BackupAccountItem>>([]);
	const [backupAccountList, setBackupAccountList] = useState<Array<BackupAccountItem>>([]);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [selectedAccountRows, setSelectedAccountRows] = useState<any>([]);
	const [isShowRestoreView, setIsShowRestoreView] = useState<boolean>(false);
	const [accountRows, setAccountRows] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowError, setIsShowError] = useState(false);
	const [searchAccountName, setSearchAccountName] = useState<string>('');
	const [legalHoldOperationLabel, setLegalHoldOperationLabel] = useState<string>(
		t('legal_hold.set_legal_hold', 'Set legal hold')
	);
	const [isShowOnlyLegalHostAccount, setIsShowOnlyLegalHostAccount] = useState<boolean>(false);
	const errorMessage = t(
		'label.something_wrong_error_msg',
		'Something went wrong. Please try again.'
	);
	const [domainList, setDomainList] = useState<
		{
			name: string;
			id: string;
			a: { n: string; _content: string }[];
		}[]
	>([]);
	const [allLegalHoldAccountList, setAllLegalHoldAccountList] = useState<Array<LegalHolds>>([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const domainName = useDomainInformation()?.name || '';
	const [searchDomainName, setSearchDomainName] = useState<string>(domainName);
	const [selectedDomainName, setSelectedDomainName] = useState<string>(domainName);
	const [isEnableLegalHold, setIsEnableLegalHold] = useState<boolean>(false);

	const showSnackbar = useCallback(
		(key, type, msg) => {
			createSnackbar({
				key,
				type,
				label: msg,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const loadingComponent = [
		{
			customComponent: (
				<Container>
					<OverlayDivision ovelayStyle={ovelayStyle} />
				</Container>
			)
		}
	];

	type THeader = {
		id: string;
		label: string;
		width?: string;
		i18nAllLabel?: string;
		bold?: boolean;
		sortable: boolean;
	};

	const headers: THeader[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '25%',
				bold: true,
				sortable: false
			},
			{
				id: 'email',
				label: t('label.email', 'Email'),
				width: '25%',
				bold: true,
				sortable: false
			},
			{
				id: 'status',
				label: t('label.account_status', 'Account Status'),
				width: '25%',
				bold: true,
				sortable: false
			},
			{
				id: 'legalhold',
				label: t('label.legal_hold_status', 'Legal Hold Status'),
				width: '25%',
				bold: true,
				sortable: false
			}
		],
		[t]
	);

	useEffect(() => {
		if (allLegalHoldAccountList.length > 0 && accounts.length > 0) {
			const updateAccountItems = accounts.map((item: BackupAccountItem) => {
				const holdAccount = item;
				const statusItem = allLegalHoldAccountList.find(
					(legalHoldAccount) => legalHoldAccount.id === holdAccount?.id
				)?.status;
				if (statusItem) {
					holdAccount.legalHold = statusItem.toString();
				}
				return holdAccount;
			});
			setBackupAccountList(updateAccountItems);
		}
	}, [accounts, allLegalHoldAccountList]);

	const setBackupAccountAndPage = useCallback(
		(backupAccounts, page) => {
			if (backupAccounts && Array.isArray(backupAccounts) && backupAccounts.length > 0) {
				setAccounts(backupAccounts);
			} else {
				setBackupAccountList([]);
			}
			if (page) {
				const num: number = page;
				setTotalItem(num * accountLimit);
			} else if (page === 0) {
				setTotalItem(1);
			}
		},
		[accountLimit]
	);

	const setBackupAccountPage = useCallback(
		(data, page) => {
			let backupAccounts;
			const allServers = Object.keys(data);
			let allServerAccounts: Array<Record<string, unknown>> = [];
			const maxPageList: Array<number> = [];
			let backupPage = page;
			allServers.forEach((item: string) => {
				if (data[item]?.response?.accounts) {
					allServerAccounts = allServerAccounts.concat(data[item]?.response?.accounts);
				}
				if (data[item]?.response?.maxPage) {
					maxPageList.push(data[item]?.response?.maxPage);
				}
			});
			if (allServerAccounts && allServerAccounts.length > 0) {
				backupAccounts = allServerAccounts;
				if (maxPageList && maxPageList.length > 0) {
					const max = Math.max(...maxPageList);
					if (max) {
						backupPage = max;
					}
				}
			}
			setBackupAccountAndPage(backupAccounts, backupPage);
		},
		[setBackupAccountAndPage]
	);

	const getBackupAccounts = useCallback(
		(searchText, domainNameItem) => {
			setIsRequestInProgress(true);
			setAccounts([]);
			getSoapFetchRequest(
				`/service/extension/zextras_admin/backup/getBackupAccounts?page=${accountOffset}&pageSize=${accountLimit}&domains=${domainNameItem}&targetServers=all_servers&filter=${searchText}`
			)
				.then((data: any) => {
					setIsRequestInProgress(false);
					const error = data?.all_server?.error?.message;
					const backupAccounts = data?.accounts;
					const page = data?.maxPage;

					if (error) {
						showSnackbar(ERROR_LABLE, ERROR_LABLE, error);
						return;
					}

					/* Take account list and maxPage from multiserver environment  */
					if (backupAccounts === undefined && !!data) {
						setBackupAccountPage(data, page);
					} else {
						setBackupAccountAndPage(backupAccounts, page);
					}
				})
				.catch((error: any) => {
					setIsRequestInProgress(false);
					showSnackbar(ERROR_LABLE, ERROR_LABLE, error?.message ? error?.message : errorMessage);
				});
		},
		[
			accountOffset,
			accountLimit,
			showSnackbar,
			setBackupAccountPage,
			setBackupAccountAndPage,
			errorMessage
		]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccount = useCallback(
		debounce((searchText, domainNameItem) => {
			getBackupAccounts(searchText, domainNameItem);
		}, 1000),
		[debounce]
	);

	useEffect(() => {
		const name =
			selectedDomainName === '' || selectedDomainName === undefined
				? domainName
				: selectedDomainName;
		getBackupAccounts('', name);
	}, [domainName, getBackupAccounts, selectedDomainName]);

	const onSearchAccount = useCallback(
		(e) => {
			setSearchAccountName(e.target.value);
			const name =
				selectedDomainName === '' || selectedDomainName === undefined
					? domainName
					: selectedDomainName;
			searchAccount(e.target.value, name);
		},
		[domainName, searchAccount, selectedDomainName]
	);

	const getAllLegalHold = useCallback(() => {
		getLegalHoldList()
			.then((data) => {
				if (data?.Body?.response?.content) {
					const parseData = JSON.parse(data?.Body?.response?.content);
					const message: string = parseData?.error?.message || parseData?.message;
					if (message) {
						showSnackbar(ERROR_LABLE, ERROR_LABLE, message);
						return;
					}
					const key = Object.keys(parseData?.response)[0];
					if (key.toString().includes('No account found for legal hold')) {
						return;
					}
					const accountRawData = parseData.response;
					const legalHoldsItems: Array<LegalHolds> = [];
					Object.entries(accountRawData).forEach((entry: any) => {
						const [keyItem, value] = entry;
						legalHoldsItems.push({
							id: keyItem.split(' ')[1],
							name: keyItem.split(' ')[0],
							status: value
						});
					});
					setAllLegalHoldAccountList(legalHoldsItems);
				}
			})
			.catch((error) => {
				showSnackbar(ERROR_LABLE, ERROR_LABLE, error?.message ? error?.message : errorMessage);
			});
	}, [errorMessage, showSnackbar]);

	useEffect(() => {
		getAllLegalHold();
	}, [getAllLegalHold]);

	const getStatusOfLegalHoldFromAccount = useCallback(
		(name): string => {
			const status = allLegalHoldAccountList.find((item) => item?.name === name)?.status;
			return status && status === UNSET ? 'NO' : 'YES';
		},
		[allLegalHoldAccountList]
	);

	const allBackupAccounts = useMemo(
		() =>
			isShowOnlyLegalHostAccount
				? backupAccountList.filter((item) => item?.legalHold === SET)
				: backupAccountList,
		[backupAccountList, isShowOnlyLegalHostAccount]
	);

	useMemo(() => {
		if (allBackupAccounts && allBackupAccounts.length > 0) {
			const allRows = allBackupAccounts.map((item) => ({
				id: item?.id,
				columns: [
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item?.id]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="regular" key={item?.name} color="gray0">
							{item?.name}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item?.id]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.name} color="gray0">
							{item?.name}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item?.id]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="regular" key={item?.name} color="gray0">
							{item?.status}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item?.id]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="regular" key={item?.name} color="gray0">
							{getStatusOfLegalHoldFromAccount(item?.name)}
						</Text>
					</Container>
				]
			}));
			setAccountRows(allRows);
		} else {
			setAccountRows([]);
		}
	}, [allBackupAccounts, getStatusOfLegalHoldFromAccount]);

	const getLegalHoldById = useCallback(
		(id): LegalHolds | undefined => {
			const account = allLegalHoldAccountList.find((item) => item?.id === id);
			return account ?? undefined;
		},
		[allLegalHoldAccountList]
	);

	const onLegalHoldPress = useCallback(() => {
		const id = selectedAccountRows[0];
		const legalHoldItem = getLegalHoldById(id);
		if (legalHoldItem) {
			const status = legalHoldItem?.status === UNSET ? SET : UNSET;
			setUnsetLegalHold(status, legalHoldItem?.name).then((data) => {
				const parseData = JSON.parse(data?.Body?.response?.content);
				const key = Object.keys(parseData?.response)[0];
				if (key.toString().includes('No account found for legal hold')) {
					showSnackbar(ERROR_LABLE, ERROR_LABLE, key ?? errorMessage);
				} else {
					const updateAccounts = accounts;
					const updatedLegalAccounts = allLegalHoldAccountList.map((item) => {
						const holdItem = item;
						if (holdItem?.id === id) {
							holdItem.status = status;
						}
						return holdItem;
					});
					setAllLegalHoldAccountList(updatedLegalAccounts);
					setAccounts([]);
					setAccounts(updateAccounts);
				}
				setSelectedAccountRows([]);
			});
		}
	}, [
		selectedAccountRows,
		getLegalHoldById,
		showSnackbar,
		errorMessage,
		accounts,
		allLegalHoldAccountList
	]);

	const customIconDetail = {
		onClick: (): void => {
			setSearchDomainName('');
		},
		style: {
			width: '1.25rem',
			height: '1.25rem',
			cursor: 'pointer'
		},
		icon: searchDomainName === '' ? 'ChevronDown' : 'CloseOutline'
	};

	const selectedDomain = useCallback(
		(domain: { name: string; id: string; a: { n: string; _content: string }[] }) => {
			setIsDomainSelect(true);
			setSearchDomainName(domain?.name);
			setSelectedDomainName(domain?.name);
			setTotalItem(0);
		},
		[]
	);

	const getDomainLists = useCallback(
		(name: string): void => {
			setIsLoading(true);
			setSelectedAccountRows([]);
			getDomainList(name, 0)
				.then((data) => {
					const searchResponse: DomainResponse = data;
					if (!!searchResponse && searchResponse?.searchTotal > 0) {
						setDomainList(searchResponse?.domain);
						setIsLoading(false);
					} else if (name !== '' && searchResponse?.searchTotal === 0) {
						setIsShowError(true);
						setDomainList([]);
						setIsLoading(false);
					} else {
						setDomainList([]);
						setIsLoading(false);
					}
				})
				.catch((error) => {
					const snackbarConfig = generateSnackbarFromError(error, t);
					createSnackbar(snackbarConfig);
				});
		},
		[createSnackbar, t]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (!isDomainSelect) {
			searchDomainCall(searchDomainName);
		}
	}, [searchDomainName, isDomainSelect, searchDomainCall]);

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'many_domain_info_msg',
											'So many domains! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: domainList.map(
					(domain: { name: string; id: string; a: { n: string; _content: string }[] }) => ({
						id: domain.id,
						label: domain.name,
						customComponent: (
							<Row
								style={{
									display: 'block',
									textAlign: 'left',
									height: 'inherit',
									padding: '0.188rem',
									width: 'inherit'
								}}
								onClick={(): void => {
									setIsShowError(false);
									selectedDomain(domain);
									setSelectedAccountRows([]);
								}}
							>
								{domain?.name}
							</Row>
						)
					})
			  );

	useEffect(() => {
		if (selectedAccountRows.length > 0) {
			const id = selectedAccountRows[0];
			const legalHoldItem = getLegalHoldById(id);
			const label =
				legalHoldItem?.status === UNSET
					? t('legal_hold.set_legal_hold', 'Set legal hold')
					: t('legal_hold.unset_legal_hold', 'Unset legal hold');
			setLegalHoldOperationLabel(label);
			setIsEnableLegalHold(true);
		} else {
			setIsEnableLegalHold(false);
		}
	}, [getLegalHoldById, selectedAccountRows, t]);

	const customIcon = useCallback(
		() => <Icon icon="FunnelOutline" size="large" color="primary" />,
		[]
	);

	const onRestore = useCallback(() => {
		const selectedItem = getLegalHoldById(selectedAccountRows[0]);
		if (selectedItem?.status === UNSET) {
			showSnackbar(
				ERROR_LABLE,
				ERROR_LABLE,
				t('legal_hold.legal_hold_status_not_set', 'Legal hold not set in this account')
			);
			return;
		}
		setIsShowRestoreView(true);
	}, [getLegalHoldById, selectedAccountRows, showSnackbar, t]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row
						orientation="horizontal"
						width="100%"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ left: 'extralarge' }}
					>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.legal_hold', 'Legal Hold')}
							</Text>
						</Row>
					</Row>
				</Container>
				<Row orientation="horizontal" width="100%" background="gray6">
					<Divider />
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 12.5rem)"
					padding={{ all: 'large' }}
				>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							orientation="vertical"
							mainAlignment="space-around"
							background="gray6"
							height="auto"
						>
							<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
								<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
									<Text size="medium" weight="bold" color="gray0">
										<Switch
											label={t(
												'legal_hold.show_only_accounts_on_legal_hold',
												'Show only accounts on Legal Hold'
											)}
											value={isShowOnlyLegalHostAccount}
											onClick={(): void => {
												setIsShowOnlyLegalHostAccount(!isShowOnlyLegalHostAccount);
											}}
											iconColor="primary"
										/>
									</Text>
								</Row>
								<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
									<Padding right="small">
										<Button
											type="outlined"
											label={legalHoldOperationLabel}
											color="primary"
											onClick={onLegalHoldPress}
											disabled={!isEnableLegalHold}
										/>
									</Padding>

									<Button
										type="outlined"
										label={t('legal_hold.restore', 'Restore')}
										color="primary"
										onClick={onRestore}
										disabled={selectedAccountRows.length === 0}
									/>
								</Row>
							</Row>

							<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
								<Row
									mainAlignment="flex-start"
									width="35%"
									crossAlignment="flex-start"
									padding={{ right: 'large' }}
								>
									<DropDownInput
										items={isLoading ? loadingComponent : items}
										inputLabel={
											isDomainSelect
												? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
												: t('domain.type_the exact_domain_name', 'Type the exact domain name')
										}
										hasError={isShowError}
										onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
											setIsDomainSelect(false);
											setIsShowError(false);
											setSearchDomainName(ev.target.value);
										}}
										inputValue={searchDomainName}
										isCustomIcon
										customIconDetail={customIconDetail}
									/>
								</Row>
								<Row width="65%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Input
										label={t('label.search_an_account', 'Search an Account')}
										backgroundColor="gray5"
										CustomIcon={customIcon}
										value={searchAccountName}
										onChange={onSearchAccount}
									/>
								</Row>
							</Row>
							<Container
								crossAlignment="center"
								mainAlignment="flex-start"
								style={{ position: 'relative' }}
							>
								{isRequestInProgress && (
									<AbsoluteContainerItem
										crossAlignment="center"
										mainAlignment="center"
										height="auto"
										padding={{ top: 'medium' }}
									>
										<Button
											type="ghost"
											color="primary"
											label=""
											loading
											onClick={(): null => null}
										/>
									</AbsoluteContainerItem>
								)}

								{accountRows.length === 0 && (
									<Container
										crossAlignment="center"
										mainAlignment="flex-start"
										padding={{ all: '3rem' }}
									>
										<Text overflow="break-word" weight="regular" size="large">
											<img src={logo} alt="logo" />
										</Text>
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
								{accountRows.length > 0 && (
									<>
										<Row
											orientation="horizontal"
											mainAlignment="space-between"
											crossAlignment="flex-start"
											width="fill"
											style={{
												height: screenMode === MOBILE ? 'auto' : 'calc(100vh - 25rem)'
											}}
											padding={{ all: 'large' }}
										>
											<Table
												rows={accountRows}
												headers={headers}
												showCheckbox={false}
												multiSelect={false}
												style={{
													overflow: 'auto',
													height: '100%'
												}}
												selectedRows={selectedAccountRows}
												RowFactory={CustomRowFactory}
												HeaderFactory={CustomHeaderFactory}
											/>
										</Row>
										<ListRow>
											<Container mainAlignment="flex-end" crossAlignment="flex-end">
												<Paging
													totalItem={totalItem}
													pageSize={accountLimit}
													setOffset={(val: number): void => {
														setAccountOffset(val / accountLimit);
													}}
												/>
											</Container>
										</ListRow>
									</>
								)}
							</Container>
						</Container>
					</Row>
				</Container>
			</Row>
			{isShowRestoreView && (
				<RestoreAccountView
					legalHoldAccount={getLegalHoldById(selectedAccountRows[0])}
					setIsShowRestoreView={setIsShowRestoreView}
				/>
			)}
		</Container>
	);
};
export default LegalHoldPanel;
