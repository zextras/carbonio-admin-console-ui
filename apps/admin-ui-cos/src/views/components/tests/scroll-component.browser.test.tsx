/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ScrollComponent } from '../scroll-component';

describe('ScrollComponent (browser)', () => {
  it('should render the scroll-down text', async () => {
    await setupBrowserTest(<ScrollComponent />);
    await expect
      .element(page.getByText('Scroll down to view other items'))
      .toBeVisible();
  });

  it('should render the text as an h2 heading', async () => {
    await setupBrowserTest(<ScrollComponent />);
    await expect
      .element(page.getByRole('heading', { name: 'Scroll down to view other items' }))
      .toBeVisible();
  });

  it('should render a ds-icon with icon="ArrowheadDown" and size="large"', async () => {
    await setupBrowserTest(<ScrollComponent />);
    const icon = document.querySelector('ds-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('icon')).toBe('ArrowheadDown');
    expect(icon?.getAttribute('size')).toBe('large');
  });

  it('should render a ds-text with size="large"', async () => {
    await setupBrowserTest(<ScrollComponent />);
    const dsText = document.querySelector('ds-text');
    expect(dsText).not.toBeNull();
    expect(dsText?.getAttribute('size')).toBe('large');
  });

  it('should contain the ds-icon and ds-text within the same inner row', async () => {
    await setupBrowserTest(<ScrollComponent />);
    const icon = document.querySelector('ds-icon');
    const dsText = document.querySelector('ds-text');
    const iconParent = icon?.parentElement;
    const textParent = dsText?.parentElement?.parentElement;
    expect(iconParent).toBe(textParent);
  });
});
