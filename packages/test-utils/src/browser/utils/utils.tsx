/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient } from '@tanstack/react-query';
import { queryClient } from '@zextras/admin-ui-bootstrap/testing';
import { type ReactElement } from 'react';
import { render, type RenderResult } from 'vitest-browser-react';

import { createBrowserSoapAPIInterceptor } from '../worker';
import { Wrapper, WrapperProps } from './wrapper';

export const setupBrowserTest = (
  ui: ReactElement,
  options?: { initialRouterEntry?: string; queryClient?: QueryClient },
): Promise<RenderResult> => {
  if (options?.initialRouterEntry) {
    window.history.replaceState({}, '', options.initialRouterEntry);
  }

  // Use the shared queryClient by default if not provided
  const effectiveQueryClient = options?.queryClient ?? queryClient;

  return render(ui, {
    wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
      <Wrapper queryClient={effectiveQueryClient}>{children}</Wrapper>
    ),
  });
};

function setupAccount() {
  // Populate React Query cache with test data
  queryClient.setQueryData(['account', 'info'], {
    id: 'test-user-id',
    name: 'test@example.com',
    displayName: '',
    signatures: {
      signature: [],
    },
    identities: undefined,
    rights: { targets: [] },
  });

  queryClient.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: {},
    props: [],
  });

  queryClient.setQueryData(['account', 'version'], '1.0.0');
}

export async function grantUserConfigRights() {
  setupAccount();
  const mockConfigRightsData = [
    {
      type: 'config',
      all: [
        {
          setAttrs: [{ all: true }],
          getAttrs: [{ all: true }],
        },
      ],
    },
  ];
  const getRightsInterceptor = createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
    target: mockConfigRightsData,
  });
  return getRightsInterceptor;
}

export async function grantUserCosRights() {
  setupAccount();
  const mockCosRightsData = [
    {
      type: 'cos',
      all: [
        {
          right: [
            { n: 'assignCos' },
            { n: 'deleteCos' },
            { n: 'listCos' },
            { n: 'manageZimlet' },
            { n: 'renameCos' },
          ],
          setAttrs: [{ all: true }],
          getAttrs: [{ all: true }],
        },
      ],
    },
  ];
  queryClient.setQueryData(['effective-rights', 'test@example.com'], mockCosRightsData);
}
