/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';

import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID } from './customize-model';
import {
  LAYOUT_PERSISTENCE_VERSION,
  layoutStorageKey,
  loadPersistedLayoutForTable,
  readPersistedLayout,
  resolveLayoutUpdater,
  sanitizePersistedLayout,
  writePersistedLayout,
  type PersistedDataTableLayout,
} from './layout-persistence';

const COLUMN_IDS = ['account', 'displayName', 'status'];

afterEach(() => {
  globalThis.localStorage.clear();
});

describe('layoutStorageKey', () => {
  it('namespaces the consumer key', () => {
    expect(layoutStorageKey('admin.domains.manage-accounts')).toBe(
      'carbonio.data-table.layout:admin.domains.manage-accounts',
    );
  });
});

describe('readPersistedLayout / writePersistedLayout', () => {
  it('round-trips a valid layout blob', () => {
    const layout: PersistedDataTableLayout = {
      v: LAYOUT_PERSISTENCE_VERSION,
      columnVisibility: { displayName: false },
      columnOrder: ['account', 'status', 'displayName'],
      density: 'compact',
    };
    writePersistedLayout('test-table', layout);
    expect(readPersistedLayout('test-table')).toEqual(layout);
  });

  it('returns null for missing, invalid JSON, or wrong version', () => {
    expect(readPersistedLayout('missing')).toBeNull();

    globalThis.localStorage.setItem(layoutStorageKey('bad-json'), '{');
    expect(readPersistedLayout('bad-json')).toBeNull();

    globalThis.localStorage.setItem(
      layoutStorageKey('bad-version'),
      JSON.stringify({
        v: 99,
        columnVisibility: {},
        columnOrder: [],
        density: 'comfortable',
      }),
    );
    expect(readPersistedLayout('bad-version')).toBeNull();

    globalThis.localStorage.setItem(
      layoutStorageKey('bad-density'),
      JSON.stringify({
        v: 1,
        columnVisibility: {},
        columnOrder: [],
        density: 'cozy',
      }),
    );
    expect(readPersistedLayout('bad-density')).toBeNull();
  });
});

describe('sanitizePersistedLayout', () => {
  it('returns defaults when nothing was persisted', () => {
    const result = sanitizePersistedLayout(null, COLUMN_IDS, 'account', true, true);
    expect(result.density).toBe('comfortable');
    expect(result.columnVisibility).toEqual({});
    expect(result.columnOrder).toEqual([
      SELECT_COLUMN_ID,
      'account',
      'displayName',
      'status',
      ACTIONS_COLUMN_ID,
    ]);
  });

  it('drops unknown columns and appends new ones after known order', () => {
    const persisted: PersistedDataTableLayout = {
      v: LAYOUT_PERSISTENCE_VERSION,
      columnVisibility: { displayName: false, gone: false, status: true },
      columnOrder: ['account', 'gone', 'status', 'displayName'],
      density: 'compact',
    };
    const result = sanitizePersistedLayout(
      persisted,
      ['account', 'displayName', 'status', 'email'],
      'account',
      false,
      false,
    );
    expect(result.columnOrder).toEqual(['account', 'status', 'displayName', 'email']);
    expect(result.columnVisibility).toEqual({ displayName: false, status: true });
    expect(result.density).toBe('compact');
  });

  it('restores select and actions column placement', () => {
    const persisted: PersistedDataTableLayout = {
      v: LAYOUT_PERSISTENCE_VERSION,
      columnVisibility: {},
      columnOrder: ['status', 'account', 'displayName'],
      density: 'comfortable',
    };
    const result = sanitizePersistedLayout(persisted, COLUMN_IDS, 'account', true, true);
    expect(result.columnOrder[0]).toBe(SELECT_COLUMN_ID);
    expect(result.columnOrder[1]).toBe('account');
    expect(result.columnOrder.at(-1)).toBe(ACTIONS_COLUMN_ID);
  });
});

describe('loadPersistedLayoutForTable', () => {
  it('loads and sanitizes from localStorage', () => {
    writePersistedLayout('accounts', {
      v: LAYOUT_PERSISTENCE_VERSION,
      columnVisibility: { status: false },
      columnOrder: ['account', 'status', 'displayName'],
      density: 'compact',
    });
    const layout = loadPersistedLayoutForTable('accounts', COLUMN_IDS, 'account', false, false);
    expect(layout.density).toBe('compact');
    expect(layout.columnVisibility).toEqual({ status: false });
    expect(layout.columnOrder).toEqual(['account', 'status', 'displayName']);
  });
});

describe('resolveLayoutUpdater', () => {
  it('applies value and functional updaters', () => {
    expect(resolveLayoutUpdater({ a: true }, { a: false })).toEqual({ a: true });
    expect(resolveLayoutUpdater((old: { a: boolean }) => ({ a: !old.a }), { a: false })).toEqual({
      a: true,
    });
  });
});
