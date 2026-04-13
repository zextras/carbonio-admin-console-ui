/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserZextrasActionInterceptor,
  getQueryClient,
  grantUserConfigRights,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ActivateSubscription } from '../activate-subscription';

function setupActivateSubscriptionTest(
  component: React.ReactElement,
): ReturnType<typeof setupBrowserTest> {
  const queryClient = getQueryClient();
  return setupBrowserTest(component, { queryClient });
}

describe('ActivateSubscription', () => {
  beforeEach(async () => {
    await grantUserConfigRights();
  });

  describe('Rendering', () => {
    it('should display all the elements', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      await expect.element(page.getByText('Subscriptions', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Activation token', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Insert here the activation token')).toBeVisible();
      await expect.element(page.getByText('Activate subscription')).toBeVisible();
      await expect
        .element(page.getByText(/Seems like you don't have a subscription token active yet/i))
        .toBeVisible();
      await expect.element(page.getByRole('img', { name: 'logo' })).toBeVisible();
    });

    it('should autofocus the input field on render', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await expect.element(input).toHaveFocus();
    });
  });

  describe('Input interaction', () => {
    it('should allow typing in the activation token input', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'MY-LICENSE-TOKEN-123');

      await expect.element(input).toHaveValue('MY-LICENSE-TOKEN-123');
    });

    it('should start with an empty input field', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await expect.element(input).toHaveValue('');
    });

    it('should trim whitespace from pasted text', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeVisible();
      const element = input.element() as HTMLInputElement;

      const clipboardData = new DataTransfer();
      clipboardData.setData('text', '  MY-PASTED-TOKEN  ');
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData,
      });
      element.dispatchEvent(pasteEvent);

      await expect.element(input).toHaveValue('MY-PASTED-TOKEN');
    });
  });

  describe('Activate subscription action', () => {
    it('should call activate-license API with the entered token when button is clicked', async () => {
      const interceptor = createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                message: 'License activated successfully',
                response: {
                  type: 'Purchased',
                  subType: 'PERPETUAL',
                  expired: false,
                  features: [],
                },
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'TEST-TOKEN-ABC');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.poll(() => interceptor.getCalledTimes()).toBe(1);

      const body = interceptor.getLastRequestBody<Record<string, any>>();
      expect(body!.Body.zextras.token).toBe('TEST-TOKEN-ABC');
      expect(body!.Body.zextras.module).toBe('ZxCore');
      expect(body!.Body.zextras).not.toHaveProperty('renewal');
    });
  });
});
