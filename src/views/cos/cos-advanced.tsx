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
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { find } from 'lodash';
import ListRow from '../list/list-row';
import { useCosStore } from '../../store/cos/store';
import { modifyCos } from '../../services/modify-cos-service';
import { useRightsStore, Right, Rights } from '../../store/rights/store';
import { COS } from '../../constants';
import Textarea from '../components/textarea';

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
	const rights: Rights = useRightsStore((state) => state.rights);

	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		if (rightsConfig?.all?.[0]?.setAttrs?.[0]?.all) {
			return false;
		}
		return true;
	}, [rights]);
	const timeItems: any[] = useMemo(
		() => [
			{
				label: t('label.seconds', 'Seconds'),
				value: 's'
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('label.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('label.days', 'Days'),
				value: 'd'
			}
		],
		[t]
	);

	const [cosAdvanced, setCosAdvanced] = useState<any>({
		zimbraMailForwardingAddressMaxLength: '',
		zimbraMailForwardingAddressMaxNumAddrs: '',
		zimbraMailQuota: '',
		zimbraContactMaxNumEntries: '',
		zimbraQuotaWarnPercent: '',
		zimbraQuotaWarnInterval: '',
		zimbraQuotaWarnMessage: '',
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

	const setValue = useCallback(
		(key: string, value: any): void => {
			setCosAdvanced((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosAdvanced]
	);

	const setInitalValues = useCallback(
		(obj: any): void => {
			if (obj) {
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

	const setStateAttrValues = useCallback(
		(obj: any): void => {
			if (obj) {
				setZimbraQuotaWarnIntervalNum(obj?.zimbraQuotaWarnInterval?.slice(0, -1));
				setzimbraQuotaWarnIntervalType(
					obj?.zimbraQuotaWarnInterval?.slice(-1)
						? obj?.zimbraQuotaWarnInterval?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraPasswordLockoutDurationNum(obj?.zimbraPasswordLockoutDuration?.slice(0, -1));
				setZimbraPasswordLockoutDurationType(
					obj?.zimbraPasswordLockoutDuration?.slice(-1)
						? obj?.zimbraPasswordLockoutDuration?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraPasswordLockoutFailureLifetimeNum(
					obj?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)
				);
				setZimbraPasswordLockoutFailureLifetimeType(
					obj?.zimbraPasswordLockoutFailureLifetime?.slice(-1)
						? obj?.zimbraPasswordLockoutFailureLifetime?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraAdminAuthTokenLifetimeNum(obj?.zimbraAdminAuthTokenLifetime?.slice(0, -1));
				setZimbraAdminAuthTokenLifetimeType(
					obj?.zimbraAdminAuthTokenLifetime?.slice(-1)
						? obj?.zimbraAdminAuthTokenLifetime?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraAuthTokenLifetimeNum(obj?.zimbraAuthTokenLifetime?.slice(0, -1));
				setZimbraAuthTokenLifetimeType(
					obj?.zimbraAuthTokenLifetime?.slice(-1)
						? obj?.zimbraAuthTokenLifetime?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraMailIdleSessionTimeoutNum(obj?.zimbraMailIdleSessionTimeout?.slice(0, -1));
				setZimbraMailIdleSessionTimeoutType(
					obj?.zimbraMailIdleSessionTimeout?.slice(-1)
						? obj?.zimbraMailIdleSessionTimeout?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraMailTrashLifetimeNum(obj?.zimbraMailTrashLifetime?.slice(0, -1));
				setZimbraMailTrashLifetimeType(
					obj?.zimbraMailTrashLifetime?.slice(-1)
						? obj?.zimbraMailTrashLifetime?.slice(-1)
						: timeItems[0]?.value
				);
				setZimbraMailSpamLifetimeNum(obj?.zimbraMailSpamLifetime?.slice(0, -1));
				setZimbraMailSpamLifetimeType(
					obj?.zimbraMailSpamLifetime?.slice(-1)
						? obj?.zimbraMailSpamLifetime?.slice(-1)
						: timeItems[0]?.value
				);

				setZimbraMailQuota(
					obj?.zimbraMailQuota
						? (parseInt(obj?.zimbraMailQuota, 10) / (1024 * 1024)).toString()
						: ''
				);
				setZimbraMailMessageLifetimeNum(obj?.zimbraMailMessageLifetime?.slice(0, -1));
				setZimbraMailMessageLifetimeType(
					obj?.zimbraMailMessageLifetime !== '0' && obj?.zimbraMailMessageLifetime?.slice(-1)
						? obj?.zimbraMailMessageLifetime?.slice(-1)
						: timeItems[0]?.value
				);
			}
		},
		[timeItems]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
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
			setStateAttrValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitalValues, setStateAttrValues, setValue, timeItems]);

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

	const onCancel = (): void => {
		setInitalValues(cosData);
		setStateAttrValues(cosData);
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
			cosData.zimbraMailQuota !== cosAdvanced.zimbraMailQuota
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

	const onZimbraQuotaWarnIntervalTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraQuotaWarnInterval: zimbraQuotaWarnIntervalNum
					? `${zimbraQuotaWarnIntervalNum}${v}`
					: ''
			}));
			setzimbraQuotaWarnIntervalType(v);
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

	const onZimbraPasswordLockoutDurationTypeChange = useCallback(
		(v: string) => {
			setCosAdvanced((prev: any) => ({
				...prev,
				zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
					? `${zimbraPasswordLockoutDurationNum}${v}`
					: ''
			}));
			setZimbraPasswordLockoutDurationType(v);
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
			setZimbraPasswordLockoutFailureLifetimeType(v);
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
			setZimbraAdminAuthTokenLifetimeType(v);
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
			setZimbraAuthTokenLifetimeType(v);
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
			setZimbraMailIdleSessionTimeoutType(v);
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
			setZimbraMailMessageLifetimeType(v);
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
			setZimbraMailSpamLifetimeType(v);
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
			setZimbraMailMessageLifetimeType(v);
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
		Object.keys(cosAdvanced).forEach((ele: any) =>
			attributes.push({ n: ele, _content: cosAdvanced[ele] })
		);
		// proxyAllowedDomainList.forEach((item: any) => {
		// 	attributes.push({
		// 		n: 'zimbraProxyAllowedDomains',
		// 		_content: item?._content
		// 	});
		// });
		body.a = attributes;
		modifyCos(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data?.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
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
	};

	return (
		<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
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
				padding={{ top: 'large' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.forwarding', 'Forwarding')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
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
											'cos.limit_user_specified_forwarding_addresses',
											'Limit user-specified forwarding addresses to (char)'
										)}
										value={cosAdvanced.zimbraMailForwardingAddressMaxLength}
										backgroundColor="gray5"
										inputName="zimbraMailForwardingAddressMaxLength"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Input
										label={t(
											'cos.max_user_specific_forwarding_address',
											'Max user-specific forwarding address'
										)}
										value={cosAdvanced.zimbraMailForwardingAddressMaxNumAddrs}
										backgroundColor="gray5"
										inputName="zimbraMailForwardingAddressMaxNumAddrs"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
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
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										label={`${t('cos.account_quota', 'Account quota')} (MB)`}
										value={zimbraMailQuota}
										backgroundColor="gray5"
										inputName="zimbraMailQuota"
										onChange={onZimbraMailQuotaChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Input
										label={t(
											'cos.max_contacts_allowed_in_the_folder',
											'Max contacts allowed in the folder'
										)}
										value={cosAdvanced.zimbraContactMaxNumEntries}
										backgroundColor="gray5"
										inputName="zimbraContactMaxNumEntries"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraQuotaWarnPercent"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t(
											'cos.minimum_duration_of_time_between_quota_warnings',
											'Minimum duration of time between quota warnings'
										)}
										value={zimbraQuotaWarnIntervalNum}
										backgroundColor="gray5"
										inputName="zimbraQuotaWarnInterval"
										onChange={onZimbraQuotaWarnIntervalNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="26%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraQuotaWarnIntervalType === ''
												? timeItems[0]
												: // eslint-disable-next-line max-len
												  timeItems.find((item: any) => item.value === zimbraQuotaWarnIntervalType)
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraQuotaWarnIntervalTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container>
									<Textarea
										label={t(
											'cos.quota_warning_message_template',
											'Quota warning message template'
										)}
										// style={{ height: 'fitContent' }}
										value={cosAdvanced.zimbraQuotaWarnMessage}
										backgroundColor="gray5"
										inputName="zimbraQuotaWarnMessage"
										onChange={changeValue}
										disabled={readonlyCOS}
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
						{t('cos.password', 'Password')}
					</Text>
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
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
							<Row mainAlignment="flex-start">
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
								</Padding>
							</Row>
							<Row
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
					<Row mainAlignment="flex-start" width="100%">
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
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraPasswordMinLength"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.maximum_password_length', 'Maximum password length')}
										value={cosAdvanced.zimbraPasswordMaxLength}
										backgroundColor="gray5"
										inputName="zimbraPasswordMaxLength"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_upper_case_characters', 'Minimum upper case characters')}
										value={cosAdvanced.zimbraPasswordMinUpperCaseChars}
										backgroundColor="gray5"
										inputName="zimbraPasswordMinUpperCaseChars"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Input
										label={t('cos.minimum_lower_case_characters', 'Minimum lower case characters')}
										value={cosAdvanced.zimbraPasswordMinLowerCaseChars}
										backgroundColor="gray5"
										inputName="zimbraPasswordMinLowerCaseChars"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraPasswordMinPunctuationChars"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
										value={cosAdvanced.zimbraPasswordMinNumericChars}
										backgroundColor="gray5"
										inputName="zimbraPasswordMinNumericChars"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
										value={cosAdvanced.zimbraPasswordMinAge}
										backgroundColor="gray5"
										inputName="zimbraPasswordMinAge"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Input
										label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
										value={cosAdvanced.zimbraPasswordMaxAge}
										backgroundColor="gray5"
										inputName="zimbraPasswordMaxAge"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraPasswordMinDigitsOrPuncs"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Input
										label={t(
											'cos.minimum_number_of_unique_password_history',
											'Minimum number of unique passwords history'
										)}
										value={cosAdvanced.zimbraPasswordEnforceHistory}
										backgroundColor="gray5"
										inputName="zimbraPasswordEnforceHistory"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										iconColor="primary"
										disabled={readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraPasswordLockoutMaxFailures"
										onChange={changeValue}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraPasswordLockoutDuration"
										onChange={onZimbraPasswordLockoutDurationNumChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraPasswordLockoutDurationType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraPasswordLockoutDurationType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraPasswordLockoutDurationTypeChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
									/>
								</Container>
								<Container width="72%" padding={{ left: 'small', right: 'small' }}>
									<Input
										label={t(
											'cos.time_window_failed_logins_must_occur_to_lock_account',
											'Time window in which the failed logins must occur to lock the account:'
										)}
										value={zimbraPasswordLockoutFailureLifetimeNum}
										backgroundColor="gray5"
										inputName="zimbraPasswordLockoutFailureLifetime"
										onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
									/>
								</Container>
								<Container width="28%" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraPasswordLockoutFailureLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraPasswordLockoutFailureLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
										disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraAdminAuthTokenLifetime"
										onChange={onZimbraAdminAuthTokenLifetimeNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraAdminAuthTokenLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraAdminAuthTokenLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraAdminAuthTokenLifetimeTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraAuthTokenLifetime"
										onChange={onZimbraAuthTokenLifetimeNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraAuthTokenLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraAuthTokenLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraAuthTokenLifetimeTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraMailIdleSessionTimeout"
										onChange={onZimbraMailIdleSessionTimeoutNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraMailIdleSessionTimeoutType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailIdleSessionTimeoutType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraMailIdleSessionTimeoutTypeChange}
										disabled={readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraMailMessageLifetime"
										onChange={onZimbraMailMessageLifetimeNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraMailMessageLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailMessageLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraMailMessageLifetimeTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraMailTrashLifetime"
										onChange={onZimbraMailTrashLifetimeNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraMailTrashLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailTrashLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraMailTrashLifetimeTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraMailSpamLifetime"
										onChange={onZimbraMailSpamLifetimeNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container width="17%" padding={{ left: 'small', right: 'small' }}>
									<Select
										items={timeItems}
										backgroundColor="gray5"
										label={t('cos.time_range', 'Time Range')}
										selection={
											zimbraMailSpamLifetimeType === ''
												? timeItems[-1]
												: timeItems.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === zimbraMailSpamLifetimeType
												  )
										}
										showCheckbox={false}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onZimbraMailSpamLifetimeTypeChange}
										disabled={readonlyCOS}
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
						{t(
							'cos.free_busy_interop',
							'Free/Busy Interop (O = OutOfOffice), (OU = OutOfOffice, AvailableForUrgentIssues)'
						)}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
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
										backgroundColor="gray5"
										inputName="zimbraFreebusyExchangeUserOrg"
										onChange={changeValue}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Row>
			</Container>
		</Container>
	);
};

export default CosAdvanced;
