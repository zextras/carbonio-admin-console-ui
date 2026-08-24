/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  buildGetMsgBatch,
  extractScoreValue,
  findBodyPart,
  generateBody,
  getAttachmentsFromParts,
  getDateTime,
  normalizeMessage,
  normalizeParticipants,
  parseFlags,
  sanitizeEmail,
} from '../quarantine-message-normalizer';
import type { AttachmentPart, SoapMailMessagePart, SoapMailParticipant } from '../quarantine-types';

describe('getDateTime', () => {
  it('formats a timestamp as dd/MM/yy HH:mm', () => {
    expect(getDateTime(new Date(2025, 5, 15, 14, 30).getTime())).toBe('15/06/25 14:30');
  });
});

describe('normalizeParticipants', () => {
  it('maps every soap role to the participant with the matching role letter', () => {
    const roles: Array<SoapMailParticipant['t']> = ['f', 't', 'c', 'b', 'r', 's', 'n', 'rf'];
    const participants = normalizeParticipants(
      roles.map((t, index) => ({
        a: `address-${index}@example.com`,
        d: `Display ${index}`,
        p: `Full Name ${index}`,
        t,
      })),
    );
    expect(participants.map((participant) => participant.type)).toEqual(roles);
    expect(participants[0]).toEqual({
      type: 'f',
      address: 'address-0@example.com',
      name: 'Display 0',
      fullName: 'Full Name 0',
    });
  });

  it('falls back to the address as name when the display name is missing', () => {
    expect(normalizeParticipants([{ a: 'fallback@example.com', t: 't', p: 'Full' }])).toEqual([
      {
        type: 't',
        address: 'fallback@example.com',
        name: 'fallback@example.com',
        fullName: 'Full',
      },
    ]);
  });

  it('returns an empty array for undefined participants', () => {
    expect(normalizeParticipants(undefined)).toEqual([]);
  });

  it('throws for an unknown participant role', () => {
    expect(() =>
      normalizeParticipants([{ a: 'unknown@example.com', t: 'zz' as never, p: 'Full' }]),
    ).toThrow(/Participant type not handled/);
  });
});

describe('findBodyPart / generateBody', () => {
  it('uses the first body part contentType and appends the content of the next body part', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/plain', body: true, content: 'plain ' },
          { part: '2', ct: 'text/html', body: true, content: '<b>html</b>' },
        ],
        'msg-42',
      ),
    ).toEqual({ contentType: 'text/plain', content: 'plain <b>html</b>' });
  });

  it('recurses into nested multipart parts to find the body', () => {
    const mp: Array<SoapMailMessagePart> = [
      {
        part: '0',
        ct: 'multipart/mixed',
        mp: [
          {
            part: '1',
            ct: 'multipart/alternative',
            mp: [
              { part: '1.1', ct: 'text/plain', body: true, content: 'text body' },
              { part: '1.2', ct: 'text/html', body: true, content: '<p>html body</p>' },
            ],
          },
        ],
      },
    ];
    expect(generateBody(mp, 'msg-42')).toEqual({
      contentType: 'text/plain',
      content: 'text body<p>html body</p>',
    });
  });

  it('accumulates into the given accumulator', () => {
    expect(
      findBodyPart(
        [{ part: '1', ct: 'text/html', body: true, content: ' more' }],
        {
          contentType: 'text/plain',
          content: 'base',
        },
        'msg-42',
      ),
    ).toEqual({ contentType: 'text/plain', content: 'base more' });
  });

  it('appends an img tag for an inline image body part after the first body', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/plain', body: true, content: 'look here' },
          { part: '2', ct: 'image/png', body: true, cd: 'inline' },
        ],
        'msg-42',
      ),
    ).toEqual({
      contentType: 'text/plain',
      content: "look here<img src='/service/home/~/?auth=co&loc=en&id=msg-42&part=2'>",
    });
  });

  it('appends a text/plain body part after the first body without an img tag', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/html', body: true, content: '<p>first</p>' },
          { part: '2', ct: 'text/plain', body: true, content: 'second' },
        ],
        'msg-42',
      ),
    ).toEqual({ contentType: 'text/html', content: '<p>first</p>second' });
  });
});

describe('getAttachmentsFromParts', () => {
  it('extracts attachments from a message with a multipart alternative body', () => {
    const results = getAttachmentsFromParts([
      {
        part: '1',
        ct: 'multipart/alternative',
        mp: [
          { part: '1.1', ct: 'text/plain', body: true, content: 'hello' },
          { part: '1.2', ct: 'text/html', body: true, content: '<p>hello</p>' },
        ],
      },
      { part: '2', ct: 'application/pdf', cd: 'attachment', s: 2048, filename: 'file.pdf' },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      part: '2',
      ct: 'application/pdf',
      cd: 'attachment',
      s: 2048,
      filename: 'file.pdf',
      contentType: 'application/pdf',
      name: '2',
      size: 2048,
    });
  });

  it('ignores apple double, digest, body, text-body and unnamed calendar parts', () => {
    const expectNoResults = (part: AttachmentPart): void => {
      expect(getAttachmentsFromParts([part])).toEqual([]);
    };
    expectNoResults({ part: '1', ct: 'multipart/appledouble', cd: 'attachment' });
    expectNoResults({ part: '1', ct: 'application/applefile', cd: 'attachment' });
    expectNoResults({ part: '1', ct: 'multipart/digest', cd: 'attachment' });
    expectNoResults({
      part: '1',
      ct: 'text/html',
      body: true,
      content: '<p>x</p>',
      cd: 'attachment',
    });
    expectNoResults({ part: '1', ct: 'text/plain', body: true, content: 'x', cd: 'attachment' });
    expectNoResults({ part: '1', ct: 'text/plain', ci: 'text-body' });
    expectNoResults({ part: '1', ct: 'text/calendar' });
  });

  it('keeps text/calendar parts that have a filename', () => {
    const results = getAttachmentsFromParts([
      { part: '1', ct: 'text/calendar', cd: 'attachment', s: 128, filename: 'event.ics' },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      contentType: 'text/calendar',
      name: '1',
      filename: 'event.ics',
      cd: 'attachment',
    });
  });

  it('falls back to an Unknown filename for message/rfc822 parts without one', () => {
    const results = getAttachmentsFromParts([{ part: '1', ct: 'message/rfc822', s: 512 }]);
    expect(results).toHaveLength(1);
    expect(results[0].filename).toBe('Unknown <message/rfc822>');
  });

  it('excludes pkcs7 signature parts', () => {
    expect(
      getAttachmentsFromParts([
        { part: '1', ct: 'application/pkcs7-signature', cd: 'attachment', s: 64 },
      ]),
    ).toEqual([]);
  });

  it('resolves inline disposition when the html body anchors the content id', () => {
    const results = getAttachmentsFromParts([
      { part: '1', ct: 'text/html', body: true, content: '<p>hi</p><img src="cid:logo">' },
      { part: '2', ct: 'image/png', cd: 'inline', ci: '<logo@example.com>' },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].cd).toBe('inline');
  });

  it('resolves inline disposition for anchored attachments inside a multipart/related parent', () => {
    const results = getAttachmentsFromParts([
      { part: '1', ct: 'text/html', body: true, content: '<img src="cid:pic">' },
      {
        part: '2',
        ct: 'multipart/related',
        mp: [{ part: '2.1', ct: 'image/png', cd: 'attachment', ci: '<pic@server>', s: 100 }],
      },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].cd).toBe('inline');
  });

  it('resolves attachment disposition when the content id is not anchored in the html body', () => {
    const results = getAttachmentsFromParts([
      { part: '1', ct: 'text/html', body: true, content: '<p>no images here</p>' },
      { part: '2', ct: 'image/png', cd: 'inline', ci: '<unused@example.com>' },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].cd).toBe('attachment');
  });

  it('returns a single non array part as a one element array', () => {
    const part: AttachmentPart = {
      part: '1',
      ct: 'application/pdf',
      cd: 'attachment',
      s: 32,
      filename: 'doc.pdf',
    };
    expect(getAttachmentsFromParts(part)).toEqual([part]);
  });

  it('recurses into the mp of a single non array part', () => {
    const results = getAttachmentsFromParts({
      part: '0',
      ct: 'multipart/mixed',
      mp: [{ part: '1', ct: 'application/zip', cd: 'attachment', s: 64, filename: 'archive.zip' }],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      contentType: 'application/zip',
      name: '1',
      cd: 'attachment',
    });
  });

  it('finds attachments nested inside a multipart/mixed parent', () => {
    const results = getAttachmentsFromParts([
      {
        part: '0',
        ct: 'multipart/mixed',
        mp: [{ part: '1', ct: 'application/pdf', cd: 'attachment', s: 16, filename: 'nested.pdf' }],
      },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ contentType: 'application/pdf', name: '1' });
  });
});

describe('buildGetMsgBatch', () => {
  it('builds one batch entry per message with the spam headers to fetch', () => {
    const batch = buildGetMsgBatch([{ id: 'msg-1' }, { id: 'msg-2' }]) as Array<{
      _jsns: string;
      m: {
        html: number;
        id: string;
        needExp: number;
        header: Array<{ n: string }>;
      };
    }>;
    expect(batch).toHaveLength(2);
    batch.forEach((entry, index) => {
      expect(entry._jsns).toBe('urn:zimbraMail');
      expect(entry.m.html).toBe(1);
      expect(entry.m.id).toBe(`msg-${index + 1}`);
      expect(entry.m.needExp).toBe(1);
      expect(entry.m.header).toHaveLength(8);
      expect(entry.m.header.map((header) => header.n)).toEqual([
        'X-Envelope-From',
        'X-Envelope-To',
        'X-Envelope-To-Blocked',
        'X-Amavis-Alert',
        'X-Spam-Flag',
        'X-Spam-Score',
        'X-Spam-Level',
        'X-Spam-Status',
      ]);
    });
  });
});

describe('extractScoreValue', () => {
  it('extracts the numeric score from a spam status string', () => {
    expect(extractScoreValue('Yes, score=6.31 required=5')).toBe('6.31');
  });

  it('returns an empty string for undefined input', () => {
    expect(extractScoreValue(undefined as never)).toBe('');
  });

  it('returns an empty string when no score is present', () => {
    expect(extractScoreValue('no score here')).toBe('');
  });
});

describe('parseFlags', () => {
  it('returns the unread defaults for undefined flags', () => {
    expect(parseFlags(undefined)).toEqual({
      read: true,
      hasAttachment: false,
      flagged: false,
      urgent: false,
      isDeleted: false,
      isDraft: false,
      isForwarded: false,
      isSentByMe: false,
      isInvite: false,
      isReplied: false,
      isReadReceiptRequested: true,
    });
  });

  it('parses every flag character', () => {
    expect(parseFlags('uafdwx!svrn')).toEqual({
      read: false,
      hasAttachment: true,
      flagged: true,
      urgent: true,
      isDeleted: true,
      isDraft: true,
      isForwarded: true,
      isSentByMe: true,
      isInvite: true,
      isReplied: true,
      isReadReceiptRequested: false,
    });
  });
});

describe('sanitizeEmail', () => {
  it('strips angle brackets from an email', () => {
    expect(sanitizeEmail('<a@b.com>')).toBe('a@b.com');
  });

  it('returns an empty string for undefined input', () => {
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('normalizeMessage', () => {
  const soapMessage = {
    id: 'msg-42',
    cid: 'conv-7',
    d: 1750000000000,
    s: 2048,
    l: '300',
    fr: 'A fragment',
    su: 'Quarantined message',
    e: [
      { a: 'sender@example.com', d: 'Sender Display', p: 'Sender Full', t: 'f' },
      { a: 'recipient@example.com', p: 'Recipient Full', t: 't' },
    ],
    f: 'u',
    mp: [{ part: '1', ct: 'text/plain', body: true, content: 'message body' }],
    autoSendTime: 1750099999000,
    _attrs: {
      'X-Spam-Score': '6.1',
      'X-Amavis-Alert': 'Bad header',
      'X-Envelope-From': '<sender@example.com>',
      'X-Envelope-To': '<recipient@example.com>',
    },
  };

  it('maps every soap field to the normalized message', () => {
    const message = normalizeMessage(soapMessage as never);
    expect(message.conversation).toBe('conv-7');
    expect(message.id).toBe('msg-42');
    expect(message.date).toBe(1750000000000);
    expect(message.size).toBe(2048);
    expect(message.parent).toBe('300');
    expect(message.fragment).toBe('A fragment');
    expect(message.subject).toBe('Quarantined message');
    expect(message.participants).toEqual([
      {
        type: 'f',
        address: 'sender@example.com',
        name: 'Sender Display',
        fullName: 'Sender Full',
      },
      {
        type: 't',
        address: 'recipient@example.com',
        name: 'recipient@example.com',
        fullName: 'Recipient Full',
      },
    ]);
    expect(message.tags).toEqual([]);
    expect(message.parts).toEqual([
      {
        contentType: 'text/plain',
        size: 0,
        name: '1',
        disposition: undefined,
        content: 'message body',
      },
    ]);
    expect(message.attachments).toEqual([]);
    expect(message.body).toEqual({ contentType: 'text/plain', content: 'message body' });
    expect(message.isComplete).toBe(true);
    expect(message.isScheduled).toBe(true);
    expect(message.autoSendTime).toBe(1750099999000);
    expect(message.read).toBe(false);
    expect(message.hasAttachment).toBe(false);
    expect(message.flagged).toBe(false);
    expect(message.urgent).toBe(false);
    expect(message.isDeleted).toBe(false);
    expect(message.isDraft).toBe(false);
    expect(message.isForwarded).toBe(false);
    expect(message.isSentByMe).toBe(false);
    expect(message.isInvite).toBe(false);
    expect(message.isReplied).toBe(false);
    expect(message.isReadReceiptRequested).toBe(true);
    expect(message.score).toBe('6.1');
    expect(message.reason).toBe('Bad header');
    expect(message.envelopeFrom).toBe('sender@example.com');
    expect(message.envelopeTo).toBe('recipient@example.com');
  });

  it('pops array attribute values down to their last element', () => {
    const message = normalizeMessage({
      ...soapMessage,
      _attrs: {
        'X-Spam-Score': ['1', '2'],
        'X-Amavis-Alert': ['first reason', 'last reason'],
        'X-Envelope-From': ['<a@x>', '<b@y>'],
        'X-Envelope-To': ['<c@x>', '<d@y>'],
        'X-Spam-Status': ['score=1 required=5', 'score=9 required=5'],
      },
    } as never);
    expect(message.score).toBe('2');
    expect(message.reason).toBe('last reason');
    expect(message.envelopeFrom).toBe('b@y');
    expect(message.envelopeTo).toBe('d@y');

    const withoutSpamScore = normalizeMessage({
      ...soapMessage,
      _attrs: { 'X-Spam-Status': ['score=1 required=5', 'score=9 required=5'] },
    } as never);
    expect(withoutSpamScore.score).toBe('9');
  });

  it('falls back to the score parsed from X-Spam-Status when X-Spam-Score is missing', () => {
    const message = normalizeMessage({
      ...soapMessage,
      _attrs: { 'X-Spam-Status': 'Yes, score=6.31 required=5' },
    } as never);
    expect(message.score).toBe('6.31');
  });

  it('defaults subject and conversation when su and cid are missing', () => {
    const message = normalizeMessage({ id: 'msg-1', d: 1750000000000, s: 10, l: '2' });
    expect(message.subject).toBe('');
    expect(message.conversation).toBe('');
  });

  it('returns an empty body, parts and attachments when the message has no mp', () => {
    const message = normalizeMessage({ id: 'msg-1', d: 1750000000000, s: 10, l: '2' });
    expect(message.body).toEqual({ contentType: '', content: '' });
    expect(message.parts).toEqual([]);
    expect(message.attachments).toEqual([]);
  });
});
