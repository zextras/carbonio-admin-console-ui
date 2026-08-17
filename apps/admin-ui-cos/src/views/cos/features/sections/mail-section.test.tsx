/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CosFeaturesFormApi, CosFeaturesFormValues } from '../../types';
import { MailSection } from './mail-section';

const defaultValues: Pick<
  CosFeaturesFormValues,
  | 'zimbraFeatureSignaturesEnabled'
  | 'zimbraFeatureOutOfOfficeReplyEnabled'
  | 'zimbraFeatureImportFolderEnabled'
  | 'zimbraFeatureExportFolderEnabled'
> = {
  zimbraFeatureSignaturesEnabled: 'TRUE',
  zimbraFeatureOutOfOfficeReplyEnabled: 'FALSE',
  zimbraFeatureImportFolderEnabled: 'FALSE',
  zimbraFeatureExportFolderEnabled: 'TRUE',
};

function renderMailSection(readonlyCOS = false): ReturnType<typeof render> {
  function Harness(): React.JSX.Element {
    const form = useForm({ defaultValues });
    return <MailSection form={form as unknown as CosFeaturesFormApi} readonlyCOS={readonlyCOS} />;
  }
  return render(<Harness />);
}

describe('MailSection', () => {
  it('renders the Mail title and all feature switches', () => {
    renderMailSection();
    expect(screen.getByText('Mail', { exact: true })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Mail Signatures' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Out of Office Reply' })).toBeTruthy();
    expect(
      screen.getByRole('switch', { name: 'Allow user to import external mailbox' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('switch', { name: 'Allow user to export their mailbox' }),
    ).toBeTruthy();
  });

  it('reflects the initial form values on each switch', () => {
    renderMailSection();
    expect(screen.getByRole('switch', { name: 'Mail Signatures' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Out of Office Reply' })).not.toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Allow user to import external mailbox' }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Allow user to export their mailbox' }),
    ).toBeChecked();
  });

  it('toggles a switch independently from the others', () => {
    renderMailSection();

    const signatures = screen.getByRole('switch', { name: 'Mail Signatures' });
    const outOfOffice = screen.getByRole('switch', { name: 'Out of Office Reply' });

    expect(signatures).toBeChecked();
    fireEvent.click(signatures);
    expect(signatures).not.toBeChecked();

    // Unrelated switch must not be affected.
    expect(outOfOffice).not.toBeChecked();
  });

  it('disables all switches when readonlyCOS is true', () => {
    renderMailSection(true);
    expect(screen.getByRole('switch', { name: 'Mail Signatures' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Out of Office Reply' })).toBeDisabled();
    expect(
      screen.getByRole('switch', { name: 'Allow user to import external mailbox' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('switch', { name: 'Allow user to export their mailbox' }),
    ).toBeDisabled();
  });
});
