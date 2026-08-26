/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DomainContentPanel } from '../domain-content-panel';

function MockDetailPanel({ children }: { children?: ReactNode }) {
  return <div data-testid="detail-panel">{children}</div>;
}
function MockCreateNewDomain() {
  return <div>VIEW:create-new-domain</div>;
}
function MockGlobalDetailPanel() {
  return <div>VIEW:global-detail-panel</div>;
}
function MockGlobalWhiteLabel() {
  return <div>VIEW:global-white-label</div>;
}
function MockGlobalTwoFactorAuth() {
  return <div>VIEW:global-two-factor-auth</div>;
}
function MockGlobalActiveSync() {
  return <div>VIEW:global-active-sync</div>;
}
function MockGlobalServices() {
  return <div>VIEW:global-services</div>;
}
function MockGlobalAdministrators() {
  return <div>VIEW:global-administrators</div>;
}
function MockDomainList() {
  return <div>VIEW:domain-list</div>;
}
function MockGlobalQuarantine() {
  return <div>VIEW:global-quarantine</div>;
}
function MockDomainGeneralSettings() {
  return <div>VIEW:general_settings</div>;
}
function MockDomainGalSettings() {
  return <div>VIEW:gal</div>;
}
function MockDomainAuthentication() {
  return <div>VIEW:authentication</div>;
}
function MockDomainTwoFactor() {
  return <div>VIEW:2-factor-authentication</div>;
}
function MockDomainTheme() {
  return <div>VIEW:whitelabel_settings</div>;
}
function MockDomainSaml() {
  return <div>VIEW:saml</div>;
}
function MockDomainDisclaimer() {
  return <div>VIEW:disclaimer</div>;
}
function MockDomainVirtualHosts() {
  return <div>VIEW:virtual_hosts</div>;
}
function MockManageAccounts() {
  return <div>VIEW:accounts</div>;
}
function MockActiveSync() {
  return <div>VIEW:active_sync</div>;
}
function MockManageDelegates() {
  return <div>VIEW:delegates_domain_admins</div>;
}
function MockDomainMailingList() {
  return <div>VIEW:distribution_list</div>;
}
function MockDomainResources() {
  return <div>VIEW:resources</div>;
}
function MockRestoreAccount() {
  return <div>VIEW:restore_account</div>;
}
function MockDomainAddressBook() {
  return <div>VIEW:address_book</div>;
}

vi.mock('../domain/domain-detail-panel', () => ({ DomainDetailPanel: MockDetailPanel }));
vi.mock('../create-new-domain/create-new-domain', () => ({ CreateDomain: MockCreateNewDomain }));
vi.mock('../global/global-detail-panel/global-detail-panel', () => ({
  GlobalDetailPanel: MockGlobalDetailPanel,
}));
vi.mock('../global/global-white-label/global-white-label', () => ({
  GlobalWhiteLabel: MockGlobalWhiteLabel,
}));
vi.mock('../global/global-two-factor-auth/global-two-factor-auth', () => ({
  GlobalTwoFactorAuth: MockGlobalTwoFactorAuth,
}));
vi.mock('../global/global-active-sync', () => ({ default: MockGlobalActiveSync }));
vi.mock('../global/global-services/global-services', () => ({
  GlobalServices: MockGlobalServices,
}));
vi.mock('../global/global-active-sync/global-active-sync', () => ({
  GlobalActiveSync: MockGlobalActiveSync,
}));
vi.mock('../global/global-administrators/global-administrators', () => ({
  GlobalAdministrators: MockGlobalAdministrators,
}));
vi.mock('../global/global-domain-list/global-domain-list', () => ({
  GlobalDomainList: MockDomainList,
}));
vi.mock('../global/global-quarantine/global-quarantine', () => ({
  GlobalQuarantine: MockGlobalQuarantine,
}));
vi.mock('../domain/details/domain-general-settings', () => ({
  DomainGeneralSettings: MockDomainGeneralSettings,
}));
vi.mock('../domain/details/domain-gal-settings', () => ({
  DomainGalSettings: MockDomainGalSettings,
}));
vi.mock('../domain/details/domain-authentication', () => ({
  DomainAuthentication: MockDomainAuthentication,
}));
vi.mock('../domain/details/domain-2fa', () => ({ default: MockDomainTwoFactor }));
vi.mock('../domain/details/domain-theme', () => ({ default: MockDomainTheme }));
vi.mock('../domain/details/domain-saml', () => ({ default: MockDomainSaml }));
vi.mock('../domain/details/domain-disclaimer', () => ({ default: MockDomainDisclaimer }));
vi.mock('../domain/details/virtual-hosts-certificates/domain-virtual-hosts', () => ({
  DomainVirtualHosts: MockDomainVirtualHosts,
}));
vi.mock('../manage/accounts/manage-accounts', () => ({ default: MockManageAccounts }));
vi.mock('../domain/manange/active-sync/active-sync', () => ({ default: MockActiveSync }));
vi.mock('../domain/manange/delegates/manage-delegates', () => ({ default: MockManageDelegates }));
vi.mock('../domain/manange/mailing-list/domain-mailing-list', () => ({
  default: MockDomainMailingList,
}));
vi.mock('../domain/manange/resources/domain-resources', () => ({ default: MockDomainResources }));
vi.mock('../domain/manange/restore-delete-account/restore-delete-account', () => ({
  default: MockRestoreAccount,
}));
vi.mock('../domain/manange/address-book/domain-address-book', () => ({
  DomainAddressBook: MockDomainAddressBook,
}));

const DOMAIN_ID = 'dom-1';

const globalRoutes: Array<[string, string]> = [
  ['/global', 'VIEW:global-detail-panel'],
  ['/global/settings', 'VIEW:global-detail-panel'],
  ['/global/whitelabel_settings', 'VIEW:global-white-label'],
  ['/global/2-factor-authentication', 'VIEW:global-two-factor-auth'],
  ['/global/quarantine', 'VIEW:global-quarantine'],
  ['/global/domains', 'VIEW:domain-list'],
  ['/global/administrators', 'VIEW:global-administrators'],
  ['/global/active_sync', 'VIEW:global-active-sync'],
  ['/global/address_book', 'VIEW:global-services'],
];

const domainOpRoutes: Array<[string, string]> = [
  ['general_settings', 'VIEW:general_settings'],
  ['gal', 'VIEW:gal'],
  ['authentication', 'VIEW:authentication'],
  ['virtual_hosts', 'VIEW:virtual_hosts'],
  ['2-factor-authentication', 'VIEW:2-factor-authentication'],
  ['whitelabel_settings', 'VIEW:whitelabel_settings'],
  ['saml', 'VIEW:saml'],
  ['accounts', 'VIEW:accounts'],
  ['delegates_domain_admins', 'VIEW:delegates_domain_admins'],
  ['distribution_list', 'VIEW:distribution_list'],
  ['resources', 'VIEW:resources'],
  ['restore_account', 'VIEW:restore_account'],
  ['active_sync', 'VIEW:active_sync'],
  ['address_book', 'VIEW:address_book'],
  ['disclaimer', 'VIEW:disclaimer'],
];

describe('DomainContentPanel routing', () => {
  beforeEach(() => {
    createBrowserSoapAPIInterceptor('GetDomain', {
      domain: [{ id: DOMAIN_ID, name: 'example.com', a: [] }],
    });
    createBrowserSoapAPIInterceptor('SearchDirectory', { cos: [] });
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('renders the empty state on the index route', async () => {
    await setupBrowserTest(<DomainContentPanel />, { initialRouterEntry: '/' });

    await expect.element(page.getByText(/Please select a domain/i)).toBeVisible();
  });

  it('renders CreateDomain on /create-new-domain', async () => {
    await setupBrowserTest(<DomainContentPanel />, { initialRouterEntry: '/create-new-domain' });

    await expect.element(page.getByText('VIEW:create-new-domain')).toBeVisible();
  });

  describe('global routes', () => {
    it.each(globalRoutes)('renders the right view for %s', async (entry, marker) => {
      await setupBrowserTest(<DomainContentPanel />, { initialRouterEntry: entry });

      await expect.element(page.getByText(marker)).toBeVisible();
    });
  });

  it('renders GeneralInformation on /:domainId/general_information', async () => {
    await setupBrowserTest(<DomainContentPanel />, {
      initialRouterEntry: `/${DOMAIN_ID}/general_information`,
    });

    await expect.element(page.getByText('General Information')).toBeVisible();
  });

  describe('domain operation routes', () => {
    it.each(domainOpRoutes)('renders the right view for /:domainId/%s', async (op, marker) => {
      await setupBrowserTest(<DomainContentPanel />, {
        initialRouterEntry: `/${DOMAIN_ID}/${op}`,
      });

      await expect.element(page.getByText(marker)).toBeVisible();
    });
  });

  it('renders the layout shell with no leaf for an unknown operation', async () => {
    await setupBrowserTest(<DomainContentPanel />, {
      initialRouterEntry: `/${DOMAIN_ID}/totally-unknown-op`,
    });

    await expect.element(page.getByTestId('detail-panel')).toBeInTheDocument();
  });
});
