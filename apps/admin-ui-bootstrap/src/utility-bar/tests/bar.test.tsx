/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
	Button: (props: Record<string, unknown>) => (
		<button
			type="button"
			onClick={props.onClick as (() => void) | undefined}
			aria-label={props['aria-label'] as string | undefined}
		>
			{props.icon as ReactNode}
		</button>
	),
	Container: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	Dropdown: ({
		items,
		children,
	}: {
		items?: Array<{ id: string; label: string; onClick: () => void }>;
		children?: ReactNode;
	}) => (
		<div>
			{children}
			<ul>
				{items?.map((item) => (
					<li key={item.id}>
						<button type="button" onClick={item.onClick}>
							{item.label}
						</button>
					</li>
				))}
			</ul>
		</div>
	),
	Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock('@zextras/ui-shared', () => ({
	CARBONIO_CE_ADMIN_DOCUMENTATION_URL: 'https://docs.example.com/ce',
	logout: vi.fn(),
	useIsAdvanced: vi.fn(),
	useUserAccount: vi.fn(),
	useUtilityBarStore: vi.fn(),
}));

vi.mock('../use-documentation-base-url', () => ({
	useDocumentationBaseUrl: vi.fn(),
}));

vi.mock('../use-documentation-context', () => ({
	useDocumentationContext: vi.fn(),
}));

vi.mock('../use-server-version', () => ({
	useServerVersion: vi.fn(),
}));

vi.mock('../build-documentation-url', () => ({
	buildDocumentationUrl: vi.fn((baseUrl: string) => baseUrl),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [
		(key: string, fallback?: string, options?: Record<string, string>): string => {
			const text = fallback ?? key;
			return options
				? text.replace(/{{(\w+)}}/g, (_match, token: string) => options[token] ?? '')
				: text;
		},
	],
}));

vi.mock('../utils', () => ({
	openLink: vi.fn(),
	useUtilityViews: vi.fn(),
}));

import { logout, useIsAdvanced, useUserAccount, useUtilityBarStore } from '@zextras/ui-shared';

import { ShellUtilityBar } from '../bar';
import { buildDocumentationUrl } from '../build-documentation-url';
import { useDocumentationBaseUrl } from '../use-documentation-base-url';
import { useDocumentationContext } from '../use-documentation-context';
import { useServerVersion } from '../use-server-version';
import { openLink, useUtilityViews } from '../utils';

describe('ShellUtilityBar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useUtilityViews).mockReturnValue([]);
		vi.mocked(useUserAccount).mockReturnValue({ name: 'Test User' } as never);
		vi.mocked(useIsAdvanced).mockReturnValue(false);
		vi.mocked(useDocumentationBaseUrl).mockReturnValue('https://docs.example.com/landing');
		vi.mocked(useServerVersion).mockReturnValue({ serverVersion: '', isLoading: false } as never);
		vi.mocked(useDocumentationContext).mockReturnValue({
			module: 'admin',
			moduleLabelKey: 'label.admin',
			moduleLabelFallback: 'Admin',
		});
		vi.mocked(useUtilityBarStore).mockReturnValue({
			mode: 'closed',
			current: undefined,
			setMode: vi.fn(),
			setCurrent: vi.fn(),
		});
	});

	it('renders without crashing', () => {
		const { container } = render(<ShellUtilityBar />);
		expect(container).toBeTruthy();
	});

	it('displays clipped account name when name exceeds 32 characters', () => {
		vi.mocked(useUserAccount).mockReturnValue({ name: 'A'.repeat(40) } as never);
		render(<ShellUtilityBar />);
		expect(screen.getByText(`${'A'.repeat(32)}...`)).toBeTruthy();
	});

	it('displays full account name when name is short', () => {
		vi.mocked(useUserAccount).mockReturnValue({ name: 'John Doe' } as never);
		render(<ShellUtilityBar />);
		expect(screen.getByText('John Doe')).toBeTruthy();
	});

	it('renders the avatar button with aria-label Account menu', () => {
		render(<ShellUtilityBar />);
		expect(screen.getByRole('button', { name: 'Account menu' })).toBeTruthy();
	});

	it('renders the standalone help button and the logout dropdown item', () => {
		render(<ShellUtilityBar />);
		expect(
			screen.getByRole('button', { name: 'Documentation: Admin' }),
		).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Logout' })).toBeTruthy();
	});

	it('labels the help button with the current module (e.g. Domains)', () => {
		vi.mocked(useDocumentationContext).mockReturnValue({
			module: 'domains',
			moduleLabelKey: 'label.domains',
			moduleLabelFallback: 'Domains',
		});
		render(<ShellUtilityBar />);
		expect(
			screen.getByRole('button', { name: 'Documentation: Domains' }),
		).toBeTruthy();
	});

	it('calls openLink with the help URL when the help button is clicked', () => {
		render(<ShellUtilityBar />);
		fireEvent.click(
			screen.getByRole('button', { name: 'Documentation: Admin' }),
		);
		expect(openLink).toHaveBeenCalledWith('https://docs.example.com/ce');
	});

	it('builds the doc URL from base URL, server version and module/context when advanced', () => {
		vi.mocked(useIsAdvanced).mockReturnValue(true);
		vi.mocked(useServerVersion).mockReturnValue({
			serverVersion: '26.9.0',
			isLoading: false,
		} as never);
		vi.mocked(useDocumentationContext).mockReturnValue({
			module: 'domains',
			context: 'general',
			moduleLabelKey: 'label.domains',
			moduleLabelFallback: 'Domains',
		});
		render(<ShellUtilityBar />);
		fireEvent.click(
			screen.getByRole('button', { name: 'Documentation: Domains' }),
		);
		expect(buildDocumentationUrl).toHaveBeenCalledWith('https://docs.example.com/landing', {
			v: '26.9.0',
			m: 'domains',
			c: 'general',
		});
		expect(openLink).toHaveBeenCalledWith('https://docs.example.com/landing');
	});

	it('omits version and context from the built doc URL when unavailable (advanced)', () => {
		vi.mocked(useIsAdvanced).mockReturnValue(true);
		render(<ShellUtilityBar />);
		fireEvent.click(
			screen.getByRole('button', { name: 'Documentation: Admin' }),
		);
		expect(buildDocumentationUrl).toHaveBeenCalledWith('https://docs.example.com/landing', {
			v: undefined,
			m: 'admin',
			c: undefined,
		});
	});

	it('calls logout when Logout is clicked', () => {
		render(<ShellUtilityBar />);
		fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
		expect(logout).toHaveBeenCalledTimes(1);
	});

	describe('UtilityBarItem', () => {
		it('renders an icon button when view.button is a string', () => {
			vi.mocked(useUtilityViews).mockReturnValue([
				{ id: 'v1', button: 'SomeIcon', label: 'View One' },
			] as never);
			render(<ShellUtilityBar />);
			expect(
				screen.getByRole('button', { name: 'View One' }),
			).toBeTruthy();
		});

		it('renders the custom component when view.button is not a string', () => {
			const CustomButton = (): ReactNode => <div>Custom View Content</div>;
			vi.mocked(useUtilityViews).mockReturnValue([
				{ id: 'v1', button: CustomButton, label: 'View One' },
			] as never);
			render(<ShellUtilityBar />);
			expect(screen.getByText('Custom View Content')).toBeTruthy();
		});
	});
});
