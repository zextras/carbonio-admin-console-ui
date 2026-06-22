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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import MTAInboundFlowSecurity from './inbound-flow-security';

type SoapAttribute = {
  n: string;
  _content: string;
};

function extractModifyAttributes(request: unknown): Array<SoapAttribute> {
  const root = request as Record<string, unknown>;

  const body = root.Body as Record<string, unknown> | undefined;
  const requestInBody = body?.ModifyConfigRequest as Record<string, unknown> | undefined;
  const requestAtRoot = root.ModifyConfigRequest as Record<string, unknown> | undefined;

  const attributesFromBody = requestInBody?.a;
  if (Array.isArray(attributesFromBody)) {
    return attributesFromBody as Array<SoapAttribute>;
  }

  const attributesFromRoot = requestAtRoot?.a;
  if (Array.isArray(attributesFromRoot)) {
    return attributesFromRoot as Array<SoapAttribute>;
  }

  const attributesAtTopLevel = root.a;
  if (Array.isArray(attributesAtTopLevel)) {
    return attributesAtTopLevel as Array<SoapAttribute>;
  }

  return [];
}

function getAllConfigResponse() {
  return {
    a: [
      { n: 'zimbraMtaBlockedExtension', _content: 'exe' },
      { n: 'zimbraMtaBlockedExtension', _content: 'bat' },
      { n: 'zimbraMtaCommonBlockedExtension', _content: 'zip' },
      { n: 'zimbraMtaCommonBlockedExtension', _content: 'js' },
      { n: 'zimbraMtaBlockedExtensionWarnAdmin', _content: 'TRUE' },
      { n: 'zimbraMtaBlockedExtensionWarnRecipient', _content: 'FALSE' },
      { n: 'zimbraMtaSmtpdRejectUnlistedSender', _content: 'yes' },
      { n: 'zimbraMtaSmtpdRejectUnlistedRecipient', _content: 'no' },
      { n: 'zimbraMtaSmtpdSenderRestrictions', _content: 'reject_sender_login_mismatch' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_client_hostname' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_reverse_client_hostname' },
      { n: 'zimbraMtaRestriction', _content: 'reject_invalid_helo_hostname' },
      { n: 'zimbraMtaRestriction', _content: 'reject_non_fqdn_helo_hostname' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_helo_hostname' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_sender_domain' },
      { n: 'zimbraMtaRestriction', _content: 'reject_non_fqdn_sender' },
    ],
  };
}

describe('MTAInboundFlowSecurity', () => {
  beforeEach(async () => {
    createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('renders all main sections and base controls', async () => {
    await setupBrowserTest(<MTAInboundFlowSecurity />, { grantRights: 'config' });

    await expect.element(page.getByText('Inbound Flow & Security', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Rejection', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Protocol Checks', { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Add commonly blocked extensions' }))
      .toBeVisible();

    expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
    expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
  });

  it('shows Save and Cancel when a switch changes', async () => {
    await setupBrowserTest(<MTAInboundFlowSecurity />, { grantRights: 'config' });

    const rejectUnlistedSenderSwitch = page.getByText('Reject unlisted Sender');
    await expect.element(rejectUnlistedSenderSwitch).toBeVisible();
    await rejectUnlistedSenderSwitch.click();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('resets dirty state when Cancel is clicked', async () => {
    await setupBrowserTest(<MTAInboundFlowSecurity />, { grantRights: 'config' });

    await page.getByText('Reject unlisted Sender').click();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.poll(() => page.getByRole('button', { name: 'Save' }).elements().length).toBe(0);
    await expect.poll(() => page.getByRole('button', { name: 'Cancel' }).elements().length).toBe(0);
  });

  it('submits a ModifyConfig request with changed data on save', async () => {
    const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});

    await setupBrowserTest(<MTAInboundFlowSecurity />, { grantRights: 'config' });

    await page.getByText('Reject unlisted Sender').click();

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect.element(saveButton).toBeVisible();
    await saveButton.click();

    const request = await modifyConfigInterceptor;
    const attributes = extractModifyAttributes(request);

    expect(attributes.length).toBeGreaterThan(0);

    expect(attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          n: 'zimbraMtaSmtpdRejectUnlistedSender',
          _content: 'no',
        }),
      ]),
    );
  }, 20000);
});
