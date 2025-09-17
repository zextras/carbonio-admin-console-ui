/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BrowserClient, Hub } from '@sentry/browser';
import { reduce } from 'lodash';
import { create } from 'zustand';

import { SHELL_APP_ID } from '../constants';
import { CarbonioModule } from '../types/apps';

type ReporterState = {
	clients: Record<string, Hub>;
	setClients: (apps: Array<CarbonioModule>) => void;
};

export const useReporter = create<ReporterState>((set) => ({
	clients: {
		[SHELL_APP_ID]: new Hub(
			new BrowserClient({
				dsn: 'https://0ce2448c05b94f0182c47ae52c7ff52c@feedback.zextras.tools/6',
				release: '0',
				maxValueLength: 500
			})
		),
		feedbacks: new Hub(
			new BrowserClient({
				dsn: 'https://b93587078dad409fb79180ddc716b14b@feedback.zextras.tools/27',
				release: '0',
				maxValueLength: 500
			})
		)
	},
	setClients: (apps): void => {
		set((s) => ({
			clients: reduce(
				apps,
				(acc, app) => {
					if (app.sentryDsn) {
						// eslint-disable-next-line no-param-reassign
						s.clients[app.name] = new Hub(
							new BrowserClient({
								dsn: app.sentryDsn,
								release: app.version,
								maxValueLength: 500
							})
						);
					}
					return acc;
				},
				s.clients
			)
		}));
	}
}));
