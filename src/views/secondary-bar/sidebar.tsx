/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';
import { Accordion } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useLocation } from 'react-router-dom';
import { map } from 'lodash';
import MatomoTracker from '../../matomo-tracker';
import {
	CERTIFICATES_ROUTE_ID,
	CORE_ROUTE_ID,
	COS_ROUTE_ID,
	DOMAINS_ROUTE_ID,
	FEATURES_ROUTE_ID,
	MANAGE_APP_ID,
	SERVER_AND_VOLUMES_ROUTE_ID
} from '../../constants';

const textProps = { fontWeight: '700', color: '#414141' };

const SidebarView: FC = () => {
	const [t] = useTranslation();
	const location = useLocation();
	const matomo = useMemo(() => new MatomoTracker(), []);

	const manageViews = useMemo(
		() => [
			{
				id: 'domains',
				route: DOMAINS_ROUTE_ID,
				label: t('label.domains', 'Domains'),
				icon: 'At',
				trackView: 'Domains'
			},
			{
				id: 'server-and-volumes',
				route: SERVER_AND_VOLUMES_ROUTE_ID,
				label: t('label.serverl_and_volumes', 'Server & Volumes'),
				icon: 'HardDriveOutline',
				trackView: 'Server and Volumes'
			},
			{
				id: 'cos',
				route: COS_ROUTE_ID,
				label: t('label.cos', 'CoS'),
				icon: 'CosOutline',
				trackView: 'COS'
			},
			{
				id: 'certificates',
				route: CERTIFICATES_ROUTE_ID,
				label: t('label.certificates', 'Certificates'),
				icon: 'AwardOutline',
				trackView: 'Certificates'
			},
			{
				id: 'core',
				route: CORE_ROUTE_ID,
				label: t('label.core', 'Core'),
				icon: 'CoreModeOutline',
				trackView: 'Core',
				subSections: [
					{
						id: 'core-subscription',
						route: 'subscription',
						label: t('label.subscriptions', 'Subscriptions'),
						icon: 'BarChartOutline',
						trackView: 'Core/Subscriptions'
					},
					{
						id: 'core-notification',
						route: 'notification',
						label: t('label.notification', 'Notification'),
						icon: 'EmailOutline',
						trackView: 'Core/Notifications'
					},
					{
						id: 'core-log',
						route: 'log',
						label: t('label.log', 'Log'),
						icon: 'CodeOutline',
						trackView: 'Core/Logs'
					},
					{
						id: 'core-privacy',
						route: 'privacy',
						label: t('label.privacy', 'Privacy'),
						icon: 'LockOutline',
						trackView: 'Core/Privacy'
					}
				]
			},
			{
				id: 'features',
				route: FEATURES_ROUTE_ID,
				label: t('label.features', 'Features'),
				icon: 'GridOutline',
				trackView: 'Features',
				subSections: [
					{
						id: 'features-admins',
						route: 'admins',
						label: t('label.admins', 'Admins'),
						icon: 'CrownOutline',
						trackView: 'Features/Admins'
					},
					{
						id: 'features-backup',
						route: 'backup',
						label: t('label.backup', 'Backup'),
						icon: 'HistoryOutline',
						trackView: 'Features/Backup'
					},
					{
						id: 'features-activesync',
						route: 'activesync',
						label: t('label.active_sync', 'ActiveSync'),
						icon: 'SmartphoneOutline',
						trackView: 'Features/ActiveSync'
					},
					{
						id: 'features-storages',
						route: 'storages',
						label: t('label.storages', 'Storages'),
						icon: 'CubeOutline',
						trackView: 'Features/Storages'
					}
				]
			}
		],
		[t]
	);

	const items = useMemo(
		() =>
			manageViews.map((view) => ({
				id: view.id,
				label: view.label,
				icon: view.icon,
				textProps,
				active: location.pathname === `/${MANAGE_APP_ID}/${view.route}` && location.search === '',
				disableHover:
					location.pathname === `/${MANAGE_APP_ID}/${view.route}` && location.search === '',
				onClick: (e: MouseEvent): void => {
					e.stopPropagation();
					replaceHistory(`/${view.route}`);
					matomo.trackPageView(`${view.trackView}`);
				},
				items: map(view.subSections, (item) => ({
					...item,
					textProps,
					active: location.pathname === `/${MANAGE_APP_ID}/${view.route}/${item.route}`,
					disableHover: location.pathname === `/${MANAGE_APP_ID}/${view.route}/${item.route}`,
					onClick: (e: MouseEvent): void => {
						e.stopPropagation();
						replaceHistory(`/${view.route}/${item.route}`);
						matomo.trackPageView(`${view.trackView}`);
					}
				}))
			})),
		[manageViews, location, matomo]
	);

	return <Accordion items={items} />;
};

export default SidebarView;
