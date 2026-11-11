/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { isEditableTarget } from './event-target';

describe('isEditableTarget', () => {
  it('accepts input elements', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
  });

  it('accepts textarea elements', () => {
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
  });

  it('accepts contenteditable elements', () => {
    // jsdom does not implement isContentEditable, so stub the property
    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true });
    expect(isEditableTarget(div)).toBe(true);
  });

  it('rejects plain non-editable elements', () => {
    const td = document.createElement('td');
    Object.defineProperty(td, 'isContentEditable', { value: false });
    expect(isEditableTarget(td)).toBe(false);
  });

  it('rejects null and non-element targets', () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget(document.createTextNode('x'))).toBe(false);
  });
});
