/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type QueryClient } from '@tanstack/react-query';
import { useAppStore } from '@zextras/ui-shared';
import { clone, cloneDeep, map } from 'lodash-es';
import { type ReactElement } from 'react';
import { useLocation } from 'react-router';
import { render, type RenderResult } from 'vitest-browser-react';

import { allConfigBaseResponseMock } from '../../api-mocks/get-all-config-response-mock';
import { getAllConfigRightsBaseResponseMock } from '../../api-mocks/get-all-config-rights-response';
import { getInfoResponseBaseMock } from '../../api-mocks/get-info-response-mock';
import { getQueryClient, Wrapper, WrapperProps } from './wrapper';

export const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

/**
 * Registers a route in the shared app store so registry-based hooks
 * (e.g. `useRelativePathname`, `buildPath`) resolve the correct prefixed path
 * during isolated component tests, mirroring how the shell registers routes
 * at boot in production.
 *
 * @param routeId  The un-prefixed route id (e.g. 'storage').
 * @param sectionId Optional primary-bar section id used as the URL prefix
 *                  (e.g. 'manage' -> 'manage/storage').
 */
export function registerAppRoute(routeId: string, sectionId?: string): void {
  const route = sectionId ? `${sectionId}/${routeId}` : routeId;
  useAppStore.setState((state) => ({
    routes: { ...state.routes, [routeId]: { id: routeId, route, app: routeId } },
  }));
}

type GrantRights = 'cos' | 'config';

type SetupBrowserTestOptions = {
  initialRouterEntry?: string;
  queryClient?: QueryClient;
  grantRights?: GrantRights;
  withDomainIdRoute?: boolean;
};

export const setupBrowserTest = async (
  ui: ReactElement,
  options?: SetupBrowserTestOptions,
): Promise<RenderResult> => {
  const effectiveQueryClient = options?.queryClient ?? getQueryClient();

  if (options?.grantRights === 'cos') {
    await grantUserCosRights(effectiveQueryClient);
  } else if (options?.grantRights === 'config') {
    await grantUserConfigRights(effectiveQueryClient);
  }

  return render(ui, {
    wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
      <Wrapper
        queryClient={effectiveQueryClient}
        initialRouterEntry={options?.initialRouterEntry}
        withDomainIdRoute={options?.withDomainIdRoute}
      >
        {children}
      </Wrapper>
    ),
  });
};

export async function setupAccount(queryClientParam: QueryClient): Promise<void> {
  queryClientParam.setQueryData(['account', 'info'], {
    id: 'test-user-id',
    name: 'test@example.com',
    displayName: '',
    signatures: {
      signature: [],
    },
    identities: undefined,
    rights: { targets: [] },
  });

  queryClientParam.setQueryData(['account', 'settings'], {
    prefs: {},
    attrs: {},
    props: [],
  });

  queryClientParam.setQueryData(['account', 'version'], '1.0.0');
}

export async function grantUserConfigRights(queryClientParam: QueryClient): Promise<void> {
  await setupAccount(queryClientParam);

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
  queryClientParam.setQueryData(['effective-rights', 'test@example.com'], mockConfigRightsData);
}

export async function grantUserCosRights(queryClientParam: QueryClient): Promise<void> {
  await setupAccount(queryClientParam);

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
  queryClientParam.setQueryData(['effective-rights', 'test@example.com'], mockCosRightsData);
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
