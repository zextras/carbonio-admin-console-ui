/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  assertZextrasServerOk,
  parseZextrasNestedContent,
} from '../address-book-zextras-utils';

describe('address-book-zextras-utils', () => {
  describe('parseZextrasNestedContent', () => {
    it('should return null for undefined content', () => {
      expect(parseZextrasNestedContent(undefined)).toBeNull();
    });

    it('should parse JSON content', () => {
      const payload = { response: { test: true }, ok: true };
      expect(parseZextrasNestedContent(JSON.stringify(payload))).toEqual(payload);
    });
  });

  describe('assertZextrasServerOk', () => {
    it('should throw when SOAP Fault exists', () => {
      const response = {
        Body: {
          Fault: { Reason: { Text: 'Some fault' } },
        },
      } as any;

      expect(() => assertZextrasServerOk(response, 'target', 'fallback')).toThrow(
        'Some fault',
      );
    });

    it('should throw when nested server result is not ok', () => {
      const response = {
        Body: {
          response: {
            content: JSON.stringify({
              response: {
                target: {
                  ok: false,
                  message: 'Command failed',
                },
              },
            }),
          },
        },
      } as any;

      expect(() => assertZextrasServerOk(response, 'target', 'fallback')).toThrow(
        'Command failed',
      );
    });

    it('should return parsed payload when ok', () => {
      const payload = { response: { target: { ok: true, response: {} } }, ok: true };
      const response = {
        Body: {
          response: {
            content: JSON.stringify(payload),
          },
        },
      } as any;

      expect(assertZextrasServerOk(response, 'target', 'fallback')).toEqual(payload);
    });
  });
});
