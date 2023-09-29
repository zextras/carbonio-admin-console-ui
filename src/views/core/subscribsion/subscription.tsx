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
	Modal,
	ContainerProps,
	TextProps
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { find, orderBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TFunction } from 'i18next';
import { fetchSoap } from '../../../services/subscription-service';
import MatomoTracker from '../../../matomo-tracker';
import { SUBSCRIPTIONS_ROUTE_ID, CONFIG } from '../../../constants';
import { useGlobalConfigStore } from '../../../store/global-config/store';
import { useRightsStore, Right, Rights } from '../../../store/rights/store';
import { useConfigStore } from '../../../store/config/store';

interface ContainerExtendProps extends ContainerProps {
	licensed?: string;
}
const VerticalBar = styled(Container)<ContainerExtendProps>`
	background-color: ${({ theme }): string => theme.palette.primary.regular};
	width: 4px;
	height: auto;
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	opacity: ${({ licensed }): number => (licensed ? 1 : 0.33)};
`;
interface TextExtendProps extends TextProps {
	licensed?: string;
}
const ServiceName = styled(Text)<TextExtendProps>`
	color: ${({ theme }): string => theme.palette.primary.regular};
	font-weight: bold;
	opacity: ${({ licensed }): number => (licensed ? 1 : 0.33)};
`;

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

const moduleNames: any = {
	ZxBackup: 'Backup',
	ZxMobile: 'ActiveSync',
	ZxAdmin: 'Admins',
	ZxPowerstore: 'Mailstores',
	SproxyD: 'SproxyD',
	ZxDrive: 'Files',
	ZxDocs: 'Docs',
	ZxChat: 'Chats',
	ZxHA: 'HA',
	Powerstore: 'Storage',
	Drive: 'Files',
	Chat: 'Chats'
};

const ServiceStatus = ({
	name,
	licensed,
	t
}: {
	name: string;
	licensed: any;
	t: TFunction;
}): ReactElement => (
	<Row
		width="180px"
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="stretch"
		style={{ padding: '0 44px 16px 0' }}
	>
		<VerticalBar licensed={licensed} />
		<Row
			orientation="vertical"
			crossAlignment="flex-start"
			padding={{ vertical: 'extrasmall', left: 'small' }}
		>
			<Padding bottom="extrasmall">
				<ServiceName licensed={licensed}>{moduleNames[name] || name}</ServiceName>
			</Padding>
			<Text color={licensed ? 'text' : 'secondary'}>
				{licensed ? t('label.enabled', 'Enabled') : t('label.disabled', 'Disabled')}
			</Text>
		</Row>
	</Row>
);

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
		if (rightsConfig?.all?.[0]?.setAttrs?.[0]?.all) {
			return true;
		}
		return false;
	}, [rights]);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${SUBSCRIPTIONS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const { t } = useTranslation();

	const getLicence = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'getLicenseInfo'
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				const formatModules = response?.response?.features?.map((module: any) => ({
					...response.response.modules[module],
					name: module
				}));
				const orderModules: any = orderBy(formatModules, 'name', 'desc');
				const filterModules: any = orderModules.filter((module: any) => module.name !== 'SproxyD');
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
					<Text weight="bold">{t('core.subscription.bundle', 'Bundle')}</Text>
				</Row>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					wrap="wrap"
					height="fit"
				>
					{modules.map(
						(module: any) =>
							(module.enabled || (!module.enabled && showDisabledModules)) && (
								<ServiceStatus
									key={module.name}
									name={module.name}
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
