/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Banner, type BannerProps } from '../Banner';

const TITLE = 'Subscription expiring soon';
const DESCRIPTION = 'Your subscription expires in 14 days.';
const LONG_DESCRIPTION = Array.from({ length: 40 }, (_, i) => `maintenance-${i}`).join(' ');

type NarrowBannerProps = { width: string } & BannerProps;

const NarrowBanner = ({ width, ...bannerProps }: NarrowBannerProps) => (
  <div style={{ width }}>
    <Banner {...bannerProps} />
  </div>
);

const ClosableBanner = () => {
  const [open, setOpen] = useState(true);

  return open ? (
    <Banner showClose onClose={() => setOpen(false)} description={DESCRIPTION} />
  ) : null;
};

const countTexts = async (text: string): Promise<number> => page.getByText(text).elements().length;

describe('Banner', () => {
  describe('rendering', () => {
    it('renders the title and the description', async () => {
      await setupBrowserTest(<Banner title={TITLE} description={DESCRIPTION} />);

      await expect.element(page.getByText(TITLE)).toBeVisible();
      await expect.element(page.getByText(DESCRIPTION)).toBeVisible();
    });

    it('renders without a title', async () => {
      await setupBrowserTest(<Banner description={DESCRIPTION} />);

      await expect.element(page.getByText(DESCRIPTION)).toBeVisible();
    });

    it('maps every severity to its own icon', async () => {
      await setupBrowserTest(
        <main>
          <Banner severity="success" description="Success banner description" />
          <Banner severity="warning" description="Warning banner description" />
          <Banner severity="info" description="Info banner description" />
          <Banner severity="error" description="Error banner description" />
        </main>,
      );

      await expect.element(page.getByTestId('icon: CheckmarkCircle2Outline')).toBeVisible();
      await expect.element(page.getByTestId('icon: AlertTriangleOutline')).toBeVisible();
      await expect.element(page.getByTestId('icon: InfoOutline')).toBeVisible();
      await expect.element(page.getByTestId('icon: CloseCircleOutline')).toBeVisible();
    });

    it('renders every type variant', async () => {
      await setupBrowserTest(
        <main>
          <Banner type="standard" title="Standard banner" description={DESCRIPTION} />
          <Banner type="fill" title="Fill banner" description={DESCRIPTION} />
          <Banner type="outline" title="Outline banner" description={DESCRIPTION} />
        </main>,
      );

      await expect.element(page.getByText('Standard banner')).toBeVisible();
      await expect.element(page.getByText('Fill banner')).toBeVisible();
      await expect.element(page.getByText('Outline banner')).toBeVisible();
    });

    it('forwards extra HTML attributes to the root element', async () => {
      await setupBrowserTest(<Banner description={DESCRIPTION} data-testid="banner-root" />);

      await expect.element(page.getByTestId('banner-root')).toBeVisible();
    });

    it('forwards the ref to the root element', async () => {
      const ref = createRef<HTMLDivElement>();
      await setupBrowserTest(<Banner ref={ref} description={DESCRIPTION} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.textContent).toContain(DESCRIPTION);
    });
  });

  describe('actions', () => {
    it('renders the primary action and fires its onClick once', async () => {
      const onClick = vi.fn();
      await setupBrowserTest(
        <Banner description={DESCRIPTION} primaryAction={{ label: 'Renew now', onClick }} />,
      );

      const primary = page.getByRole('button', { name: 'Renew now' });
      await expect.element(primary).toBeVisible();
      await primary.click();

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders the secondary action and fires its onClick once', async () => {
      const onClick = vi.fn();
      await setupBrowserTest(
        <Banner
          description={DESCRIPTION}
          secondaryAction={{ label: 'Remind me later', onClick }}
        />,
      );

      const secondary = page.getByRole('button', { name: 'Remind me later' });
      await expect.element(secondary).toBeVisible();
      await secondary.click();

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders both actions at the same time', async () => {
      await setupBrowserTest(
        <Banner
          description={DESCRIPTION}
          primaryAction={{ label: 'Renew now', onClick: vi.fn() }}
          secondaryAction={{ label: 'Remind me later', onClick: vi.fn() }}
        />,
      );

      await expect.element(page.getByRole('button', { name: 'Renew now' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Remind me later' })).toBeVisible();
    });
  });

  describe('close button', () => {
    it('names the close button with closeLabel and fires onClose', async () => {
      const onClose = vi.fn();
      await setupBrowserTest(
        <Banner
          showClose
          onClose={onClose}
          closeLabel="Dismiss banner"
          description={DESCRIPTION}
        />,
      );

      const close = page.getByRole('button', { name: 'Dismiss banner' });
      await expect.element(close).toBeVisible();
      await close.click();

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('falls back to "Close" when no closeLabel is provided', async () => {
      await setupBrowserTest(<Banner showClose onClose={vi.fn()} description={DESCRIPTION} />);

      await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    it('removes the banner when the close button is clicked', async () => {
      await setupBrowserTest(<ClosableBanner />);

      await page.getByRole('button', { name: 'Close' }).click();

      await expect.element(page.getByText(DESCRIPTION)).not.toBeInTheDocument();
    });

    it('renders no close button when showClose is not set', async () => {
      await setupBrowserTest(<Banner description={DESCRIPTION} />);

      expect(page.getByRole('button', { name: 'Close' }).elements()).toHaveLength(0);
    });
  });

  describe('more info (cropped text)', () => {
    it('shows the More info button when the text overflows', async () => {
      await setupBrowserTest(
        <NarrowBanner width="260px" title={TITLE} description={LONG_DESCRIPTION} />,
      );

      await expect.element(page.getByRole('button', { name: 'More info' })).toBeVisible();
    });

    it('shows no More info button when the text fits', async () => {
      await setupBrowserTest(<Banner title={TITLE} description={DESCRIPTION} />);

      await expect.element(page.getByRole('button', { name: 'More info' })).not.toBeInTheDocument();
    });

    it('uses the moreInfoLabel override', async () => {
      await setupBrowserTest(
        <NarrowBanner width="260px" description={LONG_DESCRIPTION} moreInfoLabel="Show me more" />,
      );

      await expect.element(page.getByRole('button', { name: 'Show me more' })).toBeVisible();
    });

    it('opens a modal with the whole description when More info is clicked', async () => {
      await setupBrowserTest(
        <NarrowBanner width="260px" title={TITLE} description={LONG_DESCRIPTION} />,
      );

      await page.getByRole('button', { name: 'More info' }).click();

      // the modal renders the title and the description a second time, in a portal
      await expect.poll(() => countTexts(TITLE)).toBe(2);
      await expect.poll(() => countTexts(LONG_DESCRIPTION)).toBe(2);

      // the modal close icon is named after the banner close label
      const modalClose = page.getByRole('button', { name: 'Close' });
      await expect.element(modalClose).toBeVisible();
      await modalClose.click();

      await expect.poll(() => countTexts(TITLE)).toBe(1);
    });

    it('runs the primary action from the modal confirm and closes the modal', async () => {
      const onPrimary = vi.fn();
      await setupBrowserTest(
        <NarrowBanner
          width="260px"
          title={TITLE}
          description={LONG_DESCRIPTION}
          primaryAction={{ label: 'Renew now', onClick: onPrimary }}
        />,
      );

      await page.getByRole('button', { name: 'More info' }).click();
      await expect.poll(() => countTexts(TITLE)).toBe(2);

      // the banner keeps its own "Renew now" button: the modal one is the portal-rendered last one
      const modalConfirm = page.getByRole('button', { name: 'Renew now' }).last();
      await modalConfirm.click();

      expect(onPrimary).toHaveBeenCalledOnce();
      await expect.poll(() => countTexts(TITLE)).toBe(1);
    });
  });
});
