/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  useUtilityBarStore: vi.fn(),
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../utils', () => ({
  useUtilityViews: vi.fn(),
}));

import { useUtilityBarStore } from '@zextras/ui-shared';

import { ShellUtilityPanel } from '../panel';
import { useUtilityViews } from '../utils';

describe('ShellUtilityPanel', () => {
  beforeEach(() => {
    (useUtilityBarStore as unknown as Mock).mockReturnValue({
      mode: 'open',
      setMode: vi.fn(),
      current: undefined,
      setCurrent: vi.fn(),
    });
    (useUtilityViews as unknown as Mock).mockReturnValue([]);
  });

  it('returns null when no currentPanel is found', () => {
    const { container } = render(<ShellUtilityPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders panel when currentPanel exists', () => {
    const PanelComponent = (): React.ReactElement => (
      <div data-testid="panel-content" />
    );
    (useUtilityBarStore as unknown as Mock).mockReturnValue({
      mode: 'open',
      setMode: vi.fn(),
      current: 'panel-1',
      setCurrent: vi.fn(),
    });
    (useUtilityViews as unknown as Mock).mockReturnValue([
      { id: 'panel-1', component: PanelComponent },
    ]);
    render(<ShellUtilityPanel />);
    expect(screen.getByTestId('panel-content')).toBeTruthy();
  });
});
