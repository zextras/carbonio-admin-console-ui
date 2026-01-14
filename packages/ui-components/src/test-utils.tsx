/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { setupTest as sharedSetupTest, screen } from 'admin-ui-test-utils';

type KeyboardModifiers = {
	readonly ctrl?: boolean;
};

type SharedUserEvent = ReturnType<typeof sharedSetupTest>['user'];

type UserEvent = SharedUserEvent & {
	readonly arrowUp: (modifiers?: KeyboardModifiers) => ReturnType<SharedUserEvent['keyboard']>;
	readonly arrowDown: (modifiers?: KeyboardModifiers) => ReturnType<SharedUserEvent['keyboard']>;
	readonly arrowLeft: () => ReturnType<SharedUserEvent['keyboard']>;
	readonly arrowRight: () => ReturnType<SharedUserEvent['keyboard']>;
	readonly esc: () => ReturnType<SharedUserEvent['keyboard']>;
	readonly enter: () => ReturnType<SharedUserEvent['keyboard']>;
};

function wrapKeyboardTextWithModifier(text: string, modifiers?: KeyboardModifiers): string {
	let finalText = text;
	if (modifiers?.ctrl) {
		finalText = `{Control>}${finalText}{/Control}`;
	}
	return finalText;
}

function setupUserEvent(options?: Parameters<typeof userEvent.setup>[0]): UserEvent {
	const user = userEvent.setup(options) as UserEvent;

	user.arrowUp = (modifiers?: KeyboardModifiers) =>
		user.keyboard(wrapKeyboardTextWithModifier('[ArrowUp]', modifiers));
	user.arrowDown = (modifiers?: KeyboardModifiers) =>
		user.keyboard(wrapKeyboardTextWithModifier('[ArrowDown]', modifiers));
	user.arrowLeft = () => user.keyboard('[ArrowLeft]');
	user.arrowRight = () => user.keyboard('[ArrowRight]');
	user.esc = () => user.keyboard('[Escape]');
	user.enter = () => user.keyboard('[Enter]');

	return user;
}

export function setup(
	ui: ReactElement,
	options?: Parameters<typeof sharedSetupTest>[1]
): ReturnType<typeof sharedSetupTest> & { user: UserEvent } {
	const result = sharedSetupTest(ui, options);
	return {
		...result,
		user: setupUserEvent(options?.setupOptions)
	};
}

export function makeItemsVisible(): void {
	const intersectionObserverMock = vi.mocked(globalThis.IntersectionObserver);
	const { calls } = intersectionObserverMock.mock;

	calls.forEach((call) => {
		const [callback, instance] = call;
		callback(
			[
				{
					boundingClientRect: new DOMRect(),
					intersectionRatio: 0,
					intersectionRect: new DOMRect(),
					isIntersecting: true,
					rootBounds: null,
					target: document.createElement('div'),
					time: 0
				}
			] as Array<IntersectionObserverEntry>,
			instance
		);
	});
}

// Re-export utilities from shared test-utils and testing-library
export { screen } from 'admin-ui-test-utils';
export type { UserEvent };
export * from '@testing-library/react';

