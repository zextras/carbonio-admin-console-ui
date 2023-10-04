/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { type ReactElement, useMemo } from 'react';

import {
	act,
	type ByRoleMatcher,
	type ByRoleOptions,
	type GetAllBy,
	queries,
	queryHelpers,
	render,
	type RenderOptions,
	type RenderResult,
	screen,
	within
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next, { type i18n } from 'i18next';
import { filter } from 'lodash';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import { ThemeProvider } from '@zextras/carbonio-design-system';

export type UserEvent = ReturnType<typeof userEvent['setup']> & {
	readonly rightClick: (target: Element) => Promise<void>;
};

/**
 * Matcher function to search a string in more html elements and not just in a single element.
 */
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
	text: string | RegExp
): string => `Found multiple elements with text: ${text}`;
const getByTextWithMarkupMissingError = (
	container: Element | null,
	text: string | RegExp
): string => `Unable to find an element with text: ${text}`;

type ByRoleWithIconOptions = ByRoleOptions & {
	icon: string | RegExp;
};
/**
 * Matcher function to search an icon button through the icon data-testid
 */
const queryAllByRoleWithIcon: GetAllBy<[ByRoleMatcher, ByRoleWithIconOptions]> = (
	container,
	role,
	{ icon, ...options }
) =>
	filter(
		screen.queryAllByRole('button', options),
		(element) => within(element).queryByTestId(icon) !== null
	);
const getByRoleWithIconMultipleError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Found multiple elements with role ${role} and icon ${options.icon}`;
const getByRoleWithIconMissingError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Unable to find an element with role ${role} and icon ${options.icon}`;

const [
	queryByTextWithMarkup,
	getAllByTextWithMarkup,
	getByTextWithMarkup,
	findAllByTextWithMarkup,
	findByTextWithMarkup
] = queryHelpers.buildQueries<[string | RegExp]>(
	queryAllByTextWithMarkup,
	getByTextWithMarkupMultipleError,
	getByTextWithMarkupMissingError
);

const [
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
] = queryHelpers.buildQueries<[ByRoleMatcher, ByRoleWithIconOptions]>(
	queryAllByRoleWithIcon,
	getByRoleWithIconMultipleError,
	getByRoleWithIconMissingError
);

const customQueries = {
	// byTextWithMarkup
	queryByTextWithMarkup,
	getAllByTextWithMarkup,
	getByTextWithMarkup,
	findAllByTextWithMarkup,
	findByTextWithMarkup,
	// byRoleWithIcon
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
};

const getAppI18n = (): i18n => {
	const newI18n = i18next.createInstance();
	newI18n
		// init i18next
		// for all options read: https://www.i18next.com/overview/configuration-options
		.init({
			lng: 'en',
			fallbackLng: 'en',
			debug: false,

			interpolation: {
				escapeValue: false // not needed for react as it escapes by default
			},
			resources: { en: { translation: {} } }
		});
	return newI18n;
};

interface WrapperProps {
	children?: React.ReactNode | undefined;
	initialRouterEntries?: string[];
}

export const I18NextTestProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const i18nInstance = useMemo(() => getAppI18n(), []);

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

const Wrapper = ({ initialRouterEntries, children }: WrapperProps): JSX.Element => (
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
	}: WrapperProps & {
		options?: Omit<RenderOptions, 'queries' | 'wrapper'>;
	} = {}
): RenderResult<typeof queries & typeof customQueries> {
	return render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
			<Wrapper initialRouterEntries={initialRouterEntries}>{children}</Wrapper>
		),
		queries: { ...queries, ...customQueries },
		...options
	});
}

type SetupOptions = Pick<WrapperProps, 'initialRouterEntries'> & {
	renderOptions?: Omit<RenderOptions, 'queries'>;
	setupOptions?: Parameters<typeof userEvent['setup']>[0];
};

const setupUserEvent = (options: SetupOptions['setupOptions']): UserEvent => {
	const user = userEvent.setup(options);
	const rightClick = (target: Element): Promise<void> =>
		user.pointer({ target, keys: '[MouseRight]' });

	return {
		...user,
		rightClick
	};
};

export const setup = (
	ui: ReactElement,
	options?: SetupOptions
): { user: UserEvent } & ReturnType<typeof customRender> => ({
	user: setupUserEvent({ advanceTimers: jest.advanceTimersByTime, ...options?.setupOptions }),
	...customRender(ui, {
		initialRouterEntries: options?.initialRouterEntries,
		...options?.renderOptions
	})
});

export function makeListItemsVisible(): void {
	const { calls, instances } = (
		window.IntersectionObserver as jest.Mock<
			IntersectionObserver,
			[callback: IntersectionObserverCallback, options?: IntersectionObserverInit]
		>
	).mock;
	calls.forEach((call, index) => {
		const [onChange] = call;
		// trigger the intersection on the observed element
		act(() => {
			onChange(
				[
					{
						intersectionRatio: 0,
						isIntersecting: true
					} as IntersectionObserverEntry
				],
				instances[index]
			);
		});
	});
}
