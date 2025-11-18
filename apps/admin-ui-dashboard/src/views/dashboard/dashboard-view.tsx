/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	useUserAccounts,
	useDomainInformation,
	useIsAdvanced,
	useDomainStore,
	useHasRight,
	getRights,
	useCurrentUserRights
} from '@zextras/admin-ui-bootstrap';
import { Container, Divider } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

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
import ListRow from '../list/list-row';

import CarbonioVersionInformation from './carbonio-version-information-view';
import DashboardNotification from './dashboard-notification';
import DashboardServerList from './dashboard-server-list-view';
import { LicenseBanner } from './license-banner';
import QuickAccess from './quick-access-view';

const Dashboard: FC = () => {
	const history = useHistory();
	const accounts = useUserAccounts();
	const [userName, setUserName] = useState<string>('');
	const [serverVersion, setServerVersion] = useState<any>({});

	const { setDomain, setDomainView, setIsQuickAccess } = useDomainStore((state) => state);
	const isAdvanced = useIsAdvanced();

	const domainInformation = useDomainInformation();
	const { data: rights } = useCurrentUserRights();
	const adminHasAllRights = useHasRight({ rightType: 'config', rightName: 'getAttrs' }).data;
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
				{adminHasAllRights && <LicenseBanner redirectButtonHasToAppear />}
				<ListRow>
					<Container width={'40'} padding={{ all: 'extralarge' }}>
						<CarbonioVersionInformation userName={userName} serverVersion={serverVersion} />
					</Container>
					<Container width={'60'} padding={{ all: 'extralarge' }}>
						<QuickAccess
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
