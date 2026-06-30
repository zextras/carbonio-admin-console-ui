/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { useDomainStore } from '../../../../../store/store';
import ActiveSync from '../active-sync';

const DOMAIN_NAME = 'example.com';

type MobileDevice = {
    accountEmail: string;
    accountName: string;
    accountServer: string;
    deviceId: string;
    deviceType: string;
    firstSeen: number;
    hasMobilePassword: boolean;
    isOnline: boolean;
    lastCommandReceived: number;
    lastPingTimeoutSecs: number;
    lastSeen: number;
    protocolVersion: string;
    provisionable: boolean;
    status: number;
    userAgent: string;
};

type ZextrasRequestBody = {
    Body: {
        zextras: {
            _jsns: string;
            module: string;
            action: string;
            targetServers?: string;
            domainList?: string;
            accountName?: string;
            deviceId?: string;
        };
    };
};

function buildDevice(overrides: Partial<MobileDevice> = {}): MobileDevice {
    return {
        accountEmail: 'user1@example.com',
        accountName: 'iPhone',
        accountServer: 'mail.example.com',
        deviceId: 'ABCD1234',
        deviceType: 'iPhone',
        firstSeen: 1700000000000,
        hasMobilePassword: false,
        isOnline: true,
        lastCommandReceived: 1700001000000,
        lastPingTimeoutSecs: 300,
        lastSeen: 1700002000000,
        protocolVersion: '14.1',
        provisionable: true,
        status: 1,
        userAgent: 'Apple-iPhone/1',
        ...overrides,
    };
}

const DEVICES: Array<MobileDevice> = [
    buildDevice({
        accountEmail: 'alice@example.com',
        accountName: 'iPhone',
        deviceId: 'DEV-001',
        deviceType: 'iPhone',
        firstSeen: 1700000001000,
        lastSeen: 1700100000000,
        status: 1,
    }),
    buildDevice({
        accountEmail: 'bob@example.com',
        accountName: 'Android',
        deviceId: 'DEV-002',
        deviceType: 'Android',
        firstSeen: 1700000002000,
        lastSeen: 1700200000000,
        status: 0,
    }),
    buildDevice({
        accountEmail: 'carol@example.com',
        accountName: 'iPad',
        deviceId: 'DEV-003',
        deviceType: 'iPad',
        firstSeen: 1700000003000,
        lastSeen: 1700300000000,
        status: 1,
    }),
];

function buildGetAllDevicesContent(devices: Array<MobileDevice>): string {
    const grouped: Record<string, { response: { devices: Array<MobileDevice> } }> = {};
    for (const device of devices) {
        const email = device.accountEmail;
        if (!grouped[email]) {
            grouped[email] = { response: { devices: [] } };
        }
        grouped[email].response.devices.push(device);
    }
    return JSON.stringify({ response: grouped });
}

function setupZextrasInterceptor(
    devices: Array<MobileDevice> = DEVICES,
    removeOk = true,
): void {
    worker.use(
        http.post('/service/admin/soap/zextras', async ({ request }) => {
            const body = (await request.json()) as ZextrasRequestBody;
            const zextrasBody = body?.Body?.zextras;

            if (!zextrasBody) {
                return HttpResponse.json({ Body: {} });
            }

            const { action } = zextrasBody;

            if (action === 'getAllDevices') {
                return HttpResponse.json({
                    Body: {
                        response: {
                            content: buildGetAllDevicesContent(devices),
                        },
                    },
                });
            }

            if (action === 'doRemoveDevice') {
                return HttpResponse.json({
                    Body: {
                        response: {
                            content: JSON.stringify(removeOk ? { ok: true } : { error: { message: 'Remove failed' } }),
                        },
                    },
                });
            }

            return HttpResponse.json({ Body: {} });
        }),
    );
}

function setupDomainStore(): void {
    useDomainStore.setState({
        domain: {
            name: DOMAIN_NAME,
            id: 'test-domain-id',
            a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
        },
    });
}

describe('ActiveSync (browser)', () => {
    beforeEach(() => {
        setupDomainStore();
    });

    afterEach(() => {
        useDomainStore.setState({});
    });

    describe('Rendering', () => {
        it('should render the ActiveSync title', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('ActiveSync', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the filter input', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByLabelText('Filter by device type, account, status'))
                .toBeInTheDocument();
        });

        it('should render the Remove button', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByRole('button', { name: 'Remove' }))
                .toBeInTheDocument();
        });

        it('should render the Remove button disabled when nothing is selected', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByRole('button', { name: 'Remove' }))
                .toHaveAttribute('disabled');
        });
    });

    describe('Table headers', () => {
        it('should render the Device column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Device', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Device ID column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Device ID', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Account column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Account', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Last seen column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Last seen', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the EAS column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('EAS', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Status column header', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Status', { exact: true }))
                .toBeInTheDocument();
        });
    });

    describe('List with data', () => {
        it('should display device names (accountName)', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect.element(page.getByText('iPhone', { exact: true }).first()).toBeInTheDocument();
            await expect.element(page.getByText('Android', { exact: true })).toBeInTheDocument();
            await expect.element(page.getByText('iPad', { exact: true })).toBeInTheDocument();
        });

        it('should display device IDs', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect.element(page.getByText('DEV-001')).toBeInTheDocument();
            await expect.element(page.getByText('DEV-002')).toBeInTheDocument();
            await expect.element(page.getByText('DEV-003')).toBeInTheDocument();
        });

        it('should display account emails', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('bob@example.com')).toBeInTheDocument();
            await expect.element(page.getByText('carol@example.com')).toBeInTheDocument();
        });

        it('should display Enabled for status 1 and Disabled for status 0', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Enabled', { exact: true }).first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('Disabled', { exact: true }).first())
                .toBeInTheDocument();
        });
    });

    describe('Empty state', () => {
        it('should show empty list message when no devices exist', async () => {
            setupZextrasInterceptor([]);
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
        });

        it('should show Do you need more information text', async () => {
            setupZextrasInterceptor([]);
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Do you need more information?'))
                .toBeInTheDocument();
        });

        it('should show Click here link', async () => {
            setupZextrasInterceptor([]);
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('Click here'))
                .toBeInTheDocument();
        });
    });

    describe('Filter', () => {
        it('should allow typing in the filter input', async () => {
            setupZextrasInterceptor();
            await setupBrowserTest(<ActiveSync />);
            await expect.element(page.getByText('iPhone', { exact: true }).first()).toBeInTheDocument();
            const filterInput = page.getByLabelText('Filter by device type, account, status');
            await userEvent.type(filterInput, 'android');
            await expect.element(filterInput).toHaveValue('android');
        });

        it('should disable filter input when list is empty and no search active', async () => {
            setupZextrasInterceptor([]);
            await setupBrowserTest(<ActiveSync />);
            await expect
                .element(page.getByText('This list is empty.'))
                .toBeInTheDocument();
            const filterInput = page.getByLabelText('Filter by device type, account, status');
            await expect.element(filterInput).toHaveAttribute('disabled');
        });
    });
});
