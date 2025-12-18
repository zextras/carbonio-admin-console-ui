/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type QueryClient } from '@tanstack/react-query';
import { queryClient } from '@zextras/admin-ui-bootstrap/testing';
import { clone, cloneDeep, map } from 'lodash-es';
import { type ReactElement } from 'react';
import { render, type RenderResult } from 'vitest-browser-react';

import { allConfigBaseResponseMock } from '../../api-mocks/get-all-config-response-mock';
import { getAllConfigRightsBaseResponseMock } from '../../api-mocks/get-all-config-rights-response';
import { getInfoResponseBaseMock } from '../../api-mocks/get-info-response-mock';
import { getQueryClient, Wrapper, WrapperProps } from './wrapper';

export const setupBrowserTest = (
  ui: ReactElement,
  options?: { initialRouterEntry?: string; queryClient?: QueryClient },
): Promise<RenderResult> => {
  if (options?.initialRouterEntry) {
    window.history.replaceState({}, '', options.initialRouterEntry);
  }

  // Always create a fresh QueryClient unless explicitly provided
  const effectiveQueryClient = options?.queryClient ?? getQueryClient();

  // Copy essential data from global queryClient to maintain compatibility
  if (!options?.queryClient) {
    const globalCache = queryClient.getQueryCache().getAll();
    globalCache.forEach((query) => {
      if (query.queryKey[0] === 'account') {
        effectiveQueryClient.setQueryData(query.queryKey, query.state.data);
      }
    });
  }

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
  queryClient.setQueryData(['effective-rights', 'test@example.com'], mockConfigRightsData);
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
type GetGetInfoResponseMockOptions = {
  prefs?: typeof getInfoResponseBaseMock.prefs._attrs;
  attrs?: typeof getInfoResponseBaseMock.attrs._attrs;
};

export function getGetInfoResponseMock(
  options?: GetGetInfoResponseMockOptions,
): typeof getInfoResponseBaseMock {
  const overrides = {
    ...(options?.prefs && {
      prefs: {
        _attrs: {
          ...getInfoResponseBaseMock.prefs._attrs,
          ...options.prefs,
        },
      },
    }),
    ...(options?.attrs && {
      attrs: {
        _attrs: {
          ...getInfoResponseBaseMock.attrs._attrs,
          ...options.attrs,
        },
      },
    }),
  };
  return {
    ...getInfoResponseBaseMock,
    ...overrides,
  };
}

type ConfigItem = { n: string; _content: string };
type ConfigOverrides = Record<string, string>;

export function getAllConfigResponseMock(
  options?: ConfigOverrides,
): typeof allConfigBaseResponseMock {
  if (!options) {
    return {
      ...allConfigBaseResponseMock,
      a: map(allConfigBaseResponseMock.a.map, clone),
    };
  }

  const optionsArray: ConfigItem[] = Object.entries(options).map(([n, _content]) => ({
    n,
    _content,
  }));

  const updatedBaseConfig: ConfigItem[] = allConfigBaseResponseMock.a.map((item) => {
    const overrideContent = options[item.n];
    if (overrideContent !== undefined) {
      return { ...item, _content: overrideContent };
    }
    return { ...item };
  });

  const baseNames = new Set(allConfigBaseResponseMock.a.map((item) => item.n));
  const newConfigItems: ConfigItem[] = optionsArray.filter((option) => !baseNames.has(option.n));
  const finalConfigArray: ConfigItem[] = [...updatedBaseConfig, ...newConfigItems];

  return {
    ...allConfigBaseResponseMock,
    a: finalConfigArray,
  };
}

export type RightOverrides = Record<string, string[]>;

export function getAllConfigRightsResponseMock(
  overrides?: RightOverrides,
): typeof getAllConfigRightsBaseResponseMock {
  const baseClone = cloneDeep(getAllConfigRightsBaseResponseMock);

  if (!overrides) {
    return baseClone;
  }

  const updatedTargets = baseClone.target.map((targetGroup) => {
    const targetType = targetGroup.type;
    const newRightsList = overrides[targetType];

    if (newRightsList === undefined) {
      return targetGroup;
    }

    return {
      ...targetGroup,
      all:
        targetGroup.all?.map((allEntry) => ({
          ...allEntry,
          right: newRightsList.map((rightName) => ({ n: rightName })),
        })) || targetGroup.all,
    };
  });

  return {
    ...baseClone,
    target: updatedTargets,
  };
}
