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
	Padding,
	Button,
	Divider,
	Switch,
	Select,
	Input,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { find, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MtaAdvanced } from '../../../../types';
import {
	CONFIG,
	ZIMBRA_AMAVIS_LOG_LEVEL,
	ZIMBRA_AMAVIS_SA_LOG_LEVEL,
	ZIMBRA_CLAM_AV_MAX_THREADS,
	ZIMBRA_LMTP_NUM_THREADS,
	ZIMBRA_MILTER_MAX_CONNECTIONS,
	ZIMBRA_MITER_NUM_THREADS,
	ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
	ZIMBRA_MTA_MESSAGE_SIZE,
	ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
	ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
	ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
	ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { useConfigStore } from '../../../store/config/store';
import { Right, Rights, useRightsStore } from '../../../store/rights/store';
import ListRow from '../../list/list-row';
import { isValidProxy } from '../../utility/utils';

const MTAAdvanced: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);

	const [mtaAdvancedInitialDetail, setMtaAdvancedInitialDetail] = useState<MtaAdvanced>();
	const [mtaAdvancedDetail, setMtaAdvancedDetail] = useState<MtaAdvanced>();

	const [isErrorInSmtpdProxy, setIsErrorInSmtpdProxy] = useState<boolean>(false);

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaAdvancedInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaAdvancedDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const rights: Rights = useRightsStore((state) => state.rights);

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

	const setAdavanceLogAndThread = useCallback(() => {
		const zimbraMtaSmtpdClientPortLogging = configInformation.filter(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING
		);

		if (zimbraMtaSmtpdClientPortLogging && zimbraMtaSmtpdClientPortLogging[0]?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
				zimbraMtaSmtpdClientPortLogging[0]?._content === 'yes'
			);
		}

		const zimbraAmavisLogLevel = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_LOG_LEVEL
		);

		if (zimbraAmavisLogLevel && zimbraAmavisLogLevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_AMAVIS_LOG_LEVEL, zimbraAmavisLogLevel?._content);
		}

		const zimbraAmavisSALogLevel = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_SA_LOG_LEVEL
		);

		if (zimbraAmavisSALogLevel && zimbraAmavisSALogLevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_AMAVIS_SA_LOG_LEVEL, zimbraAmavisSALogLevel?._content);
		}

		const zimbraMtaSmtpdTlsLoglevel = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL
		);

		if (zimbraMtaSmtpdTlsLoglevel && zimbraMtaSmtpdTlsLoglevel?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
				zimbraMtaSmtpdTlsLoglevel?._content
			);
		}

		const zimbraMtaLmtpTlsLoglevel = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL
		);

		if (zimbraMtaLmtpTlsLoglevel && zimbraMtaLmtpTlsLoglevel?._content) {
			setInitialAndCurrentValue(ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL, zimbraMtaLmtpTlsLoglevel?._content);
		}

		const zimbraClamAVMaxThreads = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_CLAM_AV_MAX_THREADS
		);

		if (zimbraClamAVMaxThreads && zimbraClamAVMaxThreads?._content) {
			setInitialAndCurrentValue(ZIMBRA_CLAM_AV_MAX_THREADS, zimbraClamAVMaxThreads?._content);
		}

		const zimbraMilterNumThreads = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MITER_NUM_THREADS
		);

		if (zimbraMilterNumThreads && zimbraMilterNumThreads?._content) {
			setInitialAndCurrentValue(ZIMBRA_MITER_NUM_THREADS, zimbraMilterNumThreads?._content);
		}
	}, [configInformation, setInitialAndCurrentValue]);

	const setSMTPDProxySetting = useCallback(() => {
		const zimbraMtaSmtpdSenderLoginMaps = configInformation.find(
			(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS
		);
		if (zimbraMtaSmtpdSenderLoginMaps && zimbraMtaSmtpdSenderLoginMaps?._content) {
			setInitialAndCurrentValue(
				ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
				zimbraMtaSmtpdSenderLoginMaps?._content
			);
		}
	}, [configInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			setAdavanceLogAndThread();
			const zimbraMtaMaxMessageSize = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MESSAGE_SIZE
			);

			const zimbraLmtpNumThreads = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_LMTP_NUM_THREADS
			);

			if (zimbraLmtpNumThreads && zimbraLmtpNumThreads?._content) {
				setInitialAndCurrentValue(ZIMBRA_LMTP_NUM_THREADS, zimbraLmtpNumThreads?._content);
			}
			if (zimbraMtaMaxMessageSize && zimbraMtaMaxMessageSize?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_MESSAGE_SIZE, zimbraMtaMaxMessageSize?._content);
			}

			const zimbraMilterMaxConnections = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MILTER_MAX_CONNECTIONS
			);

			if (zimbraMilterMaxConnections && zimbraMilterMaxConnections?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MILTER_MAX_CONNECTIONS,
					zimbraMilterMaxConnections?._content
				);
			}

			const zimbraMtaSmtpSaslAuthEnable = configInformation.filter(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE
			);
			if (zimbraMtaSmtpSaslAuthEnable && zimbraMtaSmtpSaslAuthEnable[0]?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
					zimbraMtaSmtpSaslAuthEnable[0]?._content === 'yes'
				);
			}
			setSMTPDProxySetting();
		}
	}, [configInformation, setInitialAndCurrentValue, setAdavanceLogAndThread, setSMTPDProxySetting]);

	useEffect(() => {
		if (mtaAdvancedDetail && !isEqual(mtaAdvancedDetail, mtaAdvancedInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaAdvancedDetail, mtaAdvancedInitialDetail]);

	const onAmavisLogLevelChange = useCallback(
		(v: any) => {
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

	const onCancel = useCallback(() => {
		setMtaAdvancedDetail(mtaAdvancedInitialDetail);
		setTimeout(() => {
			setIsDirty(false);
		}, 10);
	}, [mtaAdvancedInitialDetail]);

	const updateGlobalConfig = useCallback(
		(attributes: Array<Record<string, string>>): void => {
			attributes.forEach((ele: Record<string, string>) => {
				updateConfig(ele?.n, ele._content);
			});
			setTimeout(() => {
				if (attributes?.find((ele) => ele?.n === ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS)) {
					updateConfig(
						ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
						attributes?.find((ele) => ele?.n === ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS)?._content
					);
				}
			}, 10);
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

	const onSave = useCallback(() => {
		const attributes: Array<Record<string, string>> = [];
		attributes.push({
			n: ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
			_content: mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging ? 'yes' : 'no'
		});
		if (mtaAdvancedDetail?.zimbraAmavisLogLevel) {
			attributes.push({
				n: ZIMBRA_AMAVIS_LOG_LEVEL,
				_content: mtaAdvancedDetail?.zimbraAmavisLogLevel
			});
		}
		if (mtaAdvancedDetail?.zimbraAmavisSALogLevel) {
			attributes.push({
				n: ZIMBRA_AMAVIS_SA_LOG_LEVEL,
				_content: mtaAdvancedDetail?.zimbraAmavisSALogLevel
			});
		}
		if (mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel) {
			attributes.push({
				n: ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
				_content: mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel
			});
		}
		if (mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel) {
			attributes.push({
				n: ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
				_content: mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel
			});
		}
		if (mtaAdvancedDetail?.zimbraClamAVMaxThreads) {
			attributes.push({
				n: ZIMBRA_CLAM_AV_MAX_THREADS,
				_content: mtaAdvancedDetail?.zimbraClamAVMaxThreads
			});
		}
		if (mtaAdvancedDetail?.zimbraLmtpNumThreads) {
			attributes.push({
				n: ZIMBRA_LMTP_NUM_THREADS,
				_content: mtaAdvancedDetail?.zimbraLmtpNumThreads
			});
		}
		if (mtaAdvancedDetail?.zimbraMilterNumThreads) {
			attributes.push({
				n: ZIMBRA_MITER_NUM_THREADS,
				_content: mtaAdvancedDetail?.zimbraMilterNumThreads
			});
		}
		if (mtaAdvancedDetail?.zimbraMtaMaxMessageSize) {
			attributes.push({
				n: ZIMBRA_MTA_MESSAGE_SIZE,
				_content: mtaAdvancedDetail?.zimbraMtaMaxMessageSize
			});
		}
		if (mtaAdvancedDetail?.zimbraMilterMaxConnections) {
			attributes.push({
				n: ZIMBRA_MILTER_MAX_CONNECTIONS,
				_content: mtaAdvancedDetail?.zimbraMilterMaxConnections
			});
		}

		attributes.push({
			n: ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
			_content: mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable ? 'yes' : 'no'
		});

		attributes.push({
			n: ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
			_content: mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps
				? mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps
				: ''
		});
		if (isErrorInSmtpdProxy) {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: t('mta.smtpd_not_valid_error', 'Smtpd sender login maps is not valid'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		modifyConfigRequest(attributes);
	}, [
		mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging,
		mtaAdvancedDetail?.zimbraAmavisLogLevel,
		mtaAdvancedDetail?.zimbraAmavisSALogLevel,
		mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel,
		mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel,
		mtaAdvancedDetail?.zimbraClamAVMaxThreads,
		mtaAdvancedDetail?.zimbraLmtpNumThreads,
		mtaAdvancedDetail?.zimbraMilterNumThreads,
		mtaAdvancedDetail?.zimbraMtaMaxMessageSize,
		mtaAdvancedDetail?.zimbraMilterMaxConnections,
		mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable,
		mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps,
		isErrorInSmtpdProxy,
		modifyConfigRequest,
		createSnackbar,
		t
	]);

	const onSenderLoginMapsChange = useCallback(
		(e) => {
			const { value } = e.target;
			if (!isValidProxy(value)) {
				setIsErrorInSmtpdProxy(true);
			} else {
				setIsErrorInSmtpdProxy(false);
			}
			setValue(ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS, value);
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
				height="56px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('label.advanced', 'Advanced')}
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
				<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.logging', 'Logging')}
					</Text>
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'large', bottom: 'extralarge' }}
				>
					<Switch
						label={t(
							'mta.enable_logging_of_remote_smtp_client_port',
							'Enable logging of the remote SMTP client port'
						)}
						value={mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging}
						onClick={(): void =>
							setValue(
								ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
								!mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging
							)
						}
						disabled={!allowSetMTA}
					/>
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
										item.value === mtaAdvancedDetail?.zimbraAmavisLogLevel
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
									item.value === mtaAdvancedDetail?.zimbraAmavisSALogLevel
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
									item.value === mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel
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
									item.value === mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel
							)}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							onChange={onLMTPTlsLogLevelChange}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>
				<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.tuning', 'Tuning')}
					</Text>
				</Container>

				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ bottom: 'extralarge', top: 'large' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Input
							label={t('mta.max_antivirus_threads', 'Max antivirus threads (value)')}
							backgroundColor="gray5"
							value={mtaAdvancedDetail?.zimbraClamAVMaxThreads}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_CLAM_AV_MAX_THREADS, e.target.value);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<Input
							label={t('mta.lmtp_threads', 'LMTP threads (Value)')}
							backgroundColor="gray5"
							value={mtaAdvancedDetail?.zimbraLmtpNumThreads}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_LMTP_NUM_THREADS, e.target.value);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>
					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<Input
							label={t('mta.milter_threads', 'MILTER threads (value)')}
							backgroundColor="gray5"
							value={mtaAdvancedDetail?.zimbraMilterNumThreads}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MITER_NUM_THREADS, e.target.value);
							}}
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
					width="100%"
				>
					<Container crossAlignment="flex-start">
						<Input
							label={t(
								'mta.max_size__for_mail_messages',
								'Max size for mail messages (MB, 0 = "no limit")'
							)}
							backgroundColor="gray5"
							value={mtaAdvancedDetail?.zimbraMtaMaxMessageSize}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_MESSAGE_SIZE, e.target.value);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>

					<Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
						<Input
							label={t(
								'mta.reject_concurrent_milter_connection_above',
								'Reject concurrent MILTER connections above (value)'
							)}
							backgroundColor="gray5"
							value={mtaAdvancedDetail?.zimbraMilterMaxConnections}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MILTER_MAX_CONNECTIONS, e.target.value);
							}}
							disabled={!allowSetMTA}
						/>
					</Container>
				</Container>

				<Container crossAlignment="flex-start" padding={{ bottom: 'large' }}>
					<Input
						label={t('mta.smtpd_sender_login_maps', 'Smtpd sender login maps')}
						backgroundColor="gray5"
						value={mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps}
						onChange={onSenderLoginMapsChange}
						disabled={!allowSetMTA}
						hasError={isErrorInSmtpdProxy}
					/>
				</Container>

				<Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
					<Switch
						label={t(
							'mta.enable_simple_authentication_and_security_layer',
							'Enable simple authentication and security layer'
						)}
						value={!!mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable}
						onClick={(): void =>
							setValue(
								ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
								!mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable
							)
						}
						disabled={!allowSetMTA}
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAAdvanced;
