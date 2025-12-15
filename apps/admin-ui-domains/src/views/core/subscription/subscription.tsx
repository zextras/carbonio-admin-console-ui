/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	useCurrentUserRights,
	useActivateLicense,
	useLicenseInfo,
	useRemoveLicense,
	useVersion
} from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Container,
	Divider,
	Row,
	Text,
	Input,
	Modal,
	Quota,
	Tooltip
} from '@zextras/carbonio-design-system';
import { format } from 'date-fns';
import { find } from 'lodash';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CONFIG } from '../../../constants';
import { LicenseBanner } from '../../dashboard/license-banner';

import { ServiceStatus } from './service-status';

type Module = {
	value: string;
	label: string;
};
type ModuleName = {
	[key: string]: Module;
};

type ModuleConfig = {
	name: string;
	quantity: string;
	enabled: boolean;
};

export type AllModuleConfig = {
	name: Module;
	quantity: string;
	enabled: boolean;
};

const DATE_FORMAT = 'dd MMM yyyy';

const moduleName: ModuleName = {
	backup_realtime: { value: 'Realtime', label: 'Backup' },
	chats_recording: { value: 'Video recording', label: 'Chats' },
	files_basic: { value: 'Basics', label: 'Files' },
	admins_basic: { value: 'Delegated Administration', label: 'Admin' },
	storages_basic: { value: 'Basic', label: 'Storages' },
	appmail_basic: { value: 'Basic', label: 'MailApp' },
	backup_basic: { value: 'Basic', label: 'Backup' },
	mail_replica: { value: '', label: 'MailReplica' },
	storages_conn_basic: { value: 'S3 Connectors', label: 'Storages' },
	storages_centralized: { value: 'Centralized Volumes', label: 'Storages' },
	appmail_advanced: { value: 'Advanced', label: 'MailApp' },
	activesync_shared_folder: { value: 'Shared Folder', label: 'ActiveSync' },
	chats_basic: { value: 'Basic', label: 'Chats' },
	auth_2fa: { value: '2FA and Policies', label: 'Auth' },
	storages_hsm: { value: 'HSM', label: 'Storages' },
	chats_rooms: { value: 'Meeting Rooms', label: 'Chats' },
	files_docs_balancing: { value: 'Docs Connector', label: 'Files' },
	auth_saml: { value: 'SAML', label: 'Auth' },
	backup_ext_volume: { value: 'Export on External', label: 'Backup' },
	storages_conn_sproxyd: { value: 'Scality SproxyD Connector', label: 'Storages' },
	activesync_basic: { value: '', label: 'ActiveSync' },
	backup_import_external: { value: 'Import External', label: 'Backup' },
	wsc_basic: { value: 'WSC Chat', label: 'Chats' }
};

const getGapColorForLabel = (label: React.Key | null | undefined): string => {
	switch (label) {
		case 'Storages':
			return '#EF9A9A1A';
		case 'HA':
			return 'transparent';
		case 'Backup':
			return '#CE93D81A';
		case 'Auth':
			return '#F48FB11A';
		case 'MailApp':
			return '#B39DDB1A';
		case 'Files':
			return '#A5D6A71A';
		case 'ActiveSync':
			return '#80DEEA1A';
		case 'Chats':
			return '#90CAF91A';
		default:
			return 'transparent';
	}
};

export const Subscription = (): React.JSX.Element => {
	const [open, setOpen] = useState(false);

	const { data: version } = useVersion();
	const { data: licenseData } = useLicenseInfo();
	const [licenseKey, setLicenseKey] = useState(licenseData?.response?.authenticationToken ?? '');
	const { data: rights } = useCurrentUserRights();
	const { t } = useTranslation();

	const activateLicenseMutation = useActivateLicense();

	const removeLicenseMutation = useRemoveLicense();
	const allowSetSubsciption = useMemo(() => {
		const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const services = useMemo(() => {
		if (!licenseData) return null;
		return licenseData;
	}, [licenseData]);

	const modules: Array<AllModuleConfig> = useMemo(() => {
		if (!licenseData?.response?.features) return [];

		const featurs = licenseData.response.features;
		const allModules = featurs.map((module: ModuleConfig) => ({
			...module,
			name: moduleName[module.name]
		}));

		const formatModules = allModules.filter((module: AllModuleConfig) => module.name !== undefined);
		const predefinedOrder = [
			'Storages',
			'HA',
			'Backup',
			'Auth',
			'MailApp',
			'Files',
			'ActiveSync',
			'Chats',
			'Admin'
		];

		const ModuleSort = (a: AllModuleConfig, b: AllModuleConfig): number => {
			const indexA = predefinedOrder.indexOf(a.name.label);
			const indexB = predefinedOrder.indexOf(b.name.label);

			if (indexA === -1 && indexB === -1) {
				return formatModules.indexOf(a) - formatModules.indexOf(b);
			}

			if (indexA === -1) return 1;
			if (indexB === -1) return -1;

			return indexA - indexB;
		};

		const sortedModules = [...formatModules].sort(ModuleSort);
		return sortedModules.filter((module: AllModuleConfig) => module.name.value !== 'SproxyD');
	}, [licenseData]);

	const activeLicence = (): void => {
		activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
	};

	const doRemoveLicense = (): void => {
		removeLicenseMutation.mutate(undefined, {
			onSuccess: () => {
				setOpen(false);
			}
		});
	};

	const renewLicence = (): void => {
		activateLicenseMutation.mutate({ token: licenseKey, renewal: true });
	};

	const calculatedAccountQuotaSizePercentage: number = useMemo(() => {
		const accountCount = services?.response?.accountCount ?? 0;
		const licensedUsers = services?.response?.licensedUsers ?? 0;

		if (licensedUsers === 0) {
			return 0;
		}

		return (accountCount / licensedUsers) * 100;
	}, [services]);

	const getTypeDisplayValue = (): string => {
		if (!services?.response) return '';
		const { type, subType } = services.response;

		if (type === 'Purchased') {
			if (subType === 'PERPETUAL' || subType === 'REGULAR') {
				return `${type} - ${subType}`;
			}
			return subType ?? '';
		}
		return type ?? '';
	};

	return (
		<Container maxWidth="100%" mainAlignment="flex-start" background="gray6">
			<LicenseBanner />
			<Container
				orientation="horizontal"
				mainAlignment="space-around"
				background="gray6"
				height="58px"
			>
				<Row
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width="100%"
					padding={{ all: 'large' }}
				>
					<Row mainAlignment="flex-start" crossAlignment="flex-start">
						<Text size="medium" weight="bold" color="gray0">
							{t('label.details', 'Details')}
						</Text>
					</Row>
				</Row>
			</Container>

			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				padding={{ all: 'large' }}
				orientation="column"
				crossAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 200px)"
			>
				<Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'large' }}>
					<Text weight="bold">{t('core.subscription.activation', 'Activation')}</Text>
				</Row>
				<Container
					orientation="horizontal"
					width="100%"
					height="fit"
					wrap="wrap"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					style={{ padding: '8px 0 16px 0' }}
				>
					<Container crossAlignment="flex-start" padding={{ right: 'medium' }} width="74%">
						<Input
							label={t('core.subscription.token', 'Token')}
							backgroundColor="gray5"
							value={licenseKey}
							disabled={!allowSetSubsciption}
							onChange={(e: any): void => setLicenseKey(e.target.value)}
						/>
					</Container>
					<Container
						crossAlignment="flex-start"
						orientation="horizontal"
						width="26%"
						style={{ gap: '0.875rem' }}
					>
						<Button
							label={
								!services?.response || services.response.expired
									? t('core.subscription.activate', 'Activate')
									: t('core.subscription.deactivate', 'Deactivate')
							}
							disabled={
								!allowSetSubsciption ||
								!licenseKey ||
								activateLicenseMutation.isPending ||
								removeLicenseMutation.isPending
							}
							type="outlined"
							color={!services?.response || services.response.expired ? 'primary' : 'error'}
							onClick={
								!services?.response || services.response.expired
									? (): void => activeLicence()
									: (): void => setOpen(true)
							}
							loading={
								activateLicenseMutation.isPending && !activateLicenseMutation.variables?.renewal
							}
							size="extralarge"
						/>
						<Button
							label={t('core.subscription.renew', 'Renew')}
							disabled={
								!allowSetSubsciption ||
								!licenseKey ||
								!services?.response ||
								activateLicenseMutation.isPending ||
								removeLicenseMutation.isPending
							}
							type="outlined"
							color="primary"
							onClick={(): void => renewLicence()}
							loading={
								activateLicenseMutation.isPending && !!activateLicenseMutation.variables?.renewal
							}
							size="extralarge"
						/>
					</Container>
				</Container>
				{services?.response && (
					<Container
						orientation="horizontal"
						width="100%"
						height="fit"
						wrap="wrap"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input
								label={t('core.subscription.company_name', 'Company Name')}
								value={services.response.endUser || ''}
							/>
						</Row>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input
								label={t('core.subscription.provider', 'Provider')}
								value={services.response.customer}
							/>
						</Row>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input label={t('core.subscription.type', 'Type')} value={getTypeDisplayValue()} />
						</Row>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input
								label={t('core.subscription.order_id', 'Order ID')}
								value={services.response?.infrastructureId ?? ''}
							/>
						</Row>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input
								label={t('core.subscription.date_start', 'Date Start')}
								value={
									services.response.dateStart
										? format(services.response.dateStart, DATE_FORMAT)
										: ''
								}
							/>
						</Row>
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input
								label={t('core.subscription.date_end', 'Date End')}
								value={
									services.response.notYetValid ||
									!services.response.authenticationToken ||
									!services.response.dateEnd
										? ''
										: format(services.response.dateEnd, DATE_FORMAT)
								}
							/>
						</Row>
						{services.response.maintenanceEndDate && (
							<Row
								width="99%"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'small', right: 'small' }}
							>
								<Input
									label={t('core.subscription.maintenance_end_date', 'Maintenance End Date')}
									value={format(services.response.maintenanceEndDate, DATE_FORMAT)}
								/>
							</Row>
						)}
						{services.response.type === 'ISP' && (
							<Row
								width="49.5%"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'small', right: 'small' }}
							>
								<Tooltip
									label={
										<Text style={{ whiteSpace: 'pre-line' }}>
											{t(
												'core.subscription.last_validation_check_tooltip',
												'This date represents the last day on which the license was validated by the Zextras Subscription Service.\n\nSince this is a Pay Per Use (PPU) subscription, the system automatically reports daily usage data to the Zextras Subscription Service. No user action is required as long as communication is functioning correctly. If the system is unable to contact the service, a 7-day grace period is applied. This grace period is automatically renewed each time the Zextras Subscription Service is successfully contacted.'
											)}
										</Text>
									}
								>
									<Input
										label={t('core.subscription.last_validation_check', 'Last Validation Check')}
										value={
											services.response.lastValidationCheck
												? format(services.response.lastValidationCheck, DATE_FORMAT)
												: ''
										}
									/>
								</Tooltip>
							</Row>
						)}
						{services.response.type === 'ISP' && (
							<Row
								width="49.5%"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'small', right: 'small' }}
							>
								<Tooltip
									label={
										<Text style={{ whiteSpace: 'pre-line' }}>
											{t(
												'core.subscription.next_validation_deadline_tooltip',
												'This date represents the last day the license will remain fully functional if usage data is not sent to the Zextras Subscription Service.\n\nSince this is a Pay Per Use (PPU) subscription, the system automatically reports daily usage data to the Zextras Subscription Service. No user action is required as long as communication is functioning correctly. If the system is unable to contact the service, a 7-day grace period is applied. This grace period is automatically renewed each time the Zextras Subscription Service is successfully contacted.'
											)}
										</Text>
									}
								>
									<Input
										label={t(
											'core.subscription.next_validation_deadline',
											'Next Validation Deadline'
										)}
										value={
											services.response.nextValidationDeadline
												? format(services.response.nextValidationDeadline, DATE_FORMAT)
												: ''
										}
									/>
								</Tooltip>
							</Row>
						)}
						<Row
							width="49.5%"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'small', right: 'small' }}
						>
							<Input label={t('core.subscription.version', 'Module Version')} value={version} />
						</Row>
						<Row
							width="49.5%"
							orientation="vertical"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'small', bottom: 'large', right: 'small' }}
							style={{ gap: '.5rem' }}
						>
							<Text size="small" color="#828282">
								{t('core.subscription.accounts', 'Accounts')}
							</Text>
							<Row
								orientation="vertical"
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								<Text size="small">{`${services.response.accountCount} / ${services.response.licensedUsers}`}</Text>
								<Quota
									fill={calculatedAccountQuotaSizePercentage}
									background="#F5F6F8"
									fillBackground="#2B73D2"
									style={{ borderRadius: '2px' }}
								/>
							</Row>
						</Row>
					</Container>
				)}
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ top: 'large', bottom: 'large', right: 'large' }}
				>
					<Text weight="bold">{t('core.subscription.modules', 'Modules')}</Text>
				</Row>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					wrap="wrap"
					height="fit"
				>
					{modules.map((module: AllModuleConfig, index: number) => (
						<>
							{index > 0 && (
								<Container
									style={{
										width: '2.25rem',
										height: '7.688rem',
										background:
											module.name.label !== modules[index - 1].name.label
												? 'transperent'
												: getGapColorForLabel(module.name.label)
									}}
								/>
							)}
							<ServiceStatus key={module.name.label} data={module} />
						</>
					))}
				</Container>
				<Divider style={{ marginBlockStart: '2rem' }} />
			</Container>
			<Modal
				title={t('core.subscription.modal.label', 'Deactivate Token')}
				open={open}
				onClose={(): void => setOpen(false)}
				customFooter={
					<>
						<Button
							label={t('core.subscription.modal.cancel', 'NO')}
							color="secondary"
							onClick={(): void => setOpen(false)}
						/>
						<Container width="0.5rem" />
						<Button
							color="error"
							label={t('core.subscription.modal.deactivate', 'Yes, Deactivate')}
							onClick={doRemoveLicense}
							loading={removeLicenseMutation.isPending}
						/>
					</>
				}
				showCloseIcon
			>
				<Text overflow="break-word">
					{t(
						'core.subscription.modal.warning',
						'You are trying to deactivate the current token.Doing so will disable all the enabled features.'
					)}
				</Text>

				<Text overflow="break-word">
					{t('core.subscription.modal.confirm', 'Are you sure you want to proceed?')}
				</Text>
			</Modal>
		</Container>
	);
};
