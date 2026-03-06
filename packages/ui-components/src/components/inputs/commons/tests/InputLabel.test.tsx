/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InputLabel } from '../InputLabel';

describe('InputLabel', () => {
  it('should return a valid CSS variable for secondary color', () => {
    const { container } = render(
      <InputLabel $hasError={false} $hasFocus={false} $disabled={false} />,
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    const style = label!.style;
    const labelColor = style.getPropertyValue('--label-color');
    expect(labelColor).toBe('var(--color-secondary-regular, var(--color-secondary-regular))');
  });

  it('should return a valid CSS variable for primary color when focused', () => {
    const { container } = render(
      <InputLabel $hasError={false} $hasFocus={true} $disabled={false} />,
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    const style = label!.style;
    const labelColor = style.getPropertyValue('--label-color');
    expect(labelColor).toBe('var(--color-primary-regular, var(--color-primary-regular))');
  });

  it('should return a valid CSS variable for error color', () => {
    const { container } = render(
      <InputLabel $hasError={true} $hasFocus={false} $disabled={false} />,
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    const style = label!.style;
    const labelColor = style.getPropertyValue('--label-color');
    expect(labelColor).toBe('var(--color-error-regular, var(--color-error-regular))');
  });

  it('should return a valid CSS variable for disabled state', () => {
    const { container } = render(
      <InputLabel $hasError={false} $hasFocus={false} $disabled={true} />,
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    const style = label!.style;
    const labelColor = style.getPropertyValue('--label-color');
    expect(labelColor).toBe('var(--color-secondary-disabled, var(--color-secondary-regular))');
  });
});
