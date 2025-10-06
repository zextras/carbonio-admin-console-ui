/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	ChangeEvent,
	Dispatch,
	FC,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react';

import { Container, SingleSelectionOnChange, useSnackbar } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import COSEmailRetentionPolicy from './advanced/cos-email-retention-policy';
import COSFailedLoginPolicy from './advanced/cos-failed-login-policy';
import COSForwarding from './advanced/cos-forwarding';
import COSGeneralOptions from './advanced/cos-general-options';
import COSPassword from './advanced/cos-password';
import COSQuotas from './advanced/cos-quotas';
import COSTimeoutPolicy from './advanced/cos-timeout-policy';
import { Attribute, TimeItems } from '../../../types';
import {
	BACKUP_ENABLED,
	BACKUP_SELF_UNDELETE_ALLOWED,
	COS,
	ZIMBRA_ADMIN_URN
} from '../../constants';
import { flushCache } from '../../services/flush-cache-service';
import { getCoreAttributes } from '../../services/get-core-attributes';
import { getFileQuotaById } from '../../services/get-file-quota';
import { modifyCos, ModifyCosBody } from '../../services/modify-cos-service';
import { resetFileQuotaLimitById } from '../../services/reset-file-quota-limit';
import { setCoreAttributes } from '../../services/set-core-attributes';
import { setFileQuotaLimitById } from '../../services/set-file-quota-limit';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import { useCosStore } from '../../store/cos/store';
import { Right, Rights, useRightsStore } from '../../store/rights/store';
import { AccountType } from '../domain/manange/accounts/account-types/account-types';
import { PageLayout } from '../page-layout';
import { BytesToGB, GbToBytes, isValidDecimalNumber } from '../utility/utils';

type AdvancedBackupAttributes = {
	[BACKUP_ENABLED]: boolean | undefined;
	[BACKUP_SELF_UNDELETE_ALLOWED]: boolean | undefined;
};

type AdvancedBackupAttributesKeys = keyof AdvancedBackupAttributes;

function isBackupAttribute(key: string): key is AdvancedBackupAttributesKeys {
	return key === BACKUP_ENABLED || key === BACKUP_SELF_UNDELETE_ALLOWED;
}

function saveBackupAttributes(
	cosAdvancedBackupAttributes: AdvancedBackupAttributes,
	cosName: string | undefined
): void {
	const updateBackupAttributes = Object.keys(cosAdvancedBackupAttributes).reduce((acc, key) => {
		if (isBackupAttribute(key) && cosAdvancedBackupAttributes[key] !== undefined) {
			return {
				...acc,
				[key]: {
					value: cosAdvancedBackupAttributes[key],
					objectName: cosName,
					configType: COS
				}
			};
		}
		return acc;
	}, {});
	if (Object.keys(updateBackupAttributes).length > 0) {
		setCoreAttributes(updateBackupAttributes);
	}
}
function saveCosAdvanced(cosAdvanced: AccountType, zimbraId: string): Promise<any> {
	const attributes: Attribute[] = Object.keys(cosAdvanced).map((ele) => ({
		n: ele,
		_content: cosAdvanced[ele as keyof AccountType]?.toString() ?? ''
	}));

	const body: ModifyCosBody = {
		_jsns: ZIMBRA_ADMIN_URN,
		id: {
			_content: zimbraId
		},
		a: attributes
	};

	return modifyCos(body).then((data) => ({
		cosId: body.id._content,
		cos: data?.cos[0]
	}));
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const CosAdvanced: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData] = useState<AccountType>({});
	const setCos = useCosStore((state) => state.setCos);
	const rights: Rights = useRightsStore((state) => state.rights);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);
	const timeItems = useMemo<TimeItems>(
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

	const labels = {
		snackbar: {
			successMessage: t('label.change_save_success_msg', 'The change has been saved successfully'),
			errorMessage: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
		},
		advanced: t('cos.advanced', 'Advanced'),
		saveButton: t('label.save', 'Save'),
		cancelButton: t('label.cancel', 'Cancel')
	};

	const [cosAdvancedBackupAttributes, setCosAdvancedBackupAttributes] =
		useState<AdvancedBackupAttributes>({
			[BACKUP_ENABLED]: undefined,
			[BACKUP_SELF_UNDELETE_ALLOWED]: undefined
		});

	const [cosAdvanced, setCosAdvanced] = useState<AccountType>({
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
	const [initFileQuotaLimitGBValue, setInitFileQuotaLimitGBValue] = useState(undefined);
	const [fileQuotaLimitGBValue, setFileQuotaLimitGBValue] = useState<string | undefined>(undefined);
	const [showFileQuotaLimitMsg, setShowFileQuotaLimitMsg] = useState<boolean>(false);
	const [showAccountQuotaLimitMsg, setShowAccountQuotaLimitMsg] = useState<boolean>(false);
	const [accountQuotaGBValue, setAccountQuotaGBValue] = useState('');

	const setValue = useCallback<
		(key: keyof AccountType, value: AccountType[keyof AccountType]) => void
	>(
		(key, value): void => {
			setCosAdvanced((prev: AccountType) => ({ ...prev, [key]: value }));
		},
		[setCosAdvanced]
	);

	const setCosAdvancedAttributeValues = useCallback(
		(entries: Array<[keyof AdvancedBackupAttributes, boolean | undefined]>): void => {
			setCosAdvancedBackupAttributes((prev) => ({
				...prev,
				...(Object.fromEntries(entries) as Partial<AdvancedBackupAttributes>)
			}));
		},
		[setCosAdvancedBackupAttributes]
	);

	const setInitalValues = useCallback(
		// eslint-disable-next-line sonarjs/cognitive-complexity
		(obj: AccountType): void => {
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
		(obj: AccountType): void => {
			const setTimeValues = (
				value: string | undefined,
				setValueFn: Dispatch<SetStateAction<string | undefined>>,
				setValueTypeFn: Dispatch<SetStateAction<string>>,
				timeItem: TimeItems
			): void => {
				setValueFn(value?.slice(0, -1));
				setValueTypeFn(value?.slice(-1) ? value?.slice(-1) : timeItem[0]?.value);
			};

			if (obj) {
				setTimeValues(
					obj?.zimbraQuotaWarnInterval,
					setZimbraQuotaWarnIntervalNum,
					setzimbraQuotaWarnIntervalType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraPasswordLockoutDuration,
					setZimbraPasswordLockoutDurationNum,
					setZimbraPasswordLockoutDurationType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraPasswordLockoutFailureLifetime,
					setZimbraPasswordLockoutFailureLifetimeNum,
					setZimbraPasswordLockoutFailureLifetimeType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraAdminAuthTokenLifetime,
					setZimbraAdminAuthTokenLifetimeNum,
					setZimbraAdminAuthTokenLifetimeType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraAuthTokenLifetime,
					setZimbraAuthTokenLifetimeNum,
					setZimbraAuthTokenLifetimeType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraMailIdleSessionTimeout,
					setZimbraMailIdleSessionTimeoutNum,
					setZimbraMailIdleSessionTimeoutType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraMailTrashLifetime,
					setZimbraMailTrashLifetimeNum,
					setZimbraMailTrashLifetimeType,
					timeItems
				);
				setTimeValues(
					obj?.zimbraMailSpamLifetime,
					setZimbraMailSpamLifetimeNum,
					setZimbraMailSpamLifetimeType,
					timeItems
				);

				setAccountQuotaGBValue(
					obj?.zimbraMailQuota ? BytesToGB(obj?.zimbraMailQuota).toFixed(2) : ''
				);

				setTimeValues(
					obj?.zimbraMailMessageLifetime,
					setZimbraMailMessageLifetimeNum,
					setZimbraMailMessageLifetimeType,
					timeItems
				);
			}
		},
		[timeItems]
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: AccountType = {};
			cosInformation.forEach((item: Attribute) => {
				obj[item?.n as keyof AccountType] = item._content;
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

	const getFileQuota = useCallback((cosId: string): void => {
		getFileQuotaById(cosId, COS).then((res: { limit: string }) => {
			if (res?.limit) {
				setInitFileQuotaLimitGBValue(BytesToGB(res.limit).toFixed(2));
				setFileQuotaLimitGBValue(BytesToGB(res.limit).toFixed(2));
			}
		});
	}, []);

	useEffect(() => {
		if (cosData?.zimbraId && isAdvanced) {
			getFileQuota(cosData.zimbraId);
		}
	}, [cosData, getFileQuota, isAdvanced]);

	const changeValue = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setCosAdvanced]
	);

	const changeSwitchOption = useCallback(
		(key: keyof AccountType): void => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				[key]: cosAdvanced[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
			setIsDirty(true);
		},
		[cosAdvanced, setCosAdvanced, setIsDirty]
	);

	const onCancel = (): void => {
		setInitalValues(cosData);
		setStateAttrValues(cosData);
		setFileQuotaLimitGBValue(initFileQuotaLimitGBValue);
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

	useEffect(() => {
		if (
			fileQuotaLimitGBValue !== undefined &&
			initFileQuotaLimitGBValue !== fileQuotaLimitGBValue
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [initFileQuotaLimitGBValue, fileQuotaLimitGBValue]);

	const onZimbraQuotaWarnIntervalTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraQuotaWarnInterval: zimbraQuotaWarnIntervalNum
						? `${zimbraQuotaWarnIntervalNum}${v}`
						: ''
				}));
				setzimbraQuotaWarnIntervalType(v);
			}
		},
		[zimbraQuotaWarnIntervalNum, setCosAdvanced]
	);
	const onZimbraQuotaWarnIntervalNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraQuotaWarnInterval: e.target.value
					? `${e.target.value}${zimbraQuotaWarnIntervalType}`
					: ''
			}));
			setZimbraQuotaWarnIntervalNum(e.target.value);
		},
		[zimbraQuotaWarnIntervalType, setCosAdvanced]
	);

	const onZimbraPasswordLockoutDurationTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
						? `${zimbraPasswordLockoutDurationNum}${v}`
						: ''
				}));
				setZimbraPasswordLockoutDurationType(v);
			}
		},
		[zimbraPasswordLockoutDurationNum, setCosAdvanced]
	);
	const onZimbraPasswordLockoutDurationNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraPasswordLockoutDuration: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutDurationType}`
					: ''
			}));
			setZimbraPasswordLockoutDurationNum(e.target.value);
		},
		[zimbraPasswordLockoutDurationType, setCosAdvanced]
	);

	const onZimbraPasswordLockoutFailureLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraPasswordLockoutFailureLifetime: zimbraPasswordLockoutFailureLifetimeNum
						? `${zimbraPasswordLockoutFailureLifetimeNum}${v}`
						: ''
				}));
				setZimbraPasswordLockoutFailureLifetimeType(v);
			}
		},
		[zimbraPasswordLockoutFailureLifetimeNum, setCosAdvanced]
	);
	const onZimbraPasswordLockoutFailureLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraPasswordLockoutFailureLifetime: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutFailureLifetimeType}`
					: ''
			}));
			setZimbraPasswordLockoutFailureLifetimeNum(e.target.value);
		},
		[zimbraPasswordLockoutFailureLifetimeType, setCosAdvanced]
	);

	const onZimbraAdminAuthTokenLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraAdminAuthTokenLifetime: zimbraAdminAuthTokenLifetimeNum
						? `${zimbraAdminAuthTokenLifetimeNum}${v}`
						: ''
				}));
				setZimbraAdminAuthTokenLifetimeType(v);
			}
		},
		[zimbraAdminAuthTokenLifetimeNum, setCosAdvanced]
	);
	const onZimbraAdminAuthTokenLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraAdminAuthTokenLifetime: e.target.value
					? `${e.target.value}${zimbraAdminAuthTokenLifetimeType}`
					: ''
			}));
			setZimbraAdminAuthTokenLifetimeNum(e.target.value);
		},
		[zimbraAdminAuthTokenLifetimeType, setCosAdvanced]
	);

	const onZimbraAuthTokenLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraAuthTokenLifetime: zimbraAuthTokenLifetimeNum
						? `${zimbraAuthTokenLifetimeNum}${v}`
						: ''
				}));
				setZimbraAuthTokenLifetimeType(v);
			}
		},
		[zimbraAuthTokenLifetimeNum, setCosAdvanced]
	);
	const onZimbraAuthTokenLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraAuthTokenLifetime: e.target.value
					? `${e.target.value}${zimbraAdminAuthTokenLifetimeType}`
					: ''
			}));
			setZimbraAuthTokenLifetimeNum(e.target.value);
		},
		[zimbraAdminAuthTokenLifetimeType, setCosAdvanced]
	);

	const onZimbraMailIdleSessionTimeoutTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraMailIdleSessionTimeout: zimbraMailIdleSessionTimeoutNum
						? `${zimbraMailIdleSessionTimeoutNum}${v}`
						: ''
				}));
				setZimbraMailIdleSessionTimeoutType(v);
			}
		},
		[zimbraMailIdleSessionTimeoutNum, setCosAdvanced]
	);
	const onZimbraMailIdleSessionTimeoutNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraMailIdleSessionTimeout: e.target.value
					? `${e.target.value}${zimbraMailIdleSessionTimeoutType}`
					: ''
			}));
			setZimbraMailIdleSessionTimeoutNum(e.target.value);
		},
		[zimbraMailIdleSessionTimeoutType, setCosAdvanced]
	);

	const onZimbraMailTrashLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraMailTrashLifetime: zimbraMailTrashLifetimeNum
						? `${zimbraMailTrashLifetimeNum}${v}`
						: ''
				}));
				setZimbraMailMessageLifetimeType(v);
			}
		},
		[zimbraMailTrashLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailTrashLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraMailTrashLifetime: e.target.value
					? `${e.target.value}${zimbraMailTrashLifetimeType}`
					: ''
			}));
			setZimbraMailTrashLifetimeNum(e.target.value);
		},
		[zimbraMailTrashLifetimeType, setCosAdvanced]
	);

	const onZimbraMailSpamLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraMailSpamLifetime: zimbraMailSpamLifetimeNum
						? `${zimbraMailSpamLifetimeNum}${v}`
						: ''
				}));
				setZimbraMailSpamLifetimeType(v);
			}
		},
		[zimbraMailSpamLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailSpamLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraMailSpamLifetime: e.target.value
					? `${e.target.value}${zimbraMailSpamLifetimeType}`
					: ''
			}));
			setZimbraMailSpamLifetimeNum(e.target.value);
		},
		[zimbraMailSpamLifetimeType, setCosAdvanced]
	);

	const onFileQuotaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (!isValidDecimalNumber(e.target.value)) return;
		const decimalPoints = e.target.value?.split('.')[1];
		if (!!decimalPoints && decimalPoints?.length > 3) {
			setShowFileQuotaLimitMsg(true);
			return;
		}
		setShowFileQuotaLimitMsg(false);
		setFileQuotaLimitGBValue(e.target.value);
	}, []);

	const onZimbraMailQuotaChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (!isValidDecimalNumber(e.target.value)) return;
			const decimalPoints = e.target.value?.split('.')[1];
			if (!!decimalPoints && decimalPoints?.length > 3) {
				setShowAccountQuotaLimitMsg(true);
				return;
			}
			setShowAccountQuotaLimitMsg(false);
			setAccountQuotaGBValue(e.target.value);
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraMailQuota: e.target.value ? Math.round(GbToBytes(e.target.value)) : ''
			}));
		},
		[setCosAdvanced]
	);

	const onZimbraMailMessageLifetimeTypeChange = useCallback<SingleSelectionOnChange>(
		(v) => {
			if (v) {
				setCosAdvanced((prev: AccountType) => ({
					...prev,
					zimbraMailMessageLifetime: zimbraMailMessageLifetimeNum
						? `${zimbraMailMessageLifetimeNum}${v}`
						: ''
				}));
				setZimbraMailMessageLifetimeType(v);
			}
		},
		[zimbraMailMessageLifetimeNum, setCosAdvanced]
	);
	const onZimbraMailMessageLifetimeNumChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCosAdvanced((prev: AccountType) => ({
				...prev,
				zimbraMailMessageLifetime: e.target.value
					? `${e.target.value}${zimbraMailMessageLifetimeType}`
					: ''
			}));
			setZimbraMailMessageLifetimeNum(e.target.value);
		},
		[zimbraMailMessageLifetimeType, setCosAdvanced]
	);

	const cosName = useCosStore((state) => state.cos?.name);
	const setFileQuotaLimit = useCallback((cosId: string, limit: string) => {
		setFileQuotaLimitById(cosId, limit, COS).then(() => {
			setShowFileQuotaLimitMsg(false);
		});
	}, []);

	const resetFileQuotaLimit = useCallback((cosId: string) => {
		resetFileQuotaLimitById(cosId, COS).then(() => {
			setShowFileQuotaLimitMsg(false);
		});
	}, []);

	const onSave = (): void => {
		const { zimbraId = '' } = cosData;

		saveBackupAttributes(cosAdvancedBackupAttributes, cosName);
		saveCosAdvanced(cosAdvanced, zimbraId)
			.then(({ cosId, cos }) => {
				flushCache('cos', 'id', cosId);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: labels.snackbar.successMessage,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (cos) {
					setCos(cos);
				}
				if (isAdvanced && initFileQuotaLimitGBValue !== fileQuotaLimitGBValue) {
					if (fileQuotaLimitGBValue) {
						setFileQuotaLimit(zimbraId, Math.round(GbToBytes(fileQuotaLimitGBValue)).toString());
					} else {
						resetFileQuotaLimit(zimbraId);
					}
				}
				setIsDirty(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message ? error?.message : labels.snackbar.errorMessage,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	useEffect(() => {
		if (!isAdvanced) return;
		const body = [
			{
				configType: COS,
				configName: [cosName],
				attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED]
			}
		];
		getCoreAttributes(body)
			.then((data) => {
				if (data?.attributes) {
					setCosAdvancedAttributeValues([
						[
							BACKUP_SELF_UNDELETE_ALLOWED,
							!!data?.attributes?.[BACKUP_SELF_UNDELETE_ALLOWED]?.[0]?.value
						],
						[BACKUP_ENABLED, !!data?.attributes?.[BACKUP_ENABLED]?.[0]?.value]
					]);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message ? error?.message : labels.snackbar.errorMessage,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		cosName,
		createSnackbar,
		isAdvanced,
		setCosAdvancedAttributeValues,
		t,
		labels.snackbar.errorMessage
	]);

	const changeBackupAttribute = useCallback(
		(key: AdvancedBackupAttributesKeys): void => {
			setCosAdvancedBackupAttributes((prev: AdvancedBackupAttributes) => ({
				...prev,
				[key]: !cosAdvancedBackupAttributes[key]
			}));
			setIsDirty(true);
		},
		[cosAdvancedBackupAttributes, setCosAdvancedBackupAttributes, setIsDirty]
	);

	return (
		<PageLayout
			title={labels.advanced}
			onSave={onSave}
			onCancel={onCancel}
			unSavedChanges={isDirty}
		>
			<Container mainAlignment="flex-start" width="100%" orientation="vertical">
				{isAdvanced && (
					<COSGeneralOptions
						cosAdvancedBackupAttributes={cosAdvancedBackupAttributes}
						readonlyCOS={readonlyCOS}
						changeBackupAttribute={changeBackupAttribute}
					/>
				)}
				<COSForwarding
					cosAdvanced={cosAdvanced}
					changeValue={changeValue}
					readonlyCOS={readonlyCOS}
				/>
				<COSQuotas
					isAdvanced={isAdvanced}
					showFileQuotaLimitMsg={showFileQuotaLimitMsg}
					showAccountQuotaLimitMsg={showAccountQuotaLimitMsg}
					readonlyCOS={readonlyCOS}
					cosAdvanced={cosAdvanced}
					initFileQuotaLimitGBValue={initFileQuotaLimitGBValue}
					fileQuotaLimitGBValue={fileQuotaLimitGBValue}
					accountQuotaGBValue={accountQuotaGBValue}
					zimbraQuotaWarnIntervalNum={zimbraQuotaWarnIntervalNum}
					timeItems={timeItems}
					zimbraQuotaWarnIntervalType={zimbraQuotaWarnIntervalType}
					onFileQuotaChange={onFileQuotaChange}
					onZimbraMailQuotaChange={onZimbraMailQuotaChange}
					changeValue={changeValue}
					onZimbraQuotaWarnIntervalNumChange={onZimbraQuotaWarnIntervalNumChange}
					onZimbraQuotaWarnIntervalTypeChange={onZimbraQuotaWarnIntervalTypeChange}
				/>
				<COSPassword
					cosAdvanced={cosAdvanced}
					readonlyCOS={readonlyCOS}
					changeSwitchOption={changeSwitchOption}
					changeValue={changeValue}
				/>
				<COSFailedLoginPolicy
					cosAdvanced={cosAdvanced}
					readonlyCOS={readonlyCOS}
					timeItems={timeItems}
					zimbraPasswordLockoutDurationNum={zimbraPasswordLockoutDurationNum}
					zimbraPasswordLockoutDurationType={zimbraPasswordLockoutDurationType}
					zimbraPasswordLockoutFailureLifetimeNum={zimbraPasswordLockoutFailureLifetimeNum}
					zimbraPasswordLockoutFailureLifetimeType={zimbraPasswordLockoutFailureLifetimeType}
					changeSwitchOption={changeSwitchOption}
					changeValue={changeValue}
					onZimbraPasswordLockoutDurationNumChange={onZimbraPasswordLockoutDurationNumChange}
					onZimbraPasswordLockoutDurationTypeChange={onZimbraPasswordLockoutDurationTypeChange}
					onZimbraPasswordLockoutFailureLifetimeNumChange={
						onZimbraPasswordLockoutFailureLifetimeNumChange
					}
					onZimbraPasswordLockoutFailureLifetimeTypeChange={
						onZimbraPasswordLockoutFailureLifetimeTypeChange
					}
				/>
				<COSTimeoutPolicy
					zimbraAdminAuthTokenLifetimeNum={zimbraAdminAuthTokenLifetimeNum}
					zimbraAdminAuthTokenLifetimeType={zimbraAdminAuthTokenLifetimeType}
					zimbraAuthTokenLifetimeNum={zimbraAuthTokenLifetimeNum}
					zimbraAuthTokenLifetimeType={zimbraAuthTokenLifetimeType}
					zimbraMailIdleSessionTimeoutNum={zimbraMailIdleSessionTimeoutNum}
					zimbraMailIdleSessionTimeoutType={zimbraMailIdleSessionTimeoutType}
					readonlyCOS={readonlyCOS}
					timeItems={timeItems}
					onZimbraAdminAuthTokenLifetimeNumChange={onZimbraAdminAuthTokenLifetimeNumChange}
					onZimbraAdminAuthTokenLifetimeTypeChange={onZimbraAdminAuthTokenLifetimeTypeChange}
					onZimbraAuthTokenLifetimeNumChange={onZimbraAuthTokenLifetimeNumChange}
					onZimbraAuthTokenLifetimeTypeChange={onZimbraAuthTokenLifetimeTypeChange}
					onZimbraMailIdleSessionTimeoutNumChange={onZimbraMailIdleSessionTimeoutNumChange}
					onZimbraMailIdleSessionTimeoutTypeChange={onZimbraMailIdleSessionTimeoutTypeChange}
				/>
				<COSEmailRetentionPolicy
					zimbraMailMessageLifetimeNum={zimbraMailMessageLifetimeNum}
					zimbraMailMessageLifetimeType={zimbraMailMessageLifetimeType}
					zimbraMailTrashLifetimeNum={zimbraMailTrashLifetimeNum}
					zimbraMailTrashLifetimeType={zimbraMailTrashLifetimeType}
					zimbraMailSpamLifetimeNum={zimbraMailSpamLifetimeNum}
					zimbraMailSpamLifetimeType={zimbraMailSpamLifetimeType}
					readonlyCOS={readonlyCOS}
					timeItems={timeItems}
					onZimbraMailMessageLifetimeNumChange={onZimbraMailMessageLifetimeNumChange}
					onZimbraMailMessageLifetimeTypeChange={onZimbraMailMessageLifetimeTypeChange}
					onZimbraMailTrashLifetimeNumChange={onZimbraMailTrashLifetimeNumChange}
					onZimbraMailTrashLifetimeTypeChange={onZimbraMailTrashLifetimeTypeChange}
					onZimbraMailSpamLifetimeNumChange={onZimbraMailSpamLifetimeNumChange}
					onZimbraMailSpamLifetimeTypeChange={onZimbraMailSpamLifetimeTypeChange}
				/>
			</Container>
		</PageLayout>
	);
};

export default CosAdvanced;
