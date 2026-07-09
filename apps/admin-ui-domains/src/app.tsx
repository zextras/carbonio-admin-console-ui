/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, registerActions, useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  APP_ID,
  CREATE_NEW_DOMAIN_ROUTE_ID,
  CREATE_TOP_DOMAIN,
  DOMAINS_ROUTE_ID,
  GLOBAL,
  MANAGE,
  MANAGE_APP_ID,
  PRIMARY_BAR_DOMAINS,
} from './constants';
import { AppView } from './views/app-view';

const App: FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { data: rights } = useCurrentUserRights();

  const createDomainRight = useMemo(() => {
    const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
    return !!(
      rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
      rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
      find(rightsConfig?.all?.[0]?.right, { n: CREATE_TOP_DOMAIN })
    );
  }, [rights]);

  const managementSection = useMemo(
    () => ({
      id: MANAGE_APP_ID,
      label: t('label.management', 'Management'),
      position: 3,
    }),
    [t],
  );

  const DomainTooltipView: FC = useCallback(
    () => (
      <PrimaryBarTooltip>
        <p>
          <Trans
            i18nKey="label.domains_lbl"
            defaults="<bold>Domains</bold>"
            components={{ bold: <strong /> }}
            t={t}
          />
        </p>
        <p>
          <Trans
            i18nKey="label.domain_primarybar_tooltip"
            defaults="View your <bold>domains details</bold> and <bold>manage</bold> their resources such as <bold>accounts, distribution lists, resources</bold> and <bold>more</bold>."
            components={{ bold: <strong /> }}
            t={t}
          />
        </p>
      </PrimaryBarTooltip>
    ),
    [t],
  );

  useEffect(() => {
    addRoute({
      route: DOMAINS_ROUTE_ID,
      position: 1,
      visible: true,
      label: t('label.domains', 'Domains') || '',
      primaryBar: 'AtOutline',
      appView: AppView,
      primarybarSection: managementSection,
      tooltip: DomainTooltipView,
      trackerLabel: PRIMARY_BAR_DOMAINS,
    });
  }, [DomainTooltipView, managementSection, t]);

  useEffect(() => {
    const actionConfig = {
      action: (): any => ({
        id: 'new-domain',
        label: t('label.create_new_domain', 'Create New Domain'),
        icon: '',
        onClick: (): void => {
          navigate(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
        },
        disabled: !createDomainRight,
        group: APP_ID,
        primary: false,
      }),
      id: 'new-domain',
      type: 'new',
    };
    registerActions(actionConfig);
  }, [createDomainRight, navigate, t]);

  return null;
};

export default App;
