/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useState } from 'react';
import { Accordion } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';

const SidebarView: FC = () => {
	const [t] = useTranslation();
	const [accordionItems, setAccordionItems]: any = useState([]);

	const [domainItem, setDomainItem]: any = useState([
		{
			id: 'domains',
			icon: 'Globe',
			label: t('label.domains', 'Domains'),
			onClick: (): void => {
				replaceHistory(`/domain`);
			}
		}
	]);

	const [serverAndVolumeItem, setServerAndVolumeItem]: any = useState([
		{
			id: 'serverandvolutem',
			icon: 'HardDriveOutline',
			label: t('label.serverl_and_volumes', 'Server & Volumes')
		}
	]);

	const [cosItem, setCosItem]: any = useState([
		{
			id: 'cositem',
			icon: 'CosOutline',
			label: t('label.cos', 'CoS')
		}
	]);

	const [certificatesItem, setCertificatesItem]: any = useState([
		{
			id: 'certificateitem',
			icon: 'AwardOutline',
			label: t('label.certificates', 'Certificates')
		}
	]);

	const [coreItem, setCoreItem]: any = useState([
		{
			id: 'certificateitem',
			icon: 'CoreModeOutline',
			label: t('label.core', 'Core'),
			items: [
				{
					id: 'core-subscription',
					label: t('label.subscriptions', 'Subscriptions'),
					icon: 'BarChartOutline'
				},
				{
					id: 'core-notification',
					label: t('label.notification', 'Notification'),
					icon: 'EmailOutline'
				},
				{
					id: 'core-log',
					label: t('label.log', 'Log'),
					icon: 'CodeOutline'
				},
				{
					id: 'core-privacy',
					label: t('label.privacy', 'Privacy'),
					icon: 'LockOutline'
				}
			]
		}
	]);

	const [featuresItem, setFeaturesItem]: any = useState([
		{
			id: 'featuresitem',
			icon: 'GridOutline',
			label: t('label.features', 'Features'),
			items: [
				{
					id: 'core-admins',
					label: t('label.admins', 'Admins'),
					icon: 'CrownOutline'
				},
				{
					id: 'core-backup',
					label: t('label.backup', 'Backup'),
					icon: 'HistoryOutline'
				},
				{
					id: 'core-activesync',
					label: t('label.active_sync', 'ActiveSync'),
					icon: 'SmartphoneOutline'
				},
				{
					id: 'core-storages',
					label: t('label.storages', 'Storages'),
					icon: 'CubeOutline'
				}
			]
		}
	]);

	useMemo(() => {
		setAccordionItems([
			...domainItem,
			...serverAndVolumeItem,
			...certificatesItem,
			...cosItem,
			...coreItem,
			...featuresItem
		]);
	}, [domainItem, serverAndVolumeItem, certificatesItem, cosItem, coreItem, featuresItem]);

	return <Accordion items={accordionItems} />;
};

export default SidebarView;
