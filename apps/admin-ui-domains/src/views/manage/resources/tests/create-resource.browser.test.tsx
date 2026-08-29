/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CreateResource } from '../create-resource';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setup(onClose = vi.fn()) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  queryClient.setQueryData(['cos', 'list', '', 0, 0], {
    cos: [{ id: 'cos-1', name: 'Default', a: [] }],
    searchTotal: 1,
    more: false,
  });
  return setupBrowserTest(<CreateResource onClose={onClose} />, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

describe('CreateResource (browser)', () => {
  it('renders the create resource wizard title', async () => {
    await setup();

    await expect.element(page.getByText('Create Resource')).toBeVisible();
  });

  it('renders the details step', async () => {
    await setup();

    await expect.element(page.getByText('DETAILS', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
  });

  it('calls onClose when CANCEL is clicked', async () => {
    const onClose = vi.fn();
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
      a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
    });
    queryClient.setQueryData(['cos', 'list', '', 0, 0], {
      cos: [{ id: 'cos-1', name: 'Default', a: [] }],
      searchTotal: 1,
      more: false,
    });
    await setupBrowserTest(<CreateResource onClose={onClose} />, {
      queryClient,
      withDomainIdRoute: true,
      initialRouterEntry: `/${DOMAIN_ID}`,
    });

    await userEvent.click(page.getByRole('button', { name: 'CANCEL' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('advances to the sharing step when NEXT is clicked', async () => {
    await setup();

    await userEvent.click(page.getByRole('button', { name: 'NEXT' }));

    await expect.element(page.getByText('Invites', { exact: true })).toBeVisible();
  });

  it('reaches the create summary step', async () => {
    await setup();

    await userEvent.click(page.getByRole('button', { name: 'NEXT' }));
    await userEvent.click(page.getByRole('button', { name: 'NEXT' }));

    await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'CREATE' })).toBeVisible();
  });
});
