/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AdvancedVolumeContext,
  type AdvancedVolumeContextType,
  useAdvancedVolumeContext,
} from '../create-advanced-volume-context';

function Probe(): null {
  useAdvancedVolumeContext();
  return null;
}

describe('useAdvancedVolumeContext', () => {
  it('does not throw when used inside an AdvancedVolumeContext.Provider', () => {
    const provided: AdvancedVolumeContextType = {
      form: { store: {} } as unknown as AdvancedVolumeContextType['form'],
      isAllocationToggle: true,
      setIsAllocationToggle: vi.fn(),
    };

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <AdvancedVolumeContext.Provider value={provided}>
            <Probe />
          </AdvancedVolumeContext.Provider>,
        ),
      ).not.toThrow();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('throws when used outside an AdvancedVolumeContext.Provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow(
        'useAdvancedVolumeContext must be used within an AdvancedVolumeContext.Provider',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
