/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { batchService } from '../batch-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('batchService', () => {
	it('sends the batch request without otherAccount by default', async () => {
		vi.mocked(soapFetch).mockResolvedValue({});

		await batchService({ CreateDomainRequest: {}, DeleteAccountRequest: {} });

		expect(soapFetch).toHaveBeenCalledWith('Batch', { CreateDomainRequest: {}, DeleteAccountRequest: {} }, { otherAccount: undefined });
	});

	it('forwards otherAccount when provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({});

		await batchService({ NoOpRequest: {} }, 'delegate@example.com');

		expect(soapFetch).toHaveBeenCalledWith('Batch', { NoOpRequest: {} }, { otherAccount: 'delegate@example.com' });
	});
});
