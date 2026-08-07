/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow } from '@zextras/ui-components';
import {
  buildPath,
  getRights,
  useCurrentUserRights,
  useDomainInformation,
  useHasAllRights,
  useIsAdvanced,
  useUserAccounts,
} from '@zextras/ui-shared';
import { useNavigate } from 'react-router';

import {
  ACCOUNTS,
  DISTRIBUTION_LIST,
  DOMAINS_ROUTE_ID,
  LIST,
  LIST_SERVER,
  NOTIFICATION_ROUTE_ID,
  SERVER,
  SERVERS_LIST,
  STORAGES_ROUTE_ID,
} from '../../constants';
import { useServerVersion } from '../../hooks/use-server-version';
import CarbonioVersionInformation from './carbonio-version-information-view';
import { DashboardNotification } from './dashboard-notification';
import { DashboardServerList } from './dashboard-server-list-view';
import styles from './dashboard-view.module.css';
import { LicenseBanner } from './license-banner';
import { QuickAccess } from './quick-access-view';

export const Dashboard = () => {
  const navigate = useNavigate();
  const accounts = useUserAccounts();
  const userName = accounts[0]?.displayName || accounts[0]?.name?.split('@')[0] || '';
  const { serverVersion } = useServerVersion();

  const isAdvanced = useIsAdvanced();

  const { data: domainInformation } = useDomainInformation();
  const { data: rights } = useCurrentUserRights();
  const adminHasAllRights = useHasAllRights();
  const hasListServerRights =
    rights != null &&
    rights.length > 0 &&
    getRights(rights, SERVER).some(
      (item: Record<string, string>) => item?.n && item?.n === LIST_SERVER,
    );

  function openOperationView(operation: string) {
    if (domainInformation && domainInformation?.id) {
      if (operation === 'account') {
        navigate(buildPath(DOMAINS_ROUTE_ID, domainInformation?.id, ACCOUNTS));
      } else if (operation === 'mailinglist') {
        navigate(buildPath(DOMAINS_ROUTE_ID, domainInformation?.id, DISTRIBUTION_LIST));
      }
    }
  }

  function goToMailStoreServerList() {
    navigate(buildPath(STORAGES_ROUTE_ID, SERVERS_LIST));
  }

  function goToMailNotification() {
    navigate(buildPath(NOTIFICATION_ROUTE_ID, LIST));
  }

  return (
    <div>
      <ds-divider color="gray6"></ds-divider>
      <div className={styles.content}>
        {isAdvanced && adminHasAllRights && <LicenseBanner redirectButtonHasToAppear />}
        <div className={styles.section}>
          <ListRow>
            <div className={styles.versionCol}>
              <CarbonioVersionInformation userName={userName} serverVersion={serverVersion} />
            </div>
            <div className={styles.quickAccessCol}>
              <QuickAccess
                openOperationView={openOperationView}
                domainName={domainInformation?.name}
              />
            </div>
          </ListRow>
        </div>

        {isAdvanced && (
          <div className={styles.section}>
            <ListRow>
              <div className={styles.notificationCol}>
                <DashboardNotification goToMailNotification={goToMailNotification} />
              </div>
            </ListRow>
          </div>
        )}
        {hasListServerRights && (
          <div className={styles.section}>
            <ListRow>
              <div className={styles.serverListCol}>
                <DashboardServerList
                  goToMailStoreServerList={goToMailStoreServerList}
                  serverVersion={serverVersion}
                />
              </div>
            </ListRow>
          </div>
        )}
      </div>
    </div>
  );
};

