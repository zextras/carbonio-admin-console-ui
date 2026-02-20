/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { queries, render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { type ReactElement } from 'react';

import { Wrapper, WrapperProps } from './wrapper';

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

function customRender(
  ui: React.ReactElement,
  {
    initialRouterEntries = ['/'],
    ...options
  }: WrapperProps & {
    options?: Omit<RenderOptions, 'queries' | 'wrapper'>;
  } = {},
): RenderResult<typeof queries> {
  return render(ui, {
    wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
      <Wrapper initialRouterEntries={initialRouterEntries}>{children}</Wrapper>
    ),
    queries: { ...queries },
    ...options,
  });
}

type SetupOptions = Pick<WrapperProps, 'initialRouterEntries'> & {
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
