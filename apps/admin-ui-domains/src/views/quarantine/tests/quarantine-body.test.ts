/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { findBodyPart } from '../quarantine-list';

const generateBody = (
  mp: Parameters<typeof findBodyPart>[0],
  id: string,
): ReturnType<typeof findBodyPart> => findBodyPart(mp, { contentType: '', content: '' }, id);

describe('findBodyPart', () => {
  it('escapes markup from a text/plain part appended onto an HTML body (CO-4561)', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/html', body: true, content: '<html><body>Benign</body></html>' },
          {
            part: '2',
            ct: 'text/plain',
            body: true,
            content: '<img src="data:image/gif;base64,x" onerror="alert(1)">',
          },
        ],
        'msg-42',
      ),
    ).toEqual({
      contentType: 'text/html',
      content:
        '<html><body>Benign</body></html>&lt;img src=&quot;data:image/gif;base64,x&quot; onerror=&quot;alert(1)&quot;&gt;',
    });
  });

  it('does not escape an HTML part appended onto an HTML body', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/html', body: true, content: '<p>first</p>' },
          { part: '2', ct: 'text/html', body: true, content: '<p>second</p>' },
        ],
        'msg-42',
      ),
    ).toEqual({ contentType: 'text/html', content: '<p>first</p><p>second</p>' });
  });

  it('keeps a text/plain body as it is', () => {
    expect(
      generateBody(
        [
          { part: '1', ct: 'text/plain', body: true, content: 'first' },
          { part: '2', ct: 'text/plain', body: true, content: '<b>second</b>' },
        ],
        'msg-42',
      ),
    ).toEqual({ contentType: 'text/plain', content: 'first<b>second</b>' });
  });
});
