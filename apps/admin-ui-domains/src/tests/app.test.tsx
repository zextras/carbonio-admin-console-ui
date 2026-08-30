/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from '@testing-library/react';
import { type Mock, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
	PrimaryBarTooltip: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="primary-bar-tooltip">{children}</div>
	),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [(key: string, fallback?: string) => fallback || key, { i18n: {} }],
	Trans: ({ defaults }: { defaults: string }) => <>{defaults}</>,
}));

vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
}));

vi.mock('../views/app-view', () => ({
	AppView: () => <div data-testid="app-view" />,
}));

import { addRoute, registerActions, useCurrentUserRights } from '@zextras/ui-shared';
import { useNavigate } from 'react-router';

import App from '../app';
import {
	APP_ID,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	DOMAINS_ROUTE_ID,
	MANAGE,
	PRIMARY_BAR_DOMAINS,
} from '../constants';

const RIGHTS_WITH_GET_ATTRS = [
	{
		type: 'global',
		all: [{ getAttrs: [{ all: true }] }],
	},
];

const RIGHTS_WITH_SET_ATTRS = [
	{
		type: 'global',
		all: [{ setAttrs: [{ all: true }] }],
	},
];

const RIGHTS_WITH_CREATE_TOP_DOMAIN = [
	{
		type: 'global',
		all: [{ right: [{ n: 'createTopDomain' }] }],
	},
];

const RIGHTS_WITHOUT_CREATE_DOMAIN = [
	{
		type: 'global',
		all: [],
	},
];

const RIGHTS_WITHOUT_GLOBAL = [
	{
		type: 'account',
		all: [{ getAttrs: [{ all: true }] }],
	},
];

describe('App', () => {
	beforeEach(() => {
		(useCurrentUserRights as unknown as Mock).mockReturnValue({ data: RIGHTS_WITH_GET_ATTRS });
		(useNavigate as unknown as Mock).mockReturnValue(vi.fn());
	});

	it('should call addRoute with the correct config', () => {
		render(<App />);

		expect(addRoute).toHaveBeenCalledWith(
			expect.objectContaining({
				route: DOMAINS_ROUTE_ID,
				position: 1,
				visible: true,
				label: 'Domains',
				primaryBar: 'AtOutline',
				trackerLabel: PRIMARY_BAR_DOMAINS,
			}),
		);
	});

	it('should pass AppView and the tooltip to addRoute under the management section', () => {
		render(<App />);

		const callArgs = (addRoute as Mock).mock.calls[0][0];
		expect(callArgs.appView).toBeDefined();
		expect(callArgs.tooltip).toBeTypeOf('function');
		expect(callArgs.primarybarSection).toEqual({
			id: 'manage',
			label: 'Management',
			position: 3,
		});
	});

	it('should register the new-domain action with id and type new', () => {
		render(<App />);

		expect(registerActions).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'new-domain',
				type: 'new',
			}),
		);
	});

	it('should register action with correct group, label, icon, and primary', () => {
		render(<App />);

		const registeredCall = (registerActions as Mock).mock.calls[0][0];
		const action = registeredCall.action();
		expect(action.group).toBe(APP_ID);
		expect(action.id).toBe('new-domain');
		expect(action.label).toBe('Create New Domain');
		expect(action.icon).toBe('');
		expect(action.primary).toBe(false);
	});

	it.each([
		['getAttrs', RIGHTS_WITH_GET_ATTRS],
		['setAttrs', RIGHTS_WITH_SET_ATTRS],
		['createTopDomain right', RIGHTS_WITH_CREATE_TOP_DOMAIN],
	])('should enable the create domain action when %s grants it', (_name, rights) => {
		(useCurrentUserRights as unknown as Mock).mockReturnValue({ data: rights });

		render(<App />);

		const registeredCall = (registerActions as Mock).mock.calls[0][0];
		const action = registeredCall.action();
		expect(action.disabled).toBe(false);
	});

	it.each([
		['global rights without grants', RIGHTS_WITHOUT_CREATE_DOMAIN],
		['no global rights entry', RIGHTS_WITHOUT_GLOBAL],
		['undefined rights data', undefined],
	])('should disable the create domain action when %s', (_name, rights) => {
		(useCurrentUserRights as unknown as Mock).mockReturnValue({ data: rights });

		render(<App />);

		const registeredCall = (registerActions as Mock).mock.calls[0][0];
		const action = registeredCall.action();
		expect(action.disabled).toBe(true);
	});

	it('should navigate to the create new domain route on action onClick', () => {
		const mockNavigate = vi.fn();
		(useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

		render(<App />);

		const registeredCall = (registerActions as Mock).mock.calls[0][0];
		const action = registeredCall.action();
		action.onClick();

		expect(mockNavigate).toHaveBeenCalledWith(
			`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`,
		);
	});

	it('should render null', () => {
		const { container } = render(<App />);
		expect(container.innerHTML).toBe('');
	});
});
