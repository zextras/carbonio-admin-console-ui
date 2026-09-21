/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { DataTableFilterDef, DataTableFiltersState } from '../models/types';
import { TableUiProvider } from '../table-ui-store';
import { DataTableFilters } from './filters';

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

const filterDefs: Array<DataTableFilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Disabled', value: 'disabled' },
    ],
  },
  { id: 'size', label: 'Size', type: 'range' },
];

type FiltersHarnessProps = {
  filters: DataTableFiltersState;
  onFiltersChange?: (next: DataTableFiltersState) => void;
  onApplyResetSelection?: () => void;
};

const FiltersHarness = ({
  filters,
  onFiltersChange,
  onApplyResetSelection,
}: FiltersHarnessProps) => (
  <TableUiProvider>
    <DataTableFilters
      filterDefs={filterDefs}
      filters={filters}
      onFiltersChange={onFiltersChange ?? vi.fn()}
      onApplyResetSelection={onApplyResetSelection ?? vi.fn()}
    />
  </TableUiProvider>
);

function getTrigger(): HTMLElement {
  return screen.getByRole('button', { name: /Filters/ });
}

// Render-isolation probe: module-level component + module-scope counter. It
// deliberately does NOT consume the table UI store — opening a panel must
// re-render only the trigger part and the panel it mounts. The increment
// lives in an effect (render-phase side effects are forbidden by the React
// Compiler rules) and fires once per render.
let panelProbeCount = 0;

const PanelRenderProbe = () => {
  useEffect(() => {
    panelProbeCount += 1;
  });
  return <span>panel probe</span>;
};

describe('DataTableFilters', () => {
  it('renders the active filter count badge and exposes it in the accessible name', () => {
    render(<FiltersHarness filters={{ status: ['active'] }} />);
    expect(screen.getByText('1')).toBeTruthy();
    const trigger = screen.getByRole('button', { name: 'Filters, 1 active' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('keeps the plain accessible name when no filter is active', () => {
    render(<FiltersHarness filters={{}} />);
    const trigger = getTrigger();
    expect(trigger.getAttribute('aria-label')).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens and closes the panel via the trigger', () => {
    render(<FiltersHarness filters={{}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(getTrigger());
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy();
    expect(getTrigger().getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(getTrigger());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(getTrigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('links the trigger to the panel with instance-scoped ids', () => {
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    const controlsId = getTrigger().getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(screen.getByRole('dialog').getAttribute('id')).toBe(controlsId);
  });

  it('does not emit filter changes while drafting (draft isolation)', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: '10' } });
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('sanitizes the draft, emits it, resets selection and closes on Apply', () => {
    const onFiltersChange = vi.fn();
    const onApplyResetSelection = vi.fn();
    render(
      <FiltersHarness
        filters={{}}
        onFiltersChange={onFiltersChange}
        onApplyResetSelection={onApplyResetSelection}
      />,
    );
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      status: ['active'],
      size: { min: 10, max: null },
    });
    expect(onApplyResetSelection).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('drops empty draft values on Apply', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.change(screen.getByLabelText('Size from'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('clears the draft without emitting until Apply', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{ status: ['active'] }} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onFiltersChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('discards the draft on close and re-clones the filters on reopen', () => {
    render(<FiltersHarness filters={{ status: ['active'] }} />);
    fireEvent.click(getTrigger());
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    // dirty the draft without applying
    fireEvent.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close filters' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    // reopening must re-clone from the (unchanged) applied filters, not keep the draft
    fireEvent.click(getTrigger());
    expect(screen.getByRole('checkbox', { name: 'Active' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('closes on outside click without emitting', () => {
    const onFiltersChange = vi.fn();
    render(<FiltersHarness filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(getTrigger());
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('does not close when clicking inside the panel', () => {
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    const panel = screen.getByRole('dialog');
    fireEvent.mouseDown(panel);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('removes the outside-click listener when the panel closes', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    render(<FiltersHarness filters={{}} />);
    fireEvent.click(getTrigger());
    fireEvent.click(getTrigger());
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('opening the panel re-renders only the filters part, not its siblings', () => {
    render(
      <TableUiProvider>
        <PanelRenderProbe />
        <DataTableFilters
          filterDefs={filterDefs}
          filters={{}}
          onFiltersChange={vi.fn()}
          onApplyResetSelection={vi.fn()}
        />
      </TableUiProvider>,
    );
    const probeCountBefore = panelProbeCount;
    fireEvent.click(getTrigger());
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy();
    expect(panelProbeCount).toBe(probeCountBefore);
  });

  it('keeps two independent instances open at once with distinct panel ids', () => {
    const defsA: Array<DataTableFilterDef> = [
      { id: 'status', label: 'Status A', type: 'enum', options: [{ label: 'On', value: 'on' }] },
    ];
    const defsB: Array<DataTableFilterDef> = [
      { id: 'status', label: 'Status B', type: 'enum', options: [{ label: 'Off', value: 'off' }] },
    ];
    render(
      <>
        <TableUiProvider>
          <DataTableFilters
            filterDefs={defsA}
            filters={{}}
            onFiltersChange={vi.fn()}
            onApplyResetSelection={vi.fn()}
          />
        </TableUiProvider>
        <TableUiProvider>
          <DataTableFilters
            filterDefs={defsB}
            filters={{}}
            onFiltersChange={vi.fn()}
            onApplyResetSelection={vi.fn()}
          />
        </TableUiProvider>
      </>,
    );
    const [triggerA, triggerB] = screen.getAllByRole('button', { name: 'Filters' });
    fireEvent.click(triggerA);
    fireEvent.click(triggerB);
    const [panelA, panelB] = screen.getAllByRole('dialog');
    // Regression for #11: fixed DOM ids made the second instance's panel
    // unreachable; ids must be instance-scoped and must not collide.
    const idA = triggerA.getAttribute('aria-controls');
    const idB = triggerB.getAttribute('aria-controls');
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
    expect(panelA.getAttribute('id')).toBe(idA);
    expect(panelB.getAttribute('id')).toBe(idB);
    // Each UI store is instance-scoped: opening B must not close A.
    expect(panelA).toBeTruthy();
    expect(panelB).toBeTruthy();
    expect(screen.getByText('Status A')).toBeTruthy();
    expect(screen.getByText('Status B')).toBeTruthy();
  });
});
