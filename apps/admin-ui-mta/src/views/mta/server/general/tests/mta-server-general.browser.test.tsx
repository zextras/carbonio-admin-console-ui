/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getAllConfigRightsResponseMock,
  getGetInfoResponseMock,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { MTAServerGeneral } from '../mta-server-general';

const SERVER_NAME = 'mail1.test.com';

function getServerResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: SERVER_NAME,
        a: [
          { n: 'zimbraMtaSaslAuthEnable', _content: 'yes' },
          { n: 'zimbraMtaMyNetworks', _content: '127.0.0.0/8 10.0.0.0/24' },
          { n: 'zimbraMtaRelayHost', _content: 'relay.test.com' },
          { n: 'zimbraMtaFallbackRelayHost', _content: 'fallback.test.com' },
          { n: 'zimbraAmavisOriginatingBypassSA', _content: 'TRUE' },
          { n: 'zimbraAmavisEnableDKIMVerification', _content: 'TRUE' },
          { n: 'carbonioAmavisDisableVirusCheck', _content: 'FALSE' },
          { n: 'zimbraAmavisLogLevel', _content: '2' },
          { n: 'zimbraAmavisSALogLevel', _content: '0' },
          { n: 'zimbraMtaSmtpdTlsLoglevel', _content: '1' },
          { n: 'zimbraMtaLmtpTlsLoglevel', _content: '0' },
        ],
      },
    ],
  };
}

function getServerSpecificResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: SERVER_NAME,
        a: [
          { n: 'zimbraMtaSaslAuthEnable', _content: 'yes' },
          { n: 'zimbraMtaMyNetworks', _content: '127.0.0.0/8' },
        ],
      },
    ],
  };
}

function getAllConfigResponse() {
  return {
    a: [
      { n: 'zimbraMtaSaslAuthEnable', _content: 'yes' },
      { n: 'zimbraMtaMyNetworks', _content: '127.0.0.0/8 10.0.0.0/24' },
      { n: 'zimbraMtaRelayHost', _content: '' },
      { n: 'zimbraMtaFallbackRelayHost', _content: '' },
      { n: 'zimbraAmavisOriginatingBypassSA', _content: 'TRUE' },
      { n: 'zimbraAmavisEnableDKIMVerification', _content: 'TRUE' },
      { n: 'carbonioAmavisDisableVirusCheck', _content: 'FALSE' },
      { n: 'zimbraAmavisLogLevel', _content: '2' },
      { n: 'zimbraAmavisSALogLevel', _content: '0' },
      { n: 'zimbraMtaSmtpdTlsLoglevel', _content: '1' },
      { n: 'zimbraMtaLmtpTlsLoglevel', _content: '0' },
    ],
  };
}

function getAllServersWithMtaResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: SERVER_NAME,
        a: [{ n: 'zimbraServiceEnabled', _content: 'mta' }],
      },
    ],
  };
}

function setupInterceptors() {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllEffectiveRights', getAllConfigRightsResponseMock());
  createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
  createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
  // GetServer ×2: effective (applyConfig SOAP 1 / JS false), then specific (SOAP 0 / JS true)
  createBrowserSoapAPIInterceptor('GetServer', getServerResponse());
  createBrowserSoapAPIInterceptor('GetServer', getServerSpecificResponse());
}

function renderComponent() {
  return (
    <Routes>
      <Route path="/:server/:operation" element={<MTAServerGeneral />} />
    </Routes>
  );
}

async function expectAuthenticationSectionVisible() {
  await expect.element(page.getByText('Authentication', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Enable Authentication')).toBeVisible();
  await expect.element(page.getByText('My Network')).toBeVisible();
}

async function expectAuthenticationInputsVisible() {
  await expect.element(page.getByText('Relay Host', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Fallback Relay Host')).toBeVisible();
}

async function expectAntispamAntivirusSectionVisible() {
  await expect.element(page.getByText('Antispam & Antivirus', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Also check outbound messages')).toBeVisible();
  await expect.element(page.getByText('Verify DKIM validity')).toBeVisible();
  await expect.element(page.getByText('Disable Virus Check')).toBeVisible();
}

async function expectLoggingSectionVisible() {
  await expect.element(page.getByText('Logging', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Log level for Amavis', { exact: true })).toBeVisible();
  await expect.element(page.getByText('SAS Log level for Amavis')).toBeVisible();
  await expect.element(page.getByText('SMTP client logging of TLS Activity')).toBeVisible();
  await expect.element(page.getByText('LMTP client logging of TLS activity')).toBeVisible();
}

async function toggleDisableVirusCheck() {
  const virusCheckSwitch = page.getByRole('switch', { name: 'Disable Virus Check' });
  await expect.element(virusCheckSwitch).toBeVisible();
  await expect.poll(() => virusCheckSwitch.element().getAttribute('aria-disabled')).toBeNull();
  await virusCheckSwitch.click();
}

describe('MTAServerGeneral', { timeout: 20_000 }, () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the page title with server name', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expect.element(page.getByText('General', { exact: true })).toBeVisible();
    await expect.element(page.getByText(SERVER_NAME)).toBeVisible();
  });

  it('renders the Authentication section', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expectAuthenticationSectionVisible();
  });

  it('renders the Relay Host and Fallback Relay Host inputs', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expectAuthenticationInputsVisible();
  });

  it('renders the My Network chip input', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expect.element(page.getByText('My Network')).toBeVisible();
  });

  it('renders the Antispam & Antivirus section with all switches', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expectAntispamAntivirusSectionVisible();
  });

  it('renders the Logging section with all selects', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expectLoggingSectionVisible();
  });

  it('renders all three sections together', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expectAuthenticationSectionVisible();
    await expectAntispamAntivirusSectionVisible();
    await expectLoggingSectionVisible();
  });

  it('does not show Save and Cancel buttons initially', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expect.element(page.getByText('General', { exact: true })).toBeVisible();
    expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
    expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
  });

  it('renders all three Antispam & Antivirus switches', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expect.element(page.getByText('Also check outbound messages')).toBeVisible();
    await expect.element(page.getByText('Verify DKIM validity')).toBeVisible();
    await expect.element(page.getByText('Disable Virus Check')).toBeVisible();
  });

  it('renders all four Logging selects', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await expect.element(page.getByText('Log level for Amavis', { exact: true })).toBeVisible();
    await expect.element(page.getByText('SAS Log level for Amavis')).toBeVisible();
    await expect.element(page.getByText('SMTP client logging of TLS Activity')).toBeVisible();
    await expect.element(page.getByText('LMTP client logging of TLS activity')).toBeVisible();
  });

  it('shows Save and Cancel when a switch changes', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await toggleDisableVirusCheck();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('resets dirty state when Cancel is clicked', async () => {
    setupInterceptors();

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await toggleDisableVirusCheck();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.poll(() => page.getByRole('button', { name: 'Save' }).elements().length).toBe(0);
    await expect.poll(() => page.getByRole('button', { name: 'Cancel' }).elements().length).toBe(0);
  });

  it('submits a ModifyServer request with changed data on save', async () => {
    setupInterceptors();
    const modifyServerInterceptor = createBrowserSoapAPIInterceptor('ModifyServer', {
      server: [
        {
          id: 'server-1',
          name: SERVER_NAME,
          a: [{ n: 'carbonioAmavisDisableVirusCheck', _content: 'TRUE' }],
        },
      ],
    });

    await setupBrowserTest(renderComponent(), {
      initialRouterEntry: `/${SERVER_NAME}/general`,
      grantRights: 'config',
    });

    await toggleDisableVirusCheck();

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect.element(saveButton).toBeVisible();
    await saveButton.click();

    const request = await modifyServerInterceptor;
    expect(request).toMatchObject({
      _jsns: 'urn:zimbraAdmin',
      id: 'server-1',
      a: expect.arrayContaining([
        expect.objectContaining({
          n: 'carbonioAmavisDisableVirusCheck',
          _content: 'TRUE',
        }),
      ]),
    });
  });
});
