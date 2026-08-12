/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { type Operation } from '../../../types/operations';
import { buildOperationRows } from '../operations-table';

const MOCK_OPERATIONS: Array<Operation> = [
  {
    id: 'op-1',
    name: 'doBackup',
    host: 'mailstore1.test.com',
    serverName: 'mailstore1.test.com',
    state: 'Started',
    type: 'Started',
    startTime: 1742774400000,
    queuedTime: 1742774300000,
    humanStartTime: '2025-03-24 00:00:00',
    parameters: {
      requesterAddress: 'admin@test.com',
    },
  },
  {
    id: 'op-2',
    name: 'doExport',
    host: 'mailstore2.test.com',
    serverName: 'mailstore2.test.com',
    state: 'Finished',
    type: 'Finished',
    startTime: 1742688000000,
    queuedTime: 1742687900000,
    humanStartTime: '2025-03-23 00:00:00',
    parameters: {
      requesterAddress: 'user@test.com',
    },
  },
];

describe('buildOperationRows', () => {
  it('returns an empty array when operations is undefined', () => {
    expect(buildOperationRows(undefined, vi.fn(), false)).toEqual([]);
  });

  it('returns an empty array when operations is empty (undone)', () => {
    expect(buildOperationRows([], vi.fn(), false)).toEqual([]);
  });

  it('returns an empty array when operations is empty (done)', () => {
    expect(buildOperationRows([], vi.fn(), true)).toEqual([]);
  });

  it('builds correct row count and sequential ids for undone panel', () => {
    const rows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), false);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('0');
    expect(rows[1].id).toBe('1');
  });

  it('builds correct row count and sequential ids for done panel', () => {
    const rows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), true);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('0');
    expect(rows[1].id).toBe('1');
  });

  it('builds 5 columns for undone panel rows', () => {
    const rows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), false);
    expect(rows[0].columns).toHaveLength(5);
    expect(rows[1].columns).toHaveLength(5);
  });

  it('builds 6 columns for done panel rows', () => {
    const rows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), true);
    expect(rows[0].columns).toHaveLength(6);
    expect(rows[1].columns).toHaveLength(6);
  });

  it('marks all rows as clickable', () => {
    const undoneRows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), false);
    expect(undoneRows.every((r) => r.clickable)).toBe(true);

    const doneRows = buildOperationRows(MOCK_OPERATIONS, vi.fn(), true);
    expect(doneRows.every((r) => r.clickable)).toBe(true);
  });

  it('fires onClick with the correct index for undone rows', () => {
    const onClick = vi.fn();
    const rows = buildOperationRows(MOCK_OPERATIONS, onClick, false);
    const firstColumn = rows[0].columns[0] as React.ReactElement<{
      onClick: () => void;
    }>;
    firstColumn.props.onClick();
    expect(onClick).toHaveBeenCalledWith(0);

    const secondRowColumn = rows[1].columns[0] as React.ReactElement<{
      onClick: () => void;
    }>;
    secondRowColumn.props.onClick();
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('fires onClick with the correct index for done rows', () => {
    const onClick = vi.fn();
    const rows = buildOperationRows(MOCK_OPERATIONS, onClick, true);
    const firstColumn = rows[0].columns[0] as React.ReactElement<{
      onClick: () => void;
    }>;
    firstColumn.props.onClick();
    expect(onClick).toHaveBeenCalledWith(0);
  });
});
