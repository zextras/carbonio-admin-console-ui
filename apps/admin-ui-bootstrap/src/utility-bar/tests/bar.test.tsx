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
	CARBONIO_ADMIN_DOCUMENTATION_URL_ATTRIBUTE: 'carbonioAdminDocumentationUrl',
	CARBONIO_CE_ADMIN_DOCUMENTATION_URL: 'https://docs.example.com/ce',
	logout: vi.fn(),
	useConfigAttribute: vi.fn(),
	useIsAdvanced: vi.fn(),
	useUserAccount: vi.fn(),
	useUtilityBarStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [
		(key: string, fallback?: string): string => fallback ?? key,
	],
}));

vi.mock('../utils', () => ({
	openLink: vi.fn(),
	useUtilityViews: vi.fn(),
}));

import {
	logout,
	useConfigAttribute,
	useIsAdvanced,
	useUserAccount,
	useUtilityBarStore,
} from '@zextras/ui-shared';

import { ShellUtilityBar } from '../bar';
import { openLink, useUtilityViews } from '../utils';

describe('ShellUtilityBar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useUtilityViews).mockReturnValue([]);
		vi.mocked(useUserAccount).mockReturnValue({ name: 'Test User' } as never);
		vi.mocked(useIsAdvanced).mockReturnValue(false);
		vi.mocked(useConfigAttribute).mockReturnValue({ data: undefined } as never);
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

	it('renders help and logout dropdown items', () => {
		render(<ShellUtilityBar />);
		expect(
			screen.getByRole('button', { name: 'Help & Documentation' }),
		).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Logout' })).toBeTruthy();
	});

	it('calls openLink with the help URL when Help & Documentation is clicked', () => {
		render(<ShellUtilityBar />);
		fireEvent.click(
			screen.getByRole('button', { name: 'Help & Documentation' }),
		);
		expect(openLink).toHaveBeenCalledWith('https://docs.example.com/ce');
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
