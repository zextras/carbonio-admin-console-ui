/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManager, SnackbarManager } from '@zextras/ui-components';
import { I18nFactory, ReactQueryProvider, useBridge } from '@zextras/ui-shared';
import { use } from 'react';

import { ShellI18nextProvider } from './app/shell-i18n-provider';
import { BootstrapperRouter } from './bootstrapper-router';
import { ErrorPage } from './error-page';
import { init } from './init';

const i18nFactory = new I18nFactory();
const initPromise = init(i18nFactory);

function TBridge() {
  useBridge({
    functions: {},
  });
  return null;
}

export function Bootstrapper() {
  const initResult = use(initPromise);

  if (initResult && 'error' in initResult) {
    return <ErrorPage />;
  }

  return (
    <ReactQueryProvider>
      <ShellI18nextProvider>
        <SnackbarManager>
          <ModalManager>
            <TBridge />
            <BootstrapperRouter />
          </ModalManager>
        </SnackbarManager>
      </ShellI18nextProvider>
    </ReactQueryProvider>
  );
}
