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
	Icon,
	Padding,
	Row,
	Text,
	Input,
	useSnackbar,
	Modal
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { find, orderBy } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SUBSCRIPTIONS_ROUTE_ID, CONFIG } from '../../../constants';
import MatomoTracker from '../../../matomo-tracker';
import { fetchSoap } from '../../../services/subscription-service';
import { useConfigStore } from '../../../store/config/store';
import { useGlobalConfigStore } from '../../../store/global-config/store';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';

const CollapseText = styled(Text)`
	cursor: pointer;
`;

const IconInfo = ({
	icon,
	label,
	value
}: {
	icon: string;
	label: string;
	value: string | undefined;
}): ReactElement => (
	<Row width="50%" height="fit" mainAlignment="flex-start" padding={{ bottom: 'large' }}>
		<Padding vertical="small" right="small">
			<Icon size="large" color="gray0" icon={icon} />
		</Padding>
		<Row
			orientation="vertical"
			crossAlignment="flex-start"
			takeAvailableSpace
			padding={{ right: 'extralarge' }}
		>
			<Row orientation="vertical" crossAlignment="flex-start" padding={{ all: 'small' }}>
				<Padding bottom="extrasmall">
					<Text color="secondary" size="small">
						{label}
					</Text>
				</Padding>
				<Text>{value}</Text>
			</Row>
			<Divider />
		</Row>
	</Row>
);

const moduleName: any = {
	backup_realtime: { value: 'Realtime', label: 'Backup' },
	chats_recording: { value: 'Video recording', label: 'Chats' },
	files_basic: { value: 'Basics', label: 'Files' },
	admins_basic: { value: 'Delegated Administration', label: 'Admin' },
	storages_basic: { value: 'Basic', label: 'Storages' },
	appmail_basic: { value: 'Basic', label: 'MailApp' },
	backup_basic: { value: 'Basic', label: 'Backup' },
	ha_basic: { value: 'Basic', label: 'HA' },
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
	backup_import_external: { value: 'Import External', label: 'Backup' }
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
			boxShadow: `0rem 0rem 0.25rem 0rem rgba(166, 166, 166, 0.50)`
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
	const { userId } = useConfigStore((state) => state);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const matomo = useMemo(() => new MatomoTracker(userId), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [services, setServices] = useState<any>({});
	const [modules, setModules]: any = useState([]);
	const [open, setOpen] = useState(false);
	const [disableActiveBtn, setDisableActiveBtn] = useState(false);
	const [showDisabledModules, setShowDisabledModules] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [version, setVersion] = useState();
	const [licenseKey, setLicenseKey] = useState(''); // 49b0cb0a-f381-4fc3-bb4e-8dda7e00b4a0
	const createSnackbar = useSnackbar();
	const rights: Rights = useRightsStore((state) => state.rights);

	const allowSetSubsciption = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
		return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${SUBSCRIPTIONS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const { t } = useTranslation();

	const getLicence = useCallback(() => {
		fetchSoap('zextras', {
			// eslint-disable-next-line sonarjs/no-duplicate-string
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'getLicenseInfo'
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				const formatModules = response?.response?.features?.map((module: any) => ({
					...module,
					name: moduleName[module?.name]
				}));
				const orderModules: any = orderBy(formatModules, 'name.label', 'desc');
				const filterModules: any = orderModules.filter(
					(module: any) => module.name.value !== 'SproxyD'
				);
				setServices(response);
				setModules(filterModules);
				setLicenseKey(response.response.authenticationToken);
			}
		});
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
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
		setDisableActiveBtn(true);
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'activate-license',
			token: licenseKey
		})
			.then((res) => {
				setDisableActiveBtn(false);
				const response = JSON.parse(res.response.content);
				if (response.ok) {
					createSnackbar({
						key: '1',
						type: 'success',
						label: response.message,
						replace: true
					});
				} else {
					createSnackbar({
						key: '1',
						type: 'error',
						label:
							response.message ||
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						replace: true
					});
				}
				getLicence();
			})
			.catch(() => setDisableActiveBtn(false));
	};

	const doRemoveLicense = (): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doRemoveLicense',
			iamsure: true
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				createSnackbar({
					key: '1',
					type: 'success',
					label:
						response.message ||
						t('core.subscription.license_activated_successfully', 'License activated successfully'),
					replace: true
				});
			} else {
				createSnackbar({
					key: '1',
					type: 'error',
					label:
						response.message ||
						t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					replace: true
				});
			}
			setOpen(false);
			getLicence();
		});
	};

	return (
		<Container maxWidth="100%" mainAlignment="flex-start" background="gray6">
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
					<Row width="83%">
						<Input
							label={t('core.subscription.token', 'Token')}
							backgroundColor="gray5"
							value={licenseKey}
							disabled={!allowSetSubsciption}
							onChange={(e: any): void => setLicenseKey(e.target.value)}
						/>
					</Row>
					<Row width="17%" mainAlignment="flex-end" crossAlignment="flex-end">
						<Button
							label={
								services &&
								services.response &&
								(services.response.expired || services.response.type !== 'Purchased')
									? t('core.subscription.activate', 'Activate')
									: t('core.subscription.deactivate', 'Deactivate')
							}
							disabled={!allowSetSubsciption || !licenseKey || disableActiveBtn}
							type="outlined"
							color={
								services &&
								services.response &&
								(services.response.expired || services.response.type !== 'Purchased')
									? 'primary'
									: 'error'
							}
							onClick={
								services &&
								services.response &&
								(services.response.expired || services.response.type !== 'Purchased')
									? (): void => activeLicence()
									: (): void => setOpen(true)
							}
							size="extralarge"
						/>
					</Row>
				</Container>
				<Divider />
				<Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'large' }}>
					<Text weight="bold">{t('core.subscription.modules', 'Modules')}</Text>
				</Row>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					wrap="wrap"
					height="fit"
					style={{ gap: '2.25rem' }}
				>
					{modules.map(
						(module: any) =>
							(module.enabled || (!module.enabled && showDisabledModules)) && (
								<ServiceStatus
									key={module.name.label}
									data={module}
									licensed={module.enabled}
									t={t}
								/>
							)
					)}
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
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.subscription_type', 'Subscription Type')}
								value={services.response.type}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.customer', 'Customer')}
								value={services.response.customer}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.status', 'Status')}
								value={
									services.response.notYetValid || !services.response.authenticationToken
										? t('core.subscription.not_valid', 'Not Valid') || ''
										: t('core.subscription.valid', 'Valid') || ''
								}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.subscription_Accounts', 'Subscription Accounts')}
								value={`${services.response.accountCount} / ${services.response.licensedUsers}`}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.subscription_last_check', 'Subscription Last Check')}
								value=""
							/>
						</Row>
					</Container>
				)}
				<Row
					padding={{ top: 'large' }}
					mainAlignment="flex-start"
					width="100%"
					onClick={(): void => setShowInfo((prev) => !prev)}
				>
					<CollapseText weight="bold">
						{showInfo
							? t('core.subscription.less_info', 'Less Information')
							: t('core.subscription.more_info', 'More Information')}
					</CollapseText>
					<Padding left="small">
						<Icon icon={showInfo ? 'ChevronUp' : 'ChevronDown'} />
					</Padding>
				</Row>
				{services && services.response && showInfo && (
					<Container
						orientation="horizontal"
						width="100%"
						height="fit"
						wrap="wrap"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large' }}
					>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.company_name', 'Company Name')}
								value={services.response.company}
							/>
						</Row>

						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.endDate', 'End date')}
								value={
									services.response.dateEnd
										? moment(services.response.dateEnd).format('DD-MMM-YYYY')
										: ''
								}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.email_buyer', 'Email Buyer')}
								value={services.response?.companyEmail}
							/>
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input label={t('core.subscription.version', 'Module version')} value={version} />
						</Row>
						<Row width="49.5%" padding={{ all: 'large' }}>
							<Input
								label={t('core.subscription.order_id', 'Order Id')}
								value={services.response.order_id}
							/>
						</Row>
					</Container>
				)}
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
