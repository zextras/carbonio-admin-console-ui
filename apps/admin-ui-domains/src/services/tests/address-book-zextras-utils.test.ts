/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { assertZextrasOk, parseZextrasContent } from '../address-book-zextras-utils';

describe('address-book-zextras-utils', () => {
  describe('parseZextrasContent', () => {
    it('should return null for undefined content', () => {
      expect(parseZextrasContent(undefined)).toBeNull();
    });

    it('should parse JSON content', () => {
      const payload = { ok: true, response: { folders: [] } };
      expect(parseZextrasContent(JSON.stringify(payload))).toEqual(payload);
    });
  });

  describe('assertZextrasOk', () => {
    it('should throw when SOAP Fault exists', () => {
      const response = {
        Body: {
          Fault: { Reason: { Text: 'Some fault' } },
        },
      } as any;

      expect(() => assertZextrasOk(response, 'fallback')).toThrow('Some fault');
    });

    it('should throw when payload ok is false', () => {
      const response = {
        Body: {
          response: {
            content: JSON.stringify({
              ok: false,
              message: 'Command failed',
            }),
          },
        },
      } as any;

      expect(() => assertZextrasOk(response, 'fallback')).toThrow('Command failed');
    });

    it('should return parsed payload when ok', () => {
      const payload = { ok: true, response: { folders: [] } };
      const response = {
        Body: {
          response: {
            content: JSON.stringify(payload),
          },
        },
      } as any;

      expect(assertZextrasOk(response, 'fallback')).toEqual(payload);
    });
  });
});
