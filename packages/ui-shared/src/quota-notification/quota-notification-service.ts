/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type {
	QuotaNotificationConfig,
	QuotaNotificationFieldError,
	QuotaNotificationIntervalDays,
	QuotaNotificationTarget,
} from './types';

const QUOTA_NOTIFICATION_API_BASE_URL =
	'/service/extension/zextras_admin/powerstore/quota/notification/configs';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class QuotaNotificationApiError extends Error {
	readonly status: number;

	readonly errors: Array<QuotaNotificationFieldError>;

	constructor(status: number, message: string, errors: Array<QuotaNotificationFieldError> = []) {
		super(message);
		this.name = 'QuotaNotificationApiError';
		this.status = status;
		this.errors = errors;
	}
}

type QuotaNotificationPart = 'content' | 'interval';

function buildUrl(
	target: QuotaNotificationTarget,
	id: string,
	part?: QuotaNotificationPart,
): string {
	const base = `${QUOTA_NOTIFICATION_API_BASE_URL}/${target}/${encodeURIComponent(id)}`;
	return part ? `${base}/${part}` : base;
}

async function parseFieldErrors(response: Response): Promise<Array<QuotaNotificationFieldError>> {
	try {
		const body = (await response.json()) as { errors?: Array<QuotaNotificationFieldError> };
		return Array.isArray(body?.errors) ? body.errors : [];
	} catch {
		return [];
	}
}

async function request(url: string, init?: RequestInit): Promise<Response> {
	const response = await fetch(url, init);
	if (!response.ok) {
		const errors = response.status === 400 ? await parseFieldErrors(response) : [];
		throw new QuotaNotificationApiError(response.status, response.statusText, errors);
	}
	return response;
}

/** Effective value, source and inherited value of the notification configuration of a target. */
export async function getQuotaNotificationConfig(
	target: QuotaNotificationTarget,
	id: string,
): Promise<QuotaNotificationConfig> {
	const response = await request(buildUrl(target, id), { headers: JSON_HEADERS });
	return (await response.json()) as QuotaNotificationConfig;
}

export async function putQuotaNotificationContent(
	target: QuotaNotificationTarget,
	id: string,
	content: { subject: string; body: string },
): Promise<void> {
	await request(buildUrl(target, id, 'content'), {
		method: 'PUT',
		headers: JSON_HEADERS,
		body: JSON.stringify(content),
	});
}

export async function deleteQuotaNotificationContent(
	target: QuotaNotificationTarget,
	id: string,
): Promise<void> {
	await request(buildUrl(target, id, 'content'), { method: 'DELETE', headers: JSON_HEADERS });
}

export async function putQuotaNotificationInterval(
	target: QuotaNotificationTarget,
	id: string,
	days: QuotaNotificationIntervalDays,
): Promise<void> {
	await request(buildUrl(target, id, 'interval'), {
		method: 'PUT',
		headers: JSON_HEADERS,
		body: JSON.stringify({ days }),
	});
}

export async function deleteQuotaNotificationInterval(
	target: QuotaNotificationTarget,
	id: string,
): Promise<void> {
	await request(buildUrl(target, id, 'interval'), { method: 'DELETE', headers: JSON_HEADERS });
}
