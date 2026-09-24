/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18next from 'i18next';
import { noop } from 'lodash-es';
import { type ReactElement, type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DataTableRoot } from '../data-table-root';
import { DataTablePagination } from '../pagination';
import { DataTableTable } from '../table';
import { DataTableSearch } from '../toolbar/search';
import { DataTableToolbar } from '../toolbar/toolbar';
import type { DataTableColumnDef } from '../types';

// Same minimal i18n setup as the composable e2e suite: the parts default
// their labels through react-i18next and the interpolated fallbacks must
// not leak through verbatim. Independent from the sibling test file.
const testI18n = i18next.createInstance();
await testI18n.init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: {} } },
});

async function mountTable(ui: ReactElement): Promise<void> {
  await render(<I18nextProvider i18n={testI18n}>{ui}</I18nextProvider>);
}

type Item = {
  id: string;
  name: string;
  email: string;
};

const ROWS: Array<Item> = Array.from({ length: 25 }, (_, i) => ({
  id: `r${i}`,
  name: `Item ${i}`,
  email: `item${i}@demo.zextras.io`,
}));

const columns: Array<DataTableColumnDef<Item>> = [
  {
    accessorKey: 'name',
    header: 'Name',
    id: 'name',
    enableSorting: true,
    meta: { primary: true },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    id: 'email',
    enableSorting: true,
  },
];

// Paint counters: identifiers deliberately avoid the "render" substring
// (lint/compiler quirk recorded in the architecture doc). They count how
// many times each probe component body executed, i.e. part-component
// paints — Subscribe callbacks re-running below a part are NOT counted.
// The bumps go through module-level functions: assigning an outer-scope
// variable from inside a component trips react-hooks/globals (render
// purity), while calling a function that owns the assignment does not.
let toolbarPaints = 0;
let bodyPaints = 0;

function bumpToolbarPaints(): void {
  toolbarPaints += 1;
}

function bumpBodyPaints(): void {
  bodyPaints += 1;
}

/** Transparent probe: counts its own paints and delegates to the real part. */
const ToolbarProbe = ({ children }: { children: ReactNode }) => {
  bumpToolbarPaints();
  return <DataTableToolbar>{children}</DataTableToolbar>;
};

/** Transparent probe: counts its own paints and delegates to the real part. */
const BodyProbe = ({ 'aria-label': ariaLabel }: { 'aria-label': string }) => {
  bumpBodyPaints();
  return <DataTableTable aria-label={ariaLabel} />;
};

/** Inert toolbar contents for interactions that must not touch the search. */
const InertToolbar = () => (
  <ToolbarProbe>
    <DataTableSearch
      value=""
      onSearchChange={noop}
      placeholder="Search items"
      label="Search items"
    />
  </ToolbarProbe>
);

/**
 * Search state lives WITH the toolbar subtree (view state, not table
 * state): each keystroke re-paints the toolbar subtree only, and nothing
 * above it — so the body probe and the pagination part stay untouched.
 */
const SearchToolbarHolder = () => {
  const [search, setSearch] = useState('');
  return (
    <ToolbarProbe>
      <DataTableSearch
        value={search}
        onSearchChange={setSearch}
        placeholder="Search items"
        label="Search items"
      />
    </ToolbarProbe>
  );
};

/** Shared harness: probed toolbar slot, probed body, live pagination. */
function IsolationTable({ toolbar }: { toolbar: ReactNode }) {
  return (
    <DataTableRoot
      data={ROWS}
      columns={columns}
      getRowId={(row) => row.id}
      manualSorting={false}
      manualPagination={false}
      manualFiltering={false}
      enableRowSelection
      primaryColumnId="name"
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
    >
      {toolbar}
      <BodyProbe aria-label="Isolation table" />
      <DataTablePagination pageSizeOptions={[10, 25]} />
    </DataTableRoot>
  );
}

describe('DataTable (browser) paint isolation', () => {
  beforeEach(() => {
    toolbarPaints = 0;
    bodyPaints = 0;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('pagination change does not re-paint the toolbar or the table part', async () => {
    await mountTable(<IsolationTable toolbar={<InertToolbar />} />);

    await expect.element(page.getByRole('table', { name: 'Isolation table' })).toBeVisible();
    const toolbarBefore = toolbarPaints;
    const bodyBefore = bodyPaints;
    expect(bodyBefore).toBeGreaterThan(0);

    await userEvent.click(page.getByRole('button', { name: 'Next page' }));
    // Wait for the page change to commit before comparing counters.
    await expect
      .element(page.getByRole('button', { name: 'Page 2' }))
      .toHaveAttribute('aria-current', 'page');
    await expect.element(page.getByText('Item 10')).toBeVisible();

    // Only the body's and pagination's Subscribe callbacks re-ran; both
    // part components (and the pure-layout toolbar) kept their paint count.
    expect(toolbarPaints).toBe(toolbarBefore);
    expect(bodyPaints).toBe(bodyBefore);
  });

  it('typing in search re-paints the toolbar subtree only', async () => {
    await mountTable(<IsolationTable toolbar={<SearchToolbarHolder />} />);

    const searchbox = page.getByRole('searchbox', { name: 'Search items' });
    await expect.element(searchbox).toBeVisible();
    const toolbarBefore = toolbarPaints;
    const bodyBefore = bodyPaints;

    await userEvent.type(searchbox, 'u');
    await expect.element(searchbox).toHaveValue('u');

    // Search is view state: the toolbar subtree re-painted, the expensive
    // body part (and its Subscribe) did not.
    expect(toolbarPaints).toBeGreaterThan(toolbarBefore);
    expect(bodyPaints).toBe(bodyBefore);
  });

  it('row selection does not re-paint the toolbar or the table part', async () => {
    await mountTable(<IsolationTable toolbar={<InertToolbar />} />);

    const firstRowCheckbox = page.getByRole('checkbox', { name: 'Select row' }).first();
    await expect.element(firstRowCheckbox).toBeVisible();
    const toolbarBefore = toolbarPaints;
    const bodyBefore = bodyPaints;

    await userEvent.click(firstRowCheckbox);
    await expect.element(firstRowCheckbox).toBeChecked();
    await expect
      .element(page.getByRole('row', { name: /Item 0/ }))
      .toHaveAttribute('data-selected', 'true');

    // Selection lives in the table atoms: only the body's Subscribe
    // callback re-ran to flip the row chrome, no part component re-painted.
    expect(toolbarPaints).toBe(toolbarBefore);
    expect(bodyPaints).toBe(bodyBefore);
  });
});
