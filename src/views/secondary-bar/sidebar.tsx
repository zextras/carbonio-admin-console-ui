/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useState } from 'react';
import { Accordion } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import MatomoTracker from '../../matomo-tracker';

const SidebarView: FC = () => {
	const [t] = useTranslation();
	const [accordionItems, setAccordionItems]: any = useState([]);

	const matomo = new MatomoTracker();
	const [domainItem, setDomainItem]: any = useState([
		{
			id: 'domains',
			icon: 'Globe',
			label: t('label.domains', 'Domains'),
			onClick: (): void => {
				replaceHistory(`/domain`);
				matomo.trackPageView('Domains');
			}
		}
	]);

	const [serverAndVolumes, setServerAndVolumes]: any = useState([
		{
			id: 'server-and-volumes',
			icon: 'HardDriveOutline',
			label: t('label.serverl_and_volumes', 'Server & Volumes'),
			onClick: (): void => {
				replaceHistory(`/server-and-volumes`);
				matomo.trackPageView('Server and Volumes');
			}
		}
	]);

	const [cos, setCos]: any = useState([
		{
			id: 'cos',
			icon: 'CosOutline',
			label: t('label.cos', 'CoS'),
			onClick: (): void => {
				replaceHistory(`/cos`);
				matomo.trackPageView('COS');
			}
		}
	]);

	const [certificates, setCertificates]: any = useState([
		{
			id: 'certificates',
			icon: 'AwardOutline',
			label: t('label.certificates', 'Certificates'),
			onClick: (): void => {
				replaceHistory(`/certificates`);
				matomo.trackPageView('Certificates');
			}
		}
	]);

	const [core, setCore]: any = useState([
		{
			id: 'core',
			icon: 'CoreModeOutline',
			label: t('label.core', 'Core'),
			onClick: (): void => {
				replaceHistory(`/core`);
				matomo.trackPageView('Core');
			},
			items: [
				{
					id: 'core-subscription',
					label: t('label.subscriptions', 'Subscriptions'),
					icon: 'BarChartOutline',
					onClick: (): void => {
						replaceHistory(`/core-subscription`);
						matomo.trackPageView('Core/Subscriptions');
					}
				},
				{
					id: 'core-notification',
					label: t('label.notification', 'Notification'),
					icon: 'EmailOutline',
					onClick: (): void => {
						replaceHistory(`/core-notification`);
						matomo.trackPageView('Core/Notifications');
					}
				},
				{
					id: 'core-log',
					label: t('label.log', 'Log'),
					icon: 'CodeOutline',
					onClick: (): void => {
						replaceHistory(`/core-log`);
						matomo.trackPageView('Core/Logs');
					}
				},
				{
					id: 'core-privacy',
					label: t('label.privacy', 'Privacy'),
					icon: 'LockOutline',
					onClick: (): void => {
						replaceHistory(`/core-privacy`);
						matomo.trackPageView('Core/Privacy');
					}
				}
			]
		}
	]);

	const [features, setFeatures]: any = useState([
		{
			id: 'features',
			icon: 'GridOutline',
			label: t('label.features', 'Features'),
			onClick: (): void => {
				replaceHistory(`/features`);
				matomo.trackPageView('Features');
			},
			items: [
				{
					id: 'features-admins',
					label: t('label.admins', 'Admins'),
					icon: 'CrownOutline',
					onClick: (): void => {
						replaceHistory(`/features/admins`);
						matomo.trackPageView('Features/Admins');
					}
				},
				{
					id: 'features-backup',
					label: t('label.backup', 'Backup'),
					icon: 'HistoryOutline',
					onClick: (): void => {
						replaceHistory(`/features/backup`);
						matomo.trackPageView('Features/Backup');
					}
				},
				{
					id: 'features-activesync',
					label: t('label.active_sync', 'ActiveSync'),
					icon: 'SmartphoneOutline',
					onClick: (): void => {
						replaceHistory(`/features/active-sync`);
						matomo.trackPageView('Features/ActiveSync');
					}
				},
				{
					id: 'features-storages',
					label: t('label.storages', 'Storages'),
					icon: 'CubeOutline',
					onClick: (): void => {
						replaceHistory(`/features/storages`);
						matomo.trackPageView('Features/Storages');
					}
				}
			]
		}
	]);

	useMemo(() => {
		setAccordionItems([
			...domainItem,
			...serverAndVolumes,
			...certificates,
			...cos,
			...core,
			...features
		]);
	}, [domainItem, serverAndVolumes, certificates, cos, core, features]);

	return <Accordion items={accordionItems} />;
};

export default SidebarView;
