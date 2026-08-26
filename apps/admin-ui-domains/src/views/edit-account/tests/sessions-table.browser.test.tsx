/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { SessionsTable } from '../general-section/sessions-table';
import { AccountFormTestProvider } from './account-form-test-provider';

const mockAccountDetail = {
  uid: 'test-user',
  name: 'test-user@test-domain.com',
  zimbraId: 'mock-zimbra-id',
};

const mockSessions = [
  { name: 'test-user@test-domain.com', sid: 'session-1', zid: 'zid-1' },
  { name: 'test-user@test-domain.com', sid: 'session-2', zid: 'zid-2' },
];

function wrapSessionsTable(sessions = mockSessions): React.ReactElement {
  return (
    <AccountFormTestProvider values={mockAccountDetail} contextOverrides={{ sessions }}>
      <SessionsTable />
    </AccountFormTestProvider>
  );
}

function setupSessionsTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  return setupBrowserTest(component, { queryClient });
}

describe('SessionsTable (browser)', () => {
  it('renders the session rows from the context', async () => {
    setupSessionsTest(wrapSessionsTable());

    await expect.element(page.getByText('Active Sessions')).toBeVisible();
    await expect.element(page.getByText('session-1')).toBeVisible();
    await expect.element(page.getByText('session-2')).toBeVisible();
  });

  it('disables End Session until a row is selected', async () => {
    setupSessionsTest(wrapSessionsTable());

    const endSessionButton = page.getByRole('button', { name: /end session/i });
    await expect.element(endSessionButton).toBeVisible();
    await expect.element(endSessionButton).toBeDisabled();
  });

  it('selects a session on row click and enables End Session', async () => {
    setupSessionsTest(wrapSessionsTable());

    await page.getByText('session-1').click();
    await expect.element(page.getByRole('button', { name: /end session/i })).toBeEnabled();
  });

  it('filters sessions by the search input', async () => {
    setupSessionsTest(wrapSessionsTable());

    const searchInput = page.getByRole('textbox', { name: /looking for the session/i });
    await searchInput.fill('session-1');

    await expect.element(page.getByText('session-1')).toBeVisible();
    await expect.element(page.getByText('session-2')).not.toBeInTheDocument();
  });

  it('ends the selected session via delegate auth + end session calls', async () => {
    const delegateAuthInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/DelegateAuthRequest',
      () =>
        HttpResponse.json({
          Body: {
            DelegateAuthResponse: {
              authToken: [{ _content: 'delegate-token-123' }],
            },
          },
        }),
    );
    const endSessionInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/EndSessionRequest',
      () =>
        HttpResponse.json({
          Body: {
            EndSessionResponse: {
              _jsns: 'urn:zimbraAdmin',
            },
          },
        }),
    );

    setupSessionsTest(wrapSessionsTable());

    await page.getByText('session-1').click();
    await page.getByRole('button', { name: /end session/i }).click();

    await expect.element(page.getByText('Session end successfully')).toBeVisible();
    // the ended session disappears from the list
    await expect.element(page.getByText('session-1')).not.toBeInTheDocument();
    await expect.element(page.getByText('session-2')).toBeVisible();

    const delegateAuthRequest = await delegateAuthInterceptor.getLastRequest().json();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (delegateAuthRequest as any).Body.DelegateAuthRequest.account?.[0]?._content,
    ).toBe('mock-zimbra-id');

    const endSessionRequest = await endSessionInterceptor.getLastRequest().json();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (endSessionRequest as any).Body.EndSessionRequest.sessionId,
    ).toBe('session-1');
  });

  it('shows the error snackbar when the end session call fails', async () => {
    await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/DelegateAuthRequest',
      () =>
        HttpResponse.json({
          Body: {
            DelegateAuthResponse: {
              authToken: [{ _content: 'delegate-token-123' }],
            },
          },
        }),
    );
    await createBrowserAPIInterceptor('post', '/service/admin/soap/EndSessionRequest', () =>
      HttpResponse.json({
        Body: {
          EndSessionResponse: {},
        },
      }),
    );

    setupSessionsTest(wrapSessionsTable());

    await page.getByText('session-1').click();
    await page.getByRole('button', { name: /end session/i }).click();

    await expect.element(page.getByText('Session end failed')).toBeVisible();
    // the session is still listed because the call failed
    await expect.element(page.getByText('session-1')).toBeVisible();
  });
});
