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
import _ from 'lodash';
import ListRow from '../list/list-row';
import { useCosStore } from '../../store/cos/store';
import logo from '../../assets/gardian.svg';
import { modifyCos } from '../../services/modify-cos-service';

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
		zimbraAttachmentsBlocked: 'FALSE',
		zimbraMailForwardingAddressMaxLength: '',
		zimbraMailForwardingAddressMaxNumAddrs: '',
		zimbraMailQuota: '',
		zimbraContactMaxNumEntries: '',
		zimbraQuotaWarnPercent: '',
		zimbraQuotaWarnInterval: '',
		zimbraQuotaWarnMessage: '',
		zimbraDataSourceMinPollingInterval: '',
		zimbraDataSourcePop3PollingInterval: '',
		zimbraDataSourceImapPollingInterval: '',
		zimbraDataSourceCalendarPollingInterval: '',
		zimbraDataSourceRssPollingInterval: '',
		zimbraDataSourceCaldavPollingInterval: '',
		zimbraPasswordLocked: 'FALSE',
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
		zimbraPasswordBlockCommonEnabled: 'FALSE',
		zimbraPasswordLockoutEnabled: 'FALSE',
		zimbraPasswordLockoutMaxFailures: '',
		zimbraPasswordLockoutDuration: '',
		zimbraPasswordLockoutFailureLifetime: '',
		zimbraAdminAuthTokenLifetime: '',
		zimbraAuthTokenLifetime: '',
		zimbraMailIdleSessionTimeout: '',
		zimbraMailMessageLifetime: '',
		zimbraMailTrashLifetime: '',
		zimbraMailSpamLifetime: '',
		zimbraFreebusyExchangeUserOrg: ''
	});
	const [zimbraMailQuota, setZimbraMailQuota] = useState('');
	const [zimbraMailMessageLifetimeNum, setZimbraMailMessageLifetimeNum] = useState(
		cosAdvanced?.zimbraMailMessageLifetime?.slice(0, -1)
	);
	const [zimbraMailMessageLifetimeType, setZimbraMailMessageLifetimeType] = useState(
		cosAdvanced?.zimbraMailMessageLifetime?.slice(-1) || ''
	);
	const [zimbraQuotaWarnIntervalNum, setZimbraQuotaWarnIntervalNum] = useState(
		cosAdvanced?.zimbraQuotaWarnInterval?.slice(0, -1)
	);
	const [zimbraQuotaWarnIntervalType, setzimbraQuotaWarnIntervalType] = useState(
		cosAdvanced?.zimbraQuotaWarnInterval?.slice(-1) || ''
	);
	const [zimbraDataSourceMinPollingIntervalNum, setZimbraDataSourceMinPollingIntervalNum] =
		useState(cosAdvanced?.zimbraDataSourceMinPollingInterval?.slice(0, -1));
	const [zimbraDataSourceMinPollingIntervalType, setZimbraDataSourceMinPollingIntervalType] =
		useState(cosAdvanced?.zimbraDataSourceMinPollingInterval?.slice(-1) || '');

	const [zimbraDataSourcePop3PollingIntervalNum, setZimbraDataSourcePop3PollingIntervalNum] =
		useState(cosAdvanced?.zimbraDataSourcePop3PollingInterval?.slice(0, -1));
	const [zimbraDataSourcePop3PollingIntervalType, setZimbraDataSourcePop3PollingIntervalType] =
		useState(cosAdvanced?.zimbraDataSourcePop3PollingInterval?.slice(-1) || '');

	const [zimbraDataSourceImapPollingIntervalNum, setZimbraDataSourceImapPollingIntervalNum] =
		useState(cosAdvanced?.zimbraDataSourceImapPollingInterval?.slice(0, -1));
	const [zimbraDataSourceImapPollingIntervalType, setZimbraDataSourceImapPollingIntervalType] =
		useState(cosAdvanced?.zimbraDataSourceImapPollingInterval?.slice(-1) || '');
	const [
		zimbraDataSourceCalendarPollingIntervalNum,
		setZimbraDataSourceCalendarPollingIntervalNum
	] = useState(cosAdvanced?.zimbraDataSourceCalendarPollingInterval?.slice(0, -1));
	const [
		zimbraDataSourceCalendarPollingIntervalType,
		setZimbraDataSourceCalendarPollingIntervalType
	] = useState(cosAdvanced?.zimbraDataSourceCalendarPollingInterval?.slice(-1) || '');
	const [zimbraDataSourceRssPollingIntervalNum, setZimbraDataSourceRssPollingIntervalNum] =
		useState(cosAdvanced?.zimbraDataSourceRssPollingInterval?.slice(0, -1));
	const [zimbraDataSourceRssPollingIntervalType, setZimbraDataSourceRssPollingIntervalType] =
		useState(cosAdvanced?.zimbraDataSourceRssPollingInterval?.slice(-1) || '');
	const [zimbraDataSourceCaldavPollingIntervalNum, setZimbraDataSourceCaldavPollingIntervalNum] =
		useState(cosAdvanced?.zimbraDataSourceCaldavPollingInterval?.slice(0, -1));
	const [zimbraDataSourceCaldavPollingIntervalType, setZimbraDataSourceCaldavPollingIntervalType] =
		useState(cosAdvanced?.zimbraDataSourceCaldavPollingInterval?.slice(-1) || '');
	const [zimbraPasswordLockoutDurationNum, setZimbraPasswordLockoutDurationNum] = useState(
		cosAdvanced?.zimbraPasswordLockoutDuration?.slice(0, -1)
	);
	const [zimbraPasswordLockoutDurationType, setZimbraPasswordLockoutDurationType] = useState(
		cosAdvanced?.zimbraPasswordLockoutDuration?.slice(-1) || ''
	);
	const [zimbraPasswordLockoutFailureLifetimeNum, setZimbraPasswordLockoutFailureLifetimeNum] =
		useState(cosAdvanced?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1));
	const [zimbraPasswordLockoutFailureLifetimeType, setZimbraPasswordLockoutFailureLifetimeType] =
		useState(cosAdvanced?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || '');
	const [zimbraAdminAuthTokenLifetimeNum, setZimbraAdminAuthTokenLifetimeNum] = useState(
		cosAdvanced?.zimbraAdminAuthTokenLifetime?.slice(0, -1)
	);
	const [zimbraAdminAuthTokenLifetimeType, setZimbraAdminAuthTokenLifetimeType] = useState(
		cosAdvanced?.zimbraAdminAuthTokenLifetime?.slice(-1) || ''
	);
	const [zimbraAuthTokenLifetimeNum, setZimbraAuthTokenLifetimeNum] = useState(
		cosAdvanced?.zimbraAuthTokenLifetime?.slice(0, -1)
	);
	const [zimbraAuthTokenLifetimeType, setZimbraAuthTokenLifetimeType] = useState(
		cosAdvanced?.zimbraAuthTokenLifetime?.slice(-1) || ''
	);
	const [zimbraMailIdleSessionTimeoutNum, setZimbraMailIdleSessionTimeoutNum] = useState(
		cosAdvanced?.zimbraMailIdleSessionTimeout?.slice(0, -1)
	);
	const [zimbraMailIdleSessionTimeoutType, setZimbraMailIdleSessionTimeoutType] = useState(
		cosAdvanced?.zimbraMailIdleSessionTimeout?.slice(-1) || ''
	);
	const [zimbraMailTrashLifetimeNum, setZimbraMailTrashLifetimeNum] = useState(
		cosAdvanced?.zimbraMailTrashLifetime?.slice(0, -1)
	);
	const [zimbraMailTrashLifetimeType, setZimbraMailTrashLifetimeType] = useState(
		cosAdvanced?.zimbraMailTrashLifetime?.slice(-1) || ''
	);
	const [zimbraMailSpamLifetimeNum, setZimbraMailSpamLifetimeNum] = useState(
		cosAdvanced?.zimbraMailSpamLifetime?.slice(0, -1)
	);
	const [zimbraMailSpamLifetimeType, setZimbraMailSpamLifetimeType] = useState(
		cosAdvanced?.zimbraMailSpamLifetime?.slice(-1) || ''
	);

	const [newProxyAllowedDomain, setNewProxyAllowedDomain] = useState<string>('');
	const [selectedProxyAllowedDomain, setSelectedProxyAllowedDomain] = useState<any>([]);
	const [proxyAllowedDomainAddBtnDisabled, setProxyAllowedDomainAddBtnDisabled] = useState(true);
	const [proxyAllowedDomainDeleteBtnDisabled, setProxyAllowedDomainDeleteBtnDisabled] =
		useState(true);
	const [searchProxyAllowedDomain, setSearchProxyAllowedDomain]: any = useState('');
	const [proxyAllowedDomainRows, setProxyAllowedDomainRows] = useState<any[]>([]);
	const [proxyAllowedDomainList, setProxyAllowedDomainList] = useState<any[]>([]);
	const [zimbraProxyAllowedDomains, setZimbraProxyAllowedDomains] = useState<any[]>([]);

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
				setValue(
					'zimbraAttachmentsBlocked',
					obj?.zimbraAttachmentsBlocked ? obj?.zimbraAttachmentsBlocked : 'FALSE'
				);
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
				setValue('zimbraMailQuota', obj?.zimbraMailQuota ? obj?.zimbraMailQuota : '');
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
					obj?.zimbraQuotaWarnInterval ? obj?.zimbraQuotaWarnInterval : ''
				);
				setValue(
					'zimbraQuotaWarnMessage',
					obj?.zimbraQuotaWarnMessage ? obj?.zimbraQuotaWarnMessage : ''
				);
				setValue(
					'zimbraDataSourceMinPollingInterval',
					obj?.zimbraDataSourceMinPollingInterval ? obj?.zimbraDataSourceMinPollingInterval : ''
				);
				setValue(
					'zimbraDataSourcePop3PollingInterval',
					obj?.zimbraDataSourcePop3PollingInterval ? obj?.zimbraDataSourcePop3PollingInterval : ''
				);
				setValue(
					'zimbraDataSourceImapPollingInterval',
					obj?.zimbraDataSourceImapPollingInterval ? obj?.zimbraDataSourceImapPollingInterval : ''
				);
				setValue(
					'zimbraDataSourceCalendarPollingInterval',
					obj?.zimbraDataSourceCalendarPollingInterval
						? obj?.zimbraDataSourceCalendarPollingInterval
						: ''
				);
				setValue(
					'zimbraDataSourceRssPollingInterval',
					obj?.zimbraDataSourceRssPollingInterval ? obj?.zimbraDataSourceRssPollingInterval : ''
				);
				setValue(
					'zimbraDataSourceCaldavPollingInterval',
					obj?.zimbraDataSourceCaldavPollingInterval
						? obj?.zimbraDataSourceCaldavPollingInterval
						: ''
				);
				setValue(
					'zimbraPasswordLocked',
					obj?.zimbraPasswordLocked ? obj?.zimbraPasswordLocked : 'FALSE'
				);
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
					obj?.zimbraPasswordBlockCommonEnabled ? obj?.zimbraPasswordBlockCommonEnabled : 'FALSE'
				);
				setValue(
					'zimbraPasswordLockoutEnabled',
					obj?.zimbraPasswordLockoutEnabled ? obj?.zimbraPasswordLockoutEnabled : 'FALSE'
				);
				setValue(
					'zimbraPasswordLockoutMaxFailures',
					obj?.zimbraPasswordLockoutMaxFailures ? obj?.zimbraPasswordLockoutMaxFailures : ''
				);
				setValue(
					'zimbraPasswordLockoutDuration',
					obj?.zimbraPasswordLockoutDuration ? obj?.zimbraPasswordLockoutDuration : ''
				);

				setValue(
					'zimbraPasswordLockoutFailureLifetime',
					obj?.zimbraPasswordLockoutFailureLifetime ? obj?.zimbraPasswordLockoutFailureLifetime : ''
				);
				setValue(
					'zimbraAdminAuthTokenLifetime',
					obj?.zimbraAdminAuthTokenLifetime ? obj?.zimbraAdminAuthTokenLifetime : ''
				);
				setValue(
					'zimbraAuthTokenLifetime',
					obj?.zimbraAuthTokenLifetime ? obj?.zimbraAuthTokenLifetime : ''
				);
				setValue(
					'zimbraMailIdleSessionTimeout',
					obj?.zimbraMailIdleSessionTimeout ? obj?.zimbraMailIdleSessionTimeout : ''
				);
				setValue(
					'zimbraMailMessageLifetime',
					obj?.zimbraMailMessageLifetime ? obj?.zimbraMailMessageLifetime : ''
				);
				setValue(
					'zimbraMailTrashLifetime',
					obj?.zimbraMailTrashLifetime ? obj?.zimbraMailTrashLifetime : ''
				);
				setValue(
					'zimbraMailSpamLifetime',
					obj?.zimbraMailSpamLifetime ? obj?.zimbraMailSpamLifetime : ''
				);
				setValue(
					'zimbraFreebusyExchangeUserOrg',
					obj?.zimbraFreebusyExchangeUserOrg ? obj?.zimbraFreebusyExchangeUserOrg : ''
				);
			}
		},
		[setValue]
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
			setZimbraProxyAllowedDomains(proxyAllowedDomains);
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (!obj.zimbraAttachmentsBlocked) {
				obj.zimbraAttachmentsBlocked = 'FALSE';
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
				obj.zimbraPasswordLocked = 'FALSE';
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
				obj.zimbraPasswordBlockCommonEnabled = 'FALSE';
			}
			if (!obj.zimbraPasswordLockoutEnabled) {
				obj.zimbraPasswordLockoutEnabled = 'FALSE';
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
			setZimbraQuotaWarnIntervalNum(obj?.zimbraQuotaWarnInterval?.slice(0, -1));
			setzimbraQuotaWarnIntervalType(obj?.zimbraQuotaWarnInterval?.slice(-1));
			setZimbraDataSourceMinPollingIntervalNum(
				obj?.zimbraDataSourceMinPollingInterval?.slice(0, -1)
			);
			setZimbraDataSourceMinPollingIntervalType(obj?.zimbraDataSourceMinPollingInterval?.slice(-1));
			setZimbraDataSourcePop3PollingIntervalNum(
				obj?.zimbraDataSourcePop3PollingInterval?.slice(0, -1)
			);
			setZimbraDataSourcePop3PollingIntervalType(
				obj?.zimbraDataSourcePop3PollingInterval?.slice(-1)
			);
			setZimbraDataSourceImapPollingIntervalNum(
				obj?.zimbraDataSourceImapPollingInterval?.slice(0, -1)
			);
			setZimbraDataSourceImapPollingIntervalType(
				obj?.zimbraDataSourceImapPollingInterval?.slice(-1)
			);
			setZimbraDataSourceCalendarPollingIntervalNum(
				obj?.zimbraDataSourceCalendarPollingInterval?.slice(0, -1)
			);
			setZimbraDataSourceCalendarPollingIntervalType(
				obj?.zimbraDataSourceCalendarPollingInterval?.slice(-1)
			);
			setZimbraDataSourceRssPollingIntervalNum(
				obj?.zimbraDataSourceRssPollingInterval?.slice(0, -1)
			);
			setZimbraDataSourceRssPollingIntervalType(obj?.zimbraDataSourceRssPollingInterval?.slice(-1));
			setZimbraDataSourceCaldavPollingIntervalNum(
				obj?.zimbraDataSourceCaldavPollingInterval?.slice(0, -1)
			);
			setZimbraDataSourceCaldavPollingIntervalType(
				obj?.zimbraDataSourceCaldavPollingInterval?.slice(-1)
			);
			setZimbraPasswordLockoutDurationNum(obj?.zimbraPasswordLockoutDuration?.slice(0, -1));
			setZimbraPasswordLockoutDurationType(obj?.zimbraPasswordLockoutDuration?.slice(-1));
			setZimbraPasswordLockoutFailureLifetimeNum(
				obj?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)
			);
			setZimbraPasswordLockoutFailureLifetimeType(
				obj?.zimbraPasswordLockoutFailureLifetime?.slice(-1)
			);
			setZimbraAdminAuthTokenLifetimeNum(obj?.zimbraAdminAuthTokenLifetime?.slice(0, -1));
			setZimbraAdminAuthTokenLifetimeType(obj?.zimbraAdminAuthTokenLifetime?.slice(-1));
			setZimbraAuthTokenLifetimeNum(obj?.zimbraAuthTokenLifetime?.slice(0, -1));
			setZimbraAuthTokenLifetimeType(obj?.zimbraAuthTokenLifetime?.slice(-1));
			setZimbraMailIdleSessionTimeoutNum(obj?.zimbraMailIdleSessionTimeout?.slice(0, -1));
			setZimbraMailIdleSessionTimeoutType(obj?.zimbraMailIdleSessionTimeout?.slice(-1));
			setZimbraMailTrashLifetimeNum(obj?.zimbraMailTrashLifetime?.slice(0, -1));
			setZimbraMailTrashLifetimeType(obj?.zimbraMailTrashLifetime?.slice(-1));
			setZimbraMailSpamLifetimeNum(obj?.zimbraMailSpamLifetime?.slice(0, -1));
			setZimbraMailSpamLifetimeType(obj?.zimbraMailSpamLifetime?.slice(-1));
			setZimbraMailQuota(
				obj?.zimbraMailQuota ? (parseInt(obj?.zimbraMailQuota, 10) / (1024 * 1024)).toString() : ''
			);
			setZimbraMailMessageLifetimeNum(obj?.zimbraMailMessageLifetime?.slice(0, -1));
			setZimbraMailMessageLifetimeType(obj?.zimbraMailMessageLifetime?.slice(-1));
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
			setCosAdvanced((prev: any) => ({
				...prev,
				[key]: cosAdvanced[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
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
		setZimbraQuotaWarnIntervalNum(cosData?.zimbraQuotaWarnInterval?.slice(0, -1));
		setzimbraQuotaWarnIntervalType(cosData?.zimbraQuotaWarnInterval?.slice(-1));
		setZimbraDataSourceMinPollingIntervalNum(
			cosData?.zimbraDataSourceMinPollingInterval?.slice(0, -1)
		);
		setZimbraDataSourceMinPollingIntervalType(
			cosData?.zimbraDataSourceMinPollingInterval?.slice(-1)
		);
		setZimbraDataSourcePop3PollingIntervalNum(
			cosData?.zimbraDataSourcePop3PollingInterval?.slice(0, -1)
		);
		setZimbraDataSourcePop3PollingIntervalType(
			cosData?.zimbraDataSourcePop3PollingInterval?.slice(-1)
		);
		setZimbraDataSourceImapPollingIntervalNum(
			cosData?.zimbraDataSourceImapPollingInterval?.slice(0, -1)
		);
		setZimbraDataSourceImapPollingIntervalType(
			cosData?.zimbraDataSourceImapPollingInterval?.slice(-1)
		);
		setZimbraDataSourceCalendarPollingIntervalNum(
			cosData?.zimbraDataSourceCalendarPollingInterval?.slice(0, -1)
		);
		setZimbraDataSourceCalendarPollingIntervalType(
			cosData?.zimbraDataSourceCalendarPollingInterval?.slice(-1)
		);
		setZimbraDataSourceRssPollingIntervalNum(
			cosData?.zimbraDataSourceRssPollingInterval?.slice(0, -1)
		);
		setZimbraDataSourceRssPollingIntervalType(
			cosData?.zimbraDataSourceRssPollingInterval?.slice(-1)
		);
		setZimbraDataSourceCaldavPollingIntervalNum(
			cosData?.zimbraDataSourceCaldavPollingInterval?.slice(0, -1)
		);
		setZimbraDataSourceCaldavPollingIntervalType(
			cosData?.zimbraDataSourceCaldavPollingInterval?.slice(-1)
		);
		setZimbraPasswordLockoutDurationNum(cosData?.zimbraPasswordLockoutDuration?.slice(0, -1));
		setZimbraPasswordLockoutDurationType(cosData?.zimbraPasswordLockoutDuration?.slice(-1));
		setZimbraPasswordLockoutFailureLifetimeNum(
			cosData?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)
		);
		setZimbraPasswordLockoutFailureLifetimeType(
			cosData?.zimbraPasswordLockoutFailureLifetime?.slice(-1)
		);
		setZimbraAdminAuthTokenLifetimeNum(cosData?.zimbraAdminAuthTokenLifetime?.slice(0, -1));
		setZimbraAdminAuthTokenLifetimeType(cosData?.zimbraAdminAuthTokenLifetime?.slice(-1));
		setZimbraAuthTokenLifetimeNum(cosData?.zimbraAuthTokenLifetime?.slice(0, -1));
		setZimbraAuthTokenLifetimeType(cosData?.zimbraAuthTokenLifetime?.slice(-1));
		setZimbraMailIdleSessionTimeoutNum(cosData?.zimbraMailIdleSessionTimeout?.slice(0, -1));
		setZimbraMailIdleSessionTimeoutType(cosData?.zimbraMailIdleSessionTimeout?.slice(-1));
		setZimbraMailTrashLifetimeNum(cosData?.zimbraMailTrashLifetime?.slice(0, -1));
		setZimbraMailTrashLifetimeType(cosData?.zimbraMailTrashLifetime?.slice(-1));
		setZimbraMailSpamLifetimeNum(cosData?.zimbraMailSpamLifetime?.slice(0, -1));
		setZimbraMailSpamLifetimeType(cosData?.zimbraMailSpamLifetime?.slice(-1));
		setProxyAllowedDomainList(cosAdvanced.zimbraProxyAllowedDomains || []);
		setZimbraMailQuota(
			cosAdvanced?.zimbraMailQuota
				? (parseInt(cosAdvanced?.zimbraMailQuota, 10) / (1024 * 1024)).toString()
				: ''
		);
		setZimbraMailMessageLifetimeNum(cosAdvanced?.zimbraMailMessageLifetime?.slice(0, -1));
		setZimbraMailMessageLifetimeType(cosAdvanced?.zimbraMailMessageLifetime?.slice(-1));
		setIsDirty(false);
	};

	useEffect(() => {
		if (
			cosData.zimbraMailForwardingAddressMaxLength !== undefined &&
			cosData.zimbraMailForwardingAddressMaxLength !==
				cosAdvanced.zimbraMailForwardingAddressMaxLength
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraMailForwardingAddressMaxLength,
		cosData.zimbraMailForwardingAddressMaxLength
	]);

	useEffect(() => {
		if (
			cosData.zimbraMailForwardingAddressMaxNumAddrs !== undefined &&
			cosData.zimbraMailForwardingAddressMaxNumAddrs !==
				cosAdvanced.zimbraMailForwardingAddressMaxNumAddrs
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraMailForwardingAddressMaxNumAddrs,
		cosData.zimbraMailForwardingAddressMaxNumAddrs
	]);

	useEffect(() => {
		if (
			cosData.zimbraMailQuota !== undefined &&
			cosData.zimbraMailQuota !==
				(parseInt(cosAdvanced.zimbraMailQuota, 10) * 1024 * 1024).toString()
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraMailQuota, cosData.zimbraMailQuota]);

	useEffect(() => {
		if (
			cosData.zimbraContactMaxNumEntries !== undefined &&
			cosData.zimbraContactMaxNumEntries !== cosAdvanced.zimbraContactMaxNumEntries
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraContactMaxNumEntries, cosData.zimbraContactMaxNumEntries]);

	useEffect(() => {
		if (
			cosData.zimbraQuotaWarnPercent !== undefined &&
			cosData.zimbraQuotaWarnPercent !== cosAdvanced.zimbraQuotaWarnPercent
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraQuotaWarnPercent, cosData.zimbraQuotaWarnPercent]);

	useEffect(() => {
		if (
			cosData.zimbraQuotaWarnInterval !== undefined &&
			cosData.zimbraQuotaWarnInterval !== cosAdvanced.zimbraQuotaWarnInterval
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraQuotaWarnInterval, cosData.zimbraQuotaWarnInterval]);

	useEffect(() => {
		if (
			cosData.zimbraQuotaWarnMessage !== undefined &&
			cosData.zimbraQuotaWarnMessage !== cosAdvanced.zimbraQuotaWarnMessage
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraQuotaWarnMessage, cosData.zimbraQuotaWarnMessage]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourceMinPollingInterval !== undefined &&
			cosData.zimbraDataSourceMinPollingInterval !== cosAdvanced.zimbraDataSourceMinPollingInterval
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraDataSourceMinPollingInterval, cosData.zimbraDataSourceMinPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourcePop3PollingInterval !== undefined &&
			cosData.zimbraDataSourcePop3PollingInterval !==
				cosAdvanced.zimbraDataSourcePop3PollingInterval
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraDataSourcePop3PollingInterval,
		cosData.zimbraDataSourcePop3PollingInterval
	]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourceImapPollingInterval !== undefined &&
			cosData.zimbraDataSourceImapPollingInterval !==
				cosAdvanced.zimbraDataSourceImapPollingInterval
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraDataSourceImapPollingInterval,
		cosData.zimbraDataSourceImapPollingInterval
	]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourceCalendarPollingInterval !== undefined &&
			cosData.zimbraDataSourceCalendarPollingInterval !==
				cosAdvanced.zimbraDataSourceCalendarPollingInterval
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraDataSourceCalendarPollingInterval,
		cosData.zimbraDataSourceCalendarPollingInterval
	]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourceRssPollingInterval !== undefined &&
			cosData.zimbraDataSourceRssPollingInterval !== cosAdvanced.zimbraDataSourceRssPollingInterval
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraDataSourceRssPollingInterval, cosData.zimbraDataSourceRssPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraDataSourceCaldavPollingInterval !== undefined &&
			cosData.zimbraDataSourceCaldavPollingInterval !==
				cosAdvanced.zimbraDataSourceCaldavPollingInterval
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraDataSourceCaldavPollingInterval,
		cosData.zimbraDataSourceCaldavPollingInterval
	]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinLength !== undefined &&
			cosData.zimbraPasswordMinLength !== cosAdvanced.zimbraPasswordMinLength
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinLength, cosData.zimbraPasswordMinLength]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMaxLength !== undefined &&
			cosData.zimbraPasswordMaxLength !== cosAdvanced.zimbraPasswordMaxLength
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMaxLength, cosData.zimbraPasswordMaxLength]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinUpperCaseChars !== undefined &&
			cosData.zimbraPasswordMinUpperCaseChars !== cosAdvanced.zimbraPasswordMinUpperCaseChars
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinUpperCaseChars, cosData.zimbraPasswordMinUpperCaseChars]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinLowerCaseChars !== undefined &&
			cosData.zimbraPasswordMinLowerCaseChars !== cosAdvanced.zimbraPasswordMinLowerCaseChars
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinLowerCaseChars, cosData.zimbraPasswordMinLowerCaseChars]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinPunctuationChars !== undefined &&
			cosData.zimbraPasswordMinPunctuationChars !== cosAdvanced.zimbraPasswordMinPunctuationChars
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinPunctuationChars, cosData.zimbraPasswordMinPunctuationChars]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinNumericChars !== undefined &&
			cosData.zimbraPasswordMinNumericChars !== cosAdvanced.zimbraPasswordMinNumericChars
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinNumericChars, cosData.zimbraPasswordMinNumericChars]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinDigitsOrPuncs !== undefined &&
			cosData.zimbraPasswordMinDigitsOrPuncs !== cosAdvanced.zimbraPasswordMinDigitsOrPuncs
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinDigitsOrPuncs, cosData.zimbraPasswordMinDigitsOrPuncs]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMinAge !== undefined &&
			cosData.zimbraPasswordMinAge !== cosAdvanced.zimbraPasswordMinAge
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMinAge, cosData.zimbraPasswordMinAge]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordMaxAge !== undefined &&
			cosData.zimbraPasswordMaxAge !== cosAdvanced.zimbraPasswordMaxAge
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordMaxAge, cosData.zimbraPasswordMaxAge]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordEnforceHistory !== undefined &&
			cosData.zimbraPasswordEnforceHistory !== cosAdvanced.zimbraPasswordEnforceHistory
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordEnforceHistory, cosData.zimbraPasswordEnforceHistory]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordLockoutMaxFailures !== undefined &&
			cosData.zimbraPasswordLockoutMaxFailures !== cosAdvanced.zimbraPasswordLockoutMaxFailures
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordLockoutMaxFailures, cosData.zimbraPasswordLockoutMaxFailures]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordLockoutDuration !== undefined &&
			cosData.zimbraPasswordLockoutDuration !== cosAdvanced.zimbraPasswordLockoutDuration
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraPasswordLockoutDuration, cosData.zimbraPasswordLockoutDuration]);

	useEffect(() => {
		if (
			cosData.zimbraPasswordLockoutFailureLifetime !== undefined &&
			cosData.zimbraPasswordLockoutFailureLifetime !==
				cosAdvanced.zimbraPasswordLockoutFailureLifetime
		) {
			setIsDirty(true);
		}
	}, [
		cosAdvanced.zimbraPasswordLockoutFailureLifetime,
		cosData.zimbraPasswordLockoutFailureLifetime
	]);

	useEffect(() => {
		if (
			cosData.zimbraAdminAuthTokenLifetime !== undefined &&
			cosData.zimbraAdminAuthTokenLifetime !== cosAdvanced.zimbraAdminAuthTokenLifetime
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraAdminAuthTokenLifetime, cosData.zimbraAdminAuthTokenLifetime]);

	useEffect(() => {
		if (
			cosData.zimbraAuthTokenLifetime !== undefined &&
			cosData.zimbraAuthTokenLifetime !== cosAdvanced.zimbraAuthTokenLifetime
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraAuthTokenLifetime, cosData.zimbraAuthTokenLifetime]);

	useEffect(() => {
		if (
			cosData.zimbraMailIdleSessionTimeout !== undefined &&
			cosData.zimbraMailIdleSessionTimeout !== cosAdvanced.zimbraMailIdleSessionTimeout
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraMailIdleSessionTimeout, cosData.zimbraMailIdleSessionTimeout]);

	useEffect(() => {
		if (
			cosData.zimbraMailMessageLifetime !== undefined &&
			cosData.zimbraMailMessageLifetime !== cosAdvanced.zimbraMailMessageLifetime
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraMailMessageLifetime, cosData.zimbraMailMessageLifetime]);

	useEffect(() => {
		if (
			cosData.zimbraMailTrashLifetime !== undefined &&
			cosData.zimbraMailTrashLifetime !== cosAdvanced.zimbraMailTrashLifetime
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraMailTrashLifetime, cosData.zimbraMailTrashLifetime]);

	useEffect(() => {
		if (
			cosData.zimbraMailSpamLifetime !== undefined &&
			cosData.zimbraMailSpamLifetime !== cosAdvanced.zimbraMailSpamLifetime
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraMailSpamLifetime, cosData.zimbraMailSpamLifetime]);

	useEffect(() => {
		if (
			cosData.zimbraFreebusyExchangeUserOrg !== undefined &&
			cosData.zimbraFreebusyExchangeUserOrg !== cosAdvanced.zimbraFreebusyExchangeUserOrg
		) {
			setIsDirty(true);
		}
	}, [cosAdvanced.zimbraFreebusyExchangeUserOrg, cosData.zimbraFreebusyExchangeUserOrg]);

	useEffect(() => {
		if (!_.isEqual(zimbraProxyAllowedDomains, proxyAllowedDomainList)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [zimbraProxyAllowedDomains, proxyAllowedDomainList]);

	const onZimbraQuotaWarnIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraQuotaWarnInterval: zimbraQuotaWarnIntervalNum
					? `${zimbraQuotaWarnIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraQuotaWarnIntervalNum, setCosAdvanced]
	);
	const onZimbraQuotaWarnIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraQuotaWarnInterval: e.target.value
					? `${e.target.value}${zimbraQuotaWarnIntervalType}`
					: ''
			}));
			setZimbraQuotaWarnIntervalNum(e.target.value);
		},
		[zimbraQuotaWarnIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourceMinPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceMinPollingInterval: zimbraDataSourceMinPollingIntervalNum
					? `${zimbraDataSourceMinPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourceMinPollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourceMinPollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceMinPollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourceMinPollingIntervalType}`
					: ''
			}));
			setZimbraDataSourceMinPollingIntervalNum(e.target.value);
		},
		[zimbraDataSourceMinPollingIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourcePop3PollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourcePop3PollingInterval: zimbraDataSourcePop3PollingIntervalNum
					? `${zimbraDataSourcePop3PollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourcePop3PollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourcePop3PollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourcePop3PollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourcePop3PollingIntervalType}`
					: ''
			}));
			setZimbraDataSourcePop3PollingIntervalNum(e.target.value);
		},
		[zimbraDataSourcePop3PollingIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourceImapPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceImapPollingInterval: zimbraDataSourceImapPollingIntervalNum
					? `${zimbraDataSourceImapPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourceImapPollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourceImapPollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceImapPollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourceImapPollingIntervalType}`
					: ''
			}));
			setZimbraDataSourceImapPollingIntervalNum(e.target.value);
		},
		[zimbraDataSourceImapPollingIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourceCalendarPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceCalendarPollingInterval: zimbraDataSourceCalendarPollingIntervalNum
					? `${zimbraDataSourceCalendarPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourceCalendarPollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourceCalendarPollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceCalendarPollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourceCalendarPollingIntervalType}`
					: ''
			}));
			setZimbraDataSourceCalendarPollingIntervalNum(e.target.value);
		},
		[zimbraDataSourceCalendarPollingIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourceRssPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceRssPollingInterval: zimbraDataSourceRssPollingIntervalNum
					? `${zimbraDataSourceRssPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourceRssPollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourceRssPollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceRssPollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourceRssPollingIntervalType}`
					: ''
			}));
			setZimbraDataSourceRssPollingIntervalNum(e.target.value);
		},
		[zimbraDataSourceRssPollingIntervalType, setCosAdvanced]
	);

	const onZimbraDataSourceCaldavPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceCaldavPollingInterval: zimbraDataSourceCaldavPollingIntervalNum
					? `${zimbraDataSourceCaldavPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraDataSourceCaldavPollingIntervalNum, setCosAdvanced]
	);
	const onZimbraDataSourceCaldavPollingIntervalNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraDataSourceCaldavPollingInterval: e.target.value
					? `${e.target.value}${zimbraDataSourceCaldavPollingIntervalType}`
					: ''
			}));
			setZimbraDataSourceCaldavPollingIntervalNum(e.target.value);
		},
		[zimbraDataSourceCaldavPollingIntervalType, setCosAdvanced]
	);

	const onZimbraPasswordLockoutDurationTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
					? `${zimbraPasswordLockoutDurationNum}${v}`
					: ''
			}));
		},
		[zimbraPasswordLockoutDurationNum, setCosAdvanced]
	);
	const onZimbraPasswordLockoutDurationNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraPasswordLockoutDuration: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutDurationType}`
					: ''
			}));
			setZimbraPasswordLockoutDurationNum(e.target.value);
		},
		[zimbraPasswordLockoutDurationType, setCosAdvanced]
	);

	const onZimbraPasswordLockoutFailureLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraPasswordLockoutFailureLifetime: zimbraPasswordLockoutFailureLifetimeNum
					? `${zimbraPasswordLockoutFailureLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraPasswordLockoutFailureLifetimeNum, setCosAdvanced]
	);
	const onZimbraPasswordLockoutFailureLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraPasswordLockoutFailureLifetime: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutFailureLifetimeType}`
					: ''
			}));
			setZimbraPasswordLockoutFailureLifetimeNum(e.target.value);
		},
		[zimbraPasswordLockoutFailureLifetimeType, setCosAdvanced]
	);

	const onZimbraAdminAuthTokenLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraAdminAuthTokenLifetime: zimbraAdminAuthTokenLifetimeNum
					? `${zimbraAdminAuthTokenLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraAdminAuthTokenLifetimeNum, setCosAdvanced]
	);
	const onZimbraAdminAuthTokenLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraAdminAuthTokenLifetime: e.target.value
					? `${e.target.value}${zimbraAdminAuthTokenLifetimeType}`
					: ''
			}));
			setZimbraAdminAuthTokenLifetimeNum(e.target.value);
		},
		[zimbraAdminAuthTokenLifetimeType, setCosAdvanced]
	);

	const onZimbraAuthTokenLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraAuthTokenLifetime: zimbraAuthTokenLifetimeNum
					? `${zimbraAuthTokenLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraAuthTokenLifetimeNum, setCosAdvanced]
	);
	const onZimbraAuthTokenLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraAuthTokenLifetime: e.target.value
					? `${e.target.value}${zimbraAdminAuthTokenLifetimeType}`
					: ''
			}));
			setZimbraAuthTokenLifetimeNum(e.target.value);
		},
		[zimbraAdminAuthTokenLifetimeType, setCosAdvanced]
	);

	const onZimbraMailIdleSessionTimeoutTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailIdleSessionTimeout: zimbraMailIdleSessionTimeoutNum
					? `${zimbraMailIdleSessionTimeoutNum}${v}`
					: ''
			}));
		},
		[zimbraMailIdleSessionTimeoutNum, setCosAdvanced]
	);
	const onZimbraMailIdleSessionTimeoutNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailIdleSessionTimeout: e.target.value
					? `${e.target.value}${zimbraMailIdleSessionTimeoutType}`
					: ''
			}));
			setZimbraMailIdleSessionTimeoutNum(e.target.value);
		},
		[zimbraMailIdleSessionTimeoutType, setCosAdvanced]
	);

	const onZimbraMailTrashLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailTrashLifetime: zimbraMailTrashLifetimeNum
					? `${zimbraMailTrashLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraMailTrashLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailTrashLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailTrashLifetime: e.target.value
					? `${e.target.value}${zimbraMailTrashLifetimeType}`
					: ''
			}));
			setZimbraMailTrashLifetimeNum(e.target.value);
		},
		[zimbraMailTrashLifetimeType, setCosAdvanced]
	);

	const onZimbraMailSpamLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailSpamLifetime: zimbraMailSpamLifetimeNum ? `${zimbraMailSpamLifetimeNum}${v}` : ''
			}));
		},
		[zimbraMailSpamLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailSpamLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailSpamLifetime: e.target.value
					? `${e.target.value}${zimbraMailSpamLifetimeType}`
					: ''
			}));
			setZimbraMailSpamLifetimeNum(e.target.value);
		},
		[zimbraMailSpamLifetimeType, setCosAdvanced]
	);

	const onZimbraMailQuotaChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailQuota: e.target.value
					? (parseInt(e.target.value, 10) * 1024 * 1024)?.toString()
					: ''
			}));
			setZimbraMailQuota(e.target.value);
		},
		[setCosAdvanced]
	);

	const onZimbraMailMessageLifetimeTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailMessageLifetime: zimbraMailMessageLifetimeNum
					? `${zimbraMailMessageLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraMailMessageLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailMessageLifetimeNumChange = useCallback(
		(e) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraMailMessageLifetime: e.target.value
					? `${e.target.value}${zimbraMailMessageLifetimeType}`
					: ''
			}));
			setZimbraMailMessageLifetimeNum(e.target.value);
		},
		[zimbraMailMessageLifetimeType, setCosAdvanced]
	);

	const onSave = (): void => {
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		const attributes: any[] = [];
		const id = {
			_content: cosData.zimbraId
		};
		body.id = id;
		Object.keys(cosAdvanced).map((ele: any) =>
			attributes.push({ n: ele, _content: cosAdvanced[ele] })
		);
		proxyAllowedDomainList.forEach((item: any) => {
			attributes.push({
				n: 'zimbraProxyAllowedDomains',
				_content: item?._content
			});
		});
		body.a = attributes;
		modifyCos(body)
			.then((response) => response.json())
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data?.Body?.ModifyCosResponse?.cos[0];
				if (cos) {
					setCos(cos);
				} else {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: data?.Body?.Fault?.Reason?.Text,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsDirty(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
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
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<Switch
							value={cosAdvanced.zimbraAttachmentsBlocked === 'TRUE'}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
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
								<Container padding={{ left: 'small' }}>
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										label={t('cos.account_quota', 'Account quota')}
										value={zimbraMailQuota}
										background="gray5"
										inputName="zimbraMailQuota"
										onChange={onZimbraMailQuotaChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="100%" padding={{ right: 'small' }}>
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
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t(
											'cos.minimum_duration_of_time_between_quota_warnings',
											'Minimum duration of time between quota warnings'
										)}
										value={zimbraQuotaWarnIntervalNum}
										background="gray5"
										inputName="zimbraQuotaWarnInterval"
										onChange={onZimbraQuotaWarnIntervalNumChange}
									/>
								</Container>
								<Container width="26%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraQuotaWarnIntervalType === ''
												? timeItems[-1]
												: // eslint-disable-next-line max-len
												  timeItems.find((item: any) => item.value === zimbraQuotaWarnIntervalType)
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onChange={onZimbraQuotaWarnIntervalTypeChange}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container>
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="72%" padding={{ right: 'small' }}>
									<Input
										label={t(
											'cos.shortest_allowed_duration_for_any_polling_interval',
											'Shortest allowed duration for any polling interval'
										)}
										value={zimbraDataSourceMinPollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourceMinPollingInterval"
										onChange={onZimbraDataSourceMinPollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourceMinPollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraDataSourceMinPollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourceMinPollingIntervalTypeChange}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.pop3_polling_interval', 'POP3 polling interval')}
										value={zimbraDataSourcePop3PollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourcePop3PollingInterval"
										onChange={onZimbraDataSourcePop3PollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourcePop3PollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraDataSourcePop3PollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourcePop3PollingIntervalTypeChange}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="72%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.imap_polling_interval', 'IMAP polling interval')}
										value={zimbraDataSourceImapPollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourceImapPollingInterval"
										onChange={onZimbraDataSourceImapPollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourceImapPollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraDataSourceImapPollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourceImapPollingIntervalTypeChange}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.calendar_polling_interval', 'Calendar polling interval')}
										value={zimbraDataSourceCalendarPollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourceCalendarPollingInterval"
										onChange={onZimbraDataSourceCalendarPollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourceCalendarPollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === zimbraDataSourceCalendarPollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourceCalendarPollingIntervalTypeChange}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container width="72%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.rss_polling_interval', 'RSS polling interval')}
										value={zimbraDataSourceRssPollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourceRssPollingInterval"
										onChange={onZimbraDataSourceRssPollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourceRssPollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraDataSourceRssPollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourceRssPollingIntervalTypeChange}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.caldav_polling_interval', 'CalDAV polling interval')}
										value={zimbraDataSourceCaldavPollingIntervalNum}
										background="gray5"
										inputName="zimbraDataSourceCaldavPollingInterval"
										onChange={onZimbraDataSourceCaldavPollingIntervalNumChange}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraDataSourceCaldavPollingIntervalType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraDataSourceCaldavPollingIntervalType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraDataSourceCaldavPollingIntervalTypeChange}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
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
								<Container
									crossAlignment="flex-end"
									width="17%"
									padding={{ left: 'small', right: 'small' }}
								>
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
								<Container crossAlignment="flex-end" width="17%" padding={{ left: 'small' }}>
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
							padding={{ top: 'large', bottom: 'large' }}
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
						{proxyAllowedDomainRows?.length > 0 && <Divider />}
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
						padding={{ top: 'large' }}
					>
						<Container
							orientation="horizontal"
							width="99%"
							crossAlignment="center"
							mainAlignment="space-between"
							background="#D3EBF8"
							padding={{
								top: 'large',
								bottom: 'large'
							}}
							style={{ borderRadius: '2px 2px 0px 0px' }}
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
									top: 'small',
									bottom: 'small'
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Switch
										value={cosAdvanced.zimbraPasswordLocked === 'TRUE'}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										label={t('cos.minimum_password_length', 'Minimum password length')}
										value={cosAdvanced.zimbraPasswordMinLength}
										background="gray5"
										inputName="zimbraPasswordMinLength"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.maximum_password_length', 'Maximum password length')}
										value={cosAdvanced.zimbraPasswordMaxLength}
										background="gray5"
										inputName="zimbraPasswordMaxLength"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_upper_case_characters', 'Minimum upper case characters')}
										value={cosAdvanced.zimbraPasswordMinUpperCaseChars}
										background="gray5"
										inputName="zimbraPasswordMinUpperCaseChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
										value={cosAdvanced.zimbraPasswordMinPunctuationChars}
										background="gray5"
										inputName="zimbraPasswordMinPunctuationChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
										value={cosAdvanced.zimbraPasswordMinNumericChars}
										background="gray5"
										inputName="zimbraPasswordMinNumericChars"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
										value={cosAdvanced.zimbraPasswordMinAge}
										background="gray5"
										inputName="zimbraPasswordMinAge"
										onChange={changeValue}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
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
								<Container padding={{ left: 'small' }}>
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
							padding={{ bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ top: 'large' }}>
									<Switch
										value={cosAdvanced.zimbraPasswordBlockCommonEnabled === 'TRUE'}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Switch
										value={cosAdvanced.zimbraPasswordLockoutEnabled === 'TRUE'}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Input
										label={t(
											'cos.number_of_consecutive_failed_login_allowed',
											'Number of consecutive failed logins allowed'
										)}
										value={cosAdvanced.zimbraPasswordLockoutMaxFailures}
										background="gray5"
										inputName="zimbraPasswordLockoutMaxFailures"
										onChange={changeValue}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE'}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container width="72%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
										value={zimbraPasswordLockoutDurationNum}
										background="gray5"
										inputName="zimbraPasswordLockoutDuration"
										onChange={onZimbraPasswordLockoutDurationNumChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE'}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraPasswordLockoutDurationType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraPasswordLockoutDurationType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraPasswordLockoutDurationTypeChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE'}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t(
											'cos.time_window_failed_logins_must_occur_to_lock_account',
											'Time window in which the failed logins must occur to lock the account:'
										)}
										value={zimbraPasswordLockoutFailureLifetimeNum}
										background="gray5"
										inputName="zimbraPasswordLockoutFailureLifetime"
										onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE'}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraPasswordLockoutFailureLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraPasswordLockoutFailureLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE'}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Input
										label={t(
											'cos.admin_console_auth_token_lifetime',
											'Admin console auth token lifetime'
										)}
										value={zimbraAdminAuthTokenLifetimeNum}
										background="gray5"
										inputName="zimbraAdminAuthTokenLifetime"
										onChange={onZimbraAdminAuthTokenLifetimeNumChange}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraAdminAuthTokenLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraAdminAuthTokenLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraAdminAuthTokenLifetimeTypeChange}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Input
										label={t('cos.auth_token_lifetime', 'Auth token lifetime')}
										value={zimbraAuthTokenLifetimeNum}
										background="gray5"
										inputName="zimbraAuthTokenLifetime"
										onChange={onZimbraAuthTokenLifetimeNumChange}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraAuthTokenLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraAuthTokenLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraAuthTokenLifetimeTypeChange}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Input
										label={t('cos.session_idle_timeout', 'Session idle timeout')}
										value={zimbraMailIdleSessionTimeoutNum}
										background="gray5"
										inputName="zimbraMailIdleSessionTimeout"
										onChange={onZimbraMailIdleSessionTimeoutNumChange}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraMailIdleSessionTimeoutType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailIdleSessionTimeoutType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraMailIdleSessionTimeoutTypeChange}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="100%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.email_message_lifetime', 'E-mail message lifetime')}
										value={zimbraMailMessageLifetimeNum}
										background="gray5"
										inputName="zimbraMailMessageLifetime"
										onChange={onZimbraMailMessageLifetimeNumChange}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraMailMessageLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailMessageLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraMailMessageLifetimeTypeChange}
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
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container width="100%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.trashed_message_lifetime', 'Trashed message lifetime')}
										value={zimbraMailTrashLifetimeNum}
										background="gray5"
										inputName="zimbraMailTrashLifetime"
										onChange={onZimbraMailTrashLifetimeNumChange}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraMailTrashLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailTrashLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraMailTrashLifetimeTypeChange}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container width="100%" padding={{ right: 'small' }}>
									<Input
										label={t('cos.spam_message_lifetime', 'Spam message lifetime')}
										value={zimbraMailSpamLifetimeNum}
										background="gray5"
										inputName="zimbraMailSpamLifetime"
										onChange={onZimbraMailSpamLifetimeNumChange}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										selection={
											zimbraMailSpamLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailSpamLifetimeType
												  )
										}
										showCheckbox={false}
										onChange={onZimbraMailSpamLifetimeTypeChange}
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
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
