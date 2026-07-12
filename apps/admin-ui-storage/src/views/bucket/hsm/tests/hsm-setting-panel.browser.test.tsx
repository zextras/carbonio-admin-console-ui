/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	advancedSupportedApiForBrowser,
	createBrowserSoapAPIInterceptor,
	createBrowserZextrasActionInterceptor,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { HSM_SETTINGS } from '../../../../constants';
import HSMsettingPanel from '../hsm-setting-panel';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const HSM_POLICIES = [
	{ hsmQuery: 'before:-30d', hsmType: [5] },
	{ hsmQuery: 'before:-90d', hsmType: [5, 8, 6, 11] },
];

const VOLUMES = [
	{ id: 1, name: 'primary-vol', type: 1, path: '/opt/zextras/store' },
	{ id: 2, name: 'secondary-vol', type: 2, path: '/opt/zextras/secondary' },
];

function setupAllServersInterceptor(): void {
	createBrowserSoapAPIInterceptor('GetAllServers', {
		server: [
			{
				id: SERVER_ID,
				name: SERVER_NAME,
				a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
			},
		],
	});
}

function setupGetHSMPolicyInterceptor(policies: Array<{ hsmQuery: string; hsmType: Array<number> }> = HSM_POLICIES): void {
	createBrowserZextrasActionInterceptor('getHSMPolicy', () =>
		HttpResponse.json({
			Body: {
				response: {
					content: JSON.stringify({
						ok: true,
						response: {
							[SERVER_NAME]: {
								response: { policies },
							},
						},
					}),
				},
			},
		}),
	);
}

function setupGetAllVolumesInterceptor(): void {
	createBrowserSoapAPIInterceptor('GetAllVolumes', {
		volume: VOLUMES,
		_jsns: 'urn:zimbraAdmin',
	});
}

function setupPowerstoreAttributesInterceptor(): void {
	worker.use(
		http.get('/service/extension/zextras_admin/core/getAllServers', () =>
			HttpResponse.json({
				servers: [
					{
						[SERVER_NAME]: {
							name: SERVER_NAME,
							ZxPowerstore: {
								attributes: {
									powerstoreMoveScheduler: {
										value: { 'cron-pattern': '0 2 * * 3', 'cron-enabled': true },
									},
									ZxPowerstore_SpaceThreshold: { value: 80 },
									deduplicateAfterScheduledMoveBlobs: { value: false },
									ZxPowerstore_MoveSchedulingEnabled: { value: true },
								},
							},
						},
					},
				],
			}),
		),
	);
}

function setupAllInterceptors(
	policies: Array<{ hsmQuery: string; hsmType: Array<number> }> = HSM_POLICIES,
): void {
	setupAllServersInterceptor();
	setupGetHSMPolicyInterceptor(policies);
	setupGetAllVolumesInterceptor();
	setupPowerstoreAttributesInterceptor();
}

function renderPanel(): React.ReactElement {
	return (
		<Routes>
			<Route path={`/:server/${HSM_SETTINGS}`} element={<HSMsettingPanel />} />
		</Routes>
	);
}

describe('HSMsettingPanel (browser)', () => {
	beforeEach(async () => {
		await advancedSupportedApiForBrowser.withAdvancedNotSupported();
	});

	describe('Rendering', () => {
		it('should render the server name in the title', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText(`${SERVER_NAME} HSM Policies`, { exact: true }))
				.toBeVisible();
		});

		it('should render the Scheduling section label', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('Scheduling', { exact: true }))
				.toBeVisible();
		});

		it('should render the Enable Scheduler switch', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('Enable Scheduler', { exact: true }))
				.toBeVisible();
		});

		it('should render the Schedule input with example', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText(/Schedule.*E\.g\. 0 2 \* \* 3/))
				.toBeVisible();
		});

		it('should render the Apply Deduplication switch', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('Apply Deduplication after scheduled HSM', { exact: true }))
				.toBeVisible();
		});

		it('should render the HSM Policies List section', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('HSM Policies List', { exact: true }))
				.toBeVisible();
		});

		it('should render the New button', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /^new$/i }))
				.toBeVisible();
		});

		it('should render the Run All button', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /run all/i }))
				.toBeVisible();
		});

		it('should render the Delete button', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /^delete$/i }))
				.toBeVisible();
		});

		it('should render the Minimum Space Threshold input', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('Minimum Space Threshold', { exact: true }))
				.toBeVisible();
		});

		it('should render the default policy warning message', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(
					page.getByText(
						/At least one policy will always stay up/,
					),
				)
				.toBeVisible();
		});
	});

	describe('Policy list display', () => {
		it('should display policy data in the table when policies exist', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('message:before:-30d', { exact: true }))
				.toBeVisible();
			await expect
				.element(
					page.getByText('document,message,contact,appointment:before:-90d', {
						exact: true,
					}),
				)
				.toBeVisible();
		});

		it('should render the Policy Name table header', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByText('Policy Name', { exact: true }))
				.toBeVisible();
		});

		it('should not display policy rows when no policies exist', async () => {
			setupAllInterceptors([]);
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			expect(
				page.getByText('message:before:-30d', { exact: true }).elements(),
			).toHaveLength(0);
		});

		it('should disable Run All button when no policies exist', async () => {
			setupAllInterceptors([]);
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /run all/i }))
				.toBeDisabled();
		});

		it('should disable Delete button when no policy is selected', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /^delete$/i }))
				.toBeDisabled();
		});
	});

	describe('Button states', () => {
		it('should enable Run All button when policies exist', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /run all/i }))
				.toBeEnabled();
		});

		it('should enable New button', async () => {
			setupAllInterceptors();
			await setupBrowserTest(renderPanel(), {
				initialRouterEntry: `/${SERVER_NAME}/${HSM_SETTINGS}`,
			});
			await expect
				.element(page.getByRole('button', { name: /^new$/i }))
				.toBeEnabled();
		});
	});
});
