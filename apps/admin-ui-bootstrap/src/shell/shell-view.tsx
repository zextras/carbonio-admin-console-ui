/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row } from '@zextras/ui-components';
import { useCurrentRoute } from '@zextras/ui-shared';

import { ShellUtilityBar, ShellUtilityPanel } from '../utility-bar';
import { AppViewContainer } from './app-view-container';
import { ShellHeader } from './shell-header';
import { ShellNavigationBar } from './shell-navigation-bar';

function getDivStyle() {
  return {
    background: 'var(--color-gray6-regular)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100%',
    maxHeight: '100%',
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
  } as const;
}

export function ShellView() {
  const activeRoute = useCurrentRoute();
  return (
    <div style={getDivStyle()}>
      <ShellHeader activeRoute={activeRoute}>
        <ShellUtilityBar />
      </ShellHeader>
      <Row crossAlignment="unset" style={{ position: 'relative', flexGrow: '1' }}>
        <ShellNavigationBar activeRoute={activeRoute} />
        <AppViewContainer />
        <ShellUtilityPanel />
      </Row>
    </div>
  );
}
