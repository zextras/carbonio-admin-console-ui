/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { computeToggledValue } from '../account-form-context';

describe('computeToggledValue', () => {
  describe('TRUE/FALSE string attrs', () => {
    it('flips FALSE to TRUE when saved value is FALSE', () => {
      expect(computeToggledValue('FALSE', 'FALSE', 'TRUE', 'FALSE')).toBe('TRUE');
    });

    it('flips TRUE to FALSE when saved value is TRUE', () => {
      expect(computeToggledValue('TRUE', 'TRUE', 'TRUE', 'FALSE')).toBe('FALSE');
    });

    it('toggles on from an absent attr (undefined saved value)', () => {
      expect(computeToggledValue(undefined, undefined, 'TRUE', 'FALSE')).toBe('TRUE');
    });

    it('restores the exact saved undefined value when toggled back from TRUE', () => {
      // saved is absent: visually OFF means "back to saved" → restore undefined
      expect(computeToggledValue('TRUE', undefined, 'TRUE', 'FALSE')).toBeUndefined();
    });

    it('restores the exact saved FALSE value when toggled back from TRUE', () => {
      expect(computeToggledValue('TRUE', 'FALSE', 'TRUE', 'FALSE')).toBe('FALSE');
    });

    it('restores the exact saved TRUE value when toggled back from FALSE', () => {
      expect(computeToggledValue('FALSE', 'TRUE', 'TRUE', 'FALSE')).toBe('TRUE');
    });
  });

  describe('boolean attrs', () => {
    it('flips and restores booleans', () => {
      expect(computeToggledValue(false, false, true, false)).toBe(true);
      expect(computeToggledValue(true, false, true, false)).toBe(false);
      expect(computeToggledValue(true, true, true, false)).toBe(false);
      expect(computeToggledValue(false, true, true, false)).toBe(true);
    });

    it('restores undefined when saved boolean attr is absent', () => {
      expect(computeToggledValue(true, undefined, true, false)).toBeUndefined();
    });
  });

  describe('custom sentinels (ENABLED/DISABLED)', () => {
    it('flips between custom sentinels and restores the saved one', () => {
      expect(computeToggledValue('enabled', 'enabled', 'enabled', 'disabled')).toBe('disabled');
      expect(computeToggledValue('disabled', 'enabled', 'enabled', 'disabled')).toBe('enabled');
      expect(computeToggledValue('enabled', undefined, 'enabled', 'disabled')).toBeUndefined();
    });
  });
});
