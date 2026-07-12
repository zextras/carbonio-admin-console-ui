/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createVoume } from './create-volume-service';
import { setCurrentVolumeRequest } from './set-current-volume-service';

const mockSoapFetch = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
	soapFetch: mockSoapFetch,
}));

describe('volume services', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSoapFetch.mockResolvedValue({ ok: true });
	});

	describe('createVoume', () => {
		it('should call CreateVolume with only the admin namespace when no attribute is provided', async () => {
			await createVoume();

			expect(mockSoapFetch).toHaveBeenCalledWith('CreateVolume', {
				_jsns: 'urn:zimbraAdmin',
			});
		});

		it('should map volume attributes and normalize isCurrent to boolean', async () => {
			await createVoume({
				compressBlobs: 'true',
				compressionThreshold: '4096',
				isCurrent: 1,
				name: 'primary-volume',
				rootpath: '/opt/zextras/store',
				type: 1,
			});

			expect(mockSoapFetch).toHaveBeenCalledWith('CreateVolume', {
				_jsns: 'urn:zimbraAdmin',
				volume: {
					compressBlobs: 'true',
					compressionThreshold: '4096',
					isCurrent: true,
					name: 'primary-volume',
					rootpath: '/opt/zextras/store',
					type: 1,
				},
			});
		});

		it('should map non-current numeric value to false', async () => {
			await createVoume({
				compressBlobs: 'false',
				compressionThreshold: '1024',
				isCurrent: 0,
				name: 'secondary-volume',
				rootpath: '/opt/zextras/secondary',
				type: 2,
			});

			expect(mockSoapFetch).toHaveBeenCalledWith(
				'CreateVolume',
				expect.objectContaining({
					volume: expect.objectContaining({ isCurrent: false }),
				}),
			);
		});
	});

	describe('setCurrentVolumeRequest', () => {
		it('should call SetCurrentVolume with id and type when provided', async () => {
			await setCurrentVolumeRequest(42, 1);

			expect(mockSoapFetch).toHaveBeenCalledWith('SetCurrentVolume', {
				_jsns: 'urn:zimbraAdmin',
				id: 42,
				type: 1,
			});
		});

		it('should call SetCurrentVolume with id when type is omitted', async () => {
			await setCurrentVolumeRequest('84');

			expect(mockSoapFetch).toHaveBeenCalledWith('SetCurrentVolume', {
				_jsns: 'urn:zimbraAdmin',
				id: '84',
				type: undefined,
			});
		});
	});
});