/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBreakpoint, useLocalStorage, usePrimaryBarState } from '@zextras/ui-shared';
import { type FC, type ReactNode, useEffect } from 'react';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import { ActivateSubscription } from './subscription/activate-subscription';
import { MeteredSubscription } from './subscription/metered-subscription';
import { PerpetualSubscription } from './subscription/perpetual-subscription';
import { RegularSubscription } from './subscription/regular-subscription';
import { Subscription } from './subscription/subscription';
import { TrialSubscription } from './subscription/trial-subscription';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
} as const;

function getMaxWidth(breakpoint: string, isSidebarOpen = false): string {
  if (['2xl', 'xl'].includes(breakpoint)) return '1125px';
  if (breakpoint === 'lg' && !isSidebarOpen) return '1125px';
  return '981px';
}

function getContainerStyle(breakpoint: string, isSidebarOpen = false) {
  return {
    width: '100%',
    maxWidth: getMaxWidth(breakpoint, isSidebarOpen),
    transition: 'max-width 300ms',
    padding: '0 clamp(0.5rem, 2vw, 2rem)',
    boxSizing: 'border-box' as const,
  };
}

type RouteContainerProps = {
  breakpoint: string;
  isSidebarOpen: boolean;
  children: ReactNode;
};

const RouteContainer: FC<RouteContainerProps> = ({ breakpoint, isSidebarOpen, children }) => (
  <div style={{ ...baseStyle, ...getContainerStyle(breakpoint, isSidebarOpen) }}>{children}</div>
);

type RouteConfig = {
  path: string;
  element: ReactNode;
  featureFlagged?: boolean;
};

const routes: Array<RouteConfig> = [
  { path: '/', element: <Subscription /> },
  { path: '/activate', element: <ActivateSubscription /> },
  { path: '/regular', element: <RegularSubscription />, featureFlagged: true },
  { path: '/metered', element: <MeteredSubscription />, featureFlagged: true },
  { path: '/perpetual', element: <PerpetualSubscription />, featureFlagged: true },
  { path: '/trial', element: <TrialSubscription />, featureFlagged: true },
];

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    'new_subscription_feature_flag',
    null,
  );

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  return (
    <div style={{ ...baseStyle, height: 'fit-content', width: '100%' }}>
      <Breadcrumb />
      <Routes>
        {routes.map((route) =>
          route.featureFlagged && !featureFlag ? null : (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RouteContainer breakpoint={breakpoint} isSidebarOpen={isPrimaryBarExpanded}>
                  {route.element}
                </RouteContainer>
              }
            />
          ),
        )}
      </Routes>
    </div>
  );
};
