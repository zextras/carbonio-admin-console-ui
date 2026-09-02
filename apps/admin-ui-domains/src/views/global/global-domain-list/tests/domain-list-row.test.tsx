/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildDomainRow } from '../domain-list-row';

const t = (_key: string, defaultValue: string): string => defaultValue;
const onSelect = vi.fn();

afterEach(() => {
  cleanup();
  onSelect.mockClear();
});

describe('buildDomainRow', () => {
  it('builds a row keyed by the domain id with parsed attributes', () => {
    const row = buildDomainRow(
      {
        name: 'example.com',
        id: 'domain-1',
        a: [
          { n: 'zimbraDomainStatus', _content: 'active' },
          { n: 'zimbraDomainType', _content: 'local' },
        ],
      },
      t,
      onSelect,
    );

    expect(row.id).toBe('domain-1');
    expect(row.clickable).toBe(true);
    expect(row.item).toMatchObject({
      name: 'example.com',
      id: 'domain-1',
      zimbraDomainStatus: 'active',
      zimbraDomainType: 'local',
    });
  });

  it('renders the domain name and translated status label in its columns', () => {
    const row = buildDomainRow(
      { name: 'example.com', id: 'domain-1', a: [{ n: 'zimbraDomainStatus', _content: 'locked' }] },
      t,
      onSelect,
    );

    render(<>{row.columns}</>);

    expect(screen.getByText('example.com')).toBeTruthy();
    expect(screen.getByText('Locked')).toBeTruthy();
  });

  it('invokes onSelect with the parsed domain item on click', () => {
    const row = buildDomainRow({ name: 'example.com', id: 'domain-1', a: [] }, t, onSelect);

    row.onClick();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(row.item);
  });

  it('falls back to the raw status string for an unknown status', () => {
    const row = buildDomainRow(
      {
        name: 'weird.com',
        id: 'domain-x',
        a: [{ n: 'zimbraDomainStatus', _content: 'totally-unknown-status' }],
      },
      t,
      onSelect,
    );

    render(<>{row.columns}</>);

    expect(screen.getByText('totally-unknown-status')).toBeTruthy();
  });
});
