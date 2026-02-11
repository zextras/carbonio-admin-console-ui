/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute } from '@zextras/admin-ui-bootstrap';
import { PrimaryBarTooltip } from '@zextras/ui-components';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { DASHBOARD, PRIMARY_BAR_DASHBOARD } from './constants';
import AppView from './views/app-view';

const App: FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const homeTooltipItems = useMemo(
    () => [
      {
        header: (
          <Trans
            i18nKey="label.dashboard"
            defaults="<bold>Dashboard</bold>"
            components={{ bold: <strong /> }}
            t={t}
          />
        ),
        options: [],
      },
    ],
    [t],
  );

  const HomeTooltipView: FC = useCallback(
    () => <PrimaryBarTooltip items={homeTooltipItems} />,
    [homeTooltipItems],
  );
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
  }, [HomeTooltipView, navigate, pathname, t]);

  return null;
};

export default App;
