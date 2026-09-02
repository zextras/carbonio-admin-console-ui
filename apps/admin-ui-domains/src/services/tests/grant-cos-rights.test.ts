/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPostSoapFetchRequest = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
	postSoapFetchRequest: mockPostSoapFetchRequest,
}));

import { grantAllCosRights, grantCosRights, parseCosMaxAccounts, revokeCosRights } from '../grant-cos-rights';

describe('parseCosMaxAccounts', () => {
	it('should map each zimbraDomainCOSMaxAccounts attribute to an id/value pair', () => {
		const attrs = [
			{ n: 'zimbraDomainName', _content: 'example.com' },
			{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-a:50' },
			{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-b:100' },
		];

		expect(parseCosMaxAccounts(attrs)).toEqual([
			{ id: 'cos-a', value: '50' },
			{ id: 'cos-b', value: '100' },
		]);
	});

	it('should fall back to -1 when the max accounts value is missing', () => {
		const attrs = [{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-a' }];

		expect(parseCosMaxAccounts(attrs)).toEqual([{ id: 'cos-a', value: '-1' }]);
	});

	it('should return an empty list when there are no COS max accounts attributes', () => {
		expect(parseCosMaxAccounts([{ n: 'zimbraDomainName', _content: 'example.com' }])).toEqual(
			[],
		);
		expect(parseCosMaxAccounts(undefined)).toEqual([]);
	});
});

describe('grantCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should grant getCos, listCos and assignCos on the COS to the domain helpdesk admins group', async () => {
		mockPostSoapFetchRequest.mockResolvedValue({});

		await grantCosRights('cos-a', 'example.com');

		expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
		const bodies = mockPostSoapFetchRequest.mock.calls.map(
			(call) => call[1],
		) as Array<Record<string, unknown>>;
		expect(
			bodies.map((body) => (body.right as { _content: string })._content).sort(),
		).toEqual(['assignCos', 'getCos', 'listCos']);
		bodies.forEach((body) => {
			expect(body._jsns).toBe('urn:zimbraAdmin');
			expect(body.grantee).toEqual({
				by: 'name',
				type: 'grp',
				_content: '__helpdesk_admins@example.com',
			});
			expect(body.target).toEqual({ _content: 'cos-a', type: 'cos', by: 'id' });
		});
		const firstCall = mockPostSoapFetchRequest.mock.calls[0];
		expect(firstCall[0]).toBe('/service/admin/soap/GrantRightRequest');
		expect(firstCall[2]).toBe('GrantRightRequest');
	});

	it('should issue no requests when there are no COS ids', async () => {
		await grantAllCosRights('example.com', []);

		expect(mockPostSoapFetchRequest).not.toHaveBeenCalled();
	});
});

describe('revokeCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should revoke getCos, listCos and assignCos from the COS', async () => {
		mockPostSoapFetchRequest.mockResolvedValue({});

		await revokeCosRights('cos-a', 'example.com');

		expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(3);
		mockPostSoapFetchRequest.mock.calls.forEach((call) => {
			expect(call[0]).toBe('/service/admin/soap/RevokeRightRequest');
			expect(call[2]).toBe('RevokeRightRequest');
			expect((call[1] as { target: { _content: string } }).target._content).toBe('cos-a');
		});
	});
});

describe('grantAllCosRights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should grant the three rights on every COS', async () => {
		mockPostSoapFetchRequest.mockResolvedValue({});

		await grantAllCosRights('example.com', ['cos-a', 'cos-b']);

		expect(mockPostSoapFetchRequest).toHaveBeenCalledTimes(6);
		const granted = mockPostSoapFetchRequest.mock.calls
			.map(
				(call) =>
					`${(call[1] as { target: { _content: string } }).target._content}:${(call[1] as { right: { _content: string } }).right._content}`,
			)
			.sort();
		expect(granted).toEqual([
			'cos-a:assignCos',
			'cos-a:getCos',
			'cos-a:listCos',
			'cos-b:assignCos',
			'cos-b:getCos',
			'cos-b:listCos',
		]);
	});

	it('should reject when a grant fails', async () => {
		mockPostSoapFetchRequest.mockRejectedValue(new Error('grant failed'));

		await expect(grantAllCosRights('example.com', ['cos-a'])).rejects.toThrow('grant failed');
	});
});
