/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  type ByRoleMatcher,
  type ByRoleOptions,
  type GetAllBy,
  queries,
  queryHelpers,
  render,
  type RenderOptions,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filter } from 'lodash-es';
import React, { type ReactElement } from 'react';

import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18next, { type i18n } from 'i18next';
import { render as browserRender } from 'vitest-browser-react';

import { ModalManager, SnackbarManager, ThemeProvider } from './index';

export type UserEvent = ReturnType<(typeof userEvent)['setup']> & {
  readonly rightClick: (target: Element) => Promise<void>;
  readonly arrowDown: (options?: { ctrl?: boolean }) => Promise<void>;
  readonly arrowUp: (options?: { ctrl?: boolean }) => Promise<void>;
  readonly arrowLeft: () => Promise<void>;
  readonly arrowRight: () => Promise<void>;
  readonly enter: () => Promise<void>;
  readonly esc: () => Promise<void>;
  readonly tab: (options?: { shift?: boolean }) => Promise<void>;
};

const getAppI18n = (): i18n => {
  const newI18n = i18next.createInstance();
  newI18n.init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: { en: { translation: {} } },
  });
  return newI18n;
};

const queryAllByTextWithMarkup: GetAllBy<[string | RegExp]> = (container, text) =>
  screen.queryAllByText((_content, element) => {
    if (element && element instanceof HTMLElement) {
      const hasText = (singleNode: Element): boolean => {
        const regExp = RegExp(text);
        return singleNode.textContent != null && regExp.test(singleNode.textContent);
      };
      const childrenDontHaveText = Array.from(element.children).every((child) => !hasText(child));
      return hasText(element) && childrenDontHaveText;
    }
    return false;
  });

const getByTextWithMarkupMultipleError = (
  container: Element | null,
  text: string | RegExp,
): string => `Found multiple elements with text: ${text}`;
const getByTextWithMarkupMissingError = (
  container: Element | null,
  text: string | RegExp,
): string => `Unable to find an element with text: ${text}`;

type ByRoleWithIconOptions = ByRoleOptions & {
  icon: string | RegExp;
};

const queryAllByRoleWithIcon: GetAllBy<[ByRoleMatcher, ByRoleWithIconOptions]> = (
  container,
  role,
  { icon, ...options },
) =>
  filter(
    screen.queryAllByRole('button', options),
    (element) => within(element).queryByTestId(icon) !== null,
  );

const getByRoleWithIconMultipleError = (
  container: Element | null,
  role: ByRoleMatcher,
  options: ByRoleWithIconOptions,
): string => `Found multiple elements with role ${role} and icon ${options.icon}`;
const getByRoleWithIconMissingError = (
  container: Element | null,
  role: ByRoleMatcher,
  options: ByRoleWithIconOptions,
): string => `Unable to find an element with role ${role} and icon ${options.icon}`;

const [
  queryByTextWithMarkup,
  getAllByTextWithMarkup,
  getByTextWithMarkup,
  findAllByTextWithMarkup,
  findByTextWithMarkup,
] = queryHelpers.buildQueries<[string | RegExp]>(
  queryAllByTextWithMarkup,
  getByTextWithMarkupMultipleError,
  getByTextWithMarkupMissingError,
);

const [
  queryByRoleWithIcon,
  getAllByRoleWithIcon,
  getByRoleWithIcon,
  findAllByRoleWithIcon,
  findByRoleWithIcon,
] = queryHelpers.buildQueries<[ByRoleMatcher, ByRoleWithIconOptions]>(
  queryAllByRoleWithIcon,
  getByRoleWithIconMultipleError,
  getByRoleWithIconMissingError,
);

const customQueries = {
  queryByTextWithMarkup,
  getAllByTextWithMarkup,
  getByTextWithMarkup,
  findAllByTextWithMarkup,
  findByTextWithMarkup,
  queryByRoleWithIcon,
  getAllByRoleWithIcon,
  getByRoleWithIcon,
  findAllByRoleWithIcon,
  findByRoleWithIcon,
};

export type TestWrapperProps = {
  children?: React.ReactNode;
  initialRouterEntries?: string[];
};

export const I18NextTestProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const i18nInstance = React.useMemo(() => getAppI18n(), []);

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

export const TestWrapper = ({
  initialRouterEntries,
  children,
}: TestWrapperProps): React.JSX.Element => (
  <MemoryRouter
    initialEntries={initialRouterEntries}
    initialIndex={(initialRouterEntries?.length || 1) - 1}
  >
    <ThemeProvider>
      <SnackbarManager>
        <I18NextTestProvider>
          <ModalManager>{children}</ModalManager>
        </I18NextTestProvider>
      </SnackbarManager>
    </ThemeProvider>
  </MemoryRouter>
);

function customRender(
  ui: React.ReactElement,
  {
    initialRouterEntries = ['/'],
    ...options
  }: TestWrapperProps & {
    options?: Omit<RenderOptions, 'queries' | 'wrapper'>;
  } = {},
): RenderResult<typeof queries & typeof customQueries> {
  return render(ui, {
    wrapper: ({ children }: Pick<TestWrapperProps, 'children'>) => (
      <TestWrapper initialRouterEntries={initialRouterEntries}>{children}</TestWrapper>
    ),
    queries: { ...queries, ...customQueries },
    ...options,
  });
}

type SetupOptions = Pick<TestWrapperProps, 'initialRouterEntries'> & {
  renderOptions?: Omit<RenderOptions, 'queries'>;
  setupOptions?: Parameters<(typeof userEvent)['setup']>[0];
};

const setupUserEvent = (options: SetupOptions['setupOptions']): UserEvent => {
  const user = userEvent.setup(options);
  const rightClick = (target: Element): Promise<void> =>
    user.pointer({ target, keys: '[MouseRight]' });

  const arrowDown = async (options?: { ctrl?: boolean }): Promise<void> => {
    if (options?.ctrl) {
      await user.keyboard('{Control>}{ArrowDown}{/Control}');
    } else {
      await user.keyboard('{ArrowDown}');
    }
  };

  const arrowUp = async (options?: { ctrl?: boolean }): Promise<void> => {
    if (options?.ctrl) {
      await user.keyboard('{Control>}{ArrowUp}{/Control}');
    } else {
      await user.keyboard('{ArrowUp}');
    }
  };

  const arrowLeft = async (): Promise<void> => {
    await user.keyboard('{ArrowLeft}');
  };

  const arrowRight = async (): Promise<void> => {
    await user.keyboard('{ArrowRight}');
  };

  const enter = async (): Promise<void> => {
    await user.keyboard('{Enter}');
  };

  const esc = async (): Promise<void> => {
    await user.keyboard('{Escape}');
  };

  const tab = async (options?: { shift?: boolean }): Promise<void> => {
    if (options?.shift) {
      await user.keyboard('{Shift>}{Tab}{/Shift}');
    } else {
      await user.keyboard('{Tab}');
    }
  };

  return {
    ...user,
    rightClick,
    arrowDown,
    arrowUp,
    arrowLeft,
    arrowRight,
    enter,
    esc,
    tab,
  } as UserEvent;
};

export const setupTest = (
  ui: ReactElement,
  options?: SetupOptions,
): { user: UserEvent } & ReturnType<typeof customRender> => ({
  user: setupUserEvent({ ...options?.setupOptions }),
  ...customRender(ui, {
    initialRouterEntries: options?.initialRouterEntries,
    ...options?.renderOptions,
  }),
});

export const setupBrowserTest = (
  ui: ReactElement,
  options?: { initialRouterEntry?: string },
): ReturnType<typeof browserRender> => {
  if (options?.initialRouterEntry) {
    window.history.replaceState({}, '', options.initialRouterEntry);
  }

  return browserRender(ui, {
    wrapper: ({ children }: Pick<TestWrapperProps, 'children'>) => (
      <TestWrapper>{children}</TestWrapper>
    ),
  });
};

export type { SetupOptions };
