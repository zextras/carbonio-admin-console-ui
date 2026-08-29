/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useResourceForm } from '../resource-form-context';

describe('useResourceForm', () => {
  it('throws when used outside ResourceFormContext.Provider', () => {
    expect(() => renderHook(() => useResourceForm())).toThrow(
      'useResourceForm must be used within ResourceFormContext.Provider',
    );
  });
});
