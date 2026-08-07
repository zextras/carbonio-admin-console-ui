/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { DASHBOARD, PRIMARY_BAR_DASHBOARD } from './constants';
import { AppView } from './views/app-view';

const HomeTooltipView = () => {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <Trans
        i18nKey="label.dashboard"
        defaults="<bold>Dashboard</bold>"
        components={{ bold: <strong /> }}
        t={t}
      />
    </PrimaryBarTooltip>
  );
};

const App = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    addRoute({
      route: DASHBOARD,
      position: 1,
      visible: true,
      label: t('label.dashboard', 'Dashboard') || '',
      primaryBar: 'HomeOutline',
      appView: AppView,
      tooltip: HomeTooltipView,
      trackerLabel: PRIMARY_BAR_DASHBOARD,
    });
    if (pathname === '/') {
      navigate(DASHBOARD);
    }
  }, [navigate, pathname, t]);

  return null;
};

export default App;
