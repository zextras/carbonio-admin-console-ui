/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import NewBucket from '../new-bucket';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@zextras/ui-components', () => ({
  Container: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    label,
    icon,
    onClick,
  }: {
    label?: string;
    icon?: string;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} aria-label={label ?? icon ?? 'button'}>
      {label ?? icon ?? 'button'}
    </button>
  ),
}));

vi.mock('../connection', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <button type="button" onClick={onCancel}>
      Cancel from connection
    </button>
  ),
}));

describe('NewBucket', () => {
  it('should close the wizard when close button is clicked', () => {
    const setToggleWizardSection = vi.fn();
    const setDetailsBucket = vi.fn();
    const setConnectionData = vi.fn();

    render(
      <NewBucket
        setToggleWizardSection={setToggleWizardSection}
        setDetailsBucket={setDetailsBucket}
        setConnectionData={setConnectionData}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'CloseOutline' }));

    expect(setToggleWizardSection).toHaveBeenCalledWith(false);
    expect(setDetailsBucket).toHaveBeenCalledWith(false);
    expect(setConnectionData).toHaveBeenCalledWith(undefined);
  });

  it('should close wizard and details when connection cancel is triggered', () => {
    const setToggleWizardSection = vi.fn();
    const setDetailsBucket = vi.fn();
    const setConnectionData = vi.fn();

    render(
      <NewBucket
        setToggleWizardSection={setToggleWizardSection}
        setDetailsBucket={setDetailsBucket}
        setConnectionData={setConnectionData}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel from connection' }));

    expect(setToggleWizardSection).toHaveBeenCalledWith(false);
    expect(setDetailsBucket).toHaveBeenCalledWith(false);
    expect(setConnectionData).not.toHaveBeenCalled();
  });
});
