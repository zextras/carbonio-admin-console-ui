/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';
import { Accordion, Container, Row, Text, Divider, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useLocation } from 'react-router-dom';
import MatomoTracker from '../../matomo-tracker';
import {
	BACKUP_ROUTE_ID,
	DOMAINS_ROUTE_ID,
	MANAGE_APP_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from '../../constants';

const textProps = { color: 'gray0', weight: 'bold' };

const Header: FC<{ title: string }> = ({ title }) => (
	<>
		<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
			<Padding vertical="medium" horizontal="large" width="100%">
				<Text size="small" color="gray0" weight="bold">
					{title}
				</Text>
			</Padding>
		</Row>
		<Divider />
	</>
);

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
				id: 'storages',
				route: STORAGES_ROUTE_ID,
				label: t('label.storages', 'Storages'),
				icon: 'HardDriveOutline',
				trackView: 'Storages'
			},
			{
				id: 'subscriptions',
				route: SUBSCRIPTIONS_ROUTE_ID,
				label: t('label.subscriptions', 'Subscriptions'),
				icon: 'AwardOutline',
				trackView: 'Subscriptions'
			}
		],
		[t]
	);

	const serviceViews = useMemo(
		() => [
			{
				id: 'backup',
				route: BACKUP_ROUTE_ID,
				label: t('label.backup', 'Backup'),
				icon: 'HistoryOutline',
				trackView: 'Backup'
			}
		],
		[t]
	);

	const getAccorionItems = useCallback(
		(views: any) =>
			views.map((view: any) => ({
				id: view.id,
				label: view.label,
				icon: view.icon,
				textProps,
				active:
					location.pathname.includes(`/${MANAGE_APP_ID}/${view.route}`) && location.search === '',
				disableHover:
					location.pathname.includes(`/${MANAGE_APP_ID}/${view.route}`) && location.search === '',
				onClick: (e: MouseEvent): void => {
					e.stopPropagation();
					replaceHistory(`/${view.route}`);
					matomo.trackPageView(`${view.trackView}`);
				}
			})),
		[location.pathname, location.search, matomo]
	);

	const manageItems = useMemo(() => getAccorionItems(manageViews), [manageViews, getAccorionItems]);

	const serviceItems = useMemo(
		() => getAccorionItems(serviceViews),
		[serviceViews, getAccorionItems]
	);

	return (
		<Container orientation="column" crossAlignment="flex-start" mainAlignment="flex-start">
			<Header title={t('label.management', 'Management')} />
			<Accordion items={manageItems} />
			<Padding top="large" bottom="large"></Padding>
			<Header title={t('label.services', 'Services')} />
			<Accordion items={serviceItems} />
		</Container>
	);
};

export default SidebarView;
