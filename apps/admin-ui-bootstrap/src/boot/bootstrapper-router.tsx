/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManagerContext, useSnackbar } from '@zextras/ui-components';
import { BASENAME, useBridge } from '@zextras/ui-shared';
import { FC, useContext } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';

import ShellView from '../shell/shell-view';
import { TrackerProvider } from '../tracker/provider';
import { AppLoaderMounter } from './app/app-loader-mounter';

const ContextBridge: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createSnackbar = useSnackbar();

  const createModal = useContext(ModalManagerContext) as unknown as Function;

  const history = {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    goBack: () => navigate(-1),
    go: (delta: number) => navigate(delta),
    location,
    createHref: (to: string) => to,
    listen: () => () => {},
  };

  useBridge({
    functions: {
      getHistory: () => history,
      createSnackbar,
      createModal,
    },
  });
  return null;
};

export const BootstrapperRouter: FC = () => (
  <BrowserRouter basename={BASENAME}>
    <TrackerProvider>
      <ContextBridge />
      <AppLoaderMounter />
      <ShellView />
    </TrackerProvider>
  </BrowserRouter>
);
