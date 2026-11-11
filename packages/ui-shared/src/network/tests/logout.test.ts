/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useLoginConfigStore } from '../../store/login/store';
import { goTo, goToLogin } from '../go-to-login';
import { logout } from '../logout';

vi.mock('../go-to-login', () => ({
	goTo: vi.fn(),
	goToLogin: vi.fn(),
}));

describe('logout', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		useLoginConfigStore.setState({ carbonioAdminUiLogoutURL: undefined });
	});

	it('should call /logout using the POST method', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await logout();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith('/logout', { method: 'POST', redirect: 'manual' });
	});

	it('should navigate to the login page when no custom logout URL is configured', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 })));
		useLoginConfigStore.setState({ carbonioAdminUiLogoutURL: undefined });

		await logout();

		expect(goToLogin).toHaveBeenCalledTimes(1);
		expect(goTo).not.toHaveBeenCalled();
	});

	it('should navigate to the custom logout URL when configured', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 })));
		useLoginConfigStore.setState({ carbonioAdminUiLogoutURL: 'https://custom.example/logout' });

		await logout();

		expect(goTo).toHaveBeenCalledWith('https://custom.example/logout');
		expect(goToLogin).not.toHaveBeenCalled();
	});
});
