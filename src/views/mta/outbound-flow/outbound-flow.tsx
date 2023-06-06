/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Padding,
	Button,
	Divider,
	Select,
	Switch,
	SnackbarManagerContext,
	Input,
	Table,
	Tooltip
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import ListRow from '../../list/list-row';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import { useConfigStore } from '../../../store/config/store';
import { MtaOutboundFlow, TRow } from '../../../../types';
import {
	ANTISPAM,
	ANTIVIRUS,
	FALSE,
	OPENDKIM,
	TRUE,
	ZIMBRA_MTA_FALLBACK_RELAY_HOST,
	ZIMBRA_MTA_MY_HOSTNAME,
	ZIMBRA_MTA_MY_NETWORKS,
	ZIMBRA_MTA_MY_ORIGIN,
	ZIMBRA_MTA_RELAY_HOST,
	ZIMBRA_MTA_SASL_AUTH_ENABLED,
	ZIMBRA_MTA_SMTP_HELLO_NAME,
	ZIMBRA_MTA_TLS_SECURITY_LEVEL,
	ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
	ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { getAllServers } from '../../../services/get-all-servers-service';
import { useServerStore } from '../../../store/server/store';

const MTAOutBoundFlow: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const configInformation = useConfigStore((state) => state.config);
	const updateConfig = useConfigStore((state) => state.updateConfig);
	const allServersList = useServerStore((state) => state.serverList);
	const setServerList = useServerStore((state) => state.setServerList);
	const [instancesTableRows, setInstancesTableRows] = useState<Array<TRow>>([]);

	const [mtaOutboundFlowInitialDetail, setMtaOutboundFlowInitialDetail] =
		useState<MtaOutboundFlow>();
	const [mtaOutboundDetail, setMtaOutboundDetail] = useState<MtaOutboundFlow>();

	const setInitialValue = useCallback((key: string, value: unknown): void => {
		setMtaOutboundFlowInitialDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setValue = useCallback((key: string, value: unknown): void => {
		setMtaOutboundDetail((prev: any) => ({ ...prev, [key]: value }));
	}, []);

	const setInitialAndCurrentValue = useCallback(
		(key, value) => {
			setInitialValue(key, value);
			setValue(key, value);
		},
		[setInitialValue, setValue]
	);

	const getAllServersRequest = useCallback(() => {
		getAllServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setServerList(server);
			}
		});
	}, [setServerList]);

	useEffect(() => {
		getAllServersRequest();
	}, [getAllServersRequest]);

	useEffect(() => {
		if (allServersList && allServersList.length > 0) {
			const tableRow: Array<TRow> = [];
			allServersList.forEach((server: Record<string, unknown>) => {
				if (server && server?.a && Array.isArray(server?.a) && server?.a.length > 0) {
					const serviceEnabled = server?.a.filter(
						(item: Record<string, unknown>) => item?.n === 'zimbraServiceEnabled'
					);
					const zimbraMtaAuthEnabled = server?.a.find(
						(item: Record<string, unknown>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
					);
					let antivirus = [];
					let antispam = [];
					let opendkim = [];
					if (serviceEnabled && serviceEnabled.length > 0) {
						antivirus = serviceEnabled.filter(
							(item: Record<string, unknown>) => item?._content === ANTIVIRUS
						);
						antispam = serviceEnabled.filter(
							(item: Record<string, unknown>) => item?._content === ANTISPAM
						);
						opendkim = serviceEnabled.filter(
							(item: Record<string, unknown>) => item?._content === OPENDKIM
						);
					}
					let isAuthEnable = t('label.disabled', 'Disabled');
					if (
						zimbraMtaAuthEnabled &&
						zimbraMtaAuthEnabled._content &&
						zimbraMtaAuthEnabled._content === 'yes'
					) {
						isAuthEnable = t('label.enabled', 'Enabled');
					}
					tableRow.push({
						id: server?.id,
						columns: [
							<Text size="medium" weight="light" key={server?.name} color="gray0">
								{server?.name}
							</Text>,
							<Text size="medium" weight="light" key={server?.name} color="gray0">
								{antispam && antispam.length > 0
									? t('label.active', 'Active')
									: t('label.inactive', 'Inactive')}
							</Text>,
							<Text size="medium" weight="light" key={server?.name} color="gray0">
								{antivirus && antivirus.length > 0
									? t('label.active', 'Active')
									: t('label.inactive', 'Inactive')}
							</Text>,
							<Text size="medium" weight="light" key={server?.name} color="gray0">
								{isAuthEnable}
							</Text>,
							<Text size="medium" weight="light" key={server?.name} color="gray0">
								{opendkim && opendkim.length > 0
									? t('label.enabled', 'Enabled')
									: t('label.disabled', 'Disabled')}
							</Text>
						]
					});
				}
				setInstancesTableRows(tableRow);
			});
		}
	}, [allServersList, t]);

	useEffect(() => {
		if (configInformation && configInformation.length > 0) {
			const originatingIp = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP
			);
			if (originatingIp && originatingIp?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
					originatingIp?._content === TRUE
				);
			}
			const authenticatedUser = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER
			);
			if (authenticatedUser && authenticatedUser?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
					authenticatedUser?._content === TRUE
				);
			}
			const mtaAuthEnabled = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED
			);

			if (mtaAuthEnabled && mtaAuthEnabled?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_SASL_AUTH_ENABLED, mtaAuthEnabled?._content);
			}
			const zimbraMtaMyNetworks = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_NETWORKS
			);
			if (zimbraMtaMyNetworks && zimbraMtaMyNetworks?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_MY_NETWORKS, zimbraMtaMyNetworks?._content);
			}

			const smtpHelloName = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTP_HELLO_NAME
			);
			if (smtpHelloName && smtpHelloName?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_SMTP_HELLO_NAME, smtpHelloName?._content);
			}

			const mtaMyHostname = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_HOSTNAME
			);
			if (mtaMyHostname && mtaMyHostname?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_MY_HOSTNAME, mtaMyHostname?._content);
			}

			const mtaFallBackRelayHost = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST
			);
			if (mtaFallBackRelayHost && mtaFallBackRelayHost?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, mtaFallBackRelayHost?._content);
			}

			const mtaMyOrigin = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_MY_ORIGIN
			);
			if (mtaMyOrigin && mtaMyOrigin?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_MY_ORIGIN, mtaMyOrigin?._content);
			}

			const mtaRelayHost = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST
			);
			if (mtaRelayHost && mtaRelayHost?._content) {
				setInitialAndCurrentValue(ZIMBRA_MTA_RELAY_HOST, mtaRelayHost?._content);
			}

			const zimbraMtaTlsSecurityLevel = configInformation.find(
				(item: Record<string, string>) => item?.n === ZIMBRA_MTA_TLS_SECURITY_LEVEL
			);
			if (zimbraMtaTlsSecurityLevel && zimbraMtaTlsSecurityLevel?._content) {
				setInitialAndCurrentValue(
					ZIMBRA_MTA_TLS_SECURITY_LEVEL,
					zimbraMtaTlsSecurityLevel?._content
				);
			}
		}
	}, [configInformation, setInitialAndCurrentValue]);

	useEffect(() => {
		if (mtaOutboundDetail && !isEqual(mtaOutboundDetail, mtaOutboundFlowInitialDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [mtaOutboundDetail, mtaOutboundFlowInitialDetail]);

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
				.then((data) => {
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
			n: ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
			_content: mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP ? TRUE : FALSE
		});
		attributes.push({
			n: ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
			_content: mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser ? TRUE : FALSE
		});
		if (mtaOutboundDetail?.zimbraMtaSaslAuthEnable) {
			attributes.push({
				n: ZIMBRA_MTA_SASL_AUTH_ENABLED,
				_content: mtaOutboundDetail?.zimbraMtaSaslAuthEnable
			});
		}

		attributes.push({
			n: ZIMBRA_MTA_MY_NETWORKS,
			_content: mtaOutboundDetail?.zimbraMtaMyNetworks || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_SMTP_HELLO_NAME,
			_content: mtaOutboundDetail?.zimbraMtaSmtpHeloName || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_MY_HOSTNAME,
			_content: mtaOutboundDetail?.zimbraMtaMyHostname || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_FALLBACK_RELAY_HOST,
			_content: mtaOutboundDetail?.zimbraMtaFallbackRelayHost || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_RELAY_HOST,
			_content: mtaOutboundDetail?.zimbraMtaRelayHost || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_MY_ORIGIN,
			_content: mtaOutboundDetail?.zimbraMtaMyOrigin || ''
		});
		attributes.push({
			n: ZIMBRA_MTA_TLS_SECURITY_LEVEL,
			_content: mtaOutboundDetail?.zimbraMtaTlsSecurityLevel || ''
		});
		modifyConfigRequest(attributes);
	}, [mtaOutboundDetail, modifyConfigRequest]);

	const onCancel = useCallback(() => {
		setMtaOutboundDetail(mtaOutboundFlowInitialDetail);
		setValue(
			ZIMBRA_MTA_MY_NETWORKS,
			mtaOutboundFlowInitialDetail?.zimbraMtaMyNetworks
				? mtaOutboundFlowInitialDetail?.zimbraMtaMyNetworks
				: ''
		);
		setValue(
			ZIMBRA_MTA_SMTP_HELLO_NAME,
			mtaOutboundFlowInitialDetail?.zimbraMtaSmtpHeloName
				? mtaOutboundFlowInitialDetail?.zimbraMtaSmtpHeloName
				: ''
		);
		setValue(
			ZIMBRA_MTA_MY_HOSTNAME,
			mtaOutboundFlowInitialDetail?.zimbraMtaMyHostname
				? mtaOutboundFlowInitialDetail?.zimbraMtaMyNetworks
				: ''
		);
		setValue(
			ZIMBRA_MTA_FALLBACK_RELAY_HOST,
			mtaOutboundFlowInitialDetail?.zimbraMtaFallbackRelayHost
				? mtaOutboundFlowInitialDetail?.zimbraMtaFallbackRelayHost
				: ''
		);
		setValue(
			ZIMBRA_MTA_RELAY_HOST,
			mtaOutboundFlowInitialDetail?.zimbraMtaRelayHost
				? mtaOutboundFlowInitialDetail?.zimbraMtaRelayHost
				: ''
		);
		setValue(
			ZIMBRA_MTA_MY_ORIGIN,
			mtaOutboundFlowInitialDetail?.zimbraMtaMyOrigin
				? mtaOutboundFlowInitialDetail?.zimbraMtaMyOrigin
				: ''
		);
		setTimeout(() => {
			setIsDirty(false);
		}, 10);
	}, [mtaOutboundFlowInitialDetail, setValue]);

	const instanceTableHeader = useMemo(
		() => [
			{
				id: 'servername',
				label: t('mta.server_name', 'Server Name'),
				width: '30%',
				bold: true
			},
			{
				id: 'antispam',
				label: t('mta.antispam', 'Antispam'),
				width: '20%',
				bold: true
			},
			{
				id: 'antivirus',
				label: t('mta.antivirus', 'Antivirus'),
				width: '15%',
				bold: true
			},
			{
				id: 'authentication',
				label: t('mta.authentication', 'Authentication'),
				width: '20%',
				bold: true
			},
			{
				id: 'dkim',
				label: t('mta.dkim', 'DKIM'),
				width: '15%',
				bold: true
			}
		],
		[t]
	);

	const tlsSecurityOptions = useMemo(
		() => [
			{
				label: t('mta.may', 'May'),
				value: 'may'
			},
			{
				label: t('mta.none', 'None'),
				value: 'none'
			}
		],
		[t]
	);

	const onTlsSecurityOptions = useCallback(
		(v: string) => {
			setValue(ZIMBRA_MTA_TLS_SECURITY_LEVEL, v);
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
						{t('mta.outbound_flow', 'Outbound Flow')}
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
										height={36}
										onClick={onCancel}
									/>
								)}
							</Padding>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										height={36}
										onClick={onSave}
									/>
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
						{t('label.general_lbl', 'General')}
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
								'mta.include_originating_ip_address_in_smtp_header_outgoing_emails',
								'Include the originating IP address in the SMTP headers of outgoing emails'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.add_client_ip_to_header', 'Add client IP to the header')}
								value={mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP}
								onClick={(): void =>
									setValue(
										ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
										!mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP
									)
								}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Tooltip
							placement="bottom"
							label={t(
								'mta.include_authenticated_user_information_in_smtp_header_for_outgoing_emails',
								'Include the authenticated user information in the SMTP headers of outgoing emails'
							)}
							maxWidth="auto"
						>
							<Switch
								label={t('mta.add_username_to_header', 'Add username to the header')}
								value={mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser}
								onClick={(): void =>
									setValue(
										ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
										!mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser
									)
								}
							/>
						</Tooltip>
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
								value={mtaOutboundDetail?.zimbraMtaSaslAuthEnable === 'yes'}
								onClick={(): void =>
									setValue(
										ZIMBRA_MTA_SASL_AUTH_ENABLED,
										mtaOutboundDetail?.zimbraMtaSaslAuthEnable === 'yes' ? 'no' : 'yes'
									)
								}
							/>
						</Tooltip>
					</Container>
					<Container crossAlignment="flex-start">
						<Select
							items={tlsSecurityOptions}
							background="gray5"
							label={t('mta.tls_security_level', 'TLS Security Level')}
							showCheckbox={false}
							selection={tlsSecurityOptions.find(
								(item: Record<string, string>) =>
									item.value === mtaOutboundDetail?.zimbraMtaTlsSecurityLevel
							)}
							onChange={onTlsSecurityOptions}
						/>
					</Container>
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="auto"
					padding={{ top: 'large' }}
				>
					<Input
						label={t('mta.my_netword', 'MyNetwork')}
						value={mtaOutboundDetail?.zimbraMtaMyNetworks}
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							setValue(ZIMBRA_MTA_MY_NETWORKS, e.target.value);
						}}
					/>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large' }}
					height="auto"
				>
					<Container padding={{ right: 'medium' }}>
						<Input
							label={t('mta.smtp_helo_name', 'SMTP Helo Name')}
							value={mtaOutboundDetail?.zimbraMtaSmtpHeloName}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_SMTP_HELLO_NAME, e.target.value);
							}}
						/>
					</Container>
					<Container>
						<Input
							label={t('mta.my_hostname', 'My Hostname')}
							value={mtaOutboundDetail?.zimbraMtaMyHostname}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_MY_HOSTNAME, e.target.value);
							}}
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
					<Container padding={{ right: 'medium' }}>
						<Input
							label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
							value={mtaOutboundDetail?.zimbraMtaFallbackRelayHost}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, e.target.value);
							}}
						/>
					</Container>
					<Container>
						<Input
							label={t('mta.relay_host', 'Relay Host')}
							value={mtaOutboundDetail?.zimbraMtaRelayHost}
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setValue(ZIMBRA_MTA_RELAY_HOST, e.target.value);
							}}
						/>
					</Container>
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="auto"
					padding={{ top: 'large' }}
				>
					<Input
						label={t('mta.my_origin', 'My Origin')}
						value={mtaOutboundDetail?.zimbraMtaMyOrigin}
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							setValue(ZIMBRA_MTA_MY_ORIGIN, e.target.value);
						}}
					/>
				</Container>
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="auto"
					padding={{ top: 'extralarge', bottom: 'extralarge' }}
				>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.instances', 'Instances')}
					</Text>
				</Container>
				<ListRow>
					<Container
						padding={{
							top: 'small',
							bottom: 'small'
						}}
						mainAlignment="flex-start"
					>
						<Table
							rows={instancesTableRows}
							headers={instanceTableHeader}
							showCheckbox={false}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};
export default MTAOutBoundFlow;
