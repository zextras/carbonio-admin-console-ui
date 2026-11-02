/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import MailMessageRenderer from '../mail-message-renderer';
import { findBodyPart } from '../quarantine-body';
import type { SoapMailMessagePart } from '../quarantine-list';

// The renderer only needs useUserSettings; the real module loads the settings over SOAP.
vi.mock('@zextras/admin-ui-bootstrap', () => ({
  useUserSettings: () => ({ prefs: { zimbraPrefMailTrustedSenderList: '' } }),
}));

type MailMessage = Parameters<typeof MailMessageRenderer>[0]['mailMsg'];

type XssWindow = Window & { __xss?: string };

const XSS_PAYLOAD = `<img src="data:image/gif;base64,x" onerror="parent.__xss='executed in '+location.origin">`;

function createMessage(contentType: string, content: string): MailMessage {
  return {
    id: 'msg-xss',
    did: 'domain-1',
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
    date: Date.now(),
    subject: 'xss',
    fragment: '',
    tags: [],
    parts: [],
    body: { contentType, content },
    isComplete: true,
    isReplied: false,
    participants: [{ type: 'f', address: 'attacker@example.com' }],
  } as unknown as MailMessage;
}

describe('MailMessageRenderer XSS', () => {
  afterEach(() => {
    delete (globalThis as unknown as XssWindow).__xss;
  });

  it('does not execute onerror handlers from the text/html part', async () => {
    await setupBrowserTest(
      <MailMessageRenderer
        mailMsg={createMessage('text/html', `<html><body>${XSS_PAYLOAD}</body></html>`)}
      />,
    );
    await expect.element(page.getByTitle('msg-xss')).toBeInTheDocument();
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect((globalThis as unknown as XssWindow).__xss).toBeUndefined();
  });

  it('does not execute onerror handlers from the text/plain part', async () => {
    await setupBrowserTest(
      <MailMessageRenderer mailMsg={createMessage('text/plain', XSS_PAYLOAD)} />,
    );
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect((globalThis as unknown as XssWindow).__xss).toBeUndefined();
  });

  it('does not execute onerror handlers smuggled in via a multipart text/plain part (CO-4561)', async () => {
    // An HTML part followed by a text/plain part carrying the onerror payload, assembled the
    // same way the quarantine list builds a multipart/mixed body.
    const mp: Array<SoapMailMessagePart> = [
      {
        part: '1',
        ct: 'text/html',
        body: true,
        content: '<html><body><div>Benign HTML part.</div></body></html>',
      },
      { part: '2', ct: 'text/plain', body: true, content: XSS_PAYLOAD },
    ];
    const body = findBodyPart(mp, { contentType: '', content: '' }, 'msg-xss');
    const mailMsg = createMessage(body.contentType, body.content);

    await setupBrowserTest(<MailMessageRenderer mailMsg={mailMsg} />);
    await expect.element(page.getByTitle('msg-xss')).toBeInTheDocument();
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect((globalThis as unknown as XssWindow).__xss).toBeUndefined();
  });
});
