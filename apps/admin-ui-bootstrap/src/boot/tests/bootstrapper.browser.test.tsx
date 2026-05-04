/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

vi.mock('../init', () => ({
  init: vi.fn().mockResolvedValue({ error: 'Advanced is not supported' }),
}));

import { Bootstrapper } from '../bootstrapper';

describe('Bootstrapper', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display error when is advanced supported api fails', async () => {
    setupBrowserTest(<Bootstrapper />, {
      initialRouterEntry: '/carbonioAdmin',
    });

    const errorMessage = page.getByText(
      'We’re sorry, but there was an error trying to load this page',
    );
    await expect.element(errorMessage).toBeVisible();
  });
});
