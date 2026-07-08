/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from '../../store/app/store';
import { buildPath } from '../hooks';

const STORAGE_ID = 'storage';
const SUBSCRIPTIONS_ID = 'subscriptions';

function registerRoute(id: string, route: string): void {
  useAppStore.setState((state) => ({
    routes: { ...state.routes, [id]: { id, route, app: id } },
  }));
}

describe('buildPath', () => {
  beforeEach(() => {
    useAppStore.setState({ routes: {} });
  });

  it('builds a prefixed path from a registered route id and segments', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    expect(buildPath(STORAGE_ID, 'servers_list')).toBe('/manage/storage/servers_list');
  });

  it('appends multiple nested segments', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    expect(buildPath(STORAGE_ID, 'mail1', 'data_volumes')).toBe(
      '/manage/storage/mail1/data_volumes',
    );
  });

  it('returns just the prefixed route when no segments are given', () => {
    registerRoute(SUBSCRIPTIONS_ID, 'manage/subscriptions');

    expect(buildPath(SUBSCRIPTIONS_ID)).toBe('/manage/subscriptions');
  });

  it('filters out undefined segments', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    expect(buildPath(STORAGE_ID, undefined, 'servers_list')).toBe('/manage/storage/servers_list');
  });

  it('falls back to the id itself for an unknown route id', () => {
    expect(buildPath('unknown-app', 'something')).toBe('/unknown-app/something');
  });

  it('collapses accidental double slashes', () => {
    registerRoute(STORAGE_ID, 'manage/storage');

    expect(buildPath(STORAGE_ID, '/servers_list')).toBe('/manage/storage/servers_list');
  });
});
