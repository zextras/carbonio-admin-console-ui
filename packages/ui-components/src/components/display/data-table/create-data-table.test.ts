/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expectTypeOf, it } from 'vitest';

import { createDataTableColumnHelper } from './create-data-table';
import type { DataTableColumnDef } from './types';

type Domain = { id: string; name: string; count: number };

describe('createDataTableColumnHelper', () => {
  it('produces defs assignable to part column slots regardless of TValue', () => {
    const helper = createDataTableColumnHelper<Domain>();
    // The annotation is the assertion: helper defs carry concrete TValue
    // types (string / number) while the slot erases TValue — this only
    // compiles because `DataTableColumnDef` uses the any-valued
    // interchange format (see its doc comment in types.ts).
    const columns: Array<DataTableColumnDef<Domain>> = [
      helper.accessor('name', { header: 'Name' }),
      helper.accessor('count', { header: 'Count' }),
      helper.display({ id: 'actions', header: 'Actions' }),
    ];
    expectTypeOf(columns).toEqualTypeOf<Array<DataTableColumnDef<Domain>>>();
  });
});
