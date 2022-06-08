/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, FC, ReactElement, useEffect, useCallback } from 'react';
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
import styled from 'styled-components';
import { orderBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { fetchSoap } from '../../../services/subscription-service';

const VerticalBar = styled(Container)`
	background-color: rgba(0, 80, 109, ${({ licensed }): number => (licensed ? 1 : 0.33)});
	width: 4px;
	height: auto;
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
`;

const ServiceName = styled(Text)`
	color: rgba(0, 80, 109, ${({ licensed }): number => (licensed ? 1 : 0.33)});
	font-weight: bold;
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

const ServiceStatus = ({ name, licensed }: { name: string; licensed: string }): ReactElement => (
	<Row
		width="180px"
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="stretch"
		padding="0 44px 16px 0"
	>
		<VerticalBar licensed={licensed} />
		<Row
			orientation="vertical"
			crossAlignment="flex-start"
			padding={{ vertical: 'extrasmall', left: 'small' }}
		>
			<Padding bottom="extrasmall">
				<ServiceName licensed={licensed}>{name}</ServiceName>
			</Padding>
			<Text color={licensed ? 'text' : 'secondary'}>{licensed ? 'Enabled' : 'Disabled'}</Text>
		</Row>
	</Row>
);

const Subscription: FC = () => {
	const [services, setServices] = useState<any>({});
	const [modules, setModules]: any = useState([]);
	const [open, setOpen] = useState(false);
	const [disableActiveBtn, setDisableActiveBtn] = useState(false);
	const [showDisabledModules, setShowDisabledModules] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [version, setVersion] = useState();
	const [licenseKey, setLicenseKey] = useState(''); // 49b0cb0a-f381-4fc3-bb4e-8dda7e00b4a0
	const createSnackbar = useSnackbar();

	const { t } = useTranslation();

	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const getLicence = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'getLicenseInfo',
			targetServers: server
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok && response.response[server] && response.response[server].ok) {
				const formatModules = Object.keys(response.response[server].response.modules).map(
					(module) => ({
						...response.response[server].response.modules[module],
						name: module
					})
				);
				const orderModules: any = orderBy(formatModules, 'licensed', 'desc');
				setServices(response.response[server]);
				setModules(orderModules);
				setLicenseKey(response.response[server].response.authenticationToken);
			}
		});
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'getVersion',
			targetServers: server
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok && response.response[server] && response.response[server].ok) {
				setVersion(response.response[server].response.version);
			}
		});
	}, [server]);

	useEffect(() => {
		getLicence();
	}, [getLicence]);

	const activeLicence = (): void => {
		setDisableActiveBtn(true);
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'activate-license',
			targetServers: server,
			token: licenseKey
		})
			.then((res) => {
				setDisableActiveBtn(false);
				const response = JSON.parse(res.response.content);
				if (response.ok && response.response[server] && response.response[server].ok) {
					createSnackbar({
						key: 1,
						type: 'success',
						label: response.response[server].message,
						replace: true
					});
				} else {
					createSnackbar({
						key: 1,
						type: 'error',
						label: response.response[server].message,
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
			iamsure: true,
			targetServers: server
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok && response.response[server] && response.response[server].ok) {
				createSnackbar({
					key: 1,
					type: 'success',
					label: response.response[server].message,
					replace: true
				});
			} else {
				createSnackbar({
					key: 1,
					type: 'error',
					label: response.response[server].message,
					replace: true
				});
			}
			setOpen(false);
			getLicence();
		});
	};

	return (
		<>
			<>
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
				{/* <Section
					title={
						<Row mainAlignment="space-between" crossAlignment="center" width="100vw">
							<Text weight="bold">{t('core.subscription.subcription', 'Subscription')}</Text>
						</Row>
					}
					divider
				> */}
				<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
					<Container
						orientation="horizontal"
						width="100%"
						height="fit"
						wrap="wrap"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding="16px 0 32px 0"
					>
						<Row width="calc(100% - 122px)">
							<Input
								label={t('core.subscription.token', 'Token')}
								backgroundColor="gray5"
								value={licenseKey}
								onChange={(e: any): void => setLicenseKey(e.target.value)}
							/>
						</Row>
						<Row width="122px" mainAlignment="flex-end" crossAlignment="flex-end">
							<Button
								label={
									services &&
									services.response &&
									(services.response.expired || services.response.type === 'Trial')
										? t('core.subscription.active', 'Active')
										: t('core.subscription.deactive', 'Deactive')
								}
								disabled={!licenseKey || disableActiveBtn}
								type="outlined"
								color={
									services &&
									services.response &&
									(services.response.expired || services.response.type === 'Trial')
										? 'primary'
										: 'error'
								}
								onClick={
									services &&
									services.response &&
									(services.response.expired || services.response.type === 'Trial')
										? (): void => activeLicence()
										: (): void => setOpen(true)
								}
								padding="12px 12px"
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
								(module.licensed || (!module.licensed && showDisabledModules)) && (
									<ServiceStatus key={module.name} name={module.name} licensed={module.licensed} />
								)
						)}
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding="0 0 32px 0"
							onClick={(): void => setShowDisabledModules((prev) => !prev)}
						>
							<CollapseText color="primary" size="small">
								{showDisabledModules
									? t('core.subscription.hide', 'Hide')
									: t('core.subscription.features', 'Other features')}
							</CollapseText>
							<Padding left="small">
								<Icon icon={showDisabledModules ? 'ChevronUp' : 'ChevronDown'} color="primary" />
							</Padding>
						</Row>
					</Container>
					{services && services.response && showDisabledModules && (
						<Container
							orientation="horizontal"
							width="100%"
							height="fit"
							wrap="wrap"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
						>
							<IconInfo
								icon="AwardOutline"
								label={t('core.subscription.subscription_type', 'Subscription Type')}
								value={services.response.type}
							/>
							{/* <IconInfo
								icon="CalendarOutline"
								label={t('core.subscription.valid_through', 'Valid Through')}
								value={`
								${formatShortDate(services.response.dateStart)} - 
								${formatShortDate(services.response.dateEnd)}`}
							/> */}
							<IconInfo
								icon="PersonOutline"
								label={t('core.subscription.customer', 'Customer')}
								value={services.response.customer}
							/>
							<IconInfo
								icon="CheckmarkCircleOutline"
								label={t('core.subscription.status', 'Status')}
								value={services.response.notYetValid ? 'Not Valid' : 'Valid'}
							/>
							<IconInfo
								icon="EmailOutline"
								label={t('core.subscription.subscription_Accounts', 'Subscription Accounts')}
								value={`${services.response.accountCount} / ${services.response.licensedUsers}`}
							/>
							<IconInfo
								icon="ClockOutline"
								label={t('core.subscription.subscription_last_check', 'Subscription Last Check')}
								value="24 august 2021 - 11:57 PM"
							/>
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
							<IconInfo
								icon="AvatarOutline"
								label={t('core.subscription.company_name', 'Company Name')}
								value={services.response.company}
							/>
							<IconInfo
								icon="AppointmentOutline"
								label={t('core.subscription.emissionDate', 'Emission date')}
								value="24 sept 2020"
							/>
							<IconInfo
								icon="EmailOutline"
								label={t('core.subscription.email_buyer', 'Email Buyer')}
								value="hebergement@gplexpert.com"
							/>
							<IconInfo
								icon="InfoOutline"
								label={t('core.subscription.version', 'Zextras version')}
								value={version}
							/>
							<IconInfo
								icon="PricetagsOutline"
								label={t('core.subscription.order_id')}
								value={services.response.order_id}
							/>
						</Container>
					)}
				</Container>
				{/* </Section> */}
			</>
		</>
	);
};
export default Subscription;
