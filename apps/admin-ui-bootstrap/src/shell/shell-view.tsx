/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManager, Row, SnackbarManager } from '@zextras/ui-components';

import { useCurrentRoute } from '../history/hooks';
import { ShellUtilityBar, ShellUtilityPanel } from '../utility-bar';
import AppViewContainer from './app-view-container';
import ShellContextProvider from './shell-context-provider';
import ShellHeader from './shell-header';
import ShellNavigationBar from './shell-navigation-bar';
import styles from './shell-view.module.css';

function Shell() {
  const activeRoute = useCurrentRoute();
  return (
    <div className={styles.background}>
      <ShellHeader
        // @ts-expect-error - needs a fix
        activeRoute={activeRoute}
      >
        <ShellUtilityBar />
      </ShellHeader>
      <Row crossAlignment="unset" style={{ position: 'relative', flexGrow: '1' }}>
        <ShellNavigationBar activeRoute={activeRoute} />
        {/* @ts-expect-error - needs a fix */}
        <AppViewContainer activeRoute={activeRoute} />
        <ShellUtilityPanel />
      </Row>
    </div>
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
