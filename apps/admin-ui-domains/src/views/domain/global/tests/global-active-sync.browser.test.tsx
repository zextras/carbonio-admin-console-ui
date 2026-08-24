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

import GlobalActiveSync from '../global-active-sync/global-active-sync';

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

function setupZextrasInterceptor(config: AntiDosConfig = DEFAULT_CONFIG): void {
    worker.use(
        http.post('/service/admin/soap', async ({ request }) => {
            const body = (await request.json()) as ZextrasRequestBody;
            const zextrasBody = body?.Body?.zextras;

            if (!zextrasBody) {
                return HttpResponse.json({ Body: {} });
            }

            const { attribute, action } = zextrasBody;

            // Handle GET requests (initial data load)
            if (attribute === 'mobileAntiDosServiceEnabled') {
                return HttpResponse.json(buildZextrasResponse(config.enabled));
            }
            if (attribute === 'mobileAntiDosServiceJailDuration') {
                return HttpResponse.json(buildZextrasResponse(config.jailDuration));
            }
            if (attribute === 'mobileAntiDosServiceMaxRequests') {
                return HttpResponse.json(buildZextrasResponse(config.maxRequests));
            }
            if (attribute === 'mobileAntiDosServiceTimeWindow') {
                return HttpResponse.json(buildZextrasResponse(config.timeWindow));
            }

            // Handle SET requests (save)
            if (action === 'set_global_config') {
                return HttpResponse.json({ Body: { response: {} } });
            }

            // Handle doStartService / doPurgeMobileState
            if (action === 'doStartService' || action === 'doPurgeMobileState') {
                return HttpResponse.json({ Body: { response: {} } });
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
