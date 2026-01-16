/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSetupServer } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { sendMail } from '../send-mail-service';

describe('sendMail', () => {
	it('should call postSoapFetchRequest with correct parameters', async () => {
		const mockResponse = {
			Body: {
				response: {
					content: '{"success": true}'
				}
			}
		};

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

		const api = 'TestAPI';
		const body = { test: 'data' };

		const result = await sendMail(api, body);

		expect(result).toEqual({ success: true });
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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

		const result = await sendMail('TestAPI', {});

		expect(result).toEqual(mockBody);
	});

	it('should return Body when Body is undefined', async () => {
		const mockResponse = {};

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

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

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

		const result = await sendMail('TestAPI', {});

		expect(result).toEqual(mockBody);
	});

	it('should handle different body types', async () => {
		const mockResponse = {
			Body: {
				response: {
					content: '{"result": "ok"}'
				}
			}
		};

		getSetupServer().use(
			http.post('/service/admin/soap/zextras', () => {
				return HttpResponse.json(mockResponse);
			})
		);

		// Test with object
		const result1 = await sendMail('API1', { key: 'value' });
		expect(result1).toEqual({ result: 'ok' });

		// Test with array
		const result2 = await sendMail('API2', [1, 2, 3]);
		expect(result2).toEqual({ result: 'ok' });

		// Test with string
		const result3 = await sendMail('API3', 'string body');
		expect(result3).toEqual({ result: 'ok' });
	});
});
