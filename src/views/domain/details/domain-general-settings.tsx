/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
	Container,
	Input,
	Row,
	Text,
	Select,
	Divider,
	Button,
	Padding,
	Icon,
	Shimmer,
	SnackbarManagerContext,
	Modal,
	ChipInput
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { cloneDeep, filter, find, isEqual, map, some } from 'lodash';
import { timeZoneList, getFormatedDate, getDateFromStr, isValidEmail } from '../../utility/utils';
import {
	ACTIVE,
	CLOSED,
	HTTP,
	HTTPS,
	LOCKED,
	MAINTENANCE,
	NOT_SET,
	SUSPENDED,
	ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS
} from '../../../constants';
import { modifyDomain } from '../../../services/modify-domain-service';
import { deleteDomain } from '../../../services/delete-domain-service';
import { searchDirectory } from '../../../services/search-directory-service';
import { batchService } from '../../../services/batch-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';
import DomainCosLink from './domain-cos-link';
import { CosMaxAccountValues } from '../../../../types';

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainGeneralSettings: FC = () => {
	const [t] = useTranslation();
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const cosList = useDomainStore((state) => state.cosList);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);
	const removeDomain = useDomainStore((state) => state.removeDomain);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const serviceProtocolItems: any = useMemo(
		() => [
			{
				value: NOT_SET,
				label: t('label.not_set', 'Not Set')
			},
			{
				label: `${t('label.https', 'https')} (${t('label.secure', 'secure')})`,
				value: HTTPS
			},
			{
				label: `${t('label.http', 'http')} (${t('label.unsecure', 'unsecure')})`,
				value: HTTP
			}
		],
		[t]
	);

	const domainStatusItems = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: ACTIVE
			},
			{
				label: `${t('label.closed', 'Closed')} (${t('label.soft_deleted', 'Soft-deleted')})`,
				value: CLOSED
			},
			{
				label: `${t('label.locked', 'Locked')} (${t(
					'label.login_is_disabled',
					'Login is disabled'
				)})`,
				value: LOCKED
			},
			{
				label: `${t('label.in_maintenance', 'In maintenance')} (${t(
					'label.login_is_disabled',
					'Login is disabled'
				)})`,
				value: MAINTENANCE
			},
			{
				label: `${t('label.suspended', 'Suspended')} (${t(
					'label.login_is_disabled',
					'Login is disabled'
				)})`,
				value: SUSPENDED
			}
		],
		[t]
	);

	const [domainData, setDomainData]: any = useState({
		zimbraPrefTimeZoneId: NOT_SET,
		zimbraPublicServiceProtocol: NOT_SET,
		zimbraDomainStatus: ACTIVE,
		zimbraPublicServicePort: '',
		zimbraDNSCheckHostname: '',
		zimbraNotes: '',
		zimbraHelpAdminURL: '',
		zimbraHelpDelegatedURL: '',
		zimbraPublicServiceHostname: '',
		zimbraDomainMaxAccounts: '',
		zimbraDomainAggregateQuota: ''
	});
	const [selectedTimeZone, setSelectedTimeZone]: any = useState(timezones[0]);
	const [selectedPublicServiceProtocol, setSelectedPublicServiceProtocol]: any = useState(
		serviceProtocolItems[0]
	);
	const [domainStatus, setDomainStatus] = useState<any>(domainStatusItems[0]);
	const [domainName, setDomainName] = useState<string>('');
	const [publicServiceHostName, setPublicServiceHostName] = useState<string>('');
	const [zimbraPublicServicePort, setZimbraPublicServicePort] = useState<string>('');
	const [zimbraDNSCheckHostname, setZimbraDNSCheckHostname] = useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [zimbraHelpAdminURL, setZimbraHelpAdminURL] = useState<string>('');
	const [zimbraHelpDelegatedURL, setZimbraHelpDelegatedURL] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [zimbraDomainDefaultCOSId, setZimbraDomainDefaultCOSId] = useState<string>('');
	const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
	const [openDeleteDomainConfirmDialog, setOpenDeleteDomainConfirmDialog] =
		useState<boolean>(false);
	const [cosMaxAccountList, SetCosMaxAccountList] = useState<Array<CosMaxAccountValues>>([]);
	const [confirmDomainName, setConfirmDomainName] = useState<string>('');
	const [carbonioNotificationFrom, setCarbonioNotificationFrom] = useState('');
	const [hasCarbonioNotificationFromError, setHasCarbonioNotificationFromError] = useState(false);
	const [carbonioNotificationRecipients, setCarbonioNotificationRecipients] = useState<
		{ label: string }[]
	>([]);
	interface Attribute {
		n: string;
		_content: string;
	}

	interface AccountDlAlias {
		name: string;
		id: string;
		isExternal?: boolean;
		dynamic?: boolean;
		targetName?: string;
		a: Attribute[];
		zimbraIsSystemAccount?: string;
	}

	interface DomainDirectoies {
		account: AccountDlAlias[];
		dl: AccountDlAlias[];
		alias: AccountDlAlias[];
		calresource: AccountDlAlias[];
	}
	interface SearchDomainDirectoies {
		account: AccountDlAlias[];
		dl: AccountDlAlias[];
		alias: AccountDlAlias[];
		calresource: AccountDlAlias[];
		more: boolean;
		searchTotal: number;
	}
	const [domainDirectoies, setDomainDirectoies] = useState<DomainDirectoies>({
		account: [],
		dl: [],
		alias: [],
		calresource: []
	});
	const [isRequstInProgress, setIsRequestInProgress] = useState<boolean>(true);
	const [zimbraDomainMaxAccounts, setZimbraDomainMaxAccounts] = useState<string>('');
	const [zimbraMailDomainQuota, setZimbraMailDomainQuota] = useState<string>('');

	useEffect(() => {
		if (!!cosList && cosList.length > 0) {
			const arrayItem: any[] = [];
			cosList.forEach((item: any) => {
				arrayItem.push({
					label: item.name,
					value: item.id
				});
			});
			setCosItems(arrayItem);
		}
	}, [cosList]);

	useMemo(() => {
		setDomainDirectoies({
			account: [],
			dl: [],
			alias: [],
			calresource: []
		});
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			setDomainName(obj.zimbraDomainName);
			if (obj.zimbraPrefTimeZoneId) {
				setSelectedTimeZone(timezones.find((item) => item.value === obj.zimbraPrefTimeZoneId));
			} else {
				obj.zimbraPrefTimeZoneId = NOT_SET;
				setSelectedTimeZone(timezones[0]);
			}

			if (obj.zimbraPublicServiceProtocol) {
				setSelectedPublicServiceProtocol(
					serviceProtocolItems.find((item: any) => item.value === obj.zimbraPublicServiceProtocol)
				);
			} else {
				obj.zimbraPublicServiceProtocol = NOT_SET;
				setSelectedPublicServiceProtocol(serviceProtocolItems[0]);
			}

			if (obj.zimbraDomainStatus) {
				setDomainStatus(domainStatusItems.find((item) => item.value === obj.zimbraDomainStatus));
			} else {
				setDomainStatus(domainStatusItems[0]);
			}

			if (obj.zimbraPublicServicePort) {
				setZimbraPublicServicePort(obj.zimbraPublicServicePort);
			} else {
				obj.zimbraPublicServicePort = '';
				setZimbraPublicServicePort('');
			}

			if (obj.zimbraDNSCheckHostname) {
				setZimbraDNSCheckHostname(obj.zimbraDNSCheckHostname);
			} else {
				obj.zimbraDNSCheckHostname = '';
				setZimbraDNSCheckHostname('');
			}

			if (obj.zimbraPublicServiceHostname) {
				setPublicServiceHostName(obj.zimbraPublicServiceHostname);
			} else {
				obj.zimbraPublicServiceHostname = '';
				setPublicServiceHostName('');
			}

			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
				setZimbraNotes('');
			}

			if (obj.zimbraHelpAdminURL) {
				setZimbraHelpAdminURL(obj.zimbraHelpAdminURL);
			} else {
				obj.zimbraHelpAdminURL = '';
				setZimbraHelpAdminURL('');
			}

			if (obj.zimbraHelpDelegatedURL) {
				setZimbraHelpDelegatedURL(obj.zimbraHelpDelegatedURL);
			} else {
				obj.zimbraHelpDelegatedURL = '';
				setZimbraHelpDelegatedURL('');
			}
			if (obj.zimbraDomainDefaultCOSId) {
				const getItem = cosItems.find((item: any) => item.value === obj.zimbraDomainDefaultCOSId);
				if (!!getItem && getItem.value) {
					setZimbraDomainDefaultCOSId(getItem.value);
				} else {
					obj.zimbraDomainDefaultCOSId = '';
					setZimbraDomainDefaultCOSId('');
				}
			} else {
				obj.zimbraDomainDefaultCOSId = '';
				setZimbraDomainDefaultCOSId('');
			}

			if (obj.zimbraDomainMaxAccounts) {
				setZimbraDomainMaxAccounts(obj.zimbraDomainMaxAccounts);
			} else {
				obj.zimbraDomainMaxAccounts = '';
				setZimbraDomainMaxAccounts('');
			}

			if (obj.zimbraMailDomainQuota) {
				setZimbraMailDomainQuota(obj.zimbraMailDomainQuota);
			} else {
				obj.zimbraMailDomainQuota = '';
				setZimbraMailDomainQuota('');
			}

			if (obj.carbonioNotificationFrom) {
				setCarbonioNotificationFrom(obj.carbonioNotificationFrom);
			} else {
				obj.carbonioNotificationFrom = '';
				setCarbonioNotificationFrom('');
			}

			if (obj.carbonioNotificationRecipients) {
				const items = filter(domainInformation, { n: 'carbonioNotificationRecipients' });
				const data = items.map((item) => ({ label: item._content }));
				obj.carbonioNotificationRecipients = data;
				setCarbonioNotificationRecipients(data);
			} else {
				obj.carbonioNotificationRecipients = [];
				setCarbonioNotificationRecipients([]);
			}

			const domainCosMaxAccountArray = domainInformation.filter(
				(domainContent: any) => domainContent.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS
			);
			if (domainCosMaxAccountArray && domainCosMaxAccountArray.length > 0) {
				const domainCosMaxAccounts = domainCosMaxAccountArray.map(
					(domainContent: any, index: any) => ({
						id: domainContent._content?.split(':')[0],
						value: domainContent._content?.split(':')[1]
							? domainContent._content?.split(':')[1]
							: -1
					})
				);
				SetCosMaxAccountList(domainCosMaxAccounts);
			} else {
				SetCosMaxAccountList([]);
			}

			setDomainData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, timezones, serviceProtocolItems, domainStatusItems, cosItems]);

	const onTimeZoneChange = useCallback(
		(v: any): any => {
			const it = timezones.find((item: any) => item.value === v);
			setSelectedTimeZone(it);
		},
		[timezones]
	);

	const onPublicServiceProtocolChange = useCallback(
		(v: any): any => {
			const it = serviceProtocolItems.find((item: any) => item.value === v);
			setSelectedPublicServiceProtocol(it);
		},
		[serviceProtocolItems]
	);

	const onDomainStatusChange = useCallback(
		(v: any): any => {
			const it = domainStatusItems.find((item: any) => item.value === v);
			setDomainStatus(it);
		},
		[domainStatusItems]
	);

	useEffect(() => {
		const updatedData = {
			zimbraPrefTimeZoneId: selectedTimeZone?.value.toString(),
			zimbraPublicServiceProtocol: selectedPublicServiceProtocol.value,
			zimbraPublicServiceHostname: publicServiceHostName,
			zimbraDomainStatus: domainStatus.value,
			zimbraPublicServicePort,
			zimbraDNSCheckHostname,
			zimbraNotes,
			zimbraHelpAdminURL,
			zimbraHelpDelegatedURL,
			zimbraDomainDefaultCOSId: zimbraDomainDefaultCOSId || '',
			carbonioNotificationFrom,
			carbonioNotificationRecipients
		};
		const defaultDomainData = {
			zimbraPrefTimeZoneId: domainData.zimbraPrefTimeZoneId,
			zimbraPublicServiceProtocol: domainData.zimbraPublicServiceProtocol,
			zimbraPublicServiceHostname: domainData.zimbraPublicServiceHostname,
			zimbraDomainStatus: domainData.zimbraDomainStatus,
			zimbraPublicServicePort: domainData.zimbraPublicServicePort,
			zimbraDNSCheckHostname: domainData.zimbraDNSCheckHostname,
			zimbraNotes: domainData.zimbraNotes,
			zimbraHelpAdminURL: domainData.zimbraHelpAdminURL,
			zimbraHelpDelegatedURL: domainData.zimbraHelpDelegatedURL,
			zimbraDomainDefaultCOSId: domainData.zimbraDomainDefaultCOSId || '',
			carbonioNotificationFrom: domainData.carbonioNotificationFrom,
			carbonioNotificationRecipients: domainData.carbonioNotificationRecipients
		};
		if (!isEqual(defaultDomainData, updatedData)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [
		carbonioNotificationFrom,
		carbonioNotificationRecipients,
		domainData,
		domainStatus.value,
		publicServiceHostName,
		selectedPublicServiceProtocol.value,
		selectedTimeZone?.value,
		zimbraDNSCheckHostname,
		zimbraDomainDefaultCOSId,
		zimbraHelpAdminURL,
		zimbraHelpDelegatedURL,
		zimbraNotes,
		zimbraPublicServicePort
	]);
	const onCancel = (): void => {
		setSelectedPublicServiceProtocol(
			serviceProtocolItems.find(
				(item: any) => item.value === domainData.zimbraPublicServiceProtocol
			)
		);
		setSelectedTimeZone(timezones.find((item) => item.value === domainData.zimbraPrefTimeZoneId));
		setDomainStatus(domainStatusItems.find((item) => item.value === domainData.zimbraDomainStatus));
		setZimbraPublicServicePort(domainData.zimbraPublicServicePort);
		setZimbraDNSCheckHostname(domainData.zimbraDNSCheckHostname);
		setZimbraNotes(domainData.zimbraNotes);
		setZimbraHelpAdminURL(domainData.zimbraHelpAdminURL);
		setZimbraHelpDelegatedURL(domainData.zimbraHelpDelegatedURL);
		setPublicServiceHostName(domainData.zimbraPublicServiceHostname);
		setZimbraDomainMaxAccounts(domainData.zimbraDomainMaxAccounts);
		setZimbraMailDomainQuota(domainData.zimbraDomainAggregateQuota);
		const getItem = cosItems.find(
			(item: any) => item.value === domainData.zimbraDomainDefaultCOSId
		);
		if (!!getItem && getItem.value) {
			setZimbraDomainDefaultCOSId(getItem.value);
		} else {
			setZimbraDomainDefaultCOSId('');
		}
		setCarbonioNotificationFrom(domainData.carbonioNotificationFrom);
		setCarbonioNotificationRecipients(domainData.carbonioNotificationRecipients);
		setIsDirty(false);
	};

	const onSave = (): void => {
		if (isValidEmail(carbonioNotificationFrom ?? '') || carbonioNotificationFrom === '') {
			setHasCarbonioNotificationFromError(false);
			const body: any = {};
			const attributes: any[] = [];
			body.id = domainData.zimbraId;
			body._jsns = 'urn:zimbraAdmin';
			attributes.push({
				n: 'zimbraNotes',
				_content: zimbraNotes
			});
			if (selectedTimeZone.value !== NOT_SET) {
				attributes.push({
					n: 'zimbraPrefTimeZoneId',
					_content: selectedTimeZone.value
				});
			}
			if (selectedPublicServiceProtocol.value !== NOT_SET) {
				attributes.push({
					n: 'zimbraPublicServiceProtocol',
					_content: selectedPublicServiceProtocol.value
				});
			}
			attributes.push({
				n: 'zimbraDomainStatus',
				_content: domainStatus.value
			});
			attributes.push({
				n: 'zimbraPublicServicePort',
				_content: zimbraPublicServicePort
			});
			attributes.push({
				n: 'zimbraDNSCheckHostname',
				_content: zimbraDNSCheckHostname
			});
			attributes.push({
				n: 'zimbraHelpAdminURL',
				_content: zimbraHelpAdminURL
			});
			attributes.push({
				n: 'zimbraHelpDelegatedURL',
				_content: zimbraHelpDelegatedURL
			});
			if (zimbraDomainDefaultCOSId && zimbraDomainDefaultCOSId !== '') {
				attributes.push({
					n: 'zimbraDomainDefaultCOSId',
					_content: zimbraDomainDefaultCOSId
				});
			}
			attributes.push({
				n: 'zimbraPublicServiceHostname',
				_content: publicServiceHostName
			});
			attributes.push({
				n: 'carbonioNotificationFrom',
				_content: carbonioNotificationFrom
			});
			// eslint-disable-next-line array-callback-return
			carbonioNotificationRecipients.map((item: { label: string }): void => {
				attributes.push({
					n: 'carbonioNotificationRecipients',
					_content: item?.label
				});
			});
			body.a = attributes;
			modifyDomain(body)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					const domain: any = data?.domain[0];
					if (domain) {
						setDomain(domain);
					}
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		} else {
			setHasCarbonioNotificationFromError(true);
		}
	};

	const deleteOnlyDomain = useCallback((): void => {
		deleteDomain(domainData.zimbraId).then(() => {
			setIsRequestInProgress(false);
			setOpenDeleteDomainConfirmDialog(false);
			setDomainDirectoies({
				account: [],
				dl: [],
				alias: [],
				calresource: []
			});
			createSnackbar({
				key: 'success',
				type: 'success',
				label: t('label.delete_domain_success_msg', 'Domain has been deleted successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			removeDomain();
			setDomain({});
			replaceHistory(`/`);
		});
	}, [createSnackbar, domainData.zimbraId, removeDomain, setDomain, t]);

	const onDeleteAccountAndDomain = (): void => {
		setIsRequestInProgress(true);
		const accountDeleteBatch: any[] = [];
		const dlDeleteBatch: any[] = [];
		const resourceDeleteBatch: any[] = [];

		domainDirectoies.account.forEach((item: any): any =>
			accountDeleteBatch.push({
				id: item?.id,
				_jsns: 'urn:zimbraAdmin'
			})
		);
		domainDirectoies.dl.forEach((item: any): any =>
			dlDeleteBatch.push({
				id: { _content: item?.id },
				_jsns: 'urn:zimbraAdmin'
			})
		);
		domainDirectoies.calresource.forEach((item: any): any =>
			resourceDeleteBatch.push({
				id: item?.id,
				_jsns: 'urn:zimbraAdmin'
			})
		);
		batchService({
			DeleteDistributionListRequest: dlDeleteBatch,
			DeleteCalendarResourceRequest: resourceDeleteBatch,
			DeleteAccountRequest: accountDeleteBatch,
			_jsns: 'urn:zimbra'
		}).then(() => {
			deleteOnlyDomain();
		});
	};

	const domainCreationDate = useMemo(
		() =>
			!!domainData.zimbraCreateTimestamp && domainData.zimbraCreateTimestamp !== null
				? getFormatedDate(getDateFromStr(domainData.zimbraCreateTimestamp))
				: '',
		[domainData.zimbraCreateTimestamp]
	);
	const getAllDirectories = useCallback(
		(
			offset: number,
			limit: number,
			accountListArr: AccountDlAlias[],
			dlListArr: AccountDlAlias[],
			aliasListArr: AccountDlAlias[],
			calResourceArr: AccountDlAlias[]
		): void => {
			const type = 'accounts,distributionlists,aliases,resources,dynamicgroups';
			const attrs =
				'zimbraAliasTargetId,zimbraId,targetName,uid,type,description,displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,displayName,zimbraId,zimbraMailHost,uid,zimbraAccountStatus,description,zimbraCalResType,displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus, zimbraIsSystemAccount';
			searchDirectory(attrs, type, domainName, '', offset, limit).then(
				(data: SearchDomainDirectoies) => {
					if (data?.account?.length) {
						data.account.forEach((item: AccountDlAlias) => {
							const zimbraIsSystemAccount = find(item.a, { n: 'zimbraIsSystemAccount' });
							if (zimbraIsSystemAccount) {
								// eslint-disable-next-line no-param-reassign
								item.zimbraIsSystemAccount = zimbraIsSystemAccount._content;
							}
							return item;
						});
						accountListArr.push(...data.account);
					}
					if (data?.dl?.length) {
						dlListArr.push(...data.dl);
					}
					if (data?.alias?.length) {
						aliasListArr.push(...data.alias);
					}
					if (data?.calresource?.length) {
						calResourceArr.push(...data.calresource);
					}
					if (data?.more) {
						getAllDirectories(
							offset + limit,
							limit,
							cloneDeep(accountListArr),
							cloneDeep(dlListArr),
							cloneDeep(aliasListArr),
							cloneDeep(calResourceArr)
						);
					} else if (data?.searchTotal > 0) {
						if (
							accountListArr?.length ||
							dlListArr?.length ||
							aliasListArr?.length ||
							calResourceArr?.length
						) {
							setDomainDirectoies({
								account: cloneDeep(accountListArr),
								dl: cloneDeep(dlListArr),
								alias: cloneDeep(aliasListArr),
								calresource: cloneDeep(calResourceArr)
							});
							setOpenConfirmDialog(false);
							setOpenDeleteDomainConfirmDialog(true);
						} else {
							deleteOnlyDomain();
						}
					} else if (data?.searchTotal === 0) {
						deleteOnlyDomain();
					}
				}
			);
		},
		[deleteOnlyDomain, domainName]
	);

	const onDeleteDomain = (): void => {
		setIsRequestInProgress(true);
		getAllDirectories(0, 1000, [], [], [], []);
	};

	const onCloseDomain = (): void => {
		setConfirmDomainName('');
		setOpenDeleteDomainConfirmDialog(false);
		const body: any = {
			_jsns: 'urn:zimbraAdmin',
			id: domainData.zimbraId,
			a: [
				{
					n: 'zimbraDomainStatus',
					_content: domainStatusItems[1].value
				}
			]
		};
		setIsRequestInProgress(true);
		modifyDomain(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.domain_close_success_msg', 'Domain has been closed successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.domain[0];
				if (domain) {
					setDomain(domain);
				}
				const refDomainData = cloneDeep(domainData);
				refDomainData.zimbraDomainStatus = domainStatusItems[1].value;
				setDomainData(refDomainData);
				setDomainStatus(domainStatusItems[1]);
				setIsRequestInProgress(false);
			})
			.catch((error) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.general_settings', 'General Settings')}
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
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>

			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 150px)"
			>
				{loading ? (
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						width="fill"
						crossAlignment="flex-start"
					>
						<Shimmer.FormSection>
							<Shimmer.FormSubSection />
						</Shimmer.FormSection>
					</Container>
				) : (
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ all: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.name', 'Name')}
										value={domainName}
										backgroundColor="gray6"
										readOnly
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.id', 'Id')}
										value={domainData.zimbraId}
										backgroundColor="gray6"
										readOnly
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.creation_date', 'Creation Date')}
										value={domainCreationDate}
										backgroundColor="gray6"
										readOnly
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_manageable_account_for_the_domain',
											'Max manageable account for the domain (0=unlimited)'
										)}
										value={zimbraDomainMaxAccounts}
										backgroundColor="gray6"
										readOnly
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'label.max_mainbox_quota_for_the_domain_in_bytes',
											'Max mailbox quota for the domain (bytes) (0=unlimited)'
										)}
										value={zimbraMailDomainQuota}
										backgroundColor="gray6"
										readOnly
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={serviceProtocolItems}
										background="gray5"
										label={t('label.public_service_protocol', 'Public Service Protocol')}
										showCheckbox={false}
										onChange={onPublicServiceProtocolChange}
										selection={selectedPublicServiceProtocol}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.public_service_hostname', 'Public Service Host Name')}
										value={publicServiceHostName}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setPublicServiceHostName(e.target.value);
										}}
									/>
								</Container>

								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.public_service_port', 'Public Service Port')}
										value={zimbraPublicServicePort}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setZimbraPublicServicePort(e.target.value);
										}}
									/>
								</Container>
							</ListRow>

							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={timezones}
										background="gray5"
										label={t('label.timezone', 'Time Zone')}
										showCheckbox={false}
										onChange={onTimeZoneChange}
										selection={selectedTimeZone}
									/>
								</Container>
							</ListRow>
							<Container
								orientation="horizontal"
								width="98%"
								crossAlignment="center"
								mainAlignment="space-between"
								style={{ margin: '8px' }}
							>
								<Divider />
							</Container>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										items={cosItems}
										background="gray5"
										label={t('label.default_class_of_service', 'Default Class of Service')}
										showCheckbox={false}
										onChange={(e: any): any => {
											setZimbraDomainDefaultCOSId(
												cosItems.find((item: any) => item.value === e)?.value
											);
										}}
										selection={
											zimbraDomainDefaultCOSId === ''
												? cosItems[-1]
												: cosItems.find((item: any) => item.value === zimbraDomainDefaultCOSId)
										}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Select
										items={domainStatusItems}
										background="gray5"
										label={t('label.status', 'Status')}
										defaultSelection={domainStatusItems[0]}
										showCheckbox={false}
										onChange={onDomainStatusChange}
										selection={domainStatus}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.description', 'Description')}
										value={zimbraNotes}
										backgroundColor="gray5"
										onChange={(e: any): any => {
											setZimbraNotes(e.target.value);
										}}
									/>
								</Container>
							</ListRow>
							<Row
								mainAlignment="flex-start"
								width="100%"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.domain_system_notifications', 'Domain System Notifications')}
								</Text>
							</Row>
							<ListRow>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ horizontal: 'small', top: 'large', bottom: 'small' }}
								>
									<Input
										label={t('label.notification_sender', 'Notification Sender')}
										backgroundColor="gray5"
										value={carbonioNotificationFrom}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setCarbonioNotificationFrom(e.target.value);
										}}
										hasError={hasCarbonioNotificationFromError}
										description={
											hasCarbonioNotificationFromError
												? t('label.notification_error_msg', 'Enter a valid email address.')
												: undefined
										}
									/>
								</Container>
							</ListRow>
							<ListRow>
								<Container
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									padding={{ horizontal: 'small', top: 'large', bottom: 'extralarge' }}
								>
									<ChipInput
										placeholder={t('label.send_notifications_to', 'Send notifications to...')}
										background="gray5"
										defaultValue={carbonioNotificationRecipients}
										value={carbonioNotificationRecipients}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={(emails: { label: string }[]): void => {
											const data: { label: string }[] = [];
											map(emails, (email) => {
												if (isValidEmail(email.label ?? '')) data.push(email);
											});
											setCarbonioNotificationRecipients(data);
										}}
										hasError={some(carbonioNotificationRecipients || [], { error: true })}
									/>
								</Container>
							</ListRow>
							<DomainCosLink
								cosMaxAccountList={cosMaxAccountList}
								domainId={domainData.zimbraId}
								defaultCosId={zimbraDomainDefaultCOSId}
								domainName={domainName}
							/>
							<ListRow>
								<Container padding={{ all: 'small' }} width="100%" style={{ display: 'block' }}>
									<Button
										type="outlined"
										label={t('label.delete_domain', 'Delete Domain')}
										color="error"
										size="extralarge"
										width="fill"
										onClick={onDeleteDomain}
										style={{ width: '100%' }}
									/>
									<Modal
										title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
										open={openConfirmDialog}
										showCloseIcon
										onClose={(): void => {
											setConfirmDomainName('');
											setOpenConfirmDialog(false);
										}}
										customFooter={
											<Container orientation="horizontal" mainAlignment="space-between">
												<Container
													orientation="horizontal"
													mainAlignment="flex-start"
													width="10rem"
												>
													<Button
														label={t('label.need_help', 'NEED HELP?')}
														type="outlined"
														color="primary"
														onClick={(): void => {
															setConfirmDomainName('');
															setOpenConfirmDialog(false);
														}}
														width="fill"
													/>
												</Container>
												<Container orientation="horizontal" mainAlignment="flex-end">
													<Padding all="small">
														<Button
															label={t('label.cancel', 'CANCEL')}
															color="secondary"
															onClick={(): void => {
																setConfirmDomainName('');
																setOpenConfirmDialog(false);
															}}
														/>
													</Padding>

													<Button
														label={t('label.delete', 'DELETE')}
														color="error"
														onClick={onDeleteDomain}
														disabled={isRequstInProgress}
													/>
												</Container>
											</Container>
										}
									>
										<Padding all="medium">
											<Text overflow="break-word" weight="regular">
												{t('label.delete_domain_error_msg', {
													domainName,
													defaultValue:
														'You are deleting {{domainName}}. Are you sure you want to delete {{domainName}}?'
												})}
											</Text>
										</Padding>
									</Modal>

									{/* Open Delete Forcefully domains */}

									<Modal
										title={`${t('label.deleteing', 'Deleting')} ${domainName}`}
										open={openDeleteDomainConfirmDialog}
										showCloseIcon
										onClose={(): void => {
											setConfirmDomainName('');
											setOpenDeleteDomainConfirmDialog(false);
											setDomainDirectoies({
												account: [],
												dl: [],
												alias: [],
												calresource: []
											});
										}}
										customFooter={
											<Container orientation="horizontal" mainAlignment="space-between">
												<Container
													orientation="horizontal"
													mainAlignment="flex-start"
													width="10rem"
												>
													<Button
														label={t('label.cancel', 'CANCEL')}
														color="secondary"
														onClick={(): void => {
															setConfirmDomainName('');
															setOpenDeleteDomainConfirmDialog(false);
															setDomainDirectoies({
																account: [],
																dl: [],
																alias: [],
																calresource: []
															});
														}}
													/>
												</Container>
												<Container orientation="horizontal" mainAlignment="flex-end">
													<Padding right="small">
														<Button
															label={t('label.force_delete', 'Force Delete')}
															color="error"
															onClick={onDeleteAccountAndDomain}
															disabled={isRequstInProgress}
														/>
													</Padding>
													{domainStatus.value !== domainStatusItems[1].value ? (
														<Button
															label={t('label.close_domain', 'CLOSE DOMAIN')}
															color="primary"
															onClick={onCloseDomain}
														/>
													) : (
														<></>
													)}
												</Container>
											</Container>
										}
									>
										<Padding all="medium">
											<Text overflow="break-word" weight="regular">
												{t('label.delete_domain_with_all_resources_pre_msg', {
													domainName,
													defaultValue: 'Domain {{domainName}} is not empty and contains'
												})}
											</Text>
											<br />
											{domainDirectoies.account.length ? (
												<Text overflow="break-word" weight="regular">
													{domainDirectoies.account.length} {t('label.accounts', 'Accounts')}
												</Text>
											) : (
												<></>
											)}
											{filter(domainDirectoies.account, {
												zimbraIsSystemAccount: 'TRUE'
											}).length ? (
												<Text overflow="break-word" weight="regular">
													{
														filter(domainDirectoies.account, {
															zimbraIsSystemAccount: 'TRUE'
														}).length
													}{' '}
													{t('label.system_account', 'System Accounts')}
												</Text>
											) : (
												<></>
											)}
											{domainDirectoies.dl.length ? (
												<Text overflow="break-word" weight="regular">
													{domainDirectoies.dl.length}{' '}
													{t('label.distribution_list', 'Distribution list')}
												</Text>
											) : (
												<></>
											)}
											{domainDirectoies.alias.length ? (
												<Text overflow="break-word" weight="regular">
													{domainDirectoies.alias.length} {t('label.aliases', 'Aliases')}
												</Text>
											) : (
												<></>
											)}
											{domainDirectoies.calresource.length ? (
												<Text overflow="break-word" weight="regular">
													{domainDirectoies.calresource.length} {t('label.resources', 'Resources')}
												</Text>
											) : (
												<></>
											)}
											<br />
											{domainStatus.value !== domainStatusItems[1].value ? (
												<>
													<Text overflow="break-word" weight="regular">
														{t('label.delete_domain_with_all_resources_close_domain', {
															defaultValue:
																'If you are not sure, you still can close the domain to avoid any further interaction, leaving all the resources available in case of need.'
														})}
													</Text>
													<br />

													<Text overflow="break-word" weight="regular">
														{t('label.delete_domain_with_all_resources_permanently_remove', {
															defaultValue:
																'Otherwise, you can permanently remove all the accounts and domain objects. This operation cannot be reverted.'
														})}
													</Text>
													<br />
												</>
											) : (
												<>
													<Text overflow="break-word" weight="regular">
														{t(
															'label.permanently_delete_domain_with_all_resources_permanently_remove',
															{
																defaultValue:
																	'Permanently remove all the accounts and domain objects. This operation cannot be reverted.'
															}
														)}
													</Text>
													<br />
												</>
											)}
											<Text overflow="break-word" weight="regular">
												<Trans
													i18nKey="label.type_domain_name"
													defaults={`To confirm, type here the domain name <bold>"{{domainName}}"</bold>:`}
													components={{ bold: <strong /> }}
													values={{
														domainName
													}}
													t={t}
												/>
											</Text>
											<ListRow>
												<Container padding={{ top: 'large' }}>
													<Input
														value={confirmDomainName}
														backgroundColor="gray5"
														onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
															setConfirmDomainName(e.target.value);
															if (isEqual(e.target.value, domainName)) {
																setIsRequestInProgress(false);
															} else {
																setIsRequestInProgress(true);
															}
														}}
													/>
												</Container>
											</ListRow>
										</Padding>
									</Modal>
								</Container>
							</ListRow>
						</Container>
					</Row>
				)}
			</Container>

			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};
export default DomainGeneralSettings;
