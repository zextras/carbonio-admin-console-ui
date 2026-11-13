/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { type CarbonioModule } from '../../../../types';
import { useAppList } from '../hooks';
import { useAppStore } from '../store';

const initialApps = useAppStore.getState().apps;

describe('useAppList', () => {
  afterEach(() => {
    useAppStore.setState({ apps: initialApps });
  });

  it('returns the registered apps sorted by priority', () => {
    useAppStore.setState({
      apps: {
        domains: { name: 'domains', priority: 3 } as CarbonioModule,
        shell: { name: 'shell', priority: -1 } as CarbonioModule,
        backup: { name: 'backup', priority: 1 } as CarbonioModule,
      },
    });

    const { result } = renderHook(() => useAppList());

    expect(result.current.map((app) => app.name)).toEqual(['shell', 'backup', 'domains']);
  });
});
