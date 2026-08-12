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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { MTAOutBoundFlow } from '../outbound-flow';

function getAllConfigResponse() {
  return {
    a: [
      { n: 'zimbraSmtpSendAddOriginatingIP', _content: 'TRUE' },
      { n: 'zimbraSmtpSendAddAuthenticatedUser', _content: 'FALSE' },
      { n: 'zimbraMtaSaslAuthEnable', _content: 'yes' },
      { n: 'zimbraMtaMyNetworks', _content: '127.0.0.0/8 10.0.0.0/24' },
      { n: 'zimbraMtaSmtpHeloName', _content: 'mail.test.com' },
      { n: 'zimbraMtaMyHostname', _content: 'mail.test.com' },
      { n: 'zimbraMtaFallbackRelayHost', _content: '' },
      { n: 'zimbraMtaRelayHost', _content: '' },
      { n: 'zimbraMtaMyOrigin', _content: 'test.com' },
      { n: 'zimbraMtaTlsSecurityLevel', _content: 'may' },
    ],
  };
}

function getAllServersResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: 'mail.test.com',
        a: [
          { n: 'zimbraServiceEnabled', _content: 'antispam' },
          { n: 'zimbraServiceEnabled', _content: 'antivirus' },
          { n: 'zimbraServiceEnabled', _content: 'opendkim' },
          { n: 'zimbraMtaSmtpSaslAuthEnable', _content: 'yes' },
        ],
      },
    ],
  };
}

async function expectGeneralSectionVisible() {
  await expect.element(page.getByText('General', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Add client IP to the header')).toBeVisible();
  await expect.element(page.getByText('Add username to the header')).toBeVisible();
  await expect.element(page.getByText('Enable Authentication')).toBeVisible();
  await expect.element(page.getByText('TLS Security Level')).toBeVisible();
}

async function expectInputFieldsVisible() {
  await expect.element(page.getByText('SMTP HELO Name')).toBeVisible();
  await expect.element(page.getByText('My Hostname')).toBeVisible();
  await expect.element(page.getByText('Fallback Relay Host')).toBeVisible();
  await expect.element(page.getByText('Relay Host', { exact: true })).toBeVisible();
  await expect.element(page.getByText('My Origin')).toBeVisible();
}

async function expectInstancesSectionVisible() {
  await expect.element(page.getByText('Instances', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Server Name')).toBeVisible();
  await expect.element(page.getByText('Antispam', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Antivirus', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Authentication', { exact: true })).toBeVisible();
  await expect.element(page.getByText('DKIM', { exact: true })).toBeVisible();
}

async function toggleAddClientIpSwitch() {
  const addClientIpSwitch = page.getByRole('switch', { name: 'Add client IP to the header' });
  await expect.element(addClientIpSwitch).toBeVisible();
  await expect.poll(() => addClientIpSwitch.element().getAttribute('aria-disabled')).toBeNull();
  await addClientIpSwitch.click();
}

describe('MTAOutBoundFlow', () => {
  beforeEach(async () => {
    createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
    createBrowserSoapAPIInterceptor('GetAllEffectiveRights', getAllConfigRightsResponseMock());
    createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersResponse());
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('renders the page title', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expect.element(page.getByText('Outbound Flow', { exact: true })).toBeVisible();
  });

  it('renders the General section with all switches and select', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expectGeneralSectionVisible();
  });

  it('renders all input fields', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expectInputFieldsVisible();
  });

  it('renders the My Network chip input', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expect.element(page.getByText('127.0.0.0/8')).toBeVisible();
    await expect.element(page.getByText('10.0.0.0/24')).toBeVisible();
  });

  it('renders the Instances section with table headers', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expectInstancesSectionVisible();
  });

  it('renders server data in the instances table', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expect.element(page.getByText('mail.test.com')).toBeVisible();
    await expect.element(page.getByText('Active').first()).toBeVisible();
    await expect.element(page.getByText('Enabled').first()).toBeVisible();
  });

  it('does not render Save and Cancel buttons when no changes are made', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await expect.element(page.getByText('Outbound Flow', { exact: true })).toBeVisible();
    expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
    expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
  });

  it('shows Save and Cancel when a switch changes', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await toggleAddClientIpSwitch();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('resets dirty state when Cancel is clicked', async () => {
    await setupBrowserTest(<MTAOutBoundFlow />, { grantRights: 'config' });

    await toggleAddClientIpSwitch();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.poll(() => page.getByRole('button', { name: 'Save' }).elements().length).toBe(0);
    await expect.poll(() => page.getByRole('button', { name: 'Cancel' }).elements().length).toBe(0);
  });
}, 20_000);
