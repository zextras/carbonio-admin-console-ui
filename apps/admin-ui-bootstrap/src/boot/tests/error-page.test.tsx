/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-components', () => ({
	Button: ({
		label,
		onClick,
	}: {
		label?: string;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{label}
		</button>
	),
	Container: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	Row: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => [
		(key: string, fallback?: string): string => fallback ?? key,
	],
}));

import { ErrorPage } from '../error-page';

describe('ErrorPage', () => {
	let reloadSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		reloadSpy = vi.fn();
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { reload: reloadSpy },
		});
	});

	it('renders the error heading', () => {
		render(<ErrorPage />);
		expect(screen.getByText('Something went wrong')).not.toBeNull();
	});

	it('renders the error description text', () => {
		render(<ErrorPage />);
		expect(
			screen.getByText(
				'We’re sorry, but there was an error trying to load this page.',
			),
		).not.toBeNull();
	});

	it('renders a refresh button', () => {
		render(<ErrorPage />);
		expect(screen.getByRole('button', { name: 'REFRESH' })).not.toBeNull();
	});

	it('calls window.location.reload when the refresh button is clicked', () => {
		render(<ErrorPage />);
		fireEvent.click(screen.getByRole('button', { name: 'REFRESH' }));
		expect(reloadSpy).toHaveBeenCalledTimes(1);
	});
});
