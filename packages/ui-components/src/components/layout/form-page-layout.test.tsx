/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => [
    (key: string, fallback?: string): string => fallback ?? key,
  ],
}));

vi.mock('../basic/button/Button', () => ({
  Button: ({
    label,
    onClick,
  }: {
    label?: string;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));

vi.mock('../navigation/route-leaving-guard', () => ({
  RouteLeavingGuard: (): null => null,
}));

import { FormPageLayout } from './form-page-layout';

type RenderProps = {
  title?: string;
  onSave?: () => void;
  onCancel?: () => void;
  unsavedChanges?: boolean;
  children?: ReactNode;
};

function renderFormPageLayout({
  title = 'Test Title',
  onSave,
  onCancel,
  unsavedChanges,
  children,
}: RenderProps = {}) {
  return render(
    <FormPageLayout
      title={title}
      onSave={onSave}
      onCancel={onCancel}
      unsavedChanges={unsavedChanges}
    >
      {children ?? <div>content</div>}
    </FormPageLayout>,
  );
}

describe('FormPageLayout', () => {
  it('renders the title text', () => {
    renderFormPageLayout({ title: 'My Page Title' });
    expect(screen.getByText('My Page Title')).not.toBeNull();
  });

  it('does not render Save/Cancel buttons when unsavedChanges is falsy', () => {
    renderFormPageLayout({ onSave: vi.fn(), onCancel: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  it('renders Save button when unsavedChanges is true and onSave is provided', () => {
    renderFormPageLayout({ unsavedChanges: true, onSave: vi.fn() });
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeNull();
  });

  it('renders Cancel button when unsavedChanges is true and onCancel is provided', () => {
    renderFormPageLayout({ unsavedChanges: true, onCancel: vi.fn() });
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeNull();
  });

  it('calls onSave when Save button is clicked', () => {
    const onSave = vi.fn();
    renderFormPageLayout({
      unsavedChanges: true,
      onSave,
      onCancel: vi.fn(),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderFormPageLayout({
      unsavedChanges: true,
      onSave: vi.fn(),
      onCancel,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render Save button when onSave is not provided even with unsavedChanges', () => {
    renderFormPageLayout({ unsavedChanges: true, onCancel: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('does not render Cancel button when onCancel is not provided even with unsavedChanges', () => {
    renderFormPageLayout({ unsavedChanges: true, onSave: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });
});
