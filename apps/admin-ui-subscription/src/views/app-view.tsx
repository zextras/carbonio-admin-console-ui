/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useLicenseInfo, usePrimaryBarState } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import { ActivateSubscription } from './subscription/activate-subscription';
import { Subscription } from './subscription/subscription';

function getContainerStyle(isPrimaryBarExpanded: boolean) {
  return {
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();

  const { data: licenseData } = useLicenseInfo();

  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Routes>
        <Route
          path={'/'}
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '100%' }}>
                <Container style={getContainerStyle(isPrimaryBarExpanded)}>
                  <Suspense fallback={<spinner-wc />}>
                    {!licenseData && <ActivateSubscription />}
                    {licenseData && <Subscription />}
                  </Suspense>
                </Container>
              </Container>
            </Container>
          }
        />
      </Routes>
    </Container>
  );
};

export default AppView;
