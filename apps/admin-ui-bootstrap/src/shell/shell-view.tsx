/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManager, Row, SnackbarManager } from '@zextras/ui-components';
import { useCurrentRoute } from '@zextras/ui-shared';
import styled from 'styled-components';

import { AppRoute } from '../../types';
import { ShellUtilityBar, ShellUtilityPanel } from '../utility-bar';
import AppViewContainer from './app-view-container';
import ShellContextProvider from './shell-context-provider';
import ShellHeader from './shell-header';
import ShellNavigationBar from './shell-navigation-bar';

const Background = styled.div`
  background: ${({ theme }) => theme.palette.gray6.regular};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  max-height: 100%;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
`;

function Shell() {
  const activeRoute = useCurrentRoute();
  return (
    <Background>
      <ShellHeader activeRoute={activeRoute as AppRoute}>
        <ShellUtilityBar />
      </ShellHeader>
      <Row crossAlignment="unset" style={{ position: 'relative', flexGrow: '1' }}>
        <ShellNavigationBar activeRoute={activeRoute} />
        {/* @ts-expect-error - needs a fix */}
        <AppViewContainer activeRoute={activeRoute} />
        <ShellUtilityPanel />
      </Row>
    </Background>
  );
}

export default function ShellView() {
  return (
    <ShellContextProvider>
      <ModalManager>
        <SnackbarManager>
          <Shell />
        </SnackbarManager>
      </ModalManager>
    </ShellContextProvider>
  );
}
