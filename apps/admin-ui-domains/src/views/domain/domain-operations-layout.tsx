/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSnackbar } from '@zextras/ui-components';
import { searchDirectory } from '@zextras/ui-shared';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router';

import { getDomainInformation } from '../../services/domain-information-service';
import { useDomainStore } from '../../store/store';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';
import DomainDetailPanel from './domain-detail-panel';

export const DomainOperationsLayout = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { domainId } = useParams();
  const setDomain = useDomainStore((state) => state.setDomain);
  const setDomainWioutConfig = useDomainStore((state) => state.setDomainWioutConfig);
  const setCosList = useDomainStore((state) => state.setCosList);

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

  const getClassOfService = useCallback(() => {
    const attrs = 'cn,description';
    const types = 'coses';

    searchDirectory({ attr: attrs, type: types, domainName: '', query: '', offset: 0, limit: 0 })
      .then((data) => {
        const cosLists = data?.cos;
        if (cosLists) {
          setCosList(cosLists);
        }
      })
      .catch((error) => {
        const snackbarConfig = generateSnackbarFromError(error, t);
        createSnackbar(snackbarConfig);
      });
  }, [createSnackbar, setCosList, t]);

  useEffect(() => {
    getSelectedDomainInformation(domainId);
  }, [domainId, getSelectedDomainInformation]);

  useEffect(() => {
    getClassOfService();
  }, [getClassOfService]);

  return (
    <DomainDetailPanel>
      <Outlet />
    </DomainDetailPanel>
  );
};
