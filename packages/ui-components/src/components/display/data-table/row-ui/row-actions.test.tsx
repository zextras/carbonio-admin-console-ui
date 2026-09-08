/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
  render(<RowActionsHarness onSelect={onSelect} />);
  return { onSelect };
}

function getKebab(): HTMLElement {
  return screen.getByRole('button', { name: 'Actions for Row 1' });
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
});
