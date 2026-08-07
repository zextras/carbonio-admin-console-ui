/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow } from '@zextras/ui-components';
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
import DashboardServerList from './dashboard-server-list-view';
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
    <Container>
      <ds-divider color="gray6"></ds-divider>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        background="gray5"
        style={{ overflow: 'auto' }}
        height="calc(100vh - 6.55rem)"
      >
        {isAdvanced && adminHasAllRights && <LicenseBanner redirectButtonHasToAppear />}
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
              <DashboardNotification goToMailNotification={goToMailNotification} />
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

