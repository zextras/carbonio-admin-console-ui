/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  buildGetMsgBatch,
  extractScoreValue,
  getDateTime,
  normalizeMessage,
  parseFlags,
  sanitizeEmail,
} from '../quarantine-message-normalizer';

describe('parseFlags', () => {
  it('returns all-false defaults for undefined flags except read/receipt', () => {
    const flags = parseFlags(undefined);
    expect(flags.read).toBe(true);
    expect(flags.hasAttachment).toBe(false);
    expect(flags.isReadReceiptRequested).toBe(true);
  });

  it('parses each flag character', () => {
    const flags = parseFlags('afd');
    expect(flags.read).toBe(true);
    expect(flags.hasAttachment).toBe(true);
    expect(flags.isDraft).toBe(true);
    expect(flags.flagged).toBe(true);
  });

  it('u flag means unread', () => {
    expect(parseFlags('u').read).toBe(false);
  });
});

describe('extractScoreValue', () => {
  it('extracts the score from X-Spam-Status', () => {
    expect(extractScoreValue('tests=BAD_HDR score=42.1 required=5')).toBe('42.1');
  });

  it('returns empty string when no score', () => {
    expect(extractScoreValue('')).toBe('');
    expect(extractScoreValue('no score here')).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('strips angle brackets', () => {
    expect(sanitizeEmail('<a@b.com>')).toBe('a@b.com');
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('getDateTime', () => {
  it('formats epoch millis as dd/MM/yy HH:mm', () => {
    expect(getDateTime(new Date(2026, 0, 2, 3, 4).getTime())).toMatch(
      /^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
  });
});

describe('buildGetMsgBatch', () => {
  it('builds one GetMsgRequest entry per message with the 8 spam headers', () => {
    const batch = buildGetMsgBatch([{ id: '1' }, { id: '2' }]) as Array<{
      _jsns: string;
      m: { id: string; header: Array<{ n: string }> };
    }>;
    expect(batch).toHaveLength(2);
    expect(batch[0].m.id).toBe('1');
    expect(batch[0].m.header.map((h) => h.n)).toEqual([
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

describe('normalizeMessage', () => {
  const soapMsg = {
    id: 'msg-1',
    cid: 'conv-1',
    d: 1750000000000,
    s: 1024,
    l: '2',
    su: 'Test subject',
    f: 'u',
    e: [{ a: 'from@example.com', t: 'f', p: 'From' }],
    mp: [
      {
        part: 'TEXT',
        ct: 'text/plain',
        body: true,
        content: 'hello',
      },
    ],
    _attrs: {
      'X-Spam-Status': 'score=13.2 required=5',
      'X-Amavis-Alert': 'bad header',
      'X-Envelope-From': ['<from@example.com>'],
      'X-Envelope-To': ['<to@example.com>'],
    },
  };

  it('normalizes participants, body, flags and spam headers', () => {
    const msg = normalizeMessage(soapMsg as never);
    expect(msg.id).toBe('msg-1');
    expect(msg.read).toBe(false);
    expect(msg.participants?.[0].address).toBe('from@example.com');
    expect(msg.body).toEqual({ contentType: 'text/plain', content: 'hello' });
    expect(msg.score).toBe('13.2');
    expect(msg.reason).toBe('bad header');
    expect(msg.envelopeFrom).toBe('from@example.com');
    expect(msg.envelopeTo).toBe('to@example.com');
  });
});
