/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  getAllConfigRightsResponseMock,
  getGetInfoResponseMock,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import {
  CARBONIO_ALLOW_FEEDBACK,
  CARBONIO_SEND_ANALYTICS,
  CARBONIO_SEND_FULL_ERROR_STACK,
} from '../../../constants';
import { PrivacyView } from '../privacy-view';

const mockConfigData = {
  [CARBONIO_SEND_ANALYTICS]: 'FALSE',
  [CARBONIO_SEND_FULL_ERROR_STACK]: 'FALSE',
  [CARBONIO_ALLOW_FEEDBACK]: 'FALSE',
};

const SWITCH_LABELS = {
  error: 'Send full error data',
  analytics: 'Allow data analytics',
  feedback: 'Allow live survey feedbacks',
} as const;

async function setupPrivacyView(configData: Record<string, string> = mockConfigData): Promise<void> {
  const getInfoInterceptor = createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  const getAllConfigInterceptor = createBrowserSoapAPIInterceptor(
    'GetAllConfig',
    getAllConfigResponseMock(configData),
  );
  const getAllConfigRightsInterceptor = createBrowserSoapAPIInterceptor(
    'GetAllEffectiveRights',
    getAllConfigRightsResponseMock(),
  );

  setupBrowserTest(<PrivacyView />);

  await getInfoInterceptor;
  await getAllConfigInterceptor;
  await getAllConfigRightsInterceptor;

  await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.error })).toBeVisible();
}

describe('PrivacyView', () => {
  it('renders privacy settings page with all switches', async () => {
    await setupPrivacyView();

    await expect.element(page.getByText('Privacy')).toBeVisible();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.error })).toBeVisible();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.analytics })).toBeVisible();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.feedback })).toBeVisible();

    await expect
      .element(page.getByText(/We all make mistakes but it's how you deal with them/))
      .toBeVisible();
    await expect
      .element(
        page.getByText(/Your data is safe. All information we gather is and will stay anonymous/),
      )
      .toBeVisible();
    await expect
      .element(page.getByText(/We promise they will be fast, easy and very useful/))
      .toBeVisible();
  });

  it('shows save and cancel buttons when switch is toggled', async () => {
    await setupPrivacyView();

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('hides save and cancel buttons when cancel is clicked', async () => {
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls Batch API when save is clicked', async () => {
    const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.analytics }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.feedback }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();

    const request = await batchInterceptor;

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

    expect(request).toMatchObject({
      ModifyConfigRequest: [
        {
          _content: 'TRUE',
          n: 'carbonioAllowFeedback',
        },
        {
          _content: 'TRUE',
          n: 'carbonioSendFullErrorStack',
        },
        {
          _content: 'TRUE',
          n: 'carbonioSendAnalytics',
        },
      ],
      _jsns: 'urn:zimbra',
    });
  });

  it('does not show save/cancel buttons when switches are disabled', async () => {
    setupBrowserTest(<PrivacyView />);
    await expect.element(page.getByText(SWITCH_LABELS.error)).toBeVisible();

    await page.getByText(SWITCH_LABELS.error).click();
    await page.getByText(SWITCH_LABELS.analytics).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('loads config values and reflects checked state', async () => {
    const mixedConfigData = {
      [CARBONIO_SEND_ANALYTICS]: 'TRUE',
      [CARBONIO_SEND_FULL_ERROR_STACK]: 'FALSE',
      [CARBONIO_ALLOW_FEEDBACK]: 'TRUE',
    };

    await setupPrivacyView(mixedConfigData);

    await expect
      .element(page.getByRole('switch', { name: SWITCH_LABELS.error }))
      .not.toBeChecked();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.analytics })).toBeChecked();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.feedback })).toBeChecked();
    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('persists dirty state across multiple toggle operations and cancels all', async () => {
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.analytics }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.feedback }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('saves all changes when multiple switches are toggled before save', async () => {
    const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.analytics }).click();
    await page.getByRole('switch', { name: SWITCH_LABELS.feedback }).click();

    await page.getByRole('button', { name: 'Save' }).click();
    await batchInterceptor;

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('shows success snackbar after successful save', async () => {
    const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await batchInterceptor;

    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
  });

  it('shows error snackbar when save fails', async () => {
    await createBrowserAPIInterceptor('post', '/service/admin/soap/BatchRequest', () =>
      HttpResponse.json(
        {
          Body: {
            Fault: {
              Reason: { Text: 'Batch request failed' },
            },
          },
        },
        { status: 500 },
      ),
    );
    await setupPrivacyView();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.element(page.getByText(/Batch request failed/)).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('toggles switch checked state when clicked', async () => {
    await setupPrivacyView();

    const errorSwitch = page.getByRole('switch', { name: SWITCH_LABELS.error });
    const analyticsSwitch = page.getByRole('switch', { name: SWITCH_LABELS.analytics });
    const feedbackSwitch = page.getByRole('switch', { name: SWITCH_LABELS.feedback });

    await expect.element(errorSwitch).not.toBeChecked();
    await expect.element(analyticsSwitch).not.toBeChecked();
    await expect.element(feedbackSwitch).not.toBeChecked();

    await errorSwitch.click();
    await expect.element(errorSwitch).toBeChecked();
    await expect.element(analyticsSwitch).not.toBeChecked();
    await expect.element(feedbackSwitch).not.toBeChecked();

    await analyticsSwitch.click();
    await expect.element(errorSwitch).toBeChecked();
    await expect.element(analyticsSwitch).toBeChecked();
  });

  it('handles toggle operations when all settings start as TRUE', async () => {
    const allEnabledConfig = {
      [CARBONIO_SEND_ANALYTICS]: 'TRUE',
      [CARBONIO_SEND_FULL_ERROR_STACK]: 'TRUE',
      [CARBONIO_ALLOW_FEEDBACK]: 'TRUE',
    };

    await setupPrivacyView(allEnabledConfig);

    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.error })).toBeChecked();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.analytics })).toBeChecked();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.feedback })).toBeChecked();

    await page.getByRole('switch', { name: SWITCH_LABELS.error }).click();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('switch', { name: SWITCH_LABELS.error })).toBeChecked();
  });
});
