/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    advancedSupportedApiForBrowser,
    createBrowserSoapAPIInterceptor,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { useDomainStore } from '../../../../store/store';
import DomainAuthentication from '../domain-authentication';

const DOMAIN_ID = 'test-domain-id-auth';
const DOMAIN_NAME = 'auth.example.com';

function buildDomainAttributes(
    overrides: Array<{ n: string; _content: string }> = [],
): Array<{ n: string; _content: string }> {
    const defaults: Array<{ n: string; _content: string }> = [
        { n: 'zimbraDomainName', _content: DOMAIN_NAME },
        { n: 'zimbraId', _content: DOMAIN_ID },
        { n: 'zimbraAuthMech', _content: '' },
        { n: 'zimbraPasswordChangeListener', _content: '' },
        { n: 'zimbraAuthFallbackToLocal', _content: 'FALSE' },
        { n: 'zimbraAuthLdapURL', _content: '' },
        { n: 'zimbraAuthLdapSearchBindDn', _content: '' },
        { n: 'zimbraAuthLdapSearchBindPassword', _content: '' },
        { n: 'zimbraAuthLdapStartTlsEnabled', _content: 'FALSE' },
        { n: 'zimbraAuthLdapSearchFilter', _content: '' },
        { n: 'zimbraAuthLdapSearchBase', _content: '' },
        { n: 'zimbraFeatureResetPasswordStatus', _content: 'disabled' },
    ];

    const overrideKeys = new Set(overrides.map((o) => o.n));
    const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
    return [...filtered, ...overrides];
}

function setupDomainStore(
    attributeOverrides: Array<{ n: string; _content: string }> = [],
): void {
    const domainAttributes = buildDomainAttributes(attributeOverrides);
    useDomainStore.setState({
        domain: {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: domainAttributes,
        },
    });
}

describe('DomainAuthentication (browser)', () => {
    beforeEach(() => {
        setupDomainStore();
    });

    afterEach(() => {
        useDomainStore.setState({
            domain: {},
        });
    });

    describe('Rendering', () => {
        it('should render the Authentication header', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Authentication')).toBeVisible();
        });

        it('should render the Auth Method section header', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Auth Method', { exact: true })).toBeVisible();
        });

        it('should render the auth method select with Carbonio as default', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Carbonio')).toBeVisible();
        });

        it('should render the URL input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('URL')).toBeVisible();
        });

        it('should render the Filter input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Filter')).toBeVisible();
        });

        it('should render the Basic Search input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Basic Search')).toBeVisible();
        });

        it('should render the Search Bind User input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Search Bind User')).toBeVisible();
        });

        it('should render the Search Bind Password input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Search Bind Password')).toBeVisible();
        });

        it('should render the Verify Auth section header', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Verify Auth')).toBeVisible();
        });

        it('should render the User Name input in verify section', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('User Name')).toBeVisible();
        });

        it('should render the Password input in verify section', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
        });

        it('should render the LOGIN AND VERIFY button disabled by default', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const loginBtn = page.getByRole('button', { name: /login and verify/i });
            await expect.element(loginBtn).toBeVisible();
            await expect.element(loginBtn).toBeDisabled();
        });

        it('should render the Enforce External Auth switch', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(page.getByText('Enforce External Auth (LDAP/AD)'))
                .toBeVisible();
        });

        it('should render the Enable Secure Connection switch', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(page.getByText('Enable Secure Connection (StartTLS/SSL)'))
                .toBeVisible();
        });

        it('should render the Endpoint for password change input', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(page.getByText('Endpoint to be used for password change'))
                .toBeVisible();
        });

        it('should not show Save and Cancel buttons when no changes are made', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Authentication')).toBeVisible();
            await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: /cancel/i }))
                .not.toBeInTheDocument();
        });
    });

    describe('Auth method info text', () => {
        it('should show CE info text for Carbonio method when not advanced', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(page.getByText('This method allows usage of Local LDAP'))
                .toBeVisible();
        });

        it('should show advanced info text for Carbonio method when advanced', async () => {
            await advancedSupportedApiForBrowser.withAdvancedSupported();
            setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(
                    page.getByText(
                        'This method allows usage of Local LDAP, External AD/LDAP, Credential Password and SAML.',
                    ),
                )
                .toBeVisible();
        });
    });

    describe('Editing fields', () => {
        it('should show Save and Cancel buttons when URL is changed', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.type(urlInput, 'ldap://ldap.example.com');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
        });

        it('should show Save and Cancel when Filter is changed', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const filterInput = page.getByLabelText('Filter');
            await userEvent.type(filterInput, '(ou=people)');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
        });

        it('should show Save and Cancel when Basic Search is changed', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const searchBase = page.getByLabelText('Basic Search');
            await userEvent.type(searchBase, 'dc=example,dc=com');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
        });

        it('should show Save and Cancel when password change endpoint is changed', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const endpointInput = page.getByLabelText('Endpoint to be used for password change');
            await userEvent.type(endpointInput, 'https://password.example.com');

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
        });

        it('should revert changes when Cancel is clicked', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.type(urlInput, 'ldap://ldap.example.com');

            await expect.element(page.getByRole('button', { name: /cancel/i })).toBeVisible();
            const cancelButton = page.getByRole('button', { name: /cancel/i });
            await cancelButton.click();

            await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
        });
    });

    describe('Switches', () => {
        it('should toggle Enable Secure Connection switch and show dirty state', async () => {
            setupBrowserTest(<DomainAuthentication />);

            const secureSwitch = page.getByTestId('enable-secure-connection');
            await secureSwitch.click();

            await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
        });

        it('should not show Forget Password switch when not advanced', async () => {
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Authentication')).toBeVisible();
            await expect
                .element(page.getByTestId('reset-password-switch'))
                .not.toBeInTheDocument();
        });

        it('should show Forget Password switch when advanced', async () => {
            await advancedSupportedApiForBrowser.withAdvancedSupported();
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByTestId('reset-password-switch')).toBeVisible();
        });
    });

    describe('LDAP URL validation', () => {
        it('should show error when LDAP URL is invalid', async () => {
            setupDomainStore([{ n: 'zimbraAuthMech', _content: 'ldap' }]);
            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.type(urlInput, 'not-a-valid-url');

            await expect.element(page.getByText('Ldap url is not valid')).toBeVisible();
        });

        it('should show Required when URL is cleared in LDAP mode', async () => {
            setupDomainStore([
                { n: 'zimbraAuthMech', _content: 'ldap' },
                { n: 'zimbraAuthLdapURL', _content: 'ldap://ldap.example.com' },
            ]);
            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.clear(urlInput);

            await expect.element(page.getByText('Required')).toBeVisible();
        });
    });

    describe('Pre-populated fields', () => {
        it('should render with pre-existing LDAP URL', async () => {
            setupDomainStore([
                { n: 'zimbraAuthMech', _content: 'ldap' },
                { n: 'zimbraAuthLdapURL', _content: 'ldap://ldap.example.com' },
                { n: 'zimbraAuthLdapSearchFilter', _content: '(uid=%u)' },
                { n: 'zimbraAuthLdapSearchBase', _content: 'dc=example,dc=com' },
            ]);
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('External LDAP only')).toBeVisible();
        });

        it('should render with External AD auth method', async () => {
            setupDomainStore([{ n: 'zimbraAuthMech', _content: 'ad' }]);
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('External AD only')).toBeVisible();
        });

        it('should render with Local LDAP only auth method', async () => {
            setupDomainStore([{ n: 'zimbraAuthMech', _content: 'zimbra' }]);
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Local LDAP only')).toBeVisible();
        });

        it('should show Enable Secure Connection as enabled when set', async () => {
            setupDomainStore([
                { n: 'zimbraAuthLdapStartTlsEnabled', _content: 'TRUE' },
            ]);
            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByText('Enable Secure Connection (StartTLS/SSL)')).toBeVisible();
        });
    });

    describe('Save', () => {
        it('should call ModifyDomain when Save is clicked', async () => {
            const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes(),
                    },
                ],
            });

            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.type(urlInput, 'ldap://ldap.test.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            const requestParams = (await modifyDomainInterceptor) as any;
            expect(requestParams.id).toBe(DOMAIN_ID);
            expect(requestParams.a).toBeDefined();

            const urlAttr = requestParams.a.find((attr: any) => attr.n === 'zimbraAuthLdapURL');
            expect(urlAttr._content).toBe('ldap://ldap.test.com');
        });

        it('should show success snackbar after successful save', async () => {
            createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes(),
                    },
                ],
            });

            setupBrowserTest(<DomainAuthentication />);

            const endpointInput = page.getByLabelText('Endpoint to be used for password change');
            await userEvent.type(endpointInput, 'https://pwd.example.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            await expect
                .element(page.getByText('The change has been saved successfully'))
                .toBeVisible();
        });

        it('should show error snackbar when save fails', async () => {
            worker.use(
                http.post('/service/admin/soap/ModifyDomainRequest', () =>
                    HttpResponse.json(
                        { Body: { Fault: { Reason: { Text: 'Server error' } } } },
                        { status: 500 },
                    ),
                ),
            );

            setupBrowserTest(<DomainAuthentication />);

            const urlInput = page.getByLabelText('URL');
            await userEvent.type(urlInput, 'ldap://ldap.fail.com');

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            await expect
                .element(page.getByText('Server error'))
                .toBeVisible();
        });

        it('should include zimbraFeatureResetPasswordStatus when advanced', async () => {
            await advancedSupportedApiForBrowser.withAdvancedSupported();

            const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
                domain: [
                    {
                        name: DOMAIN_NAME,
                        id: DOMAIN_ID,
                        a: buildDomainAttributes(),
                    },
                ],
            });

            setupBrowserTest(<DomainAuthentication />);

            await expect.element(page.getByTestId('reset-password-switch')).toBeVisible();
            const resetSwitch = page.getByTestId('reset-password-switch');
            await resetSwitch.click();

            const saveButton = page.getByRole('button', { name: /save/i });
            await saveButton.click();

            const requestParams = (await modifyDomainInterceptor) as any;
            const resetPasswordAttr = requestParams.a.find(
                (attr: any) => attr.n === 'zimbraFeatureResetPasswordStatus',
            );
            expect(resetPasswordAttr).toBeDefined();
            expect(resetPasswordAttr._content).toBe('enabled');
        });
    });

    describe('Verify Auth', () => {
        it('should enable LOGIN AND VERIFY button when LDAP/AD auth with required fields', async () => {
            setupDomainStore([
                { n: 'zimbraAuthMech', _content: 'ldap' },
                { n: 'zimbraAuthLdapURL', _content: 'ldap://ldap.example.com' },
                { n: 'zimbraAuthLdapSearchBindDn', _content: 'cn=admin,dc=example,dc=com' },
                { n: 'zimbraAuthLdapSearchBindPassword', _content: 'secret123' },
            ]);
            await setupBrowserTest(<DomainAuthentication />);

            await expect
                .element(page.getByRole('button', { name: /login and verify/i }))
                .not.toBeDisabled();
        });

        it('should call CheckAuthConfig when LOGIN AND VERIFY is clicked', async () => {
            setupDomainStore([
                { n: 'zimbraAuthMech', _content: 'ldap' },
                { n: 'zimbraAuthLdapURL', _content: 'ldap://ldap.example.com' },
            ]);

            const checkAuthInterceptor = createBrowserSoapAPIInterceptor('CheckAuthConfig', {
                code: [{ _content: 'check.OK' }],
            });

            setupBrowserTest(<DomainAuthentication />);

            const bindUserInput = page.getByLabelText('Search Bind User');
            await userEvent.type(bindUserInput, 'cn=admin,dc=example,dc=com');

            const bindPasswordInput = page.getByLabelText('Search Bind Password');
            await userEvent.type(bindPasswordInput, 'secret123');

            const loginBtn = page.getByRole('button', { name: /login and verify/i });
            await expect.element(loginBtn).not.toBeDisabled();
            await loginBtn.click();

            const requestParams = (await checkAuthInterceptor) as any;
            expect(requestParams.a).toBeDefined();
        });

        it('should show LOGIN VERIFIED after successful verification', async () => {
            setupDomainStore([
                { n: 'zimbraAuthMech', _content: 'ldap' },
                { n: 'zimbraAuthLdapURL', _content: 'ldap://ldap.example.com' },
            ]);

            createBrowserSoapAPIInterceptor('CheckAuthConfig', {
                code: [{ _content: 'check.OK' }],
            });

            setupBrowserTest(<DomainAuthentication />);

            const bindUserInput = page.getByLabelText('Search Bind User');
            await userEvent.type(bindUserInput, 'cn=admin,dc=example,dc=com');

            const bindPasswordInput = page.getByLabelText('Search Bind Password');
            await userEvent.type(bindPasswordInput, 'secret123');

            const loginBtn = page.getByRole('button', { name: /login and verify/i });
            await loginBtn.click();

            await expect
                .element(page.getByRole('button', { name: /login verified/i }))
                .toBeVisible();
        });
    });
});
