/* eslint-disable dot-notation */
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
	Button,
	Padding,
	Divider,
	Tooltip,
	ChipInput,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { find, isEqual, join, map, some, split, trim } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CreateSnackbarType, IpRangeValue, MtaServerGeneral } from '../../../../../types';
import {
	CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
	CONFIG,
	FALSE,
	TRUE,
	ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
	ZIMBRA_AMAVIS_LOG_LEVEL,
	ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
	ZIMBRA_AMAVIS_SA_LOG_LEVEL,
	ZIMBRA_MTA_FALLBACK_RELAY_HOST,
	ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
	ZIMBRA_MTA_MY_NETWORKS,
	ZIMBRA_MTA_RELAY_HOST,
	ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
	ZIMBRA_MTA_SASL_AUTH_ENABLED
} from '../../../../constants';
import { getServerInformationByName } from '../../../../services/get-server-information';
import { modifyServer } from '../../../../services/modify-server';
import { useConfigStore } from '../../../../store/config/store';
import { Right, Rights, useRightsStore } from '../../../../store/rights/store';
import { useServerStore } from '../../../../store/server/store';
import CustomChip from '../../../components/customChip';
import ListRow from '../../../list/list-row';
import InheritedInput from '../../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../../utility/inherited-components/inherited-select';
import InheritedSwitch from '../../../utility/inherited-components/inherited-switch';
import { validateIpAddress } from '../../../utility/utils';

const MTAServerGeneral: FC = () => {
	const [t] = useTranslation();
	const { server }: { server: string } = useParams();
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const rights: Rights = useRightsStore((state) => state.rights);
	const [serverAttributes, setServerAttributes] = useState<{ n: string; _content: string }[]>([]);
	const [mtaServerGeneralInitialDetail, setMtaServerGeneralInitialDetail] =
		useState<MtaServerGeneral>();
	const [mtaServerGeneralDetail, setMtaServerGeneralDetail] = useState<MtaServerGeneral>();
	const [networkValue, setNetworkValue] = useState<Array<any>>([]);
	const mtaServerList = useServerStore((state) => state.mtaServerList);
	const configInformation = useConfigStore((state) => state.config);
	const [serverSpecificAttributes, setServerSpecificAttributes] = useState<
		{ n: string; _content: string }[]
	>([]);
	const [mtaServerSpecificGeneralDetail, setMtaServerSpecificGeneralDetail] =
		useState<MtaServerGeneral>();

	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaServerGeneralDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaServerGeneralInitialDetail((prev: any) => ({
			...prev,
			[key]: value
		}));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const setServerSpecificCurrentValue = useCallback(
		(key, value) => {
			setMtaServerSpecificGeneralDetail((prev: any) => ({
				...prev,
				[key]: value
			}));
		},
		[setMtaServerSpecificGeneralDetail]
	);

	const amavisLogLevelOptions = useMemo(
		() => [
			{
				label: t('mta.zero', '0'),
				value: '0'
			},
			{
				label: t('mta.one', '1'),
				value: '1'
			},
			{
				label: t('mta.two', '2'),
				value: '2'
			},
			{
				label: t('mta.three', '3'),
				value: '3'
			},
			{
				label: t('mta.four', '4'),
				value: '4'
			},
			{
				label: t('mta.five', '5'),
				value: '5'
			}
		],
		[t]
	);

	const amavisSALogLevelOptions = useMemo(
		() => [
			{
				label: t('mta.info', 'Info'),
				value: '0'
			},
			{
				label: t('mta.all', 'All'),
				value: '1'
			}
		],
		[t]
	);

	const zimbraMtaSmtpdLoglevelOptions = useMemo(
		() => [
			{
				label: t('mta.one', '1'),
				value: '1'
			},
			{
				label: t('mta.two', '2'),
				value: '2'
			},
			{
				label: t('mta.three', '3'),
				value: '3'
			},
			{
				label: t('mta.four', '4'),
				value: '4'
			}
		],
		[t]
	);

	const zimbraMtaLmtpTlsLoglevelOptions = useMemo(
		() => [
			{
				label: t('mta.zero', '0'),
				value: '0'
			},
			{
				label: t('mta.one', '1'),
				value: '1'
			},
			{
				label: t('mta.two', '2'),
				value: '2'
			},
			{
				label: t('mta.three', '3'),
				value: '3'
			},
			{
				label: t('mta.four', '4'),
				value: '4'
			}
		],
		[t]
	);

	const allowSetMTA = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const setMtaLoggingValues = useCallback(() => {
		const zimbraAmavisLogLevel = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_LOG_LEVEL
		);

		if (zimbraAmavisLogLevel && zimbraAmavisLogLevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_AMAVIS_LOG_LEVEL, zimbraAmavisLogLevel?._content);
		}

		const zimbraAmavisSALogLevel = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_SA_LOG_LEVEL
		);

		if (zimbraAmavisSALogLevel && zimbraAmavisSALogLevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_AMAVIS_SA_LOG_LEVEL, zimbraAmavisSALogLevel?._content);
		}

		const zimbraMtaSmtpdTlsLoglevel = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL
		);

		if (zimbraMtaSmtpdTlsLoglevel && zimbraMtaSmtpdTlsLoglevel?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
				zimbraMtaSmtpdTlsLoglevel?._content
			);
		}

		const zimbraMtaLmtpTlsLoglevel = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL
		);

		if (zimbraMtaLmtpTlsLoglevel && zimbraMtaLmtpTlsLoglevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL, zimbraMtaLmtpTlsLoglevel?._content);
		}
	}, [serverAttributes, setInitialAndCurrentValue]);

	const setMtaAntiVirusValues = useCallback(() => {
		const zimbraAmavisOriginatingBypassSA = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA
		);
		if (zimbraAmavisOriginatingBypassSA && zimbraAmavisOriginatingBypassSA?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
				zimbraAmavisOriginatingBypassSA?._content
			);
		}

		const zimbraAmavisEnableDKIMVerification = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION
		);
		if (zimbraAmavisEnableDKIMVerification && zimbraAmavisEnableDKIMVerification?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
				zimbraAmavisEnableDKIMVerification?._content
			);
		}

		const carbonioAmavisDisableVirusCheck = serverAttributes.find(
			(item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
		);
		if (carbonioAmavisDisableVirusCheck && carbonioAmavisDisableVirusCheck?._content) {
			setInitialAndCurrentValue(
				CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
				carbonioAmavisDisableVirusCheck?._content
			);
		}

		const mtaFallBackRelayHost = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST
		);
		if (mtaFallBackRelayHost && mtaFallBackRelayHost?._content) {
			setInitialAndCurrentValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, mtaFallBackRelayHost?._content);
		}
	}, [serverAttributes, setInitialAndCurrentValue]);

	useEffect(() => {
		if (serverAttributes.length > 0) {
			const mtaAuthEnabled = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
			);

			if (mtaAuthEnabled && mtaAuthEnabled?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_SASL_AUTH_ENABLED,
					mtaAuthEnabled?._content === 'yes' ? TRUE : FALSE
				);
			}

			const zimbraMtaMyNetworks = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS
			);

			if (zimbraMtaMyNetworks && zimbraMtaMyNetworks?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_MY_NETWORKS, zimbraMtaMyNetworks?._content);
			}
			const value = zimbraMtaMyNetworks?._content?.trim()
				? map(split(zimbraMtaMyNetworks?._content, /  ?/), (ip) => ({
						label: trim(ip)
				  }))
				: [];

			setNetworkValue(value);

			const mtaRelayHost = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST
			);
			if (mtaRelayHost && mtaRelayHost?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_RELAY_HOST, mtaRelayHost?._content);
			}

			setMtaAntiVirusValues();
			setMtaLoggingValues();
			setTimeout(() => {
				setIsDirty(false);
			}, 100);
		}
	}, [serverAttributes, setInitialAndCurrentValue, setMtaAntiVirusValues, setMtaLoggingValues]);

	const setServerSpecificMtaLoggingValues = useCallback(() => {
		const zimbraAmavisLogLevel = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_LOG_LEVEL
		);

		if (zimbraAmavisLogLevel && zimbraAmavisLogLevel?._content) {
			setServerSpecificCurrentValue(ZIMBRA_AMAVIS_LOG_LEVEL, zimbraAmavisLogLevel?._content);
		}

		const zimbraAmavisSALogLevel = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_SA_LOG_LEVEL
		);

		if (zimbraAmavisSALogLevel && zimbraAmavisSALogLevel?._content) {
			setServerSpecificCurrentValue(ZIMBRA_AMAVIS_SA_LOG_LEVEL, zimbraAmavisSALogLevel?._content);
		}

		const zimbraMtaSmtpdTlsLoglevel = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL
		);

		if (zimbraMtaSmtpdTlsLoglevel && zimbraMtaSmtpdTlsLoglevel?._content) {
			setServerSpecificCurrentValue(
				ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
				zimbraMtaSmtpdTlsLoglevel?._content
			);
		}

		const zimbraMtaLmtpTlsLoglevel = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL
		);

		if (zimbraMtaLmtpTlsLoglevel && zimbraMtaLmtpTlsLoglevel?._content) {
			setServerSpecificCurrentValue(
				ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
				zimbraMtaLmtpTlsLoglevel?._content
			);
		}
	}, [serverSpecificAttributes, setServerSpecificCurrentValue]);

	const setServerSpecificMtaAntiVirusValues = useCallback(() => {
		const zimbraAmavisOriginatingBypassSA = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA
		);
		if (zimbraAmavisOriginatingBypassSA && zimbraAmavisOriginatingBypassSA?._content) {
			setServerSpecificCurrentValue(
				ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
				zimbraAmavisOriginatingBypassSA?._content
			);
		}

		const zimbraAmavisEnableDKIMVerification = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION
		);
		if (zimbraAmavisEnableDKIMVerification && zimbraAmavisEnableDKIMVerification?._content) {
			setServerSpecificCurrentValue(
				ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
				zimbraAmavisEnableDKIMVerification?._content
			);
		}

		const carbonioAmavisDisableVirusCheck = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
		);
		if (carbonioAmavisDisableVirusCheck && carbonioAmavisDisableVirusCheck?._content) {
			setServerSpecificCurrentValue(
				CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
				carbonioAmavisDisableVirusCheck?._content
			);
		}

		const mtaFallBackRelayHost = serverSpecificAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST
		);
		if (mtaFallBackRelayHost && mtaFallBackRelayHost?._content) {
			setServerSpecificCurrentValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, mtaFallBackRelayHost?._content);
		}
	}, [serverSpecificAttributes, setServerSpecificCurrentValue]);

	useEffect(() => {
		if (serverSpecificAttributes.length > 0) {
			const mtaAuthEnabled = serverSpecificAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
			);

			if (mtaAuthEnabled && mtaAuthEnabled?._content) {
				setServerSpecificCurrentValue(
					ZIMBRA_MTA_SASL_AUTH_ENABLED,
					mtaAuthEnabled?._content === 'yes' ? TRUE : FALSE
				);
			}

			const zimbraMtaMyNetworks = serverSpecificAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS
			);

			if (zimbraMtaMyNetworks && zimbraMtaMyNetworks?._content) {
				setServerSpecificCurrentValue(ZIMBRA_MTA_MY_NETWORKS, zimbraMtaMyNetworks?._content);
			}

			const mtaRelayHost = serverSpecificAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST
			);
			if (mtaRelayHost && mtaRelayHost?._content) {
				setServerSpecificCurrentValue(ZIMBRA_MTA_RELAY_HOST, mtaRelayHost?._content);
			}

			setServerSpecificMtaAntiVirusValues();
			setServerSpecificMtaLoggingValues();
			setTimeout(() => {
				setIsDirty(false);
			}, 100);
		}
	}, [
		serverSpecificAttributes,
		setServerSpecificCurrentValue,
		setServerSpecificMtaAntiVirusValues,
		setServerSpecificMtaLoggingValues
	]);

	const getServerSpecificInformation = useCallback(() => {
		getServerInformationByName(server, true).then((data) => {
			if (data && data?.server && Array.isArray(data?.server)) {
				const serverItem = data?.server[0];
				if (serverItem && serverItem?.a) {
					setServerSpecificAttributes(serverItem?.a);
				}
			}
		});
	}, [server]);

	useEffect(() => {
		setIsDirty(false);
		getServerInformationByName(server).then((data) => {
			if (data && data?.server && Array.isArray(data?.server)) {
				const serverItem = data?.server[0];
				if (serverItem && serverItem?.a) {
					setServerAttributes(serverItem?.a);
				}
			}
		});
		getServerSpecificInformation();
	}, [server, getServerSpecificInformation]);

	useEffect(() => {
		if (mtaServerGeneralDetail && !isEqual(mtaServerGeneralDetail, mtaServerGeneralInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaServerGeneralDetail, mtaServerGeneralInitialDetail, networkValue]);

	const onCancel = useCallback(() => {
		setMtaServerGeneralDetail(mtaServerGeneralInitialDetail);
		setValue(
			ZIMBRA_MTA_MY_NETWORKS,
			mtaServerGeneralInitialDetail?.zimbraMtaMyNetworks
				? mtaServerGeneralInitialDetail?.zimbraMtaMyNetworks
				: ''
		);
		setValue(
			ZIMBRA_MTA_FALLBACK_RELAY_HOST,
			mtaServerGeneralInitialDetail?.zimbraMtaFallbackRelayHost
				? mtaServerGeneralInitialDetail?.zimbraMtaFallbackRelayHost
				: ''
		);
		setValue(
			ZIMBRA_MTA_RELAY_HOST,
			mtaServerGeneralInitialDetail?.zimbraMtaRelayHost
				? mtaServerGeneralInitialDetail?.zimbraMtaRelayHost
				: ''
		);

		const zimbraMtaMyNetworks = serverAttributes.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS
		);
		const value = zimbraMtaMyNetworks?._content?.trim()
			? map(split(zimbraMtaMyNetworks?._content, /  ?/), (ip) => ({
					label: trim(ip)
			  }))
			: [];
		setNetworkValue(value);
		setTimeout(() => {
			setIsDirty(false);
		}, 10);
	}, [mtaServerGeneralInitialDetail, serverAttributes, setValue]);

	const modifyServerRequest = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			const id = mtaServerList.find((serverItem) => serverItem?.name === server)?.id;
			const body: Record<string, unknown> = {
				a: attributes,
				_jsns: 'urn:zimbraAdmin',
				id
			};
			modifyServer(body)
				.then((data) => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('label.change_save_success_msg', 'The change has been saved successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					if (data && data?.server && Array.isArray(data?.server)) {
						const serverItem = data?.server[0];
						if (serverItem && serverItem?.a) {
							setServerAttributes(serverItem?.a);
							getServerSpecificInformation();
						}
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
		},
		[createSnackbar, getServerSpecificInformation, mtaServerList, server, t]
	);

	const getValues = useCallback((val) => {
		if (val === undefined) {
			return '';
		}
		return val || '';
	}, []);

	const onSave = useCallback(() => {
		const attributes: Array<Record<string, string>> = [];

		attributes.push({
			n: ZIMBRA_MTA_FALLBACK_RELAY_HOST,
			_content: getValues(mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost)
		});

		attributes.push({
			n: ZIMBRA_MTA_MY_NETWORKS,
			_content: getValues(mtaServerGeneralDetail?.zimbraMtaMyNetworks)
		});

		attributes.push({
			n: ZIMBRA_MTA_RELAY_HOST,
			_content: getValues(mtaServerGeneralDetail?.zimbraMtaRelayHost)
		});

		if (mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable === undefined) {
			attributes.push({
				n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
				_content: ''
			});
		} else {
			attributes.push({
				n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
				_content: mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable === TRUE ? 'yes' : 'no'
			});
		}

		attributes.push({
			n: ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
			_content: getValues(mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel)
		});

		attributes.push({
			n: ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
			_content: getValues(mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel)
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_SA_LOG_LEVEL,
			_content: getValues(mtaServerGeneralDetail?.zimbraAmavisSALogLevel)
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_LOG_LEVEL,
			_content: getValues(mtaServerGeneralDetail?.zimbraAmavisLogLevel)
		});

		attributes.push({
			n: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
			_content: getValues(mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck)
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
			_content: getValues(mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification)
		});

		attributes.push({
			n: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
			_content: getValues(mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA)
		});
		modifyServerRequest(attributes);
	}, [
		getValues,
		modifyServerRequest,
		mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck,
		mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification,
		mtaServerGeneralDetail?.zimbraAmavisLogLevel,
		mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA,
		mtaServerGeneralDetail?.zimbraAmavisSALogLevel,
		mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost,
		mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel,
		mtaServerGeneralDetail?.zimbraMtaMyNetworks,
		mtaServerGeneralDetail?.zimbraMtaRelayHost,
		mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable,
		mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel
	]);

	const onAmavisLogLevelChange = useCallback(
		(v) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, zimbraAmavisLogLevel: v }));
		},
		[setMtaServerGeneralDetail]
	);

	const onAmavisSALogLevelChange = useCallback(
		(v: string) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, zimbraAmavisSALogLevel: v }));
		},
		[setMtaServerGeneralDetail]
	);

	const onSMTPClientLogLevelChange = useCallback(
		(v: string) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, zimbraMtaSmtpdTlsLoglevel: v }));
		},
		[setMtaServerGeneralDetail]
	);

	const onLMTPTlsLogLevelChange = useCallback(
		(v: string) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, zimbraMtaLmtpTlsLoglevel: v }));
		},
		[setMtaServerGeneralDetail]
	);

	const onBlockExtensionChange = useCallback(
		(ips) => {
			const data: Array<unknown> = [];
			map(ips, (ip: IpRangeValue) => {
				validateIpAddress(ip.label ?? '') ? data.push(ip) : data.push({ ...ip, error: true });
			});
			const value = data.length === 0 ? '' : join(map(data, 'label'), ' ');
			const isErrorValueAvail = some(data || [], { error: true });
			if (allowSetMTA && !isErrorValueAvail) {
				setValue(ZIMBRA_MTA_MY_NETWORKS, value);
			}
			setNetworkValue(data);
		},
		[allowSetMTA, setValue]
	);

	const setEmptyValue = useCallback(
		(keyName) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setMtaServerGeneralDetail]
	);

	const changeSwitchOption = useCallback(
		(key: keyof MtaServerGeneral): void => {
			if (mtaServerGeneralDetail) {
				setMtaServerGeneralDetail((prev: any) => ({
					...prev,
					[key]: mtaServerGeneralDetail[key] === TRUE ? FALSE : TRUE
				}));
			}
		},
		[mtaServerGeneralDetail]
	);

	const changeValue = useCallback(
		(e) => {
			setMtaServerGeneralDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setMtaServerGeneralDetail]
	);

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
						{t('label.general_lbl', 'General')}
					</Text>
					<Text size="medium" overflow="ellipsis" weight="regular">
						<Padding left={'small'}>{server}</Padding>
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
					padding={{ top: 'medium', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.authentication', 'Authentication')}
					</Text>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.enable_or_disable_authentication_for_email_transfer_agent',
								'Enable or disable authentication for the Mail Transfer Agent (MTA)'
							)}
							maxWidth="auto"
						>
							<InheritedSwitch
								subValue={mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable}
								onChange={changeSwitchOption}
								label={t('mta.enable_authentication', 'Enable Authentication')}
								iconColor="primary"
								inheritedValue={
									configInformation?.find(
										(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
									)?._content === 'yes'
										? TRUE
										: FALSE
								}
								fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaSaslAuthEnable}
								inputName={ZIMBRA_MTA_SASL_AUTH_ENABLED}
								onChangeReset={(): void =>
									setEmptyValue && setEmptyValue(ZIMBRA_MTA_SASL_AUTH_ENABLED)
								}
								disabled={!allowSetMTA}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start" height="auto">
						<ChipInput
							placeholder={t('mta.my_netword', 'My Network')}
							background="gray5"
							requireUniqueChips
							value={networkValue}
							onChange={onBlockExtensionChange}
							disabled={!allowSetMTA}
							hasError={some(networkValue || [], { error: true })}
							ChipComponent={CustomChip}
							errorLabel={t(
								'error.invalid_ip_address_error_text',
								'Supported ip format for ipv4 is ipv4/netmask and for ipv6 is [ipv6]/netmask'
							)}
							maxChips={null}
						/>
					</Container>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }} height="auto">
						<InheritedInput
							label={t('mta.relay_host', 'Relay Host')}
							subValue={mtaServerGeneralDetail?.zimbraMtaRelayHost}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaRelayHost}
							background="gray5"
							inputName="zimbraMtaRelayHost"
							onChange={changeValue}
							onChangeReset={(): void => setEmptyValue('zimbraMtaRelayHost')}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container padding={{ right: 'medium' }}>
						<InheritedInput
							label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
							subValue={mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaFallbackRelayHost}
							background="gray5"
							inputName="zimbraMtaFallbackRelayHost"
							onChange={changeValue}
							onChangeReset={(): void => setEmptyValue('zimbraMtaFallbackRelayHost')}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.antispam_and_antivirus', 'Antispam & Antivirus')}
					</Text>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<InheritedSwitch
							subValue={mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA}
							onChange={changeSwitchOption}
							label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
							iconColor="primary"
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisOriginatingBypassSA}
							inputName={ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue(ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<InheritedSwitch
							subValue={mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification}
							onChange={changeSwitchOption}
							label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
							iconColor="primary"
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) =>
										item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisEnableDKIMVerification}
							inputName={ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue(ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<InheritedSwitch
							subValue={mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck}
							onChange={changeSwitchOption}
							label={t('mta.disable_virus_check', 'Disable Virus Check')}
							iconColor="primary"
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.carbonioAmavisDisableVirusCheck}
							inputName={CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK}
							onChangeReset={(): void =>
								setEmptyValue && setEmptyValue(CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'medium', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.logging', 'Logging')}
					</Text>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					height="auto"
					padding={{ bottom: 'extralarge' }}
				>
					<Container crossAlignment="flex-start">
						<InheritedSelect
							label={t('mta.log_level_for_amavis', 'Log level for Amavis')}
							items={amavisLogLevelOptions}
							subValue={mtaServerGeneralDetail?.zimbraAmavisLogLevel}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_LOG_LEVEL
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisLogLevel}
							background="gray5"
							selectName="zimbraAmavisLogLevel"
							onChange={onAmavisLogLevelChange}
							onChangeReset={(): void => setEmptyValue('zimbraAmavisLogLevel')}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<InheritedSelect
							label={t('mta.sas_log_level_for_amavis', 'SAS Log level for Amavis')}
							items={amavisSALogLevelOptions}
							subValue={mtaServerGeneralDetail?.zimbraAmavisSALogLevel}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_SA_LOG_LEVEL
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisSALogLevel}
							background="gray5"
							selectName="zimbraAmavisSALogLevel"
							onChange={onAmavisSALogLevelChange}
							onChangeReset={(): void => setEmptyValue('zimbraAmavisSALogLevel')}
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
						<InheritedSelect
							label={t(
								'mta.smtp_client_logging_of_tls_activity',
								'SMTP client logging of TLS Activity'
							)}
							items={zimbraMtaSmtpdLoglevelOptions}
							subValue={mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaSmtpdTlsLoglevel}
							background="gray5"
							selectName="zimbraMtaSmtpdTlsLoglevel"
							onChange={onSMTPClientLogLevelChange}
							onChangeReset={(): void => setEmptyValue('zimbraMtaSmtpdTlsLoglevel')}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<InheritedSelect
							label={t(
								'mta.lmtp_client_logging_of_tls_activity',
								'LMTP client logging of TLS activity'
							)}
							items={zimbraMtaLmtpTlsLoglevelOptions}
							subValue={mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel}
							inheritedValue={
								configInformation?.find(
									(item: Record<string, string>) => item?.n === ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL
								)?._content
							}
							fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaLmtpTlsLoglevel}
							background="gray5"
							selectName="zimbraMtaLmtpTlsLoglevel"
							onChange={onLMTPTlsLogLevelChange}
							onChangeReset={(): void => setEmptyValue('zimbraMtaLmtpTlsLoglevel')}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};
export default MTAServerGeneral;
