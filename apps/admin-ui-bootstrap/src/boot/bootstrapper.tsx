/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManager, SnackbarManager } from '@zextras/ui-components';
import { FC, use } from 'react';

import I18nFactory from '../i18n/i18n-factory';
import { ReactQueryProvider } from '../providers/react-query-provider';
import { useBridge } from '../store/context-bridge';
import { TrackerProvider } from '../tracker/provider';
import BootstrapperContextProvider from './bootstrapper-provider';
import BootstrapperRouter from './bootstrapper-router';
import { ErrorPage } from './error-page';
import { init } from './init';
import { ThemeProvider } from './theme-provider';

const i18nFactory = new I18nFactory();
const initPromise = init(i18nFactory);

const TBridge: FC<{ i18nFactory: I18nFactory }> = ({ i18nFactory }) => {
  useBridge({
    functions: {},
    packageDependentFunctions: {
      t: (app) => i18nFactory.getAppI18n({ name: app }).t,
    },
  });
  return null;
};

const BootstrapperContent: FC = () => {
  const initResult = use(initPromise);

  if (initResult && 'error' in initResult) {
    return <ErrorPage />;
  }

  return (
    <SnackbarManager>
      <ModalManager>
        <TrackerProvider>
          <BootstrapperContextProvider i18nFactory={i18nFactory}>
            <TBridge i18nFactory={i18nFactory} />
            <BootstrapperRouter />
          </BootstrapperContextProvider>
        </TrackerProvider>
      </ModalManager>
    </SnackbarManager>
  );
};

const Bootstrapper = () => {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <BootstrapperContent />
      </ThemeProvider>
    </ReactQueryProvider>
  );
};

export default Bootstrapper;
