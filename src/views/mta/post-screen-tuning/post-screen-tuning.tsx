/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	Container,
	SnackbarManagerContext,
	Row,
	Padding,
	Text,
	Button,
	Divider,
	Icon,
	IconButton,
	Select,
	Input,
	Switch
} from '@zextras/carbonio-design-system';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MtaPostTuning } from '../../../../types';
import {
	IS_SHOW_POST_TUNING_BANNER,
	ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
	ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
	ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
	ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
	ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
	ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
	ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
	ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
	ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
	ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
	ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
	ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import ListRow from '../../list/list-row';
import { useLocalStorage } from '../../utility/utils';

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

const MTAPostScreenTuning: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const [mtaPostTuningInitialDetail, setMtaPostTuningInitialDetail] = useState<MtaPostTuning>();
	const [mtaPostTuningDetail, setMtaPostTuningDetail] = useState<MtaPostTuning>();
	const [isShowBanner, setIsShowBanner] = useLocalStorage(IS_SHOW_POST_TUNING_BANNER, true);

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaPostTuningInitialDetail((prev: any) => ({
			...prev,
			[key]: value
		}));
	}, []);
	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaPostTuningDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	useEffect(() => {
		if (mtaPostTuningDetail && !isEqual(mtaPostTuningDetail, mtaPostTuningInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaPostTuningDetail, mtaPostTuningInitialDetail]);

	const ignoreEnforceDropOptions = useMemo(
		() => [
			{
				label: t('mta.ignore', 'Ignore'),
				value: 'ignore'
			},
			{
				label: t('mta.enforce', 'Enforce'),
				value: 'enforce'
			},
			{
				label: t('mta.drop', 'Drop'),
				value: 'drop'
			}
		],
		[t]
	);

	const ignoreDropOptions = useMemo(
		() => [
			{
				label: t('mta.ignore', 'Ignore'),
				value: 'ignore'
			},
			{
				label: t('mta.drop', 'Drop'),
				value: 'drop'
			}
		],
		[t]
	);

	const intervalOptions = useMemo(
		() => [
			{
				label: t('mta.seconds', 'Seconds'),
				value: 's'
			},
			{
				label: t('mta.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('mta.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('mta.days', 'Days'),
				value: 'd'
			},
			{
				label: t('mta.weeks', 'Weeks'),
				value: 'w'
			}
		],
		[t]
	);
	const [dnsblMinTTLUnit, setDnsblMinTTLUnit] = useState(intervalOptions[2]);
	const [dnsblMaxTTLUnit, setDnsblMaxTTLUnit] = useState(intervalOptions[2]);
	const [dnsblTTLUnit, setDnsblTTLUnit] = useState(intervalOptions[2]);
	const [pipeliningTTLUnit, setPipeliningTTLUnit] = useState(intervalOptions[2]);
	const [nonSMTPCommandTTLUnit, setNonSMTPCommandTTLUnit] = useState(intervalOptions[2]);
	const [bareNewLineTTLUnit, setBareNewLineTTLUnit] = useState(intervalOptions[2]);

	const setPostScreenData = useCallback(() => {
		const zimbraMtaPostscreenPipeliningAction = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION
		);
		if (zimbraMtaPostscreenPipeliningAction && zimbraMtaPostscreenPipeliningAction?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION,
				zimbraMtaPostscreenPipeliningAction?._content
			);
		}

		const zimbraMtaPostscreenNonSmtpCommandAction = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION
		);
		if (
			zimbraMtaPostscreenNonSmtpCommandAction &&
			zimbraMtaPostscreenNonSmtpCommandAction?._content
		) {
			setInitialAndCurrentValue(
				ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
				zimbraMtaPostscreenNonSmtpCommandAction?._content
			);
		}

		const zimbraMtaPostscreenBareNewlineAction = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION
		);
		if (zimbraMtaPostscreenBareNewlineAction && zimbraMtaPostscreenBareNewlineAction?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
				zimbraMtaPostscreenBareNewlineAction?._content
			);
		}

		const zimbraMtaPostscreenPipeliningTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL
		);
		if (zimbraMtaPostscreenPipeliningTTL && zimbraMtaPostscreenPipeliningTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
				zimbraMtaPostscreenPipeliningTTL?._content
			);
		}

		const zimbraMtaPostscreenNonSmtpCommandTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL
		);
		if (zimbraMtaPostscreenNonSmtpCommandTTL && zimbraMtaPostscreenNonSmtpCommandTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
				zimbraMtaPostscreenNonSmtpCommandTTL?._content
			);
		}

		const zimbraMtaPostscreenBareNewlineTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL
		);
		if (zimbraMtaPostscreenBareNewlineTTL && zimbraMtaPostscreenBareNewlineTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
				zimbraMtaPostscreenBareNewlineTTL?._content
			);
		}
		const zimbraMtaPostscreenDnsblWhitelistThreshold = configInformation.find(
			(item: Record<string, string>) =>
				item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD
		);
		if (
			zimbraMtaPostscreenDnsblWhitelistThreshold &&
			zimbraMtaPostscreenDnsblWhitelistThreshold?._content
		) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
				zimbraMtaPostscreenDnsblWhitelistThreshold?._content
			);
		}
	}, [configInformation, setInitialAndCurrentValue]);

	const setPostScreenConfigData = useCallback(() => {
		const zimbraMtaPostscreenDnsblMinTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL
		);
		if (zimbraMtaPostscreenDnsblMinTTL && zimbraMtaPostscreenDnsblMinTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
				zimbraMtaPostscreenDnsblMinTTL?._content
			);
		}

		const zimbraMtaPostscreenDnsblMaxTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL
		);
		if (zimbraMtaPostscreenDnsblMaxTTL && zimbraMtaPostscreenDnsblMaxTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
				zimbraMtaPostscreenDnsblMaxTTL?._content
			);
		}

		const zimbraMtaPostscreenDnsblTTL = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL
		);
		if (zimbraMtaPostscreenDnsblTTL && zimbraMtaPostscreenDnsblTTL?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
				zimbraMtaPostscreenDnsblTTL?._content
			);
		}

		const zimbraMtaPostscreenBareNewlineEnable = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE
		);
		if (zimbraMtaPostscreenBareNewlineEnable && zimbraMtaPostscreenBareNewlineEnable?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
				zimbraMtaPostscreenBareNewlineEnable?._content === 'yes'
			);
		}

		const zimbraMtaPostscreenNonSmtpCommandEnable = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE
		);
		if (
			zimbraMtaPostscreenNonSmtpCommandEnable &&
			zimbraMtaPostscreenNonSmtpCommandEnable?._content
		) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
				zimbraMtaPostscreenNonSmtpCommandEnable?._content === 'yes'
			);
		}

		const zimbraMtaPostscreenPipeliningEnable = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE
		);
		if (zimbraMtaPostscreenPipeliningEnable && zimbraMtaPostscreenPipeliningEnable?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
				zimbraMtaPostscreenPipeliningEnable?._content === 'yes'
			);
		}
		const zimbraMtaPostscreenDnsblThreshold = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD
		);
		if (zimbraMtaPostscreenDnsblThreshold && zimbraMtaPostscreenDnsblThreshold?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
				zimbraMtaPostscreenDnsblThreshold?._content
			);
		} else {
			setInitialAndCurrentValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, '');
		}
	}, [configInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			setPostScreenConfigData();
			setPostScreenData();
			const zimbraMtaPostscreenBlacklistAction = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION
			);
			if (zimbraMtaPostscreenBlacklistAction && zimbraMtaPostscreenBlacklistAction?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
					zimbraMtaPostscreenBlacklistAction?._content
				);
			}

			const zimbraMtaPostscreenAccessList = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST
			);
			if (zimbraMtaPostscreenAccessList && zimbraMtaPostscreenAccessList?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
					zimbraMtaPostscreenAccessList?._content
				);
			}

			const zimbraMtaPostscreenDnsblAction = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION
			);
			if (zimbraMtaPostscreenDnsblAction && zimbraMtaPostscreenDnsblAction?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
					zimbraMtaPostscreenDnsblAction?._content
				);
			}

			const zimbraMtaPostscreenDnsblSites = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES
			);
			if (zimbraMtaPostscreenDnsblSites && zimbraMtaPostscreenDnsblSites?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
					zimbraMtaPostscreenDnsblSites?._content
				);
			} else {
				setInitialAndCurrentValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, '');
			}
		}
	}, [configInformation, setInitialAndCurrentValue, setPostScreenConfigData, setPostScreenData]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblMinTTLUnit(findOption || dnsblMinTTLUnit);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL, intervalOptions, dnsblMinTTLUnit]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblMaxTTLUnit(findOption || dnsblMaxTTLUnit);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL, intervalOptions, dnsblMaxTTLUnit]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setDnsblTTLUnit(findOption || dnsblTTLUnit);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL, intervalOptions, dnsblTTLUnit]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setPipeliningTTLUnit(findOption || pipeliningTTLUnit);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL, intervalOptions, pipeliningTTLUnit]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL.replace(
				/[^a-zA-Z]/g,
				''
			);
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setNonSMTPCommandTTLUnit(findOption || nonSMTPCommandTTLUnit);
		}
	}, [
		mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL,
		intervalOptions,
		nonSMTPCommandTTLUnit
	]);

	useEffect(() => {
		if (mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL) {
			const unit = mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL.replace(/[^a-zA-Z]/g, '');
			const findOption = intervalOptions.find(
				(item: Record<string, string>) => item?.value === unit
			);
			setBareNewLineTTLUnit(findOption || bareNewLineTTLUnit);
		}
	}, [mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL, intervalOptions, bareNewLineTTLUnit]);

	const onBlackListActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION, v);
		},
		[setValue]
	);

	const onDNSBlackListActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION, v);
		},
		[setValue]
	);

	const onDNSBlSiteChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, v);
		},
		[setValue]
	);

	const onPipeLiningActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION, v);
		},
		[setValue]
	);

	const onNonSMTPCommandActionChange = useCallback(
		(v: string) => {
			setValue(ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION, v);
		},
		[setValue]
	);

	const onBareNewLineActionChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION, v);
		},
		[setValue]
	);

	const onDNSMinTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblMinTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL]
	);

	const onDNSMaxTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblMaxTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL]
	);

	const onDNSTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setDnsblTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL]
	);

	const onPipelinginTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setPipeliningTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL]
	);

	const onNonSMTPCommandTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setNonSMTPCommandTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL]
	);

	const onBareNewLineTTLUnitChange = useCallback(
		(v) => {
			const findOption = intervalOptions.find((item: Record<string, string>) => item?.value === v);
			setBareNewLineTTLUnit(findOption || intervalOptions[2]);
			setValue(
				ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
				`${mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL.replace(/[^0-9]/g, '')}${
					findOption?.value
				}`
			);
		},
		[intervalOptions, setValue, mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL]
	);

	const onCancel = useCallback(() => {
		setMtaPostTuningDetail(mtaPostTuningInitialDetail);
		setValue(
			ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
			mtaPostTuningInitialDetail?.zimbraMtaPostscreenDnsblSites
				? mtaPostTuningInitialDetail?.zimbraMtaPostscreenDnsblSites
				: ''
		);
	}, [mtaPostTuningInitialDetail, setValue]);

	const updateGlobalConfig = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			attributes.forEach((ele: Record<string, string>) => {
				updateConfig(ele?.n, ele._content);
			});
		},
		[updateConfig]
	);

	const modifyConfigRequest = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			modifyConfig(attributes)
				.then(() => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					updateGlobalConfig(attributes);
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
		},
		[createSnackbar, t, updateGlobalConfig]
	);

	const setSaveValue = useCallback(
		(attributes) => {
			if (mtaPostTuningDetail?.zimbraMtaPostscreenBlacklistAction) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenBlacklistAction
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenAccessList) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenAccessList
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL
				});
			}
			if (mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL) {
				attributes.push({
					n: ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
					_content: mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL
				});
			}
		},
		[
			mtaPostTuningDetail?.zimbraMtaPostscreenAccessList,
			mtaPostTuningDetail?.zimbraMtaPostscreenBlacklistAction,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold,
			mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold
		]
	);

	const onSave = useCallback(() => {
		const attributes: Array<Record<string, string>> = [];
		setSaveValue(attributes);
		attributes.push({
			n: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
			_content: mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable ? 'yes' : 'no'
		});
		attributes.push({
			n: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
			_content: mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable ? 'yes' : 'no'
		});
		attributes.push({
			n: ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
			_content: mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable ? 'yes' : 'no'
		});
		if (mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningAction) {
			attributes.push({
				n: ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningAction
			});
		}
		if (mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandAction) {
			attributes.push({
				n: ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandAction
			});
		}
		if (mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineAction) {
			attributes.push({
				n: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineAction
			});
		}
		if (mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL) {
			attributes.push({
				n: ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL
			});
		}
		if (mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL) {
			attributes.push({
				n: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL
			});
		}
		if (mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL) {
			attributes.push({
				n: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
				_content: mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL
			});
		}
		modifyConfigRequest(attributes);
	}, [
		setSaveValue,
		mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable,
		mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable,
		mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable,
		mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningAction,
		mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandAction,
		mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineAction,
		mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL,
		mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL,
		mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL,
		modifyConfigRequest
	]);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.postscreen_tuning', 'Postscreen Tuning')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								)}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				style={{ overflow: 'auto' }}
			>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: isShowBanner ? 'extrasmall' : 'large' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.blacklisting', 'Blacklisting')}
					</Text>
				</Container>
				{isShowBanner && (
					<Container
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="100%"
						background="#D3EBF8"
						padding={{ all: 'small' }}
						style={{
							borderRadius: '0.125rem 0.125rem 0 0',
							borderBottom: '0.063rem solid #2196D3',
							marginTop: '0.938rem',
							marginBottom: '0.938rem'
						}}
					>
						<Container
							crossAlignment="flex-start"
							orientation="horizontal"
							mainAlignment="space-between"
							width="100%"
						>
							<Container width="5%" padding={{ left: 'extralarge', right: 'extralarge' }}>
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="#2196D3"></CustomIcon>
								</Padding>
							</Container>
							<Container
								padding={{
									top: 'small',
									bottom: 'small'
								}}
								crossAlignment="flex-start"
							>
								<Text overflow="break-word">
									{t(
										'mta.graylisting_disabled_warning_message',
										'This is a form of greylisting, so you need to disable other forms of greylisting.'
									)}
								</Text>
							</Container>
						</Container>

						<Container width="auto" padding={{ right: 'small' }}>
							<IconButton
								icon="CloseOutline"
								size="large"
								onClick={(): void => {
									setIsShowBanner(false);
								}}
							/>
						</Container>
					</Container>
				)}
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={ignoreEnforceDropOptions}
							background="gray5"
							label={t('mta.black_list_action', 'Blacklist Action')}
							showCheckbox={false}
							selection={ignoreEnforceDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenBlacklistAction
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onBlackListActionChange}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t('mta.access_list_path', 'Access List Path')}
							backgroundColor="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenAccessList}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST, e.target.value);
							}}
						/>
					</Container>
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.dns_black_listing', 'DNS Blacklisting')}
					</Text>
				</Container>
				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Select
							items={ignoreDropOptions}
							background="gray5"
							label={t('mta.dns_blacklist_sites', 'DNS Blacklist Sites')}
							showCheckbox={false}
							selection={ignoreDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onDNSBlSiteChange}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={ignoreEnforceDropOptions}
							background="gray5"
							label={t('mta.dns_blacklist_action', 'DNS Blacklist Action')}
							showCheckbox={false}
							selection={ignoreEnforceDropOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onDNSBlackListActionChange}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Input
							label={t('mta.dns_blacklist_threshold_value', 'DNS Blacklist Threshold (value)')}
							backgroundColor="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, e.target.value);
							}}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Input
							label={t(
								'mta.dns_blacklist_whitelist_threshold_value',
								'DNS Blacklist Whitelist Threshold  (value)'
							)}
							backgroundColor="gray5"
							value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD, e.target.value);
							}}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
						width="55%"
					>
						<Container
							padding={{ right: 'medium' }}
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							width="75%"
						>
							<Input
								label={t(
									'mta.dns_blacklist_min_time_to_live',
									'DNS Blacklist Min Time to Live (value)'
								)}
								backgroundColor="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replace(/[^0-9]/g, '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container crossAlignment="flex-start" mainAlignment="flex-start" width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblMinTTLUnit}
								onChange={onDNSMinTTLUnitChange}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="54%"
					>
						<Container padding={{ right: 'medium' }} width="75%">
							<Input
								label={t(
									'mta.dns_blacklist_max_time_to_live',
									'DNS Blacklist Max Time to Live (value)'
								)}
								backgroundColor="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replace(/[^0-9]/g, '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblMaxTTLUnit}
								onChange={onDNSMaxTTLUnitChange}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
					width="100%"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
						padding={{ right: 'small' }}
					>
						<Container padding={{ right: 'small' }} width="75%">
							<Input
								label={t('mta.dns_blacklist_time_to_live', 'DNS Blacklist Time to Live (value)')}
								backgroundColor="gray5"
								value={
									mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL &&
									mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL.replace(/[^0-9]/g, '')
								}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container width="25%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={dnsblTTLUnit}
								onChange={onDNSTTLUnitChange}
							/>
						</Container>
					</Container>
					<Container></Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'medium' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.tuning', 'Tuning')}
					</Text>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.bare_newline', 'Bare Newline')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('mta.action', 'Action')}
								showCheckbox={false}
								selection={ignoreEnforceDropOptions.find(
									(item: Record<string, string>) =>
										item.value === mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineAction
								)}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								onChange={onBareNewLineActionChange}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
							<Input
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								backgroundColor="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL.replace(
									/[^0-9]/g,
									''
								)}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container crossAlignment="flex-end" width="30%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={bareNewLineTTLUnit}
								onChange={onBareNewLineTTLUnitChange}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.non_smtp_command', 'NonSMTP Command')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
								selection={ignoreEnforceDropOptions.find(
									(item: Record<string, string>) =>
										item.value === mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandAction
								)}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								onChange={onNonSMTPCommandActionChange}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								backgroundColor="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL.replace(
									/[^0-9]/g,
									''
								)}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container crossAlignment="flex-end" width="30%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={nonSMTPCommandTTLUnit}
								onChange={onNonSMTPCommandTTLUnitChange}
							/>
						</Container>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					orientation="horizontal"
					mainAlignment="space-between"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						padding={{ right: 'medium' }}
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start">
							<Switch
								label={t('mta.pipelining', 'Pipelining')}
								value={mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
										!mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable
									)
								}
							/>
						</Container>
						<Container crossAlignment="flex-end">
							<Select
								items={ignoreEnforceDropOptions}
								background="gray5"
								label={t('mta.action', 'Action')}
								showCheckbox={false}
								selection={ignoreEnforceDropOptions.find(
									(item: Record<string, string>) =>
										item.value === mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningAction
								)}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								onChange={onPipeLiningActionChange}
							/>
						</Container>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
					>
						<Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
							<Input
								label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
								backgroundColor="gray5"
								value={mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL.replace(/[^0-9]/g, '')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setValue(ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL, e.target.value);
								}}
							/>
						</Container>
						<Container crossAlignment="flex-end" width="30%">
							<Select
								items={intervalOptions}
								background="gray5"
								label={t('mta.interval', 'Interval')}
								showCheckbox={false}
								selection={pipeliningTTLUnit}
								onChange={onPipelinginTTLUnitChange}
							/>
						</Container>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAPostScreenTuning;
