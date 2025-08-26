/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Event, EventHint, Severity } from '@sentry/browser';

import { useReporter } from './store';
import { getIsAdvanced } from '../store/advance';

export const report =
	(appId: string) =>
	(error: Event, hint?: EventHint): string => {
		const reporter = useReporter.getState();
		const eventId = reporter.clients[appId]?.captureException(error, { ...hint });
		if (eventId) {
			console.info('Reported event ', eventId);
		}
		return eventId;
	};

export const feedback = (message: Event, data: unknown): string => {
	const reporter = useReporter.getState();
	const isAdvanced = getIsAdvanced();

	const eventId = reporter.clients.feedbacks.captureEvent({
		...message,
		level: Severity.Info,
		tags: {
			// carbonio_ui_version: '',
			// carbonio_admin_version: '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			carbonio_backend_version: data?.carbonioBackendVersion || '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			carbonio_admin_UI_version: data?.carbonioAdminUIVersion || '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			total_accounts: data?.totalAccounts || '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			total_domains: data?.totalDomains || '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			total_servers: data?.totalServers || '',
			carbonio_ce: !isAdvanced
		}
	});
	if (eventId) {
		console.info('Feedback ', eventId, ' sent, Thank you');
	}
	// return eventId;
	return JSON.stringify({
		eventId,
		// carbonio_ui_version: '',
		// carbonio_admin_version: '',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		carbonio_backend_version: data.carbonioBackendVersion,
		carbonio_ce: !isAdvanced,
		...message
	});
};
