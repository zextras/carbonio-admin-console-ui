/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDomainInformation } from '@zextras/ui-shared';
import { useCallback, useEffect } from 'react';
import { Outlet, useParams } from 'react-router';

import { useDomainStore } from '../../store/store';
import { DomainDetailPanel } from './domain-detail-panel';

export const DomainOperationsLayout = () => {
  const { domainId } = useParams();
  const setDomain = useDomainStore((state) => state.setDomain);
  const setDomainWioutConfig = useDomainStore((state) => state.setDomainWioutConfig);

  const getSelectedDomainInformation = useCallback(
    (id: any): any => {
      getDomainInformation(id, 1).then((data) => {
        const domain = data?.domain[0];
        if (domain) {
          setDomain(domain);
        }
      });
      getDomainInformation(id, 0).then((data) => {
        const domain = data?.domain[0];
        if (domain) {
          setDomainWioutConfig(domain);
        }
      });
    },
    [setDomain, setDomainWioutConfig],
  );

  useEffect(() => {
    getSelectedDomainInformation(domainId);
  }, [domainId, getSelectedDomainInformation]);

  return (
    <DomainDetailPanel>
      <Outlet />
    </DomainDetailPanel>
  );
};
