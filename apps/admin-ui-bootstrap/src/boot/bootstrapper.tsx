/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManager, SnackbarManager } from '@zextras/ui-components';
import { I18nFactory, ReactQueryProvider, useBridge } from '@zextras/ui-shared';
import { FC, use } from 'react';

import { TrackerProvider } from '../tracker/provider';
import { BootstrapperContextProvider } from './bootstrapper-provider';
import { BootstrapperRouter } from './bootstrapper-router';
import { ErrorPage } from './error-page';
import { init } from './init';

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

export const Bootstrapper = () => {
  const initResult = use(initPromise);

  if (initResult && 'error' in initResult) {
    return <ErrorPage />;
  }

  return (
    <ReactQueryProvider>
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
    </ReactQueryProvider>
  );
};
