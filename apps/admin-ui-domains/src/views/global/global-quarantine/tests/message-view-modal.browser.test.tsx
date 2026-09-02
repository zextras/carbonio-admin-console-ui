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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { MessageViewModal } from '../message-view-modal';
import type { IncompleteMessage } from '../quarantine-types';

function createMessage(): IncompleteMessage {
  return {
    id: 'msg-1',
    parent: '2',
    conversation: '',
    read: true,
    size: 100,
    hasAttachment: false,
    flagged: false,
    urgent: false,
    isDeleted: false,
    isSentByMe: false,
    isForwarded: false,
    isInvite: false,
    isDraft: false,
    isScheduled: false,
    date: new Date(2025, 5, 15, 14, 30).getTime(),
    subject: 'Spam subject',
    fragment: '',
    tags: [],
    parts: [],
    body: { contentType: 'text/html', content: '<p>html-source</p>' },
    isComplete: true,
    isReplied: false,
    score: '42',
    reason: 'bad content',
    envelopeFrom: 'spammer@example.com',
    envelopeTo: 'admin@example.com',
    participants: [{ type: 'f', address: 'spammer@example.com' }],
    attachments: [],
  };
}

async function setupModal(onClose: () => void = vi.fn()): Promise<void> {
  await setupBrowserTest(
    <MessageViewModal message={createMessage()} accountId="acc-1" onClose={onClose} />,
    { grantRights: 'config' },
  );
}

describe('MessageViewModal', () => {
  afterEach(() => {
    resetMockWorker();
    vi.unstubAllGlobals();
  });

  it('renders subject, sender, score and the main actions', async () => {
    await setupModal();

    await expect.element(page.getByText('Spam subject', { exact: true })).toBeVisible();
    await expect.element(page.getByText('spammer@example.com', { exact: true })).toBeVisible();
    await expect.element(page.getByText('42', { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'DOWNLOAD', exact: true }))
      .toBeVisible();
    await expect.element(page.getByRole('button', { name: 'DELIVER', exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'DELETE', exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Close', exact: true }))
      .toBeVisible();
  });

  it('downloads the message using a delegate-auth token', async () => {
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);
    const delegateAuthParams = createBrowserSoapAPIInterceptor('DelegateAuth', {
      authToken: [{ _content: 'token-123' }],
    });
    await setupModal();

    await page.getByRole('button', { name: 'DOWNLOAD', exact: true }).click();
    const params = await delegateAuthParams;
    expect(JSON.stringify(params)).toContain('acc-1');
    await vi.waitFor(() => expect(openMock).toHaveBeenCalledTimes(1));
    const url = String(openMock.mock.calls[0]?.[0]);
    expect(url).toContain('authtoken=token-123');
    expect(url).toContain('adminPreAuth=1');
  });

  it('shows an error snackbar when the delegate-auth response has no token', async () => {
    createBrowserSoapAPIInterceptor('DelegateAuth', {});
    await setupModal();

    await page.getByRole('button', { name: 'DOWNLOAD', exact: true }).click();

    await expect
      .element(page.getByText('Something went wrong. Please try again.'))
      .toBeVisible();
  });

  it('toggles the raw source panel', async () => {
    await setupModal();

    await expect.element(page.getByText('<p>html-source</p>')).not.toBeVisible();
    await page.getByRole('button', { name: 'Show source' }).click();
    await expect.element(page.getByText('<p>html-source</p>')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Hide source' })).toBeVisible();

    await page.getByRole('button', { name: 'Hide source' }).click();
    await expect.element(page.getByText('<p>html-source</p>')).not.toBeVisible();
  });

  it('closes the deliver confirmation without delivering when cancelled', async () => {
    const onClose = vi.fn();
    await setupModal(onClose);

    await page.getByRole('button', { name: 'DELIVER', exact: true }).click();
    await expect.element(page.getByText('Is the content of the email safe?')).toBeVisible();

    await page.getByRole('button', { name: 'NO, CANCEL' }).click();
    await expect
      .poll(() => page.getByText('Is the content of the email safe?').elements())
      .toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes the delete confirmation without deleting when cancelled', async () => {
    const onClose = vi.fn();
    await setupModal(onClose);

    await page.getByRole('button', { name: 'DELETE', exact: true }).click();
    await expect
      .element(page.getByText('Are you sure you want to delete message?'))
      .toBeVisible();

    await page.getByRole('button', { name: 'NO, KEEP IT' }).click();
    await expect
      .poll(() => page.getByText('Are you sure you want to delete message?').elements())
      .toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});
