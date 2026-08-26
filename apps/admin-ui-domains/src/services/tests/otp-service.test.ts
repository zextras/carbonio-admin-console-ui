/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../generateOTP-service', async (importOriginal) => {
	const original = await importOriginal<typeof import('../generateOTP-service')>();
	return {
		...original,
		fetchSoap: vi.fn(),
	};
});

import { ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../generateOTP-service';
import {
	deleteTotp,
	generateTotp,
	restoreTotp,
} from '../otp-service';

describe('otp-service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('generateTotp sends the ZxAuth totp_generate_command for the account', async () => {
		vi.mocked(fetchSoap).mockResolvedValue({ ok: true, response: { secret: 'abc' } });

		await generateTotp('user@example.com');

		expect(fetchSoap).toHaveBeenCalledWith('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'totp_generate_command',
			account: 'user@example.com',
		});
	});

	it('deleteTotp sends the ZxAuth delete_totp_command with the OTP id', async () => {
		vi.mocked(fetchSoap).mockResolvedValue({ ok: true });

		await deleteTotp('user@example.com', 'otp-1');

		expect(fetchSoap).toHaveBeenCalledWith('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'delete_totp_command',
			account: 'user@example.com',
			id: 'otp-1',
		});
	});

	it('restoreTotp sends the ZxAuth restore-otp command with the OTP id', async () => {
		vi.mocked(fetchSoap).mockResolvedValue({ ok: true });

		await restoreTotp('user@example.com', 'otp-1');

		expect(fetchSoap).toHaveBeenCalledWith('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'restore-otp',
			account: 'user@example.com',
			id: 'otp-1',
		});
	});
});
