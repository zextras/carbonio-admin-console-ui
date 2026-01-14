/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import { setupTest } from 'admin-ui-test-utils';

import { Icon } from './Icon';

describe('Icon', () => {
  test('Render an icon', () => {
    setupTest(<Icon icon="BulbOutline" />);
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });

  test('Render an icon with a color of the palette with the variant', () => {
    setupTest(<Icon icon="BulbOutline" color="primary.hover" />);
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });

  test('Render an icon with a color not of the palette with the variant', () => {
    setupTest(<Icon icon="BulbOutline" color="cadetblue.disabled" />);
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });

  test('Render an icon with a color in the rgb form and a variant', () => {
    setupTest(<Icon icon="BulbOutline" color="rgba(100, 50, 50, 0.7).disabled" />);
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });

  test('Render an icon with a custom color', () => {
    setupTest(<Icon icon="BulbOutline" color="rgba(100, 50, 50, 0.7)" />);
    expect(screen.getByTestId('icon: BulbOutline')).toBeVisible();
  });
});
