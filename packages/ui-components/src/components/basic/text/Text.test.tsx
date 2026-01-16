/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import { setupTest } from '@test-utils';

import { Theme } from '../../../theme/theme';
import { Text, TextProps } from './Text';

describe('Text', () => {
  test('render a text with string content', () => {
    setupTest(<Text>ABCD</Text>);
    expect(screen.getByText('ABCD')).toBeVisible();
  });

  test('render a text with disabled color', () => {
    setupTest(<Text disabled>ABCD</Text>);
    expect(screen.getByText('ABCD')).toHaveStyle({ color: Theme.palette.text.disabled });
  });

  test('render text with a component as content', () => {
    setupTest(
      <Text>
        ABC <Text>DEF</Text>
      </Text>,
    );
    expect(screen.getByText('ABC')).toBeVisible();
    expect(screen.getByText('DEF')).toBeVisible();
  });

  it('should render the text with italic style if italic prop is true', () => {
    setupTest(<Text italic>ABCD</Text>);
    expect(screen.getByText('ABCD')).toHaveStyle('font-style: italic');
  });

  it.each<TextProps['textAlign']>(['left', 'right', 'center', 'justify', 'end', 'revert', 'start'])(
    'should render the text with textAlign %s',
    (textAlign) => {
      setupTest(<Text textAlign={textAlign}>ACB</Text>);
      expect(screen.getByText('ACB')).toHaveStyle({ textAlign });
    },
  );

  it('should render the text with line height', () => {
    const lineHeight = 10;
    setupTest(<Text lineHeight={lineHeight}>ABC</Text>);
    expect(screen.getByText('ABC')).toHaveStyle({ lineHeight: String(lineHeight) });
  });
});
