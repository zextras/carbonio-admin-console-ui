/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/admin-ui-bootstrap';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { sendMail } from '../send-mail-service';

vi.mock('@zextras/admin-ui-bootstrap', () => ({
	postSoapFetchRequest: vi.fn()
}));

describe('sendMail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call postSoapFetchRequest with correct parameters', async () => {
		const mockResponse = {
			Body: {
				response: {
					content: '{"success": true}'
				}
			}
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const api = 'TestAPI';
		const body = { test: 'data' };

		await sendMail(api, body);

		expect(postSoapFetchRequest).toHaveBeenCalledWith(
			'/service/admin/soap/zextras',
			body,
			'TestAPI'
		);
	});

	it('should parse JSON content when response contains content', async () => {
		const mockContent = { success: true, message: 'Email sent' };
		const mockResponse = {
			Body: {
				response: {
					content: JSON.stringify(mockContent)
				}
			}
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('SendEmail', { to: 'test@example.com' });

		expect(result).toEqual(mockContent);
	});

	it('should return Body when response does not contain content', async () => {
		const mockBody = {
			someField: 'value',
			anotherField: 123
		};
		const mockResponse = {
			Body: mockBody
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('GetStatus', {});

		expect(result).toEqual(mockBody);
	});

	it('should return Body when response is undefined', async () => {
		const mockBody = {
			data: 'test'
		};
		const mockResponse = {
			Body: mockBody
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('TestAPI', {});

		expect(result).toEqual(mockBody);
	});

	it('should return Body when content is undefined', async () => {
		const mockBody = {
			response: {},
			otherData: 'value'
		};
		const mockResponse = {
			Body: mockBody
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('TestAPI', {});

		expect(result).toEqual(mockBody);
	});

	it('should return Body when Body is undefined', async () => {
		const mockResponse = {};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('TestAPI', {});

		expect(result).toBeUndefined();
	});

	it('should handle complex JSON content', async () => {
		const complexContent = {
			users: [
				{ id: 1, name: 'User 1' },
				{ id: 2, name: 'User 2' }
			],
			metadata: {
				total: 2,
				page: 1
			}
		};
		const mockResponse = {
			Body: {
				response: {
					content: JSON.stringify(complexContent)
				}
			}
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('GetUsers', {});

		expect(result).toEqual(complexContent);
	});

	it('should handle empty string content', async () => {
		const mockBody = {
			response: {
				content: ''
			}
		};
		const mockResponse = {
			Body: mockBody
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		const result = await sendMail('TestAPI', {});

		expect(result).toEqual(mockBody);
	});

	it('should propagate errors from postSoapFetchRequest', async () => {
		const error = new Error('Network error');
		vi.mocked(postSoapFetchRequest).mockRejectedValue(error);

		await expect(sendMail('TestAPI', {})).rejects.toThrow('Network error');
	});

	it('should handle different body types', async () => {
		const mockResponse = {
			Body: {
				response: {
					content: '{"result": "ok"}'
				}
			}
		};

		vi.mocked(postSoapFetchRequest).mockResolvedValue(mockResponse);

		// Test with object
		await sendMail('API1', { key: 'value' });
		expect(postSoapFetchRequest).toHaveBeenLastCalledWith(
			'/service/admin/soap/zextras',
			{ key: 'value' },
			'API1'
		);

		// Test with array
		await sendMail('API2', [1, 2, 3]);
		expect(postSoapFetchRequest).toHaveBeenLastCalledWith(
			'/service/admin/soap/zextras',
			[1, 2, 3],
			'API2'
		);

		// Test with string
		await sendMail('API3', 'string body');
		expect(postSoapFetchRequest).toHaveBeenLastCalledWith(
			'/service/admin/soap/zextras',
			'string body',
			'API3'
		);
	});
});
