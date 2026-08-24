/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalActiveSync } from '../global-active-sync/global-active-sync';

type ZextrasRequestBody = {
    Body: {
        zextras: {
            _jsns: string;
            module: string;
            action: string;
            command?: string;
            attribute?: string;
            value?: unknown;
            service_name?: string;
            targetServers?: string;
        };
    };
};

type AntiDosConfig = {
    enabled: boolean;
    jailDuration: string;
    maxRequests: string;
    timeWindow: string;
};

const DEFAULT_CONFIG: AntiDosConfig = {
    enabled: true,
    jailDuration: '600000',
    maxRequests: '150',
    timeWindow: '20000',
};

function buildZextrasResponse(value: unknown): object {
    return {
        Body: {
            response: {
                content: JSON.stringify({
                    response: {
                        values: [{ value }],
                    },
                }),
            },
        },
    };
}

type ZextrasFaults = {
    setGlobalConfig?: string;
    doStartService?: string;
    doPurgeMobileState?: string;
};

let capturedZextrasRequests: Array<ZextrasRequestBody['Body']['zextras']> = [];

// Mirrors server state: GET requests echo back the latest saved values so the
// post-save invalidation refetch clears the form dirty state (canonical pattern).
let currentConfig: AntiDosConfig;

function applySetRequest(zextrasBody: ZextrasRequestBody['Body']['zextras']): void {
    switch (zextrasBody?.attribute) {
        case 'mobileAntiDosServiceEnabled':
            currentConfig.enabled = Boolean(zextrasBody.value);
            break;
        case 'mobileAntiDosServiceJailDuration':
            currentConfig.jailDuration = String(zextrasBody.value);
            break;
        case 'mobileAntiDosServiceMaxRequests':
            currentConfig.maxRequests = String(zextrasBody.value);
            break;
        case 'mobileAntiDosServiceTimeWindow':
            currentConfig.timeWindow = String(zextrasBody.value);
            break;
    }
}

function setupZextrasInterceptor(
    config: AntiDosConfig = DEFAULT_CONFIG,
    faults: ZextrasFaults = {},
): void {
    currentConfig = { ...config };
    worker.use(
        http.post('/service/admin/soap', async ({ request }) => {
            const body = (await request.json()) as ZextrasRequestBody;
            const zextrasBody = body?.Body?.zextras;

            if (!zextrasBody) {
                return HttpResponse.json({ Body: {} });
            }

            const { attribute, action } = zextrasBody;

            // Handle SET requests (save) — must run before the attribute checks
            // because set_global_config bodies also carry the attribute field
            if (action === 'set_global_config') {
                capturedZextrasRequests.push(zextrasBody);
                if (faults.setGlobalConfig) {
                    return HttpResponse.json({
                        Body: { Fault: { Reason: { Text: faults.setGlobalConfig } } },
                    });
                }
                applySetRequest(zextrasBody);
                return HttpResponse.json({ Body: { response: {} } });
            }

            // Handle doStartService / doPurgeMobileState
            if (action === 'doStartService' || action === 'doPurgeMobileState') {
                capturedZextrasRequests.push(zextrasBody);
                const faultMessage =
                    action === 'doStartService' ? faults.doStartService : faults.doPurgeMobileState;
                if (faultMessage) {
                    return HttpResponse.json({
                        Body: { Fault: { Reason: { Text: faultMessage } } },
                    });
                }
                return HttpResponse.json({ Body: { response: {} } });
            }

            // Handle GET requests (initial data load + post-save refetch)
            if (attribute === 'mobileAntiDosServiceEnabled') {
                return HttpResponse.json(buildZextrasResponse(currentConfig.enabled));
            }
            if (attribute === 'mobileAntiDosServiceJailDuration') {
                return HttpResponse.json(buildZextrasResponse(currentConfig.jailDuration));
            }
            if (attribute === 'mobileAntiDosServiceMaxRequests') {
                return HttpResponse.json(buildZextrasResponse(currentConfig.maxRequests));
            }
            if (attribute === 'mobileAntiDosServiceTimeWindow') {
                return HttpResponse.json(buildZextrasResponse(currentConfig.timeWindow));
            }

            return HttpResponse.json({ Body: {} });
        }),
    );
}

function setupGetAllServersInterceptor(
    servers: Array<{ name: string; id: string }> = [],
): Promise<unknown> {
    return createBrowserSoapAPIInterceptor('GetAllServers', {
        server: servers.map((s) => ({
            name: s.name,
            id: s.id,
            a: [
                { n: 'description', _content: 'Mailstore' },
                { n: 'zimbraServiceHostname', _content: s.name },
                { n: 'zimbraId', _content: s.id },
            ],
        })),
    });
}

const MAILSTORE_SERVERS = [
    { name: 'mail1.example.com', id: 'server-1' },
    { name: 'mail2.example.com', id: 'server-2' },
];

describe('GlobalActiveSync (browser)', () => {
    beforeEach(() => {
        capturedZextrasRequests = [];
        setupZextrasInterceptor();
    });

    describe('Rendering', () => {
        it('should render the ActiveSync title', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect.element(page.getByText('ActiveSync', { exact: true })).toBeInTheDocument();
        });

        it('should render the Mobile DOS Protection section title', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect
                .element(page.getByText('Mobile DOS Protection', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Restart Jail button', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect
                .element(page.getByRole('button', { name: /restart jail/i }))
                .toBeInTheDocument();
        });

        it('should render the Purge ActiveSync button', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect
                .element(page.getByRole('button', { name: /purge activesync/i }))
                .toBeInTheDocument();
        });

        it('should render the Enable Mobile DOS Protection switch', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect
                .element(page.getByText('Enable the Mobile DOS Protection Service'))
                .toBeInTheDocument();
        });
    });

    describe('Input fields', () => {
        it('should render Jail Duration input with loaded value', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toBeInTheDocument();
            await expect.element(input).toHaveValue(600000);
        });

        it('should render Maximum of Requests Allowed input with loaded value', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Maximum of Requests Allowed');
            await expect.element(input).toBeInTheDocument();
            await expect.element(input).toHaveValue(150);
        });

        it('should render Time Window input with loaded value', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Time Window for Allowed Requests (ms)');
            await expect.element(input).toBeInTheDocument();
            await expect.element(input).toHaveValue(20000);
        });
    });

    describe('Dirty state', () => {
        it('should not show Save and Cancel buttons initially', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            // Wait for data to load
            await expect
                .element(page.getByLabelText('Jail Duration (ms)'))
                .toHaveValue(600000);
            await expect
                .element(page.getByText('Save', { exact: true }))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByText('Cancel', { exact: true }))
                .not.toBeInTheDocument();
        });

        it('should show Save and Cancel buttons when a value is changed', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toHaveValue(600000);
            await userEvent.clear(input);
            await userEvent.type(input, '500000');
            await expect.element(page.getByText('Save', { exact: true })).toBeInTheDocument();
            await expect.element(page.getByText('Cancel', { exact: true })).toBeInTheDocument();
        });

        it('should restore original value when Cancel is clicked', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toHaveValue(600000);
            await userEvent.clear(input);
            await userEvent.type(input, '999');
            await expect.element(page.getByText('Cancel', { exact: true })).toBeInTheDocument();
            await userEvent.click(page.getByText('Cancel', { exact: true }));
            await expect.element(input).toHaveValue(600000);
        });
    });

    describe('Actions', () => {
        it('should allow clicking the Restart Jail button', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const button = page.getByRole('button', { name: /restart jail/i });
            await expect.element(button).toBeInTheDocument();
            await userEvent.click(button);
        });

        it('should allow clicking the Purge ActiveSync button', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const button = page.getByRole('button', { name: /purge activesync/i });
            await expect.element(button).toBeInTheDocument();
            await userEvent.click(button);
        });
    });

    describe('Maintenance actions', () => {
        it('should send doStartService for every mailstore server and show a success snackbar', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await userEvent.click(page.getByRole('button', { name: /restart jail/i }));
            const startRequests = () =>
                capturedZextrasRequests.filter((r) => r?.action === 'doStartService');
            await expect.poll(() => startRequests().length).toBe(2);
            expect(startRequests().map((r) => r?.targetServers)).toEqual([
                'mail1.example.com',
                'mail2.example.com',
            ]);
            await expect.element(page.getByText('Servers have been restared')).toBeVisible();
        });

        it('should show an error snackbar when restarting the jail fails', async () => {
            setupZextrasInterceptor(DEFAULT_CONFIG, { doStartService: 'jail unavailable' });
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await userEvent.click(page.getByRole('button', { name: /restart jail/i }));
            await expect.element(page.getByText('jail unavailable')).toBeVisible();
        });

        it('should show a success snackbar after purging ActiveSync', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await userEvent.click(page.getByRole('button', { name: /purge activesync/i }));
            await expect
                .element(page.getByText('ActiveSync has been purged successfully'))
                .toBeVisible();
        });

        it('should show an error snackbar when purging ActiveSync fails', async () => {
            setupZextrasInterceptor(DEFAULT_CONFIG, { doPurgeMobileState: 'purge failed' });
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await userEvent.click(page.getByRole('button', { name: /purge activesync/i }));
            await expect.element(page.getByText('purge failed')).toBeVisible();
        });
    });

    describe('Save', () => {
        it('should send set_global_config only for the changed field and clear the dirty state', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toHaveValue(600000);
            await userEvent.clear(input);
            await userEvent.type(input, '500000');
            await userEvent.click(page.getByRole('button', { name: /^save$/i }));
            const setRequests = () =>
                capturedZextrasRequests.filter((r) => r?.action === 'set_global_config');
            await expect.poll(() => setRequests().length).toBe(1);
            expect(setRequests()[0]).toMatchObject({
                attribute: 'mobileAntiDosServiceJailDuration',
                value: 500000,
            });
            await expect
                .element(page.getByText('Changes have been saved successfully'))
                .toBeVisible();
            await expect
                .element(page.getByRole('button', { name: /^save$/i }))
                .not.toBeInTheDocument();
        });

        it('should show an error snackbar and keep the dirty state when saving fails', async () => {
            setupZextrasInterceptor(DEFAULT_CONFIG, { setGlobalConfig: 'could not save' });
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toHaveValue(600000);
            await userEvent.clear(input);
            await userEvent.type(input, '500000');
            await userEvent.click(page.getByRole('button', { name: /^save$/i }));
            await expect.element(page.getByText('could not save')).toBeVisible();
            await expect
                .element(page.getByRole('button', { name: /^save$/i }))
                .toBeInTheDocument();
        });

        it('should block saving and flag an inline error when a numeric field is emptied', async () => {
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            const input = page.getByLabelText('Jail Duration (ms)');
            await expect.element(input).toHaveValue(600000);
            await userEvent.clear(input);
            await expect.element(page.getByText('Please enter a valid number')).toBeVisible();
            await userEvent.click(page.getByRole('button', { name: /^save$/i }));
            await expect
                .element(page.getByText('Changes have been saved successfully'))
                .not.toBeInTheDocument();
            expect(
                capturedZextrasRequests.filter((r) => r?.action === 'set_global_config').length,
            ).toBe(0);
        });
    });

    describe('With different config values', () => {
        it('should display custom config values', async () => {
            setupZextrasInterceptor({
                enabled: false,
                jailDuration: '300000',
                maxRequests: '50',
                timeWindow: '10000',
            });
            setupGetAllServersInterceptor(MAILSTORE_SERVERS);
            await setupBrowserTest(<GlobalActiveSync />);
            await expect.element(page.getByLabelText('Jail Duration (ms)')).toHaveValue(300000);
            await expect
                .element(page.getByLabelText('Maximum of Requests Allowed'))
                .toHaveValue(50);
            await expect
                .element(page.getByLabelText('Time Window for Allowed Requests (ms)'))
                .toHaveValue(10000);
        });
    });
});
