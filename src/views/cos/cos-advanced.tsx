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
	Switch,
	Padding,
	Button,
	Input,
	Select,
	Icon,
	SnackbarManagerContext,
	Table
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../list/list-row';
import { useCosStore } from '../../store/cos/store';
import logo from '../../assets/gardian.svg';

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const CosAdvanced: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData]: any = useState({});
	const setCos = useCosStore((state) => state.setCos);
	const timeItems: any[] = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: 'd'
			},
			{
				label: t('label.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: 's'
			}
		],
		[t]
	);

	const proxyAllowedDomainHeaders: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('cos.proxy_allowed_domain_name', 'Proxy Allowed Domain Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const [cosAdvanced, setCosAdvanced] = useState<any>({
		zimbraAttachmentsBlocked: false,
		zimbraMailForwardingAddressMaxLength: '',
		zimbraMailForwardingAddressMaxNumAddrs: '',
		zimbraMailQuota: '',
		zimbraContactMaxNumEntries: '',
		zimbraQuotaWarnPercent: '',
		zimbraQuotaWarnInterval: '',
		zimbraQuotaWarnIntervalRangeTime: timeItems[0],
		zimbraQuotaWarnMessage: '',
		zimbraDataSourceMinPollingInterval: '',
		zimbraDataSourceMinPollingIntervalRangeTime: timeItems[0],
		zimbraDataSourcePop3PollingInterval: '',
		zimbraDataSourcePop3PollingIntervalRangeTime: timeItems[0],
		zimbraDataSourceImapPollingInterval: '',
		zimbraDataSourceImapPollingIntervalRangeTime: timeItems[0],
		zimbraDataSourceCalendarPollingInterval: '',
		zimbraDataSourceCalendarPollingIntervalRangeTime: timeItems[0],
		zimbraDataSourceRssPollingInterval: '',
		zimbraDataSourceRssPollingIntervalRangeTime: timeItems[0],
		zimbraDataSourceCaldavPollingInterval: '',
		zimbraDataSourceCaldavPollingIntervalRangeTime: timeItems[0],
		zimbraProxyAllowedDomains: [],
		zimbraPasswordLocked: false,
		zimbraPasswordMinLength: '',
		zimbraPasswordMaxLength: '',
		zimbraPasswordMinUpperCaseChars: '',
		zimbraPasswordMinLowerCaseChars: '',
		zimbraPasswordMinPunctuationChars: '',
		zimbraPasswordMinNumericChars: '',
		zimbraPasswordMinDigitsOrPuncs: '',
		zimbraPasswordMinAge: '',
		zimbraPasswordMaxAge: '',
		zimbraPasswordEnforceHistory: '',
		zimbraPasswordBlockCommonEnabled: false,
		zimbraPasswordLockoutEnabled: false,
		zimbraPasswordLockoutMaxFailures: '',
		zimbraPasswordLockoutDuration: '',
		zimbraPasswordLockoutDurationRangeTime: timeItems[0],
		zimbraPasswordLockoutFailureLifetime: '',
		zimbraPasswordLockoutFailureLifetimeRangeTime: timeItems[0],
		zimbraAdminAuthTokenLifetime: '',
		zimbraAdminAuthTokenLifetimeRangeTime: timeItems[0],
		zimbraAuthTokenLifetime: '',
		zimbraAuthTokenLifetimeRangeTime: timeItems[0],
		zimbraMailIdleSessionTimeout: '',
		zimbraMailIdleSessionTimeoutRangeTime: timeItems[0],
		zimbraMailMessageLifetime: '',
		zimbraMailTrashLifetime: '',
		zimbraMailTrashLifetimeRangeTime: timeItems[0],
		zimbraMailSpamLifetime: '',
		zimbraMailSpamLifetimeRangeTime: timeItems[0],
		zimbraFreebusyExchangeUserOrg: ''
	});
	const [newProxyAllowedDomain, setNewProxyAllowedDomain] = useState<string>('');
	const [selectedProxyAllowedDomain, setSelectedProxyAllowedDomain] = useState<any>([]);
	const [proxyAllowedDomainAddBtnDisabled, setProxyAllowedDomainAddBtnDisabled] = useState(true);
	const [proxyAllowedDomainDeleteBtnDisabled, setProxyAllowedDomainDeleteBtnDisabled] =
		useState(true);
	const [searchProxyAllowedDomain, setSearchProxyAllowedDomain]: any = useState('');
	const [proxyAllowedDomainRows, setProxyAllowedDomainRows] = useState<any[]>([]);
	const [proxyAllowedDomainList, setProxyAllowedDomainList] = useState<any[]>([]);

	const setValue = useCallback(
		(key: string, value: any): void => {
			setCosAdvanced((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosAdvanced]
	);

	useEffect(() => {
		const sList: any[] = [];
		proxyAllowedDomainList.forEach((item: any, index: number) => {
			sList.push({
				id: index?.toString(),
				columns: [
					<Text size="medium" weight="light" key={index} color="gray0">
						{item?._content}
					</Text>
				],
				item,
				label: item?._content,
				clickable: true
			});
		});
		setProxyAllowedDomainRows(sList);
	}, [proxyAllowedDomainList]);

	const generateProxyAllowedDomainList = (proxyAllowedDomains: any): void => {
		if (proxyAllowedDomains && Array.isArray(proxyAllowedDomains)) {
			setProxyAllowedDomainList(proxyAllowedDomains);
		}
	};

	const setInitalValues = useCallback(
		(obj: any): void => {
			if (obj) {
				setValue('zimbraAttachmentsBlocked', obj?.zimbraAttachmentsBlocked === 'TRUE');
				setValue(
					'zimbraMailForwardingAddressMaxLength',
					obj?.zimbraMailForwardingAddressMaxLength ? obj?.zimbraMailForwardingAddressMaxLength : ''
				);
				setValue(
					'zimbraMailForwardingAddressMaxNumAddrs',
					obj?.zimbraMailForwardingAddressMaxNumAddrs
						? obj?.zimbraMailForwardingAddressMaxNumAddrs
						: ''
				);
				setValue(
					'zimbraMailQuota',
					// eslint-disable-next-line no-unsafe-optional-chaining
					obj?.zimbraMailQuota ? obj?.zimbraMailQuota / (1024 * 124) : ''
				);
				setValue(
					'zimbraContactMaxNumEntries',
					obj?.zimbraContactMaxNumEntries ? obj?.zimbraContactMaxNumEntries : ''
				);
				setValue(
					'zimbraQuotaWarnPercent',
					obj?.zimbraQuotaWarnPercent ? obj?.zimbraQuotaWarnPercent : ''
				);
				setValue(
					'zimbraQuotaWarnInterval',
					obj?.zimbraQuotaWarnInterval
						? // eslint-disable-next-line no-unsafe-optional-chaining
						  obj?.zimbraQuotaWarnInterval.substring(0, obj?.zimbraQuotaWarnInterval?.length - 1)
						: ''
				);
				setValue(
					'zimbraQuotaWarnIntervalRangeTime',
					obj?.zimbraQuotaWarnInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									// eslint-disable-next-line no-unsafe-optional-chaining
									obj?.zimbraQuotaWarnInterval.charAt(obj?.zimbraQuotaWarnInterval?.length - 1)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraQuotaWarnMessage',
					obj?.zimbraQuotaWarnMessage ? obj?.zimbraQuotaWarnMessage : ''
				);
				setValue(
					'zimbraDataSourceMinPollingInterval',
					obj?.zimbraDataSourceMinPollingInterval
						? obj?.zimbraDataSourceMinPollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourceMinPollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourceMinPollingIntervalRangeTime',
					obj?.zimbraDataSourceMinPollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourceMinPollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourceMinPollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraDataSourcePop3PollingInterval',
					obj?.zimbraDataSourcePop3PollingInterval
						? obj?.zimbraDataSourcePop3PollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourcePop3PollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourcePop3PollingIntervalRangeTime',
					obj?.zimbraDataSourcePop3PollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourcePop3PollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourcePop3PollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraDataSourceImapPollingInterval',
					obj?.zimbraDataSourceImapPollingInterval
						? obj?.zimbraDataSourceImapPollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourceImapPollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourceImapPollingIntervalRangeTime',
					obj?.zimbraDataSourceImapPollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourceImapPollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourceImapPollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraDataSourceCalendarPollingInterval',
					obj?.zimbraDataSourceCalendarPollingInterval
						? obj?.zimbraDataSourceCalendarPollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourceCalendarPollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourceCalendarPollingIntervalRangeTime',
					obj?.zimbraDataSourceCalendarPollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourceCalendarPollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourceCalendarPollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraDataSourceRssPollingInterval',
					obj?.zimbraDataSourceRssPollingInterval
						? obj?.zimbraDataSourceRssPollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourceRssPollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourceRssPollingIntervalRangeTime',
					obj?.zimbraDataSourceRssPollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourceRssPollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourceRssPollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraDataSourceCaldavPollingInterval',
					obj?.zimbraDataSourceCaldavPollingInterval
						? obj?.zimbraDataSourceCaldavPollingInterval.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraDataSourceCaldavPollingInterval?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraDataSourceCaldavPollingIntervalRangeTime',
					obj?.zimbraDataSourceCaldavPollingInterval
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraDataSourceCaldavPollingInterval.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraDataSourceCaldavPollingInterval?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue('zimbraPasswordLocked', obj?.zimbraPasswordLocked === 'TRUE');
				setValue(
					'zimbraPasswordMinLength',
					obj?.zimbraPasswordMinLength ? obj?.zimbraPasswordMinLength : ''
				);
				setValue(
					'zimbraPasswordMaxLength',
					obj?.zimbraPasswordMaxLength ? obj?.zimbraPasswordMaxLength : ''
				);
				setValue(
					'zimbraPasswordMinUpperCaseChars',
					obj?.zimbraPasswordMinUpperCaseChars ? obj?.zimbraPasswordMinUpperCaseChars : ''
				);
				setValue(
					'zimbraPasswordMinLowerCaseChars',
					obj?.zimbraPasswordMinLowerCaseChars ? obj?.zimbraPasswordMinLowerCaseChars : ''
				);
				setValue(
					'zimbraPasswordMinPunctuationChars',
					obj?.zimbraPasswordMinPunctuationChars ? obj?.zimbraPasswordMinPunctuationChars : ''
				);
				setValue(
					'zimbraPasswordMinNumericChars',
					obj?.zimbraPasswordMinNumericChars ? obj?.zimbraPasswordMinNumericChars : ''
				);
				setValue(
					'zimbraPasswordMinDigitsOrPuncs',
					obj?.zimbraPasswordMinDigitsOrPuncs ? obj?.zimbraPasswordMinDigitsOrPuncs : ''
				);
				setValue(
					'zimbraPasswordMinAge',
					obj?.zimbraPasswordMinAge ? obj?.zimbraPasswordMinAge : ''
				);
				setValue(
					'zimbraPasswordMaxAge',
					obj?.zimbraPasswordMaxAge ? obj?.zimbraPasswordMaxAge : ''
				);
				setValue(
					'zimbraPasswordEnforceHistory',
					obj?.zimbraPasswordEnforceHistory ? obj?.zimbraPasswordEnforceHistory : ''
				);
				setValue(
					'zimbraPasswordBlockCommonEnabled',
					obj?.zimbraPasswordBlockCommonEnabled === 'TRUE'
				);
				setValue('zimbraPasswordLockoutEnabled', obj?.zimbraPasswordLockoutEnabled === 'TRUE');
				setValue(
					'zimbraPasswordLockoutMaxFailures',
					obj?.zimbraPasswordLockoutMaxFailures ? obj?.zimbraPasswordLockoutMaxFailures : ''
				);
				setValue(
					'zimbraPasswordLockoutDuration',
					obj?.zimbraPasswordLockoutDuration
						? obj?.zimbraPasswordLockoutDuration.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraPasswordLockoutDuration?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraPasswordLockoutDurationRangeTime',
					obj?.zimbraPasswordLockoutDuration
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraPasswordLockoutDuration.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraPasswordLockoutDuration?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraPasswordLockoutFailureLifetime',
					obj?.zimbraPasswordLockoutFailureLifetime
						? obj?.zimbraPasswordLockoutFailureLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraPasswordLockoutFailureLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraPasswordLockoutFailureLifetimeRangeTime',
					obj?.zimbraPasswordLockoutFailureLifetime
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraPasswordLockoutFailureLifetime.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraPasswordLockoutFailureLifetime?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraAdminAuthTokenLifetime',
					obj?.zimbraAdminAuthTokenLifetime
						? obj?.zimbraAdminAuthTokenLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraAdminAuthTokenLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraAdminAuthTokenLifetimeRangeTime',
					obj?.zimbraAdminAuthTokenLifetime
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraAdminAuthTokenLifetime.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraAdminAuthTokenLifetime?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraAuthTokenLifetime',
					obj?.zimbraAuthTokenLifetime
						? obj?.zimbraAuthTokenLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraAuthTokenLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraAuthTokenLifetimeRangeTime',
					obj?.zimbraAuthTokenLifetime
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraAuthTokenLifetime.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraAuthTokenLifetime?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraMailIdleSessionTimeout',
					obj?.zimbraMailIdleSessionTimeout
						? obj?.zimbraMailIdleSessionTimeout.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraMailIdleSessionTimeout?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraMailIdleSessionTimeoutRangeTime',
					obj?.zimbraMailIdleSessionTimeout
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraMailIdleSessionTimeout.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraMailIdleSessionTimeout?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraMailMessageLifetime',
					obj?.zimbraMailMessageLifetime
						? obj?.zimbraMailMessageLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraMailMessageLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraMailTrashLifetime',
					obj?.zimbraMailTrashLifetime
						? obj?.zimbraMailTrashLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraMailTrashLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraMailTrashLifetimeRangeTime',
					obj?.zimbraMailTrashLifetime
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraMailTrashLifetime.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraMailTrashLifetime?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraMailSpamLifetime',
					obj?.zimbraMailSpamLifetime
						? obj?.zimbraMailSpamLifetime.substring(
								0,
								// eslint-disable-next-line no-unsafe-optional-chaining
								obj?.zimbraMailSpamLifetime?.length - 1
						  )
						: ''
				);
				setValue(
					'zimbraMailSpamLifetimeRangeTime',
					obj?.zimbraMailSpamLifetime
						? timeItems.find(
								(item: any) =>
									item.value ===
									obj?.zimbraMailSpamLifetime.charAt(
										// eslint-disable-next-line no-unsafe-optional-chaining
										obj?.zimbraMailSpamLifetime?.length - 1
									)
						  )
						: timeItems[0]
				);
				setValue(
					'zimbraFreebusyExchangeUserOrg',
					obj?.zimbraFreebusyExchangeUserOrg ? obj?.zimbraFreebusyExchangeUserOrg : ''
				);
			}
		},
		[setValue, timeItems]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const proxyAllowedDomains = cosInformation
				?.filter((value: any) => value?.n === 'zimbraProxyAllowedDomains')
				.map((item: any, index: any): any => {
					const id = index?.toString();
					return { ...item, id };
				});
			generateProxyAllowedDomainList(proxyAllowedDomains);
			setValue('zimbraProxyAllowedDomains', proxyAllowedDomains);
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (!obj.zimbraAttachmentsBlocked) {
				obj.zimbraAttachmentsBlocked = false;
			}
			if (!obj.zimbraMailForwardingAddressMaxLength) {
				obj.zimbraMailForwardingAddressMaxLength = '';
			}
			if (!obj.zimbraMailForwardingAddressMaxNumAddrs) {
				obj.zimbraMailForwardingAddressMaxNumAddrs = '';
			}
			if (!obj.zimbraMailQuota) {
				obj.zimbraMailQuota = '';
			}
			if (!obj.zimbraContactMaxNumEntries) {
				obj.zimbraContactMaxNumEntries = '';
			}
			if (!obj.zimbraQuotaWarnPercent) {
				obj.zimbraQuotaWarnPercent = '';
			}
			if (!obj.zimbraQuotaWarnInterval) {
				obj.zimbraQuotaWarnInterval = '';
			}
			if (!obj.zimbraQuotaWarnMessage) {
				obj.zimbraQuotaWarnMessage = '';
			}
			if (!obj.zimbraDataSourceMinPollingInterval) {
				obj.zimbraDataSourceMinPollingInterval = '';
			}
			if (!obj.zimbraDataSourcePop3PollingInterval) {
				obj.zimbraDataSourcePop3PollingInterval = '';
			}
			if (!obj.zimbraDataSourceImapPollingInterval) {
				obj.zimbraDataSourceImapPollingInterval = '';
			}
			if (!obj.zimbraDataSourceCalendarPollingInterval) {
				obj.zimbraDataSourceCalendarPollingInterval = '';
			}
			if (!obj.zimbraDataSourceRssPollingInterval) {
				obj.zimbraDataSourceRssPollingInterval = '';
			}
			if (!obj.zimbraDataSourceCaldavPollingInterval) {
				obj.zimbraDataSourceCaldavPollingInterval = '';
			}
			if (!obj.zimbraPasswordLocked) {
				obj.zimbraPasswordLocked = false;
			}
			if (!obj.zimbraPasswordMinLength) {
				obj.zimbraPasswordMinLength = '';
			}
			if (!obj.zimbraPasswordMaxLength) {
				obj.zimbraPasswordMaxLength = '';
			}
			if (!obj.zimbraPasswordMinUpperCaseChars) {
				obj.zimbraPasswordMinUpperCaseChars = '';
			}
			if (!obj.zimbraPasswordMinLowerCaseChars) {
				obj.zimbraPasswordMinLowerCaseChars = '';
			}
			if (!obj.zimbraPasswordMinPunctuationChars) {
				obj.zimbraPasswordMinPunctuationChars = '';
			}
			if (!obj.zimbraPasswordMinNumericChars) {
				obj.zimbraPasswordMinNumericChars = '';
			}
			if (!obj.zimbraPasswordMinDigitsOrPuncs) {
				obj.zimbraPasswordMinDigitsOrPuncs = '';
			}
			if (!obj.zimbraPasswordMinAge) {
				obj.zimbraPasswordMinAge = '';
			}
			if (!obj.zimbraPasswordMaxAge) {
				obj.zimbraPasswordMaxAge = '';
			}
			if (!obj.zimbraPasswordEnforceHistory) {
				obj.zimbraPasswordEnforceHistory = '';
			}
			if (!obj.zimbraPasswordBlockCommonEnabled) {
				obj.zimbraPasswordBlockCommonEnabled = false;
			}
			if (!obj.zimbraPasswordLockoutEnabled) {
				obj.zimbraPasswordLockoutEnabled = false;
			}
			if (!obj.zimbraPasswordLockoutMaxFailures) {
				obj.zimbraPasswordLockoutMaxFailures = '';
			}
			if (!obj.zimbraPasswordLockoutDuration) {
				obj.zimbraPasswordLockoutDuration = '';
			}
			if (!obj.zimbraPasswordLockoutFailureLifetime) {
				obj.zimbraPasswordLockoutFailureLifetime = '';
			}
			if (!obj.zimbraAdminAuthTokenLifetime) {
				obj.zimbraAdminAuthTokenLifetime = '';
			}
			if (!obj.zimbraAuthTokenLifetime) {
				obj.zimbraAuthTokenLifetime = '';
			}
			if (!obj.zimbraMailIdleSessionTimeout) {
				obj.zimbraMailIdleSessionTimeout = '';
			}
			if (!obj.zimbraMailMessageLifetime) {
				obj.zimbraMailMessageLifetime = '';
			}
			if (!obj.zimbraMailTrashLifetime) {
				obj.zimbraMailTrashLifetime = '';
			}
			if (!obj.zimbraMailSpamLifetime) {
				obj.zimbraMailSpamLifetime = '';
			}
			if (!obj.zimbraFreebusyExchangeUserOrg) {
				obj.zimbraFreebusyExchangeUserOrg = '';
			}
			setCosData(obj);
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitalValues, setValue, timeItems]);

	const changeValue = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setCosAdvanced]
	);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setCosAdvanced((prev: any) => ({ ...prev, [key]: !cosAdvanced[key] }));
			setIsDirty(true);
		},
		[cosAdvanced, setCosAdvanced, setIsDirty]
	);

	const onSelectionChange = useCallback(
		(key: string, v: string): void => {
			const objItem = timeItems.find((item: any) => item.value === v);
			if (objItem !== cosAdvanced[key]) {
				setCosAdvanced((prev: any) => ({ ...prev, [key]: objItem }));
			}
		},
		[cosAdvanced, timeItems, setCosAdvanced]
	);

	const addProxyAllowedDomain = useCallback((): void => {
		if (newProxyAllowedDomain) {
			const lastId =
				proxyAllowedDomainList.length > 0
					? proxyAllowedDomainList[proxyAllowedDomainList.length - 1].id
					: 0;
			const newId = +lastId + 1;
			const item = {
				id: newId.toString(),
				n: 'zimbraProxyAllowedDomains',
				_content: newProxyAllowedDomain
			};
			setProxyAllowedDomainList([...proxyAllowedDomainList, item]);
			setProxyAllowedDomainAddBtnDisabled(true);
			setNewProxyAllowedDomain('');
		}
	}, [newProxyAllowedDomain, proxyAllowedDomainList, setProxyAllowedDomainList]);

	const deleteProxyAllowedDomain = useCallback((): void => {
		if (selectedProxyAllowedDomain && selectedProxyAllowedDomain.length > 0) {
			const filterItems = proxyAllowedDomainList.filter(
				(item: any, index: any) => !selectedProxyAllowedDomain.includes(index.toString())
			);
			setProxyAllowedDomainList(filterItems);
			setProxyAllowedDomainDeleteBtnDisabled(true);
			setSelectedProxyAllowedDomain([]);
		}
	}, [selectedProxyAllowedDomain, proxyAllowedDomainList, setProxyAllowedDomainList]);

	const onCancel = (): void => {
		setInitalValues(cosData);
		setProxyAllowedDomainList(cosAdvanced.zimbraProxyAllowedDomains);
		setIsDirty(false);
	};

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.advanced', 'Advanced')}
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
							{isDirty && <Button label={t('label.save', 'Save')} color="primary" />}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.general_options', 'General Options')}
					</Text>
					<Row
						width="100%"
						mainAlignment="flex-start"
						padding={{ top: 'large', left: 'large', bottom: 'large' }}
					>
						<Switch
							value={cosAdvanced.zimbraAttachmentsBlocked}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onClick={() => changeSwitchOption('zimbraAttachmentsBlocked')}
							label={t(
								'cos.disable_attachment_viewing_from_web_mail_ui',
								'Disable attachment viewing from web mail UI'
							)}
						/>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.quotas', 'Quotas')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.user_specific_fowarding_addresses',
											'Limit user-specified forwarding addresses field to (chars)'
										)}
										value={cosAdvanced.zimbraMailForwardingAddressMaxLength}
										background="gray5"
										inputName="zimbraMailForwardingAddressMaxLength"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.maximum_number_of_user_specific_forwarding_addresses',
											'Maximum number of user-specified forwarding addresses'
										)}
										value={cosAdvanced.zimbraMailForwardingAddressMaxNumAddrs}
										background="gray5"
										inputName="zimbraMailForwardingAddressMaxNumAddrs"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.account_quota', 'Account quota')}
										value={cosAdvanced.zimbraMailQuota}
										background="gray5"
										inputName="zimbraMailQuota"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.maximum_number_of_contacts_allowed_in_folder',
											'Maximum number of contacts allowed in folder'
										)}
										value={cosAdvanced.zimbraContactMaxNumEntries}
										background="gray5"
										inputName="zimbraContactMaxNumEntries"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.percentage_threshold_for_quota_warning',
											'Percentage threshold for quota warning messages'
										)}
										value={cosAdvanced.zimbraQuotaWarnPercent}
										background="gray5"
										inputName="zimbraQuotaWarnPercent"
										onChange={changeValue}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_duration_of_time_between_quota_warnings',
											'Minimum duration of time between quota warnings'
										)}
										value={cosAdvanced.zimbraQuotaWarnInterval}
										background="gray5"
										inputName="zimbraQuotaWarnInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="26%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraQuotaWarnIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) => onSelectionChange('zimbraQuotaWarnIntervalRangeTime', v)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.quota_warning_message_template',
											'Quota warning message template'
										)}
										value={cosAdvanced.zimbraQuotaWarnMessage}
										background="gray5"
										inputName="zimbraQuotaWarnMessage"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.data_source', 'Data Source')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.shortest_allowed_duration_for_any_polling_interval',
											'Shortest allowed duration for any polling interval'
										)}
										value={cosAdvanced.zimbraDataSourceMinPollingInterval}
										background="gray5"
										inputName="zimbraDataSourceMinPollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourceMinPollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourceMinPollingIntervalRangeTime', v)
										}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.pop3_polling_interval', 'POP3 polling interval')}
										value={cosAdvanced.zimbraDataSourcePop3PollingInterval}
										background="gray5"
										inputName="zimbraDataSourcePop3PollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourcePop3PollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourcePop3PollingIntervalRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.imap_polling_interval', 'IMAP polling interval')}
										value={cosAdvanced.zimbraDataSourceImapPollingInterval}
										background="gray5"
										inputName="zimbraDataSourceImapPollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourceImapPollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourceImapPollingIntervalRangeTime', v)
										}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.calendar_polling_interval', 'Calendar polling interval')}
										value={cosAdvanced.zimbraDataSourceCalendarPollingInterval}
										background="gray5"
										inputName="zimbraDataSourceCalendarPollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourceCalendarPollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourceCalendarPollingIntervalRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.rss_polling_interval', 'RSS polling interval')}
										value={cosAdvanced.zimbraDataSourceRssPollingInterval}
										background="gray5"
										inputName="zimbraDataSourceRssPollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourceRssPollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourceRssPollingIntervalRangeTime', v)
										}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.caldav_polling_interval', 'CalDAV polling interval')}
										value={cosAdvanced.zimbraDataSourceCaldavPollingInterval}
										background="gray5"
										inputName="zimbraDataSourceCaldavPollingInterval"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraDataSourceCaldavPollingIntervalRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraDataSourceCaldavPollingIntervalRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.proxy_allowed_domains', 'Proxy Allowed Domains')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.new_proxy_allowed_domain', 'New Proxy Allowed Domain')}
										value={newProxyAllowedDomain}
										background="gray5"
										onChange={(e: any): any => {
											setNewProxyAllowedDomain(e.target.value);
											setProxyAllowedDomainAddBtnDisabled(false);
										}}
									/>
								</Container>
								<Container crossAlignment="flex-end" width="17%" padding={{ all: 'small' }}>
									<Button
										type="outlined"
										label={t('label.add', 'Add')}
										icon="Plus"
										color="primary"
										height="44px"
										width="128px"
										disabled={proxyAllowedDomainAddBtnDisabled}
										onClick={addProxyAllowedDomain}
									/>
								</Container>
								<Container crossAlignment="flex-end" width="17%" padding={{ all: 'small' }}>
									<Button
										type="outlined"
										label={t('label.delete', 'Delete')}
										icon="Close"
										color="error"
										height="44px"
										width="128px"
										disabled={proxyAllowedDomainDeleteBtnDisabled}
										onClick={deleteProxyAllowedDomain}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ left: 'large', right: 'large' }}
					width="100%"
				>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'large', right: 'large', bottom: 'small' }}
						>
							<Table
								rows={proxyAllowedDomainRows}
								headers={proxyAllowedDomainHeaders}
								showCheckbox
								style={{ overflow: 'auto', height: '100%' }}
								selectedRows={selectedProxyAllowedDomain}
								onSelectionChange={(selected: any): any => {
									setSelectedProxyAllowedDomain(selected);
									if (selected && selected.length > 0) {
										setProxyAllowedDomainDeleteBtnDisabled(false);
									} else {
										setProxyAllowedDomainDeleteBtnDisabled(true);
									}
								}}
							/>
						</Container>
					</Row>
				</Row>
				{proxyAllowedDomainRows?.length === 0 && (
					<Row
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ all: 'large' }}
						width="100%"
					>
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
								<Text weight="light" color="#828282" size="large" overflow="break-word">
									{t('label.this_list_is_empty', 'This list is empty.')}
								</Text>
							</Row>
							<Row
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
								padding={{ top: 'small' }}
								width="53%"
							>
								<Text weight="light" color="#828282" size="large" overflow="break-word">
									<Trans
										i18nKey="label.do_you_need_more_information"
										defaults="Do you need more information?"
									/>
								</Text>
							</Row>
							<Row
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
								padding={{ top: 'small', bottom: 'small' }}
								width="53%"
							>
								<Text weight="light" color="primary">
									{t('label.click_here', 'Click here')}
								</Text>
							</Row>
						</Container>
						<Divider />
					</Row>
				)}
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.password', 'Password')}
					</Text>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'small', left: 'small', right: 'small' }}
					>
						<Container
							orientation="horizontal"
							width="99%"
							crossAlignment="center"
							mainAlignment="space-between"
							background="#D3EBF8"
							padding={{
								all: 'large'
							}}
							style={{ margin: '8px', borderRadius: '2px 2px 0px 0px' }}
						>
							<Row takeAvwidth="fill" mainAlignment="flex-start">
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
								</Padding>
							</Row>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								padding={{
									all: 'small'
								}}
							>
								<Text overflow="break-word">
									{t(
										'cos.password_set_to_use_external_authentication_information_msg',
										'These settings do not affect the passwords set by users in domains that are configured to use external authentication'
									)}
								</Text>
							</Row>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Switch
										value={cosAdvanced.zimbraPasswordLocked}
										label={t(
											'cos.prevent_user_from_changing_password',
											'Prevent user from changing password'
										)}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => changeSwitchOption('zimbraPasswordLocked')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_password_length', 'Minimum password length')}
										value={cosAdvanced.zimbraPasswordMinLength}
										background="gray5"
										inputName="zimbraPasswordMinLength"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.maximum_password_length', 'Maximum password length')}
										value={cosAdvanced.zimbraPasswordMaxLength}
										background="gray5"
										inputName="zimbraPasswordMaxLength"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_upper_case_characters', 'Minimum upper case characters')}
										value={cosAdvanced.zimbraPasswordMinUpperCaseChars}
										background="gray5"
										inputName="zimbraPasswordMinUpperCaseChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_lower_case_characters', 'Minimum lower case characters')}
										value={cosAdvanced.zimbraPasswordMinLowerCaseChars}
										background="gray5"
										inputName="zimbraPasswordMinLowerCaseChars"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
										value={cosAdvanced.zimbraPasswordMinPunctuationChars}
										background="gray5"
										inputName="zimbraPasswordMinPunctuationChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
										value={cosAdvanced.zimbraPasswordMinNumericChars}
										background="gray5"
										inputName="zimbraPasswordMinNumericChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
										value={cosAdvanced.zimbraPasswordMinAge}
										background="gray5"
										inputName="zimbraPasswordMinAge"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
										value={cosAdvanced.zimbraPasswordMaxAge}
										background="gray5"
										inputName="zimbraPasswordMaxAge"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', top: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_numeric_characters_or_punctuation_symbols',
											'Minimum numeric characters or punctuation symbols'
										)}
										value={cosAdvanced.zimbraPasswordMinDigitsOrPuncs}
										background="gray5"
										inputName="zimbraPasswordMinDigitsOrPuncs"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_number_of_unique_password_history',
											'Minimum number of unique passwords history'
										)}
										value={cosAdvanced.zimbraPasswordEnforceHistory}
										background="gray5"
										inputName="zimbraPasswordEnforceHistory"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ bottom: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Switch
										value={cosAdvanced.zimbraPasswordBlockCommonEnabled}
										label={t('cos.reject_common_passwords', 'Reject common passwords')}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => changeSwitchOption('zimbraPasswordBlockCommonEnabled')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.failed_login_policy', 'Failed Login Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Switch
										value={cosAdvanced.zimbraPasswordLockoutEnabled}
										label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClick={() => changeSwitchOption('zimbraPasswordLockoutEnabled')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.number_of_consecutive_failed_login_allowed',
											'Number of consecutive failed logins allowed'
										)}
										value={cosAdvanced.zimbraPasswordLockoutMaxFailures}
										background="gray5"
										inputName="zimbraPasswordLockoutMaxFailures"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
										value={cosAdvanced.zimbraPasswordLockoutDuration}
										background="gray5"
										inputName="zimbraPasswordLockoutDuration"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraPasswordLockoutDurationRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraPasswordLockoutDurationRangeTime', v)
										}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.time_window_failed_logins_must_occur_to_lock_account',
											'Time window in which the failed logins must occur to lock the account:'
										)}
										value={cosAdvanced.zimbraPasswordLockoutFailureLifetime}
										background="gray5"
										inputName="zimbraPasswordLockoutFailureLifetime"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraPasswordLockoutFailureLifetimeRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraPasswordLockoutFailureLifetimeRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.timeout_policy', 'Timeout Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.admin_console_auth_token_lifetime',
											'Admin console auth token lifetime'
										)}
										value={cosAdvanced.zimbraAdminAuthTokenLifetime}
										background="gray5"
										inputName="zimbraAdminAuthTokenLifetime"
										onChange={changeValue}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraAdminAuthTokenLifetimeRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraAdminAuthTokenLifetimeRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.auth_token_lifetime', 'Auth token lifetime')}
										value={cosAdvanced.zimbraAuthTokenLifetime}
										background="gray5"
										inputName="zimbraAuthTokenLifetime"
										onChange={changeValue}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraAuthTokenLifetimeRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) => onSelectionChange('zimbraAuthTokenLifetimeRangeTime', v)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.session_idle_timeout', 'Session idle timeout')}
										value={cosAdvanced.zimbraMailIdleSessionTimeout}
										background="gray5"
										inputName="zimbraMailIdleSessionTimeout"
										onChange={changeValue}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraMailIdleSessionTimeoutRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) =>
											onSelectionChange('zimbraMailIdleSessionTimeoutRangeTime', v)
										}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.email_retention_policy', 'Email Retention Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.email_message_lifetime', 'E-mail message lifetime')}
										value={cosAdvanced.zimbraMailMessageLifetime}
										background="gray5"
										inputName="zimbraMailMessageLifetime"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.trashed_message_lifetime', 'Trashed message lifetime')}
										value={cosAdvanced.zimbraMailTrashLifetime}
										background="gray5"
										inputName="zimbraMailTrashLifetime"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraMailTrashLifetimeRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) => onSelectionChange('zimbraMailTrashLifetimeRangeTime', v)}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.spam_message_lifetime', 'Spam message lifetime')}
										value={cosAdvanced.zimbraMailSpamLifetime}
										background="gray5"
										inputName="zimbraMailSpamLifetime"
										onChange={changeValue}
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={cosAdvanced.zimbraMailSpamLifetimeRangeTime}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={(v: any) => onSelectionChange('zimbraMailSpamLifetimeRangeTime', v)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.free_busy_interop', 'Free/Busy Interop')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.legacy_exchange_dn_attribute',
											'O and OU used in legacyExchangeDN attribute'
										)}
										value={cosAdvanced.zimbraFreebusyExchangeUserOrg}
										background="gray5"
										inputName="zimbraFreebusyExchangeUserOrg"
										onChange={changeValue}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
			</Container>
		</Container>
	);
};

export default CosAdvanced;
