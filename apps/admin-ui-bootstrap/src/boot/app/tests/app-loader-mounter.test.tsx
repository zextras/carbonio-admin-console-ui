/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, type Mock, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from '@zextras/ui-shared';

import { AppLoaderMounter } from '../app-loader-mounter';

describe('AppLoaderMounter', () => {
  it('renders hidden div when entryPoints is empty', () => {
    (useAppStore as unknown as Mock).mockReturnValue({});
    render(<AppLoaderMounter />);
    const mounter = screen.getByTestId('app-mounter');
    expect(mounter).toBeTruthy();
    expect(mounter.getAttribute('hidden')).not.toBeNull();
  });

  it('renders entry point components when entryPoints has values', () => {
    const Component = (): React.ReactElement => (
      <div data-testid="entry-component" />
    );
    (useAppStore as unknown as Mock).mockReturnValue({ 'app-1': Component });
    render(<AppLoaderMounter />);
    expect(screen.getByTestId('entry-component')).toBeTruthy();
    expect(screen.getByTestId('app-mounter')).toBeTruthy();
  });
});
