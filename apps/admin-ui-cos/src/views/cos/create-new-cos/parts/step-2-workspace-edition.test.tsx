/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import { StepTwoWorkspaceEdition } from './step-2-workspace-edition';

const defaultValues: CreateCosFormValues = {
  cn: '',
  description: '',
  zimbraNotes: '',
  edition: 'workspace',
  carbonioFeatureMailsAppEnabled: 'TRUE',
  zimbraFeatureContactsEnabled: 'TRUE',
  zimbraFeatureCalendarEnabled: 'TRUE',
  carbonioFeatureFilesEnabled: 'TRUE',
  carbonioFeatureFilesAppEnabled: 'TRUE',
  carbonioFeatureTasksEnabled: 'TRUE',
  carbonioFeatureWscEnabled: 'TRUE',
  carbonioWscVideoCallEnabled: 'TRUE',
};

function renderStep(): ReturnType<typeof render> {
  const onBack = vi.fn();
  function Harness(): React.JSX.Element {
    const form = useForm({ defaultValues });
    return <StepTwoWorkspaceEdition form={form as unknown as CreateCosFormApi} onBack={onBack} />;
  }
  return render(<Harness />);
}

describe('StepTwoWorkspaceEdition', () => {
  it('renders the section headers for each feature group', () => {
    const { getByText } = renderStep();
    expect(getByText('Mail', { exact: true })).toBeTruthy();
    expect(getByText('Contacts', { exact: true })).toBeTruthy();
    expect(getByText('Calendar', { exact: true })).toBeTruthy();
    expect(getByText('Files', { exact: true })).toBeTruthy();
    expect(getByText('Tasks', { exact: true })).toBeTruthy();
    expect(getByText('Chats', { exact: true })).toBeTruthy();
    expect(getByText('Video calls', { exact: true })).toBeTruthy();
  });

  it('renders all the workspace feature switches', () => {
    const { getByRole } = renderStep();
    expect(getByRole('switch', { name: 'Enable mail' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Users can access Contacts' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Users can access Calendar' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Enable files' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Enable mobile app' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Enable tasks' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Enable chats' })).toBeTruthy();
    expect(getByRole('switch', { name: 'Enable video calls' })).toBeTruthy();
  });

  it('renders the feature descriptions', () => {
    const { getByText } = renderStep();
    expect(getByText('Personal and shared address books on the web client.')).toBeTruthy();
    expect(getByText('Calendars, appointments and scheduling on the web client.')).toBeTruthy();
    expect(getByText('File storage and sharing on the web client.')).toBeTruthy();
    expect(getByText('Messaging, group chats and file sharing between users.')).toBeTruthy();
    expect(getByText('One-to-one and group video calls within Chats.')).toBeTruthy();
  });

  it('renders the footer with the create and Back buttons', () => {
    const { getByRole } = renderStep();
    expect(getByRole('button', { name: 'create' })).toBeTruthy();
    expect(getByRole('button', { name: 'BACK' })).toBeTruthy();
  });
});
