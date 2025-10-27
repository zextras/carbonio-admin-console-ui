/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useState } from 'react';

import { Container, Divider } from '@zextras/carbonio-design-system';
import { useUserAccounts, useDomainInformation } from '@zextras/admin-ui-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import CarbonioVersionInformation from './carbonio-version-information-view';
import DashboardNotification from './dashboard-notification';
import DashboardServerList from './dashboard-server-list-view';
import QuickAccess from './quick-access-view';
import LicenseBanner from './license-banner';
import packageJson from '../../../package.json';
import {
	ACCOUNTS,
	DOMAINS_ROUTE_ID,
	LIST,
	LIST_SERVER,
	LOG_AND_QUEUES,
	DISTRIBUTION_LIST,
	MANAGE,
	NOTIFICATION_ROUTE_ID,
	SERVER,
	SERVERS_LIST,
	STORAGES_ROUTE_ID
} from '../../constants';
import { getVersionInfo } from '../../services/get-version-info';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import { useDomainStore } from '../../store/domain/store';
import { hasAllRights, useRightsStore } from '../../store/rights/store';
import ListRow from '../list/list-row';
import { getRights } from '../utility/utils';
import { useModuleLicenseStore } from '../../store/module-license/store';
import { has } from 'lodash';

const Dashboard: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const accounts = useUserAccounts();
	const [userName, setUserName] = useState<string>('');
	const [version, setVersion] = useState<string>('');
	const [serverVersion, setServerVersion] = useState<any>({});

	const { setDomain, setDomainView, setIsQuickAccess } = useDomainStore((state) => state);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const moduleLicenseInfo = useModuleLicenseStore((state) => state.licenseInfo);
	const [isLicenseBannerOpen, setIsLicenseBannerOpen] = useState<boolean>(
		moduleLicenseInfo?.maintenanceStatus !== "expired" ||
		moduleLicenseInfo?.maintenanceStatus !== "expiring"
	);
	const adminHasAllRights = useRightsStore(hasAllRights);
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
			operationText: t('label.distribution_list', 'Distribution List'),
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
				setIsQuickAccess(true);
				if (operation === 'account') {
					setDomainView(ACCOUNTS);
					setDomainView(ACCOUNTS);
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${ACCOUNTS}`);
				} else if (operation === 'malinglist') {
					setDomainView(DISTRIBUTION_LIST);
					setDomainView(DISTRIBUTION_LIST);
					history.push(
						`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${DISTRIBUTION_LIST}`
					);
				}
			}
		},
		[domainInformation, setDomain, setDomainView, setIsQuickAccess, history]
	);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [history]);

	const goToMailNotificationt = useCallback(() => {
		history.push(`/${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}/${LIST}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	const getVersionInformation = useCallback(() => {
		getVersionInfo().then((res) => {
			if (res?.info && Array.isArray(res?.info)) {
				setServerVersion(res?.info[0]);
			}
		});
	}, []);
	useEffect(() => {
		getVersionInformation();
	}, [getVersionInformation]);

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
				{
					adminHasAllRights && isLicenseBannerOpen &&
					<LicenseBanner
						maintenanceEndDate={moduleLicenseInfo?.maintenanceEndDate}
						maintenanceStatus={moduleLicenseInfo?.maintenanceStatus}
						setLicenseBannerOpen={setIsLicenseBannerOpen}
						redirectButtonHasToAppear
					/>
				}
				<ListRow>
					<Container width={'40'} padding={{ all: 'extralarge' }}>
						<CarbonioVersionInformation userName={userName} serverVersion={serverVersion} />
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
							<DashboardServerList
								goToMailStoreServerList={goToMailStoreServerList}
								serverVersion={serverVersion}
							/>
						</Container>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};
export default Dashboard;
