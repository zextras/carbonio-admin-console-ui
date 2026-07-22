/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect,it } from 'vitest';

import { asQueryString, type HsmPolicyDetail } from '../../hsm/hsm-policy-detail';

describe('asQueryString - Exhaustive Test Suite', () => {
  const createBaseDetail = (overrides: Partial<HsmPolicyDetail> = {}): HsmPolicyDetail => ({
    isAllEnabled: false,
    isMessageEnabled: false,
    isEventEnabled: false,
    isContactEnabled: false,
    isDocumentEnabled: false,
    policyCriteria: [],
    sourceVolume: [],
    destinationVolume: [],
    ...overrides,
  });

  describe('Category Selection', () => {
    it('should prioritize isAllEnabled over individual flags', () => {
      const detail = createBaseDetail({
        isAllEnabled: true,
        isDocumentEnabled: false, 
      });
      expect(asQueryString(detail)).toBe('document,message,contact,appointment');
    });

    it('should handle all individual flags being true while isAllEnabled is false', () => {
      const detail = createBaseDetail({
        isDocumentEnabled: true,
        isMessageEnabled: true,
        isContactEnabled: true,
        isEventEnabled: true,
      });
      expect(asQueryString(detail)).toBe('document,message,contact,appointment');
    });
  });

  describe('Policy Criteria Logic', () => {
    it('should chain multiple criteria of different types correctly', () => {
      const detail = createBaseDetail({
        isDocumentEnabled: true,
        policyCriteria: [
          { option: 'before', dateScale: '10', scale: 'days' },
          { option: 'larger', dateScale: '5', scale: 'mb' }
        ],
      });
      expect(asQueryString(detail)).toBe('document:before:-10days:larger:5mb');
    });

    it('should ignore unknown options (defensive check)', () => {
      const detail = createBaseDetail({
        isMessageEnabled: true,
        policyCriteria: [
          { option: 'unknown_op', dateScale: '1', scale: 'yr' } as any
        ],
      });
      expect(asQueryString(detail)).toBe('message');
    });
  });

  describe('Volume Handling', () => {
    it('should handle multiple source and destination volumes with commas', () => {
      const detail = createBaseDetail({
        isAllEnabled: true,
        sourceVolume: [{ id: 'src-1' }, { id: 'src-2' }],
        destinationVolume: [{ id: 'dest-1' }, { id: 'dest-2' }],
      });
      const result = asQueryString(detail);
      expect(result).toBe('document,message,contact,appointment source: src-1,src-2 destination: dest-1,dest-2');
    });

    it('should format correctly when only destinationVolume is present', () => {
      const detail = createBaseDetail({
        isMessageEnabled: true,
        destinationVolume: [{ id: 'target-cloud' }],
      });
      expect(asQueryString(detail)).toBe('message destination: target-cloud');
    });

    it('should not add "source:" or "destination:" labels if arrays are empty', () => {
      const detail = createBaseDetail({ isEventEnabled: true });
      const result = asQueryString(detail);
      expect(result).not.toContain('source:');
      expect(result).not.toContain('destination:');
    });
  });
});