/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TableUiProvider, useTableUi } from '../table-ui-store';
import type { DataTableRowAction } from '../types';
import { DataTableRowActions } from './row-actions';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: Record<string, string>) => {
      if (defaultValue === undefined) {
        return key;
      }
      if (options === undefined) {
        return defaultValue;
      }
      return defaultValue.replace(
        /\{\{(\w+)\}\}/g,
        (_match: string, name: string) => options[name] ?? '',
      );
    },
  }),
}));

const testActions: Array<DataTableRowAction> = [
  { id: 'open', label: 'Open details' },
  { id: 'delete', label: 'Delete', danger: true },
];

type RowActionsHarnessProps = {
  onSelect: (action: DataTableRowAction) => void;
};

const RowActionsHarness = ({ onSelect }: RowActionsHarnessProps) => {
  const [open, setOpen] = useState(false);
  return (
    <DataTableRowActions
      rowLabel="Row 1"
      actions={testActions}
      open={open}
      onToggle={() => {
        setOpen((value) => !value);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onSelect={(action) => {
        onSelect(action);
        setOpen(false);
      }}
    />
  );
};

function setupRowActions() {
  const onSelect = vi.fn();
  render(
    <TableUiProvider>
      <RowActionsHarness onSelect={onSelect} />
    </TableUiProvider>,
  );
  return { onSelect };
}

function getKebab(): HTMLElement {
  return screen.getByRole('button', { name: 'Actions for Row 1' });
}

/** Publishes a modal flag into the UI store, like an open confirm dialog. */
function ModalFlag({ value }: { value: boolean }) {
  const setModalOpen = useTableUi((s) => s.setModalOpen);
  useEffect(() => {
    setModalOpen(value);
  }, [setModalOpen, value]);
  return null;
}

/** Mirrors the store's rowMenuOpen slice into a callback for assertions. */
function RowMenuOpenProbe({ onValue }: { onValue: (value: boolean) => void }) {
  const rowMenuOpen = useTableUi((s) => s.rowMenuOpen);
  useEffect(() => {
    onValue(rowMenuOpen);
  }, [onValue, rowMenuOpen]);
  return null;
}

describe('DataTableRowActions', () => {
  it('opens the menu when the kebab is clicked', async () => {
    setupRowActions();
    fireEvent.click(getKebab());
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Open details' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeTruthy();
  });

  it('closes the menu on Escape while focus is on the kebab', async () => {
    setupRowActions();
    const kebab = getKebab();
    fireEvent.click(kebab);
    await screen.findByRole('menu');
    fireEvent.keyDown(kebab, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('calls onSelect with the action and closes the menu', async () => {
    const { onSelect } = setupRowActions();
    fireEvent.click(getKebab());
    await screen.findByRole('menu');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'delete', label: 'Delete', danger: true }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('keeps the menu open on Escape while a modal is open', async () => {
    render(
      <TableUiProvider>
        <RowActionsHarness onSelect={vi.fn()} />
        <ModalFlag value />
      </TableUiProvider>,
    );
    fireEvent.click(getKebab());
    await screen.findByRole('menu');
    fireEvent.keyDown(getKebab(), { key: 'Escape' });
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('closes the menu on Escape once the modal is gone', async () => {
    const { rerender } = render(
      <TableUiProvider>
        <RowActionsHarness onSelect={vi.fn()} />
        <ModalFlag value />
      </TableUiProvider>,
    );
    fireEvent.click(getKebab());
    await screen.findByRole('menu');
    rerender(
      <TableUiProvider>
        <RowActionsHarness onSelect={vi.fn()} />
        <ModalFlag value={false} />
      </TableUiProvider>,
    );
    fireEvent.keyDown(getKebab(), { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('publishes rowMenuOpen to the UI store while the menu is open', async () => {
    const values: Array<boolean> = [];
    render(
      <TableUiProvider>
        <RowMenuOpenProbe
          onValue={(value) => {
            values.push(value);
          }}
        />
        <RowActionsHarness onSelect={vi.fn()} />
      </TableUiProvider>,
    );
    expect(values).toEqual([false]);
    fireEvent.click(getKebab());
    await screen.findByRole('menu');
    await waitFor(() => {
      expect(values[values.length - 1]).toBe(true);
    });
    fireEvent.keyDown(getKebab(), { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    await waitFor(() => {
      expect(values[values.length - 1]).toBe(false);
    });
  });
});
