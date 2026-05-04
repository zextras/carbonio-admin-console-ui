/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow } from '@zextras/ui-components';
import {
  getRights,
  useCurrentUserRights,
  useDomainInformation,
  useDomainStore,
  useHasAllRights,
  useIsAdvanced,
  useUserAccounts,
} from '@zextras/ui-shared';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  ACCOUNTS,
  DISTRIBUTION_LIST,
  DOMAINS_ROUTE_ID,
  LIST,
  LIST_SERVER,
  LOG_AND_QUEUES,
  MANAGE,
  NOTIFICATION_ROUTE_ID,
  SERVER,
  SERVER_VERSION,
  SERVERS_LIST,
  STORAGES_ROUTE_ID,
} from '../../constants';
import { useServerVersion } from '../../hooks/use-server-version';
import CarbonioVersionInformation from './carbonio-version-information-view';
import DashboardNotification from './dashboard-notification';
import DashboardServerList from './dashboard-server-list-view';
import { LicenseBanner } from './license-banner';
import QuickAccess from './quick-access-view';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const accounts = useUserAccounts();
  const [userName, setUserName] = useState<string>('');
  const { serverVersion } = useServerVersion();

  const { setDomain, setDomainView, setIsQuickAccess } = useDomainStore((state) => state);
  const isAdvanced = useIsAdvanced();

  const { data: domainInformation } = useDomainInformation();
  const { data: rights } = useCurrentUserRights();
  const adminHasAllRights = useHasAllRights();
  const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);

  const openOperationView = useCallback(
    (operation: string) => {
      if (domainInformation && domainInformation?.id) {
        setDomain({
          a: domainInformation?.a,
          id: domainInformation?.id,
          name: domainInformation?.name,
        });
        setIsQuickAccess(true);
        if (operation === 'account') {
          setDomainView(ACCOUNTS);
          setDomainView(ACCOUNTS);
          navigate(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${ACCOUNTS}`);
        } else if (operation === 'malinglist') {
          setDomainView(DISTRIBUTION_LIST);
          setDomainView(DISTRIBUTION_LIST);
          navigate(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${domainInformation?.id}/${DISTRIBUTION_LIST}`);
        }
      }
    },
    [domainInformation, setDomain, setIsQuickAccess, setDomainView, navigate],
  );

  useEffect(() => {
    if (accounts[0]?.displayName) {
      setUserName(accounts[0]?.displayName);
    } else if (accounts[0]?.name) {
      setUserName(accounts[0]?.name.split('@')[0]);
    }
  }, [accounts]);

  const goToMailStoreServerList = useCallback(() => {
    navigate(`/${MANAGE}/${STORAGES_ROUTE_ID}/${SERVERS_LIST}`);
  }, [navigate]);

  const goToMailNotificationt = useCallback(() => {
    navigate(`/${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}/${LIST}`);
  }, [navigate]);

  useEffect(() => {
    if (rights && rights.length > 0) {
      const right = getRights(rights, SERVER);
      if (right.length > 0) {
        const findServerRight = right.find(
          (item: Record<string, string>) => item?.n && item?.n === LIST_SERVER,
        );
        if (findServerRight) {
          sethasListServerRights(true);
        }
      }
    }
  }, [rights]);

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
            <CarbonioVersionInformation userName={userName} serverVersion={SERVER_VERSION} />
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
                serverVersion={SERVER_VERSION}
              />
            </Container>
          </ListRow>
        )}
      </Container>
    </Container>
  );
};
export default Dashboard;
