/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { MailMessageRenderer } from '../mail-message-renderer';
import { generateBody } from '../quarantine-message-normalizer';
import type { IncompleteMessage, SoapMailMessagePart } from '../quarantine-types';

vi.mock('@zextras/ui-shared', async () => {
  const actual = await vi.importActual<typeof import('@zextras/ui-shared')>('@zextras/ui-shared');
  return {
    ...actual,
    useUserSettings: () => ({ prefs: { zimbraPrefMailTrustedSenderList: '' } }),
  };
});

type XssWindow = Window & { __xss?: string };

const XSS_PAYLOAD = `<img src="data:image/gif;base64,x" onerror="parent.__xss='executed in '+location.origin">`;

function createMessage(contentType: string, content: string): IncompleteMessage {
  return {
    id: 'msg-xss',
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
  } as IncompleteMessage;
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
    // Mirrors the manually confirmed PoC: an HTML part followed by a text/plain part carrying
    // the onerror payload, exactly as generateBody() assembles a multipart/mixed body.
    const mp: Array<SoapMailMessagePart> = [
      {
        part: '1',
        ct: 'text/html',
        body: true,
        content: '<html><body><div>Benign HTML part.</div></body></html>',
      },
      { part: '2', ct: 'text/plain', body: true, content: XSS_PAYLOAD },
    ];
    const body = generateBody(mp, 'msg-xss');
    const mailMsg = createMessage(body.contentType, body.content);

    await setupBrowserTest(<MailMessageRenderer mailMsg={mailMsg} />);
    await expect.element(page.getByTitle('msg-xss')).toBeInTheDocument();
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect((globalThis as unknown as XssWindow).__xss).toBeUndefined();
  });
});
