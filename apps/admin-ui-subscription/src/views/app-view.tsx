/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBreakpoint, usePrimaryBarState } from '@zextras/ui-shared';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import { ActivateSubscription } from './subscription/activate-subscription';
import { RegularSubscription } from './subscription/regular-subscription';
import { Subscription } from './subscription/subscription';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
} as const;

function getMaxWidth(breakpoint: string, isSidebarOpen = false) {
  if (breakpoint === '2xl') return '1125px';
  if (breakpoint === 'xl') return '1125px';
  if (breakpoint === 'lg' && !isSidebarOpen) return '1125px';
  if (breakpoint === 'lg' && isSidebarOpen) return '981px';
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

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();

  return (
    <div style={{ ...baseStyle, height: 'fit-content', width: '100%' }}>
      <Breadcrumb />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ ...baseStyle, ...getContainerStyle(breakpoint, isPrimaryBarExpanded) }}>
              <Subscription />
            </div>
          }
        />
        <Route
          path="/activate"
          element={
            <div style={{ ...baseStyle, ...getContainerStyle(breakpoint, isPrimaryBarExpanded) }}>
              <ActivateSubscription />
            </div>
          }
        />
        <Route
          path="/regular"
          element={
            <div style={{ ...baseStyle, ...getContainerStyle(breakpoint, isPrimaryBarExpanded) }}>
              <RegularSubscription />
            </div>
          }
        />
      </Routes>
    </div>
  );
};
