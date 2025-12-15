/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest, useDomainInformation } from '@zextras/admin-ui-bootstrap';
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
	useSnackbar
} from '@zextras/carbonio-design-system';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BackupAccountItem, DomainResponse } from '../../../types';
import logo from '../../assets/ninja_robo.svg';
import {
	ERROR_LABLE,
	MAX_DOMAIN_DISPLAY,
	MOBILE,
	RECORD_DISPLAY_LIMIT,
	SET,
	TRUE,
	UNSET
} from '../../constants';
import { getDomainList } from '../../services/search-domain-service';
import { setUnsetLegalHold } from '../../services/set-unset-legalhold';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import DropDownInput from '../components/dropDownInput';
import OverlayDivision from '../components/overlayDivision';
import Paging from '../components/paging';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import ListRow from '../list/list-row';

import RestoreAccountView from './restore/restore-account';

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
	const createSnackbar = useSnackbar();
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
	const [isShowOnlyLegalHoldAccount, setIsShowOnlyLegalHoldAccount] = useState<boolean>(false);
	const errorMessage = t(
		'label.something_wrong_error_msg',
		'Something went wrong. Please try again.'
	);
	const [domainList, setDomainList] = useState<
		{ name: string; id: string; a: { n: string; _content: string }[] }[]
	>([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const { data: domainData } = useDomainInformation();
	const domainName = domainData?.name || '';
	const [searchDomainName, setSearchDomainName] = useState<string>(domainName);
	const [selectedDomainName, setSelectedDomainName] = useState<string>(domainName);
	const [isEnableLegalHold, setIsEnableLegalHold] = useState<boolean>(false);
	const [disableSwitch, setDisableSwitch] = useState<boolean>(false);

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
				id: 'email',
				label: t('label.email', 'Email'),
				width: '20%',
				bold: true,
				sortable: false
			},
			{
				id: 'uid',
				label: t('label.account_id', 'Account Id'),
				width: '20%',
				bold: true,
				sortable: false
			},
			{
				id: 'serverName',
				label: t('label.server_name', 'Server Name'),
				width: '20%',
				bold: true,
				sortable: false
			},
			{
				id: 'createdDate',
				label: t('label.created_date', 'Created Date'),
				width: '10%',
				bold: true,
				sortable: false
			},
			{
				id: 'deletedDate',
				label: t('label.deleted_date', 'Deleted Date'),
				width: '10%',
				bold: true,
				sortable: false
			},
			{
				id: 'status',
				label: t('label.account_status', 'Account Status'),
				width: '10%',
				bold: true,
				sortable: false
			},
			{
				id: 'legalhold',
				label: t('label.legal_hold_status', 'Legal Hold Status'),
				width: '10%',
				bold: true,
				sortable: false
			}
		],
		[t]
	);

	const setBackupAccountAndPage = useCallback(
		(backupAccounts: Array<BackupAccountItem> | undefined, page: number) => {
			if (backupAccounts && Array.isArray(backupAccounts) && backupAccounts.length > 0) {
				setBackupAccountList(backupAccounts);
			} else {
				setBackupAccountList([]);
			}
			if (page >= 0) {
				const num: number = page;
				setTotalItem(num * accountLimit);
			} else if (page === 0) {
				setTotalItem(1);
			}
		},
		[accountLimit]
	);

	const setBackupAccountPage = useCallback(
		(data: any, page: number) => {
			let backupAccounts;
			const allServers = Object.keys(data);
			let allServerAccounts: Array<BackupAccountItem> = [];
			const maxPageList: Array<number> = [];
			let backupPage = page;
			allServers.forEach((item: string) => {
				if (data[item]?.response?.accounts) {
					allServerAccounts = allServerAccounts.concat(data[item]?.response?.accounts);
				}
				if (data[item]?.response?.maxPage >= 0) {
					maxPageList.push(data[item]?.response?.maxPage);
				}
			});
			if (allServerAccounts && allServerAccounts.length > 0) {
				backupAccounts = allServerAccounts;
				if (maxPageList && maxPageList.length > 0) {
					const max = Math.max(...maxPageList);
					if (max >= 0) {
						backupPage = max;
					}
				}
			}
			setBackupAccountAndPage(backupAccounts, backupPage);
		},
		[setBackupAccountAndPage]
	);

	const getBackupAccounts = useCallback(
		(searchText = '', offSet = 0): void => {
			setIsRequestInProgress(true);
			setDisableSwitch(true);
			setAccountRows([]);
			const domainNameItem =
				selectedDomainName === '' || selectedDomainName === undefined
					? domainName
					: selectedDomainName;
			const url = `/service/extension/zextras_admin/backup/getBackupAccounts?page=${offSet}&pageSize=${accountLimit}&domains=${domainNameItem}&filter=${searchText}&legalHold=${isShowOnlyLegalHoldAccount}`;
			getSoapFetchRequest(url)
				.then((data: any) => {
					setIsRequestInProgress(false);
					setDisableSwitch(false);
					const error = data?.all_server?.error?.message;
					const backupAccounts = data?.accounts;
					const page = data?.maxPage;

					if (error) {
						showSnackbar(ERROR_LABLE, ERROR_LABLE, error);
						return;
					}

					if (backupAccounts === undefined && !!data) {
						setBackupAccountPage(data, page);
					} else {
						setBackupAccountAndPage(backupAccounts, page);
					}
				})
				.catch((error: any) => {
					setIsRequestInProgress(false);
					setDisableSwitch(false);
					showSnackbar(ERROR_LABLE, ERROR_LABLE, error?.message ? error?.message : errorMessage);
				});
		},
		[
			accountLimit,
			domainName,
			errorMessage,
			selectedDomainName,
			isShowOnlyLegalHoldAccount,
			setBackupAccountAndPage,
			setBackupAccountPage,
			showSnackbar
		]
	);

	// Debounced version of getBackupAccounts
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedGetBackupAccounts = useCallback(
		debounce((searchText: string, offSet: number) => {
			getBackupAccounts(searchText, offSet);
		}, 500),
		[getBackupAccounts]
	);

	useEffect(() => {
		debouncedGetBackupAccounts(searchAccountName, accountOffset);
		return () => {
			debouncedGetBackupAccounts.cancel();
		};
	}, [
		debouncedGetBackupAccounts,
		searchAccountName,
		accountOffset,
		isShowOnlyLegalHoldAccount,
		selectedDomainName
	]);

	const onSearchAccount = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchAccountName(e.target.value);
		setAccountOffset(0);
	}, []);

	const allBackupAccounts = useMemo(() => backupAccountList, [backupAccountList]);

	useMemo(() => {
		if (allBackupAccounts && allBackupAccounts.length > 0) {
			const allRows = allBackupAccounts.map((item) => ({
				id: `${item?.id}-${item?.serverName}`,
				columns: [
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
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
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.name} color="gray0">
							{item?.id}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.name} color="gray0">
							{item?.serverName}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.name} color="gray0">
							{format(item?.creationTimestamp, 'dd/MM/yyyy')}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="light" key={item?.name} color="gray0">
							{item?.deletedTimestamp ? format(item?.deletedTimestamp, 'dd/MM/yyyy') : ''}
						</Text>
					</Container>,
					<Container
						key={item?.name}
						onClick={(): void => {
							setSelectedAccountRows([item]);
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
							setSelectedAccountRows([item]);
						}}
						crossAlignment="flex-start"
					>
						<Text size="small" weight="regular" key={item?.name} color="gray0">
							{item.legalHold?.toUpperCase() === TRUE
								? t('legal_hold.yes', 'Yes')
								: t('legal_hold.no', 'No')}
						</Text>
					</Container>
				]
			}));
			setAccountRows(allRows);
		} else {
			setAccountRows([]);
		}
	}, [allBackupAccounts, t]);

	const setAccountAfterLegalHold = useCallback(
		(status: string, id: string, serverName: string) => {
			const updatedLegalAccounts = allBackupAccounts.map((item) => {
				const holdItem = item;
				if (holdItem?.id === id && holdItem?.serverName === serverName) {
					holdItem.legalHold = status === SET ? 'true' : 'false';
				}
				return holdItem;
			});
			setBackupAccountList(updatedLegalAccounts);
		},
		[allBackupAccounts]
	);

	const setUnsetLegalHoldResponse = useCallback(
		(data: any, status: string, id: string, serverName: string) => {
			if (data?.accounts?.length) {
				setAccountAfterLegalHold(status, id, serverName);
			} else {
				const allServers = Object.keys(data);
				let allServerAccounts: Array<Record<string, unknown>> = [];
				allServers.forEach((item: string) => {
					if (data[item]?.response?.accounts) {
						allServerAccounts = allServerAccounts.concat(data[item]?.response?.accounts);
					}
				});
				if (allServerAccounts.length) {
					setAccountAfterLegalHold(status, id, serverName);
				}
			}
			setSelectedAccountRows([]);
		},
		[setAccountAfterLegalHold]
	);

	const onLegalHoldPress = useCallback(() => {
		const legalHoldItem = selectedAccountRows[0];
		if (legalHoldItem) {
			const status = legalHoldItem?.legalHold?.toUpperCase() === TRUE ? UNSET : SET;
			setUnsetLegalHold(status, legalHoldItem.id, legalHoldItem.serverName).then((data) => {
				setUnsetLegalHoldResponse(data, status, legalHoldItem.id, legalHoldItem.serverName);
			});
		}
	}, [selectedAccountRows, setUnsetLegalHoldResponse]);

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
					if (searchResponse?.searchTotal > 0) {
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
		[getDomainLists]
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
			const legalHoldItem = selectedAccountRows[0];
			const label =
				legalHoldItem?.legalHold === 'false'
					? t('legal_hold.set_legal_hold', 'Set legal hold')
					: t('legal_hold.unset_legal_hold', 'Unset legal hold');
			setLegalHoldOperationLabel(label);
			setIsEnableLegalHold(true);
		} else {
			setIsEnableLegalHold(false);
		}
	}, [selectedAccountRows, t]);

	const customIcon = useCallback(
		() => <Icon icon="FunnelOutline" size="large" color="primary" />,
		[]
	);

	const onRestore = useCallback(() => {
		const selectedItem = selectedAccountRows[0];
		if (selectedItem?.status === UNSET) {
			showSnackbar(
				ERROR_LABLE,
				ERROR_LABLE,
				t('legal_hold.legal_hold_status_not_set', 'Legal hold not set in this account')
			);
			return;
		}
		setIsShowRestoreView(true);
	}, [selectedAccountRows, showSnackbar, t]);

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
												'legalHold.show_only_accounts_on_legal_hold',
												'Show only accounts on Legal Hold'
											)}
											value={isShowOnlyLegalHoldAccount}
											disabled={disableSwitch}
											onClick={(): void => {
												const newValue = !isShowOnlyLegalHoldAccount;
												setIsShowOnlyLegalHoldAccount(newValue);
												setAccountOffset(0);
												setDisableSwitch(!disableSwitch);
												setIsShowRestoreView(false);
												setIsEnableLegalHold(false);
												setSelectedAccountRows([]);
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
										defaultValue={searchAccountName}
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
												<Padding right="4rem">
													<Paging
														totalItem={totalItem}
														pageSize={accountLimit}
														currentPageProp={accountOffset ? accountOffset + 1 : 1}
														onPageChange={(val: number): void => {
															setAccountOffset(val - 1);
															setSelectedAccountRows([]);
															setIsShowRestoreView(false);
														}}
													/>
												</Padding>
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
					legalHoldAccount={selectedAccountRows[0]}
					setIsShowRestoreView={setIsShowRestoreView}
				/>
			)}
		</Container>
	);
};
export default LegalHoldPanel;
