/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import {
	useUserAccounts,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	useDomainInformation
} from '@zextras/carbonio-shell-ui';
import { useHistory } from 'react-router-dom';
import { string } from 'prop-types';
import packageJson from '../../../package.json';
import MatomoTracker from '../../matomo-tracker';
import {
	ACCOUNTS,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	LIST,
	LIST_SERVER,
	LOG_AND_QUEUES,
	MAILING_LIST,
	MANAGE,
	NOTIFICATION_ROUTE_ID,
	SERVER,
	SERVERS_LIST,
	STORAGES_ROUTE_ID
} from '../../constants';
import { useGlobalConfigStore } from '../../store/global-config/store';
import ListRow from '../list/list-row';
import CarbonioVersionInformation from './carbonio-version-information-view';
import QuickAccess from './quick-access-view';
import DashboardNotification from './dashboard-notification';
import DashboardServerList from './dashboard-server-list-view';
import { useDomainStore } from '../../store/domain/store';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import { useRightsStore } from '../../store/rights/store';
import { getRights } from '../utility/utils';
import { useConfigStore } from '../../store/config/store';

const Dashboard: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const userInfo = useConfigStore((state) => state.userId);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const matomo = useMemo(() => new MatomoTracker(userInfo), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const accounts = useUserAccounts();
	const [userName, setUserName] = useState<string>('');
	const [version, setVersion] = useState<string>('');

	const setDomain = useDomainStore((state) => state.setDomain);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [quickAccessItems, setQuickAccessItems] = useState<Array<any>>([
		{
			upperText: t('label.domains', 'Domains'),
			operationText: t('label.accounts', 'Accounts'),
			bottomText: t('label.open', 'Open'),
			operationIcon: 'PersonOutline',
			bottomIcon: 'ChevronRightOutline',
			bgColor: 'avatar_39',
			operation: 'account'
		},
		{
			upperText: t('label.domains', 'Domains'),
			operationText: t('label.mailing_list', 'Mailing List'),
			bottomText: t('label.open', 'Open'),
			operationIcon: 'DistributionListOutline',
			bottomIcon: 'ChevronRightOutline',
			bgColor: 'avatar_21',
			operation: 'malinglist'
		}
	]);
	const domainInformation = useDomainInformation();
	const rights = useRightsStore((state) => state.rights);
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);

	const openOperationView = useCallback(
		(operation: string) => {
			if (domainInformation && domainInformation?.id) {
				setDomain({
					a: domainInformation?.a,
					id: domainInformation?.id,
					name: domainInformation?.name
				});
				if (operation === 'account') {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${ACCOUNTS}`);
				} else if (operation === 'malinglist') {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${MAILING_LIST}`);
				}
			}
		},
		[history, domainInformation, setDomain]
	);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${DASHBOARD}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		if (accounts[0]?.displayName) {
			setUserName(accounts[0]?.displayName);
		} else if (accounts[0]?.name) {
			setUserName(accounts[0]?.name.split('@')[0]);
		}
	}, [accounts]);

	useEffect(() => {
		if (packageJson?.version) {
			setVersion(packageJson?.version);
		}
	}, []);

	const goToMailStoreServerList = useCallback(() => {
		history.push(`/${MANAGE}/${STORAGES_ROUTE_ID}/${SERVERS_LIST}`);
	}, [history]);

	const goToMailNotificationt = useCallback(() => {
		history.push(`/${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}/${LIST}`);
	}, [history]);

	useEffect(() => {
		if (rights && rights.length > 0) {
			const right = getRights(rights, SERVER);
			if (right.length > 0) {
				const findServerRight = right.find(
					(item: Record<string, string>) => item?.n && item?.n === LIST_SERVER
				);
				if (findServerRight) {
					sethasListServerRights(true);
				}
			}
		}
	}, [rights]);

	return (
		<Container>
			<Divider color="gray6" />
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				background="gray5"
				style={{ overflow: 'auto' }}
				height="calc(100vh - 6.55rem)"
			>
				<ListRow>
					<Container width={'40'} padding={{ all: 'extralarge' }}>
						<CarbonioVersionInformation userName={userName} />
					</Container>
					<Container width={'60'} padding={{ all: 'extralarge' }}>
						<QuickAccess
							quickAccessItems={quickAccessItems}
							openOperationView={openOperationView}
							domainName={domainInformation?.name}
						/>
					</Container>
				</ListRow>

				{isAdvanced && (
					<ListRow>
						<Container padding={{ all: 'extralarge' }}>
							<DashboardNotification goToMailNotificationt={goToMailNotificationt} />
						</Container>
					</ListRow>
				)}
				{hasListServerRights && (
					<ListRow>
						<Container padding={{ all: 'extralarge' }}>
							<DashboardServerList goToMailStoreServerList={goToMailStoreServerList} />
						</Container>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};
export default Dashboard;
