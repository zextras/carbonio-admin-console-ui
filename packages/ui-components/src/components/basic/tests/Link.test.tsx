/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Link } from '../Link';

describe('Link', () => {
  it('renders an anchor with the given href and children', () => {
    render(<Link href="https://example.com">Example</Link>);

    const link = screen.getByRole('link', { name: 'Example' });
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.dataset.underlined).toBeUndefined();
  });

  it('marks the link as underlined and keeps custom styles', () => {
    render(
      <Link href="#" underlined style={{ marginTop: '4px' }}>
        Underlined
      </Link>,
    );

    const link = screen.getByRole('link', { name: 'Underlined' });
    expect(link.dataset.underlined).toBe('true');
    expect(link.style.marginTop).toBe('4px');
    expect(link.style.getPropertyValue('--link-hover-color')).not.toBe('');
  });
});
