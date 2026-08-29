/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ResourceFormContext } from '../resource-form-context';
import { ResourceSharingSection } from '../resource-sharing-section';
import { useCreateResourceForm } from '../use-create-resource-form';

const Harness = () => {
  const form = useCreateResourceForm();
  return (
    <ResourceFormContext.Provider value={{ form }}>
      <ResourceSharingSection />
    </ResourceFormContext.Provider>
  );
};

describe('ResourceSharingSection (browser)', () => {
  it('renders the invites heading and empty invite list', async () => {
    await setupBrowserTest(<Harness />);

    await expect.element(page.getByText('Invites', { exact: true })).toBeVisible();
    await expect.element(page.getByText('This list is empty.')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });
});
