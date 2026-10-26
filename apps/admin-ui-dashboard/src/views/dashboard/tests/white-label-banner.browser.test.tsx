/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DOMAINS_ROUTE_ID, useAppStore, useLoginConfigStore } from '@zextras/ui-shared';
import { LocationDisplay, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { WhiteLabelBanner } from '../white-label-banner';

const HOST = globalThis.location?.hostname ?? 'localhost';
const BLOCKED_URL = `https://${HOST}/logo.png`;
const BANNER_DESCRIPTION = /Branding assets blocked \(403\)/;

function resetBrandingUrls(): void {
  useLoginConfigStore.setState({
    carbonioAdminUiAppLogo: undefined,
    carbonioAdminUiDarkAppLogo: undefined,
    carbonioAdminUiFavicon: undefined,
    carbonioAdminUiLoginLogo: undefined,
    carbonioAdminUiDarkLoginLogo: undefined,
    carbonioAdminUiBackground: undefined,
    carbonioAdminUiDarkBackground: undefined,
  });
}

describe('WhiteLabelBanner (browser)', () => {
  afterEach(() => {
    resetBrandingUrls();
  });

  it('renders the banner when a branding URL is same-origin outside the allowlist', async () => {
    useLoginConfigStore.setState({ carbonioAdminUiAppLogo: BLOCKED_URL });
    await setupBrowserTest(<WhiteLabelBanner />);

    await expect.element(page.getByText(BANNER_DESCRIPTION)).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Go to Whitelabel Settings' }))
      .toBeVisible();
  });

  it('renders nothing when the store has no branding URLs', async () => {
    resetBrandingUrls();
    await setupBrowserTest(<WhiteLabelBanner />);

    await expect.element(page.getByText(BANNER_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('renders nothing when all branding URLs are external or allowlisted', async () => {
    useLoginConfigStore.setState({
      carbonioAdminUiAppLogo: 'https://cdn.example.com/x.png',
      carbonioAdminUiFavicon: `https://${HOST}/static/y.png`,
    });
    await setupBrowserTest(<WhiteLabelBanner />);

    await expect.element(page.getByText(BANNER_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('hides the banner when the close button is clicked', async () => {
    useLoginConfigStore.setState({ carbonioAdminUiAppLogo: BLOCKED_URL });
    await setupBrowserTest(<WhiteLabelBanner />);

    await expect.element(page.getByText(BANNER_DESCRIPTION)).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect.element(page.getByText(BANNER_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('navigates to the logo section of the whitelabel settings when the action button is clicked', async () => {
    useLoginConfigStore.setState({ carbonioAdminUiAppLogo: BLOCKED_URL });
    // Register the domains route so buildPath resolves the prefixed path
    // (/manage/domains/...), mirroring how the shell bootstraps routes.
    useAppStore.setState({
      routes: {
        [DOMAINS_ROUTE_ID]: {
          id: DOMAINS_ROUTE_ID,
          route: DOMAINS_ROUTE_ID,
          path: `manage/${DOMAINS_ROUTE_ID}`,
          app: 'carbonio-admin-ui-domains',
        },
      },
    });
    await setupBrowserTest(
      <>
        <WhiteLabelBanner />
        <LocationDisplay />
      </>,
    );

    await page.getByRole('button', { name: 'Go to Whitelabel Settings' }).click();

    await expect.element(page.getByTestId('location')).toHaveTextContent(
      '/manage/domains/global/whitelabel_settings#logo',
    );
  });
});
