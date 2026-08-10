/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  getResponsiveContainerStyle,
  getResponsiveMaxWidth,
} from '../responsive-container';

describe('getResponsiveMaxWidth', () => {
  it('returns 1400px at 2xl with no offset', () => {
    expect(getResponsiveMaxWidth({ breakpoint: '2xl' })).toBe('1400px');
  });

  it('returns 1125px at xl with no offset', () => {
    expect(getResponsiveMaxWidth({ breakpoint: 'xl' })).toBe('1125px');
  });

  it('returns 1125px at lg when the primary bar is collapsed', () => {
    expect(
      getResponsiveMaxWidth({ breakpoint: 'lg', isPrimaryBarExpanded: false }),
    ).toBe('1125px');
  });

  it('returns 981px at lg when the primary bar is expanded', () => {
    expect(
      getResponsiveMaxWidth({ breakpoint: 'lg', isPrimaryBarExpanded: true }),
    ).toBe('981px');
  });

  it('subtracts sidePanelOffsetPx via calc() when > 0', () => {
    expect(
      getResponsiveMaxWidth({ breakpoint: '2xl', sidePanelOffsetPx: 265 }),
    ).toBe('calc(1400px - 265px)');
  });

  it('caps the base width at maxBaseWidthPx', () => {
    expect(
      getResponsiveMaxWidth({ breakpoint: '2xl', maxBaseWidthPx: 1125 }),
    ).toBe('1125px');
  });

  it('does not raise widths below the cap', () => {
    expect(
      getResponsiveMaxWidth({
        breakpoint: 'lg',
        isPrimaryBarExpanded: true,
        maxBaseWidthPx: 1125,
      }),
    ).toBe('981px');
  });
});

describe('getResponsiveContainerStyle', () => {
  it('returns the shared layout shape with the computed maxWidth', () => {
    expect(
      getResponsiveContainerStyle({ breakpoint: 'xl', sidePanelOffsetPx: 265 }),
    ).toEqual({
      width: '100%',
      maxWidth: 'calc(1125px - 265px)',
      transition: 'max-width 300ms',
      padding: '0 clamp(0.5rem, 2vw, 2rem)',
      boxSizing: 'border-box',
    });
  });
});
