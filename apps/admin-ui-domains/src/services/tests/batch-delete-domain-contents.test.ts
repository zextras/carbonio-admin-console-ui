/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	batchService: vi.fn(),
}));

import { batchService, type DirectoryEntry } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../../constants';
import { batchDeleteDomainContents } from '../batch-delete-domain-contents';

function makeEntry(id: string, name: string): DirectoryEntry {
	return { id, name, a: [] };
}

describe('batchDeleteDomainContents', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps accounts, distribution lists, and calendar resources into batch delete requests', async () => {
		const response = { Fault: [{ Reason: { Text: 'ok' } }] };
		vi.mocked(batchService).mockResolvedValue(response);

		const result = await batchDeleteDomainContents({
			accounts: [makeEntry('acc-1', 'a@example.com'), makeEntry('acc-2', 'b@example.com')],
			distributionLists: [makeEntry('dl-1', 'list@example.com')],
			calendarResources: [makeEntry('res-1', 'room@example.com')],
		});

		expect(batchService).toHaveBeenCalledWith({
			DeleteDistributionListRequest: [{ id: { _content: 'dl-1' }, _jsns: ZIMBRA_ADMIN_URN }],
			DeleteCalendarResourceRequest: [{ id: 'res-1', _jsns: ZIMBRA_ADMIN_URN }],
			DeleteAccountRequest: [
				{ id: 'acc-1', _jsns: ZIMBRA_ADMIN_URN },
				{ id: 'acc-2', _jsns: ZIMBRA_ADMIN_URN },
			],
			_jsns: 'urn:zimbra',
		});
		expect(result).toBe(response);
	});

	it('sends empty request arrays when the domain has no contents', async () => {
		vi.mocked(batchService).mockResolvedValue({});

		await batchDeleteDomainContents({
			accounts: [],
			distributionLists: [],
			calendarResources: [],
		});

		expect(batchService).toHaveBeenCalledWith({
			DeleteDistributionListRequest: [],
			DeleteCalendarResourceRequest: [],
			DeleteAccountRequest: [],
			_jsns: 'urn:zimbra',
		});
	});
});
