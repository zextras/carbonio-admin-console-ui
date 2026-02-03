/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManagerContext, useSnackbar } from '@zextras/ui-components';
import { FC, useContext, useMemo } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';

import { BASENAME } from '../constants';
import ShellView from '../shell/shell-view';
import { useBridge } from '../store/context-bridge';
import { AppLoaderMounter } from './app/app-loader-mounter';

const ContextBridge: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createSnackbar = useSnackbar();

  const createModal = useContext(ModalManagerContext) as Function;

  const history = useMemo(
    () => ({
      push: (to: string) => navigate(to),
      replace: (to: string) => navigate(to, { replace: true }),
      goBack: () => navigate(-1),
      go: (delta: number) => navigate(delta),
      location,
      createHref: (to: string) => to,
      listen: () => () => {},
    }),
    [navigate, location],
  );

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
    <ContextBridge />
    <AppLoaderMounter />
    <ShellView />
  </BrowserRouter>
);
