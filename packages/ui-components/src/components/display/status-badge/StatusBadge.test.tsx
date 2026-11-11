/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getStatusBadgeTone } from './get-status-badge-tone';
import { StatusBadge } from './StatusBadge';

describe('getStatusBadgeTone', () => {
  it('maps known sandbox labels to tones', () => {
    expect(getStatusBadgeTone('Active')).toBe('success');
    expect(getStatusBadgeTone('Pending')).toBe('warning');
    expect(getStatusBadgeTone('Locked')).toBe('danger');
    expect(getStatusBadgeTone('Closed')).toBe('neutral');
    expect(getStatusBadgeTone('Maintenance')).toBe('info');
  });

  it('falls back to neutral for unknown labels', () => {
    expect(getStatusBadgeTone('Something else')).toBe('neutral');
  });
});

describe('StatusBadge', () => {
  it('renders an explicit tone and label', () => {
    const { container } = render(<StatusBadge tone="success" label="Active" />);
    expect(screen.getByText('Active')).toBeTruthy();
    expect(container.firstElementChild?.className).toMatch(/success/);
  });

  it('resolves tone from label when tone is omitted', () => {
    const { container } = render(<StatusBadge label="Pending" />);
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(container.firstElementChild?.className).toMatch(/warning/);
  });

  it('renders children and defaults to neutral without label or tone', () => {
    const { container } = render(<StatusBadge>Custom</StatusBadge>);
    expect(screen.getByText('Custom')).toBeTruthy();
    expect(container.firstElementChild?.className).toMatch(/neutral/);
  });

  it('prefers explicit tone over label map', () => {
    const { container } = render(<StatusBadge tone="info" label="Active" />);
    expect(container.firstElementChild?.className).toMatch(/info/);
    expect(container.firstElementChild?.className).not.toMatch(/success/);
  });
});
