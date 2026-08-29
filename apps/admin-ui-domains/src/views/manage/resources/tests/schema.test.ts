/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { createResourceSchema } from '../schema';
import { CREATE_RESOURCE_DEFAULT_VALUES } from '../use-create-resource-form';

describe('createResourceSchema', () => {
  it('accepts complete default values that include a display name and name', () => {
    const result = createResourceSchema.safeParse({
      ...CREATE_RESOURCE_DEFAULT_VALUES,
      displayName: 'Conference Room',
      name: 'conference-room',
    });

    expect(result.success).toBe(true);
  });

  it('requires a resource display name', () => {
    const result = createResourceSchema.safeParse({
      ...CREATE_RESOURCE_DEFAULT_VALUES,
      displayName: '   ',
      name: 'room',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'displayName')).toBe(true);
    }
  });

  it('requires a name', () => {
    const result = createResourceSchema.safeParse({
      ...CREATE_RESOURCE_DEFAULT_VALUES,
      displayName: 'Room',
      name: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    }
  });

  it('rejects passwords shorter than 6 characters', () => {
    const result = createResourceSchema.safeParse({
      ...CREATE_RESOURCE_DEFAULT_VALUES,
      displayName: 'Room',
      name: 'room',
      password: '12345',
      repeatPassword: '12345',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'password')).toBe(true);
    }
  });

  it('rejects mismatched passwords', () => {
    const result = createResourceSchema.safeParse({
      ...CREATE_RESOURCE_DEFAULT_VALUES,
      displayName: 'Room',
      name: 'room',
      password: 'secret1',
      repeatPassword: 'secret2',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'repeatPassword')).toBe(true);
    }
  });
});
