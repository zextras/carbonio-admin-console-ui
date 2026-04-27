/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserZextrasActionInterceptor,
  delayedSoapApiForBrowser,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ActivateSubscription } from '../activate-subscription';

vi.mock('../../../constants', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../constants')>();
  return {
    ...original,
    ACTIVATION_PROGRESS_MIN_DISPLAY_MS: 100,
    ACTIVATION_PROGRESS_COMPLETE_DELAY_MS: 0,
    ACTIVATION_SUCCESS_AUTO_CLOSE_MS: 500,
  };
});

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

  afterEach(() => {
    resetMockWorker();
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

  describe('Activation popup', () => {
    it('should show activation popup with title and description when activate button is clicked', async () => {
      const mockDelayMs = 500;
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'TEST-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      delayedSoapApiForBrowser('activate-license', 500);
      await expect.element(page.getByText('Activating subscription')).toBeVisible();
      await expect
        .element(page.getByText('Please wait while we verify and set up your workspace'))
        .toBeVisible();

      await new Promise((resolve) => setTimeout(resolve, mockDelayMs + 50));
    });

    it('should show success popover after successful activation', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
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
      await userEvent.type(input, 'TEST-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Subscription activated')).toBeVisible();
      await expect
        .element(page.getByText(/You will be redirected to the subscription page/))
        .toBeVisible();
    });

    it('should show error popover when activation fails', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: false,
                message: 'Network error',
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'BAD-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Something went wrong', { exact: true })).toBeVisible();
      await expect
        .element(
          page.getByText(
            'Please verify that you have inserted the correct token. If the error persists contact your provider or try again later.',
          ),
        )
        .toBeVisible();
    });

    it('should show error popover when API returns ok:true with type None', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: {
                  type: 'None',
                  features: [],
                },
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'TEST-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Something went wrong', { exact: true })).toBeVisible();
      await expect
        .element(
          page.getByText(
            'Please verify that you have inserted the correct token. If the error persists contact your provider or try again later.',
          ),
        )
        .toBeVisible();
    });

    it('should show error popover when API returns ok:false', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: false,
                message: 'Invalid token',
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'BAD-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Something went wrong', { exact: true })).toBeVisible();
      await expect
        .element(
          page.getByText(
            'Please verify that you have inserted the correct token. If the error persists contact your provider or try again later.',
          ),
        )
        .toBeVisible();
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

  describe('Validation', () => {
    it('should show validation error when activating with empty input', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: { type: 'Purchased', features: [] },
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Please enter your activation token')).toBeVisible();
    });

    it('should show validation error when activating with whitespace-only input', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, '   ');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Please enter your activation token')).toBeVisible();
    });

    it('should clear validation error when user starts typing', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await expect.element(input).toBeVisible();

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Please enter your activation token')).toBeVisible();

      await userEvent.type(input, 'A');

      const errorElements = page.getByText('Please enter your activation token').elements();
      expect(errorElements).toHaveLength(0);
    });

    it('should not show validation error on blur with valid content', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'VALID-TOKEN');

      await userEvent.click(document.body);

      const errorElements = page.getByText('Please enter your activation token').elements();
      expect(errorElements).toHaveLength(0);
    });
  });

  describe('Keyboard interaction', () => {
    it('should trigger activation when Enter key is pressed in input', async () => {
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
      await userEvent.type(input, 'TOKEN-VIA-ENTER');

      await userEvent.keyboard('{Enter}');

      await expect.poll(() => interceptor.getCalledTimes()).toBe(1);

      const body = interceptor.getLastRequestBody<Record<string, any>>();
      expect(body!.Body.zextras.token).toBe('TOKEN-VIA-ENTER');
    });
  });

  describe('Error popover interaction', () => {
    it('should hide error popover when back button is clicked', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: false,
                message: 'Activation failed',
              }),
            },
          },
        }),
      );

      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'BAD-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Something went wrong', { exact: true })).toBeVisible();

      const backButton = page.getByText('back');
      await backButton.click();

      await expect
        .element(page.getByText('Something went wrong', { exact: true }))
        .not.toBeVisible();
    });
  });

  describe('Validation on blur', () => {
    it('should show validation error on blur when input has content then is cleared', async () => {
      setupActivateSubscriptionTest(<ActivateSubscription />);

      const input = page.getByRole('textbox');
      await userEvent.type(input, 'VALID-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Activating subscription')).toBeVisible();
    });
  });

  describe('Progress completion flow', () => {
    it('should hide progress popover and show result after API responds', async () => {
      createBrowserZextrasActionInterceptor('activate-license', () =>
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
      await userEvent.type(input, 'TEST-TOKEN');

      const activateButton = page.getByText('Activate subscription');
      await activateButton.click();

      await expect.element(page.getByText('Subscription activated')).toBeVisible();
      await expect.element(page.getByText('Activating subscription')).not.toBeVisible();
    });
  });
});
