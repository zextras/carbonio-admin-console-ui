/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from '../Avatar';

function getAvatarStyle(): CSSStyleDeclaration {
  return screen.getByTestId('avatar').style;
}

describe('Avatar', () => {
  it.each([
    ['john doe', 'JD'],
    ['John Michael Doe', 'JD'],
    ['johnny', 'JY'],
    ['jo', 'JO'],
    ['  single  ', 'SE'],
    ['john.doe@example.com', 'JM'],
  ])('renders the capitals of "%s" as "%s"', (label, expected) => {
    render(<Avatar label={label} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('renders no capitals when the label only contains special characters', () => {
    render(<Avatar label="@@ ##" />);
    expect(screen.getByTestId('avatar').textContent).toBe('');
  });

  it('derives the background color from colorLabel when provided', () => {
    const { unmount } = render(<Avatar label="John Doe" colorLabel="other" />);
    const fromColorLabel = getAvatarStyle().getPropertyValue('--avatar-bg');
    unmount();

    render(<Avatar label="John Doe" />);
    const fromLabel = getAvatarStyle().getPropertyValue('--avatar-bg');

    expect(fromColorLabel).toMatch(/^var\(--color-avatar-\d+\)$/);
    expect(fromLabel).toMatch(/^var\(--color-avatar-\d+\)$/);
    expect(fromColorLabel).not.toBe(fromLabel);
  });

  it('uses the forced background color instead of the calculated one', () => {
    render(<Avatar label="John Doe" background="primary" />);
    expect(getAvatarStyle().getPropertyValue('--avatar-bg')).not.toMatch(/--color-avatar-/);
  });

  it('shows the picture instead of the capitals', () => {
    render(<Avatar label="John Doe" picture="https://example.com/me.png" />);

    expect(screen.queryByText('JD')).toBeNull();
    expect(getAvatarStyle().getPropertyValue('--avatar-picture')).toBe(
      'url(https://example.com/me.png)',
    );
  });

  it('applies the square shape radius', () => {
    render(<Avatar label="John Doe" shape="square" size="large" />);

    expect(getAvatarStyle().getPropertyValue('--avatar-radius')).toBe('15%');
    expect(getAvatarStyle().getPropertyValue('--avatar-diameter')).toBe(
      'var(--avatar-large-diameter)',
    );
  });

  it('hides the capitals and the picture while selecting an unselected avatar', () => {
    render(<Avatar label="John Doe" picture="https://example.com/me.png" selecting />);

    expect(screen.queryByText('JD')).toBeNull();
    expect(getAvatarStyle().getPropertyValue('--avatar-picture')).toBe('none');
    expect(getAvatarStyle().getPropertyValue('--avatar-border')).not.toBe('none');
  });

  it('shows a checkmark when selecting a selected avatar', () => {
    render(<Avatar label="John Doe" selecting selected size="extralarge" />);

    expect(screen.getByTestId('avatar').innerHTML).toMatch(/<ds-icon[^>]*icon="Checkmark"/);
  });
});
