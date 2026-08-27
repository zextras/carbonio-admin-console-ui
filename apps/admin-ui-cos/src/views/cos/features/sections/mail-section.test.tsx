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
    expect(
      screen.getByRole('switch', { name: 'Mail Signatures' }).getAttribute('aria-checked'),
    ).toBe('true');
    expect(
      screen.getByRole('switch', { name: 'Out of Office Reply' }).getAttribute('aria-checked'),
    ).toBe('false');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to import external mailbox' })
        .getAttribute('aria-checked'),
    ).toBe('false');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to export their mailbox' })
        .getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('toggles a switch independently from the others', () => {
    renderMailSection();

    const signatures = screen.getByRole('switch', { name: 'Mail Signatures' });
    const outOfOffice = screen.getByRole('switch', { name: 'Out of Office Reply' });

    expect(signatures.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(signatures);
    expect(signatures.getAttribute('aria-checked')).toBe('false');

    // Unrelated switch must not be affected.
    expect(outOfOffice.getAttribute('aria-checked')).toBe('false');
  });

  it('disables all switches when readonlyCOS is true', () => {
    renderMailSection(true);
    expect(
      screen.getByRole('switch', { name: 'Mail Signatures' }).getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      screen.getByRole('switch', { name: 'Out of Office Reply' }).getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to import external mailbox' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to export their mailbox' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
  });
});
