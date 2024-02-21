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
	Switch,
	Tooltip,
	ChipInput,
	Input,
	Select,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { find, isEqual, join, map, some, split, trim } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { IpRangeValue, MtaServerGeneral } from '../../../../../types';
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
	ZIMBRA_MTA_SASL_AUTH_ENABLED,
	ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
	ZIMBRA_MTA_TLS_SECURITY_LEVEL,
	ZIMBRA_SPAM_KILL_PERCENT,
	ZIMBRA_SPAM_TAG_PERCENT
} from '../../../../constants';
import { getServerInformationByName } from '../../../../services/get-server-information';
import { modifyServer } from '../../../../services/modify-server';
import { Right, Rights, useRightsStore } from '../../../../store/rights/store';
import { useServerStore } from '../../../../store/server/store';
import CustomChip from '../../../components/customChip';
import ListRow from '../../../list/list-row';
import { validateIpAddress } from '../../../utility/utils';

const MTAServerGeneral: FC = () => {
	const [t] = useTranslation();
	const { server }: { server: string } = useParams();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const rights: Rights = useRightsStore((state) => state.rights);
	const [serverAttributes, setServerAttributes] = useState<{ n: string; _content: string }[]>([]);
	const [mtaServerGeneralInitialDetail, setMtaServerGeneralInitialDetail] =
		useState<MtaServerGeneral>();
	const [mtaServerGeneralDetail, setMtaServerGeneralDetail] = useState<MtaServerGeneral>();
	const [networkValue, setNetworkValue] = useState<any>([]);
	const mtaServerList = useServerStore((state) => state.mtaServerList);

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

	const spamTagPercentOptions = useMemo(
		() => [
			{
				label: t('mta.low', 'Low'),
				value: '33'
			},
			{
				label: t('mta.medium', 'Medium'),
				value: '20'
			},
			{
				label: t('mta.high', 'High'),
				value: '16'
			}
		],
		[t]
	);

	const spamKillPercentOptions = useMemo(
		() => [
			{
				label: t('mta.low', 'Low'),
				value: '90'
			},
			{
				label: t('mta.medium', 'Medium'),
				value: '75'
			},
			{
				label: t('mta.high', 'High'),
				value: '66'
			}
		],
		[t]
	);

	const allowSetMTA = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (serverAttributes.length > 0) {
			const mtaAuthEnabled = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
			);
			if (mtaAuthEnabled && mtaAuthEnabled?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_SASL_AUTH_ENABLED, mtaAuthEnabled?._content);
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

			const mtaFallBackRelayHost = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST
			);
			if (mtaFallBackRelayHost && mtaFallBackRelayHost?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, mtaFallBackRelayHost?._content);
			}

			// const zimbraMtaTlsSecurityLevel = serverAttributes.find(
			// 	(item: Record<string, string>) => item?.n === ZIMBRA_MTA_TLS_SECURITY_LEVEL
			// );
			// if (zimbraMtaTlsSecurityLevel && zimbraMtaTlsSecurityLevel?._content) {
			// 	setInitialAndCurrentValue(
			// 		ZIMBRA_MTA_TLS_SECURITY_LEVEL,
			// 		zimbraMtaTlsSecurityLevel?._content
			// 	);
			// }

			const zimbraAmavisOriginatingBypassSA = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA
			);
			if (zimbraAmavisOriginatingBypassSA && zimbraAmavisOriginatingBypassSA?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
					zimbraAmavisOriginatingBypassSA?._content === TRUE
				);
			}

			const zimbraAmavisEnableDKIMVerification = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION
			);
			if (zimbraAmavisEnableDKIMVerification && zimbraAmavisEnableDKIMVerification?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
					zimbraAmavisEnableDKIMVerification?._content === TRUE
				);
			}

			const carbonioAmavisDisableVirusCheck = serverAttributes.find(
				(item: Record<string, string>) => item?.n === CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK
			);
			if (carbonioAmavisDisableVirusCheck && carbonioAmavisDisableVirusCheck?._content) {
				setInitialAndCurrentValue(
					CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
					carbonioAmavisDisableVirusCheck?._content === TRUE
				);
			}

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
				setInitialAndCurrentValue(
					ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
					zimbraMtaLmtpTlsLoglevel?._content
				);
			}

			const zimbraSpamTagPercent = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_TAG_PERCENT
			);

			if (zimbraSpamTagPercent && zimbraSpamTagPercent?._content) {
				setInitialAndCurrentValue(ZIMBRA_SPAM_TAG_PERCENT, zimbraSpamTagPercent?._content);
			}

			const zimbraSpamKillPercent = serverAttributes.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SPAM_KILL_PERCENT
			);

			if (zimbraSpamKillPercent && zimbraSpamKillPercent?._content) {
				setInitialAndCurrentValue(ZIMBRA_SPAM_KILL_PERCENT, zimbraSpamKillPercent?._content);
			}
		}
	}, [serverAttributes, setInitialAndCurrentValue]);

	useEffect(() => {
		getServerInformationByName(server).then((data) => {
			if (data && data?.server && Array.isArray(data?.server)) {
				const serverItem = data?.server[0];
				if (serverItem && serverItem?.a) {
					setServerAttributes(serverItem?.a);
				}
			}
		});
	}, [server]);

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
			const body: any = {
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
		[createSnackbar, mtaServerList, server, t]
	);

	const onSave = useCallback(() => {
		// eslint-disable-next-line sonarjs/no-unused-collection
		const attributes: Array<Record<string, string>> = [];
		attributes.push({
			n: CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
			_content: mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck ? TRUE : FALSE
		});
		attributes.push({
			n: ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
			_content: mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification ? TRUE : FALSE
		});
		if (mtaServerGeneralDetail?.zimbraAmavisLogLevel) {
			attributes.push({
				n: ZIMBRA_AMAVIS_LOG_LEVEL,
				_content: mtaServerGeneralDetail?.zimbraAmavisLogLevel
			});
		}
		attributes.push({
			n: ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
			_content: mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA ? TRUE : FALSE
		});
		if (mtaServerGeneralDetail?.zimbraAmavisSALogLevel) {
			attributes.push({
				n: ZIMBRA_AMAVIS_SA_LOG_LEVEL,
				_content: mtaServerGeneralDetail?.zimbraAmavisSALogLevel
			});
		}
		attributes.push({
			n: ZIMBRA_MTA_FALLBACK_RELAY_HOST,
			_content: mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost || ''
		});
		if (mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel) {
			attributes.push({
				n: ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
				_content: mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel
			});
		}
		attributes.push({
			n: ZIMBRA_MTA_MY_NETWORKS,
			_content: mtaServerGeneralDetail?.zimbraMtaMyNetworks || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_RELAY_HOST,
			_content: mtaServerGeneralDetail?.zimbraMtaRelayHost || ''
		});
		if (mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable) {
			attributes.push({
				n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
				_content: mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable
			});
		}
		if (mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel) {
			attributes.push({
				n: ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
				_content: mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel
			});
		}
		// if (mtaServerGeneralDetail?.zimbraSpamTagPercent) {
		// 	attributes.push({
		// 		n: ZIMBRA_SPAM_TAG_PERCENT,
		// 		_content: mtaServerGeneralDetail?.zimbraSpamTagPercent
		// 	});
		// }
		// if (mtaServerGeneralDetail?.zimbraSpamKillPercent) {
		// 	attributes.push({
		// 		n: ZIMBRA_SPAM_KILL_PERCENT,
		// 		_content: mtaServerGeneralDetail?.zimbraSpamKillPercent
		// 	});
		// }
		modifyServerRequest(attributes);
	}, [
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
			setValue(ZIMBRA_AMAVIS_LOG_LEVEL, v);
		},
		[setValue]
	);

	const onAmavisSALogLevelChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_AMAVIS_SA_LOG_LEVEL, v);
		},
		[setValue]
	);

	const onSMTPClientLogLevelChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL, v);
		},
		[setValue]
	);

	const onLMTPTlsLogLevelChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL, v);
		},
		[setValue]
	);

	const onBlockExtensionChange = useCallback(
		(ips) => {
			const data: any = [];
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[setValue]
	);

	const onTlsSecurityOptions = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_TLS_SECURITY_LEVEL, v);
		},
		[setValue]
	);

	const onSpamTagPercentChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_SPAM_TAG_PERCENT, v);
		},
		[setValue]
	);

	const onSpamKillPercentChange = useCallback(
		(v: string) => {
			setValue(ZIMBRA_SPAM_KILL_PERCENT, v);
		},
		[setValue]
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
							<Switch
								label={t('mta.enable_authentication', 'Enable Authentication')}
								value={mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable === 'yes'}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_SASL_AUTH_ENABLED,
										mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable === 'yes' ? 'no' : 'yes'
									)
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
						<Input
							label={t('mta.relay_host', 'Relay Host')}
							value={mtaServerGeneralDetail?.zimbraMtaRelayHost || ''}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (allowSetMTA) {
									setValue(ZIMBRA_MTA_RELAY_HOST, e.target.value);
								}
							}}
							backgroundColor="gray5"
						/>
					</Container>
					<Container padding={{ right: 'medium' }}>
						<Input
							label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
							value={mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost || ''}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								if (allowSetMTA) {
									setValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, e.target.value);
								}
							}}
							backgroundColor="gray5"
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
						<Select
							items={spamTagPercentOptions}
							background="gray5"
							label={t('mta.spam_to_junk_tolerance', 'Spam to Junk tolerance')}
							showCheckbox={false}
							selection={spamTagPercentOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaServerGeneralDetail?.zimbraSpamTagPercent
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onSpamTagPercentChange}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={spamKillPercentOptions}
							background="gray5"
							label={t('mta.block_spam_tolerance', 'Block Spam tolerance')}
							showCheckbox={false}
							selection={spamKillPercentOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaServerGeneralDetail?.zimbraSpamKillPercent
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onSpamKillPercentChange}
							disabled={!allowSetMTA}
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
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
						<Switch
							label={t('mta.also_check_outbound_messages', 'Also check outbound messages')}
							value={mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA}
							onClick={(): void =>
								setValue(
									ZIMBRA_AMAVIS_ORIGINATING_BYPASS_SA,
									!mtaServerGeneralDetail?.zimbraAmavisOriginatingBypassSA
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.verify_dkim_validity', 'Verify DKIM validity')}
							value={mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification}
							onClick={(): void =>
								setValue(
									ZIMBRA_AMAVIS_ENABLE_DKIM_VERIFICATION,
									!mtaServerGeneralDetail?.zimbraAmavisEnableDKIMVerification
								)
							}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.disable_virus_check', 'Disable Virus Check')}
							value={mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck}
							onClick={(): void =>
								setValue(
									CARBONIO_AMAVIS_DISABLE_VIRUS_CHECK,
									!mtaServerGeneralDetail?.carbonioAmavisDisableVirusCheck
								)
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
						<Select
							items={amavisLogLevelOptions}
							background="gray5"
							label={t('mta.log_level_for_amavis', 'Log level for Amavis')}
							showCheckbox={false}
							selection={
								amavisLogLevelOptions.find(
									(item: Record<string, string>) =>
										item.value === mtaServerGeneralDetail?.zimbraAmavisLogLevel
								) || amavisLogLevelOptions[0]
							}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onAmavisLogLevelChange}
							disabled={!allowSetMTA}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<Select
							items={amavisSALogLevelOptions}
							background="gray5"
							label={t('mta.sas_log_level_for_amavis', 'SAS Log level for Amavis')}
							showCheckbox={false}
							selection={amavisSALogLevelOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaServerGeneralDetail?.zimbraAmavisSALogLevel
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onAmavisSALogLevelChange}
							disabled={!allowSetMTA}
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
						<Select
							items={zimbraMtaSmtpdLoglevelOptions}
							background="gray5"
							label={t(
								'mta.smtp_client_logging_of_tls_activity',
								'SMTP client logging of TLS Activity'
							)}
							showCheckbox={false}
							selection={zimbraMtaSmtpdLoglevelOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onSMTPClientLogLevelChange}
							disabled={!allowSetMTA}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<Select
							items={zimbraMtaLmtpTlsLoglevelOptions}
							background="gray5"
							label={t(
								'mta.lmtp_client_logging_of_tls_activity',
								'LMTP client logging of TLS activity'
							)}
							showCheckbox={false}
							selection={zimbraMtaLmtpTlsLoglevelOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onLMTPTlsLogLevelChange}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};
export default MTAServerGeneral;
