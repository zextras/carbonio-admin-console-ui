/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient } from '@tanstack/react-query';
import { useDomainStore } from '@zextras/ui-shared';
import {
    createBrowserSoapAPIInterceptor,
    getQueryClient,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainGalSettings from '../domain-gal-settings';

const DOMAIN_NAME = 'example.com';
const DOMAIN_ID = 'test-domain-id';
const GAL_ACCOUNT_ID = 'gal-account-id-1';

type DomainAttribute = { n: string; _content: string };

function buildDomainAttributes(
    overrides: Array<DomainAttribute> = [],
): Array<DomainAttribute> {
    const defaults: Array<DomainAttribute> = [
        { n: 'zimbraDomainName', _content: DOMAIN_NAME },
        { n: 'zimbraId', _content: DOMAIN_ID },
        { n: 'zimbraGalMode', _content: 'zimbra' },
        { n: 'zimbraGalMaxResults', _content: '100' },
        { n: 'zimbraGalLdapPageSize', _content: '1000' },
        { n: 'zimbraGalAccountId', _content: GAL_ACCOUNT_ID },
        { n: 'zimbraGalLdapURL', _content: '' },
        { n: 'zimbraGalLdapStartTlsEnabled', _content: 'FALSE' },
        { n: 'zimbraGalLdapFilter', _content: '' },
        { n: 'zimbraGalLdapSearchBase', _content: '' },
        { n: 'zimbraGalLdapBindDn', _content: '' },
        { n: 'zimbraGalLdapBindPassword', _content: '' },
        { n: 'zimbraGalLdapAuthMech', _content: 'none' },
    ];

    const overrideKeys = new Set(overrides.map((o) => o.n));
    const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
    return [...filtered, ...overrides];
}

const MAILSTORE_SERVERS = [
    { id: 'server-1', name: 'mail1.example.com', a: [{ n: 'description', _content: 'Primary' }] },
    { id: 'server-2', name: 'mail2.example.com', a: [{ n: 'description', _content: 'Secondary' }] },
];

type SoapRequestBody = {
    Body: Record<string, unknown>;
};

function setupGalApiInterceptors(): void {
    worker.use(
        http.post('/service/admin/soap/GetAccountRequest', () =>
            HttpResponse.json({
                Body: {
                    GetAccountResponse: {
                        account: [
                            {
                                id: GAL_ACCOUNT_ID,
                                name: `galsync.${DOMAIN_NAME}`,
                                a: [
                                    { n: 'zimbraMailHost', _content: 'mail1.example.com' },
                                    { n: 'zimbraDataSourceGalPollingInterval', _content: '1d' },
                                ],
                            },
                        ],
                    },
                },
            }),
        ),
        http.post('/service/admin/soap/GetDataSourcesRequest', () =>
            HttpResponse.json({
                Body: {
                    GetDataSourcesResponse: {
                        dataSource: [
                            {
                                id: 'datasource-1',
                                name: 'gal-datasource',
                                type: 'gal',
                                _attrs: {
                                    zimbraDataSourcePollingInterval: '1d',
                                },
                            },
                        ],
                    },
                },
            }),
        ),
        http.post('/service/admin/soap/GetAllServersRequest', () =>
            HttpResponse.json({
                Body: {
                    GetAllServersResponse: {
                        server: MAILSTORE_SERVERS,
                    },
                },
            }),
        ),
    );
}

function setupDomainStore(attributeOverrides: Array<DomainAttribute> = []): void {
    const domainAttributes = buildDomainAttributes(attributeOverrides);
    useDomainStore.setState({
        domain: {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: domainAttributes,
        },
    });
}

function setupAndRender(
    attributeOverrides: Array<DomainAttribute> = [],
): ReturnType<typeof setupBrowserTest> {
    setupDomainStore(attributeOverrides);
    setupGalApiInterceptors();
    const qc: QueryClient = getQueryClient();
    qc.setQueryData(['mailstore-servers'], MAILSTORE_SERVERS);
    return setupBrowserTest(<DomainGalSettings />, { queryClient: qc });
}

describe('DomainGalSettings (browser)', () => {
    afterEach(() => {
        useDomainStore.setState({
            domain: {},
        });
    });

    describe('Rendering', () => {
        it('should render the Global Address List header', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText(/Global Add.*ress List/))
                .toBeInTheDocument();
        });

        it('should render the General section', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('General', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the Settings section', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('Settings', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the GAL Mode input as Internal for zimbra mode', async () => {
            await setupAndRender();
            await expect
                .element(page.getByLabelText('GAL Mode'))
                .toBeInTheDocument();
        });

        it('should render the CHANGE TO button', async () => {
            await setupAndRender();
            await expect
                .element(page.getByRole('button', { name: /change to/i }))
                .toBeInTheDocument();
        });

        it('should render the CREATE button', async () => {
            await setupAndRender();
            await expect
                .element(page.getByRole('button', { name: /^create$/i }))
                .toBeInTheDocument();
        });

        it('should render the RE-SYNC button', async () => {
            await setupAndRender();
            await expect
                .element(page.getByRole('button', { name: /re-sync/i }))
                .toBeInTheDocument();
        });

        it('should render the DELETE button', async () => {
            await setupAndRender();
            await expect
                .element(page.getByRole('button', { name: /^delete$/i }))
                .toBeInTheDocument();
        });

        it('should not show Save and Cancel buttons when no changes are made', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('General', { exact: true }))
                .toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: /save/i }))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: /cancel/i }))
                .not.toBeInTheDocument();
        });
    });

    describe('General inputs', () => {
        it('should render the max results input with value from domain', async () => {
            await setupAndRender();
            const maxResultsInput = page.getByLabelText(
                'Max number of results given by search in the Address Book list',
            );
            await expect.element(maxResultsInput).toBeInTheDocument();
            await expect.element(maxResultsInput).toHaveValue(100);
        });

        it('should render the Page Size input with value from domain', async () => {
            await setupAndRender();
            const pageSizeInput = page.getByLabelText('Page Size');
            await expect.element(pageSizeInput).toBeInTheDocument();
            await expect.element(pageSizeInput).toHaveValue(1000);
        });
    });

    describe('Settings inputs', () => {
        it('should render the GAL Update Frequency input', async () => {
            await setupAndRender();
            await expect
                .element(page.getByLabelText('GAL Update Frequency (value)'))
                .toBeInTheDocument();
        });

        it('should render the Interval select', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('Interval', { exact: true }))
                .toBeInTheDocument();
        });
    });

    describe('Server table', () => {
        it('should render the Server column header', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('Server', { exact: true }))
                .toBeInTheDocument();
        });

        it('should render the GALSync Account column header', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('GALSync Account', { exact: true }))
                .toBeInTheDocument();
        });

        it('should display mailstore server names', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('mail1.example.com').first())
                .toBeInTheDocument();
            await expect
                .element(page.getByText('mail2.example.com').first())
                .toBeInTheDocument();
        });
    });

    describe('Editing fields', () => {
        it('should show Save and Cancel when max results is changed', async () => {
            await setupAndRender();
            const maxResultsInput = page.getByLabelText(
                'Max number of results given by search in the Address Book list',
            );
            await userEvent.clear(maxResultsInput);
            await userEvent.type(maxResultsInput, '200');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
        });

        it('should show Save and Cancel when page size is changed', async () => {
            await setupAndRender();
            const pageSizeInput = page.getByLabelText('Page Size');
            await userEvent.clear(pageSizeInput);
            await userEvent.type(pageSizeInput, '500');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
        });

        it('should revert changes when Cancel is clicked', async () => {
            await setupAndRender();
            const maxResultsInput = page.getByLabelText(
                'Max number of results given by search in the Address Book list',
            );
            await userEvent.clear(maxResultsInput);
            await userEvent.type(maxResultsInput, '999');

            const cancelButton = page.getByRole('button', { name: /cancel/i });
            await cancelButton.click();

            await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
        });
    });

    describe('Save', () => {
        it('should call ModifyDomain when Save is clicked', async () => {
            const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes([{ n: 'zimbraGalMaxResults', _content: '200' }]),
                    },
                ],
            });

            await setupAndRender();
            const maxResultsInput = page.getByLabelText(
                'Max number of results given by search in the Address Book list',
            );
            await userEvent.clear(maxResultsInput);
            await userEvent.type(maxResultsInput, '200');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            const params = (await modifyInterceptor) as any;
            expect(params.id).toBe(DOMAIN_ID);
            const maxResultsAttr = params.a.find(
                (attr: DomainAttribute) => attr.n === 'zimbraGalMaxResults',
            );
            expect(maxResultsAttr._content).toBe('200');
        });
    });

    describe('External GAL mode', () => {
        it('should not show LDAP section in internal mode', async () => {
            await setupAndRender();
            await expect
                .element(page.getByText('General', { exact: true }))
                .toBeInTheDocument();
            await expect
                .element(page.getByText('LDAP Url'))
                .not.toBeInTheDocument();
        });

        it('should show LDAP section when mode is external', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByText('LDAP Url'))
                .toBeInTheDocument();
            await expect
                .element(page.getByLabelText('External Server Address'))
                .toBeInTheDocument();
        });

        it('should show LDAP Filter input in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByLabelText('LDAP Filter'))
                .toBeInTheDocument();
        });

        it('should show LDAP based search input in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByLabelText('LDAP based search'))
                .toBeInTheDocument();
        });

        it('should show Authentication Settings in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByText('Authentication Settings'))
                .toBeInTheDocument();
        });

        it('should show Bind DN input in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByLabelText('Bind DN'))
                .toBeInTheDocument();
        });

        it('should show Password input in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByLabelText('Password'))
                .toBeInTheDocument();
        });

        it('should show Use SSL switch in external mode', async () => {
            await setupAndRender([{ n: 'zimbraGalMode', _content: 'ldap' }]);
            await expect
                .element(page.getByText('Use SSL'))
                .toBeInTheDocument();
        });
    });

    describe('Empty server table', () => {
        it('should show Empty Table when no servers exist', async () => {
            setupDomainStore([{ n: 'zimbraGalAccountId', _content: '' }]);
            setupGalApiInterceptors();
            const qc = getQueryClient();
            qc.setQueryData(['mailstore-servers'], []);
            await setupBrowserTest(<DomainGalSettings />, { queryClient: qc });

            await expect
                .element(page.getByText('Empty Table'))
                .toBeInTheDocument();
        });
    });
});
