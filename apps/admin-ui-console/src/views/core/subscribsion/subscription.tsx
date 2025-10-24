/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, FC, ReactElement, useEffect, useCallback, useMemo } from 'react';

import {
	Button,
	Container,
	Divider,
	Padding,
	Row,
	Text,
	Input,
	useSnackbar,
	Modal,
	Quota,
	Tooltip
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { find } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { CONFIG, ZIMBRA_ADMIN_URN } from '../../../constants';
import { fetchSoap } from '../../../services/subscription-service';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import { useModuleLicenseStore } from '../../../store/module-license/store';
import LicenseBanner from '../../dashboard/license-banner';

interface Module {
	value: string;
	label: string;
}
type ModuleName = {
	[key: string]: Module;
};

interface ModuleConfig {
	name: string;
	quantity: string;
	enabled: boolean;
}

type AllModuleConfig = {
	name: Module;
	quantity: string;
	enabled: boolean;
};

const DATE_FORMAT = 'DD MMM YYYY';

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

const ServiceStatus = ({
	data,
	licensed,
	t
}: {
	data: any;
	licensed: any;
	t: TFunction;
}): ReactElement => (
	<Row
		width="8rem"
		height="7.688rem"
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="stretch"
		borderRadius="regular"
		style={{
			padding: '0.75rem 0.75rem 0.75rem 0.5rem',
			background: '#FFF',
			boxShadow: `0rem 0rem 0.25rem 0rem rgba(166, 166, 166, 0.50)`,
			marginBottom: '2.25rem'
		}}
	>
		<Row
			orientation="vertical"
			crossAlignment="flex-end"
			mainAlignment="space-between"
			width="100%"
		>
			<Row orientation="vertical" crossAlignment="flex-start" width="100%" gap="0.25rem">
				<Row
					borderRadius="regular"
					style={{
						background: '#00506D'
					}}
					padding={{ horizontal: 'extrasmall' }}
				>
					<Text
						size="small"
						weight="bold"
						style={{
							color: '#FFF',
							lineHeight: '1.313rem'
						}}
					>
						{data?.name?.label}
					</Text>
				</Row>
				<Row>
					<Text size="extrasmall" weight="bold" style={{ whiteSpace: 'break-spaces' }}>
						{data?.name?.value}
					</Text>
				</Row>
			</Row>
			<Row orientation="vertical" crossAlignment="flex-end" width="100%" gap="1.938rem">
				<Text size="extrasmall" weight="regular" color={licensed ? 'text' : 'secondary'}>
					{/* eslint-disable-next-line no-nested-ternary */}
					{data?.quantity !== 'unlimited'
						? `${data?.quantity} users`
						: licensed
							? t('label.enabled', 'Enabled')
							: t('label.disabled', 'Disabled')}
				</Text>
			</Row>
		</Row>
	</Row>
);

// eslint-disable-next-line sonarjs/cognitive-complexity
const Subscription: FC = () => {
	const [services, setServices] = useState<any>({});
	const [modules, setModules]: any = useState([]);
	const [open, setOpen] = useState(false);
	const [disableActiveBtn, setDisableActiveBtn] = useState(false);
	const [showDisabledModules, setShowDisabledModules] = useState(false);
	const [version, setVersion] = useState();
	const [licenseKey, setLicenseKey] = useState(''); // 49b0cb0a-f381-4fc3-bb4e-8dda7e00b4a0
	const [isLoader, setIsLoader] = useState(false);
	const [isActivateLoading, setIsActivateLoading] = useState(false);
	const createSnackbar = useSnackbar();
	const rights: Rights = useRightsStore((state) => state.rights);
	const moduleLicenseInfo = useModuleLicenseStore((state) => state.licenseInfo);
	const [isLicenseBannerOpen, setIsLicenseBannerOpen] = useState<boolean>(
		moduleLicenseInfo?.maintenanceStatus !== "expired" ||
		moduleLicenseInfo?.maintenanceStatus !== "expiring"
	);

	const allowSetSubsciption = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const { t } = useTranslation();

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const formatAndSetModulesStats = (response: {
		response: { features: ModuleConfig[]; authenticationToken: React.SetStateAction<string> };
	}) => {
		const featurs: ModuleConfig[] = response?.response?.features;
		const allModules: AllModuleConfig[] = featurs.map((module: ModuleConfig) => ({
			...module,
			name: moduleName[module.name]
		}));

		const formatModules: AllModuleConfig[] = allModules.filter(
			(module: AllModuleConfig) => module.name !== undefined
		);
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

		const orderModules: AllModuleConfig[] = formatModules.sort(ModuleSort);
		const filterModules = orderModules.filter(
			(module: AllModuleConfig) => module.name.value !== 'SproxyD'
		);

		setServices(response);
		setModules(filterModules);
		setLicenseKey(response.response.authenticationToken);
	};

	const getLicence = useCallback(() => {
		fetchSoap('zextras', {
			// eslint-disable-next-line sonarjs/no-duplicate-string
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'getLicenseInfo'
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				if (response.response && response.response.type === 'None') {
					setServices({});
					setModules([]);
					setLicenseKey('');
					setVersion(undefined);
				} else {
					formatAndSetModulesStats(response);
				}
			}
		});
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'getVersion'
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				setVersion(response.response.version);
			}
		});
	}, []);

	useEffect(() => {
		getLicence();
	}, [getLicence]);

	const activeLicence = (): void => {
		setIsActivateLoading(true);
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'activate-license',
			token: licenseKey
		})
			.then((res) => {
				setIsActivateLoading(false);
				const response = JSON.parse(res.response.content);
				if (response.ok) {
					createSnackbar({
						key: '1',
						severity: 'success',
						label: response.message,
						replace: true
					});
					getLicence();
				} else {
					createSnackbar({
						key: '1',
						severity: 'error',
						label:
							response.message ||
							// eslint-disable-next-line sonarjs/no-duplicate-string
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						replace: true
					});
					if (response.response && response.response.type === 'None') {
						setServices({});
						setModules([]);
						setLicenseKey('');
						setVersion(undefined);
					} else {
						getLicence();
					}
				}
			})
			.catch(() => setIsActivateLoading(false));
	};

	const doRemoveLicense = (): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'doRemoveLicense',
			iamsure: true
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				createSnackbar({
					key: '1',
					severity: 'success',
					label:
						response.message ||
						t(
							'core.subscription.license_deactivated_successfully',
							'License deactivated successfully'
						),
					replace: true
				});
				setServices({});
				setModules([]);
				setLicenseKey('');
				setVersion(undefined);
			} else {
				createSnackbar({
					key: '1',
					severity: 'error',
					label:
						response.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					replace: true
				});
			}
			setOpen(false);
		});
	};

	const calculatedAccountQuotaSizePercentage: number = useMemo(() => {
		const accountCount = services.response?.accountCount;
		const licensedUsers = services.response?.licensedUsers;

		if (licensedUsers === 0) {
			// To avoid division by zero, handle this case appropriately
			return 0;
		}

		return (accountCount / licensedUsers) * 100;
	}, [services.response]);

	const getTypeDisplayValue = (): string => {
		const { type } = services.response;
		const { subType } = services.response;

		if (type === 'Purchased') {
			if (subType === 'PERPETUAL' || subType === 'REGULAR') {
				return `${type} - ${subType}`;
			}
			return subType ?? '';
		}
		return type ?? '';
	};

	const renewLicence = (): void => {
		setIsLoader(true);
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'activate-license',
			token: licenseKey,
			renewal: true
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				setIsLoader(false);
				createSnackbar({
					key: '1',
					severity: 'success',
					label: response.message,
					replace: true
				});
				getLicence();
			} else {
				setIsLoader(false);
				createSnackbar({
					key: '1',
					severity: 'error',
					label:
						response.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					replace: true
				});
				if (response.response && response.response.type === 'None') {
					setServices({});
					setModules([]);
					setLicenseKey('');
					setVersion(undefined);
				} else {
					getLicence();
				}
			}
		});
	};

	return (
		<Container maxWidth="100%" mainAlignment="flex-start" background="gray6">
			{
				isLicenseBannerOpen &&
				<LicenseBanner
					maintenanceEndDate={moduleLicenseInfo?.maintenanceEndDate}
					maintenanceStatus={moduleLicenseInfo?.maintenanceStatus}
					setLicenseBannerOpen={setIsLicenseBannerOpen}
				/>
			}
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
							disabled={!allowSetSubsciption || !licenseKey || isActivateLoading}
							type="outlined"
							color={!services?.response || services.response.expired ? 'primary' : 'error'}
							onClick={
								!services?.response || services.response.expired
									? (): void => activeLicence()
									: (): void => setOpen(true)
							}
							loading={isActivateLoading}
							size="extralarge"
						/>
						<Button
							label={t('core.subscription.renew', 'Renew')}
							disabled={!allowSetSubsciption || !licenseKey || !services?.response}
							type="outlined"
							color="primary"
							onClick={(): void => renewLicence()}
							loading={isLoader}
							size="extralarge"
						/>
					</Container>
				</Container>
				{services && services.response /* && showDisabledModules */ && (
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
										? moment(services.response.dateStart).format(DATE_FORMAT)
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
									services.response.notYetValid || !services.response.authenticationToken
										? ''
										: moment(services.response.dateEnd).format(DATE_FORMAT)
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
									value={moment(services.response.maintenanceEndDate).format(DATE_FORMAT)}
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
												? moment(services.response.lastValidationCheck).format(DATE_FORMAT)
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
												? moment(services.response.nextValidationDeadline).format(DATE_FORMAT)
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
					{modules.map(
						(
							module: { name: { label: React.Key | null | undefined }; enabled: any },
							index: number
						) => (
							<React.Fragment key={module.name.label}>
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
								{(module.enabled || (!module.enabled && showDisabledModules)) && (
									<ServiceStatus
										key={module.name.label}
										data={module}
										licensed={module.enabled}
										t={t}
									/>
								)}
							</React.Fragment>
						)
					)}
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
						<Padding horizontal="small" />
						<Button
							color="error"
							label={t('core.subscription.modal.deactivate', 'Yes, Deactivate')}
							onClick={doRemoveLicense}
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
export default Subscription;
