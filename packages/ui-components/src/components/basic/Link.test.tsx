/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupTest } from '@test-utils';
import { screen } from '@testing-library/react';

import { Link } from './Link';

describe('Link', () => {
  test('Render a Link', () => {
    const text = 'some content';
    setupTest(
      <Link weight="bold" size="large" color="warning" underlined href="https://test-link.test">
        {text}
      </Link>,
    );
    expect(screen.getByRole('link', { name: text })).toBeVisible();
  });
});
