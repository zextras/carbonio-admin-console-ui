/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/ui-shared';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import { ActivateSubscription } from './subscription/activate-subscription';
import { Subscription } from './subscription/subscription';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
} as const;

function getContainerStyle(isPrimaryBarExpanded: boolean) {
  return {
    width: '100%',
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();

  return (
    <div style={{ ...baseStyle, height: 'fit-content', width: '100%' }}>
      <Breadcrumb />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ ...baseStyle, ...getContainerStyle(isPrimaryBarExpanded) }}>
              <Suspense fallback={<spinner-wc />}>
                <Subscription />
              </Suspense>
            </div>
          }
        />
        <Route
          path="/activate"
          element={
            <div style={{ ...baseStyle, ...getContainerStyle(isPrimaryBarExpanded) }}>
              <Suspense fallback={<spinner-wc />}>
                <ActivateSubscription />
              </Suspense>
            </div>
          }
        />
      </Routes>
    </div>
  );
};
