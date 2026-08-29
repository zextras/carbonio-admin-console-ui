/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement,useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ResourceCreateSection } from '../resource-create-section';
import {
  RESOURCE_TYPE,
  SCHEDULE_POLICY_TYPE,
  STATUS,
  TRUE_FALSE,
} from '../resource-edit-detail-view';
import { ResourceFormContext } from '../resource-form-context';
import { useCreateResourceForm } from '../use-create-resource-form';

const COS_LIST = [
  { id: 'cos-1', name: 'Default', a: [] },
  { id: 'cos-2', name: 'Premium', a: [] },
];

function setup(ui: ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['cos', 'list', '', 0, 0], {
    cos: COS_LIST,
    searchTotal: COS_LIST.length,
    more: false,
  });
  return setupBrowserTest(ui, { queryClient });
}

const DefaultSummary = () => {
  const form = useCreateResourceForm();
  return (
    <ResourceFormContext.Provider value={{ form }}>
      <ResourceCreateSection />
    </ResourceFormContext.Provider>
  );
};

const SeededSummary = () => {
  const form = useCreateResourceForm();

  useEffect(() => {
    form.setFieldValue('displayName', 'Projector');
    form.setFieldValue('name', 'projector');
    form.setFieldValue('zimbraCalResType', RESOURCE_TYPE.EQUIPMENT);
    form.setFieldValue('zimbraAccountStatus', STATUS.CLOSED);
    form.setFieldValue('zimbraCalResAutoDeclineRecurring', TRUE_FALSE.TRUE);
    form.setFieldValue('zimbraCOSId', 'cos-2');
    form.setFieldValue('zimbraCalResMaxNumConflictsAllowed', '3');
    form.setFieldValue('zimbraCalResMaxPercentConflictsAllowed', '10');
    form.setFieldValue('schedulePolicyType', SCHEDULE_POLICY_TYPE.MANUAL_ACCEPT);
    form.setFieldValue('zimbraNotes', 'Hallway projector');
    form.setFieldValue('sendInviteList', [
      { id: '1', n: 'zimbraPrefCalendarForwardInvitesTo', _content: 'admin@example.com' },
    ]);
  }, [form]);

  return (
    <ResourceFormContext.Provider value={{ form }}>
      <ResourceCreateSection />
    </ResourceFormContext.Provider>
  );
};

describe('ResourceCreateSection (browser)', () => {
  it('renders the details summary labels', async () => {
    await setup(<DefaultSummary />);

    await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    await expect.element(page.getByText('ResourceName')).toBeVisible();
    await expect.element(page.getByText('Name', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Domain', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Type', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Status', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Class of Service')).toBeVisible();
    await expect.element(page.getByText('Auto-Refuse')).toBeVisible();
    await expect.element(page.getByText('Set Policy')).toBeVisible();
    await expect.element(page.getByText('Description', { exact: true })).toBeVisible();
  });

  it('shows default location, active, auto COS, and no auto-refuse', async () => {
    await setup(<DefaultSummary />);

    await expect.element(page.getByText('Meeting Room')).toBeVisible();
    await expect.element(page.getByText('Active', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Auto', { exact: true })).toBeVisible();
    await expect.element(page.getByText('No', { exact: true })).toBeVisible();
  });

  it('shows seeded equipment, closed, COS name, and description', async () => {
    await setup(<SeededSummary />);

    await expect.element(page.getByText('Projector', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Equipment')).toBeVisible();
    await expect.element(page.getByText('Closed', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Premium')).toBeVisible();
    await expect.element(page.getByText('Yes', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Hallway projector')).toBeVisible();
    await expect.element(page.getByText('admin@example.com')).toBeVisible();
  });
});
