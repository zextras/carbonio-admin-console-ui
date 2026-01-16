/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupTest } from '@test-utils';
import { screen } from '@testing-library/react';
import React from 'react';

import { Catcher } from './Catcher';

function ErrorComponent(): React.JSX.Element {
  throw new Error("Error from the test component, don't panic if You see this error.");
}

describe('Catcher', () => {
  test('Render a component', () => {
    const onError = vi.fn();
    setupTest(
      <Catcher onError={onError}>
        <div>CHILD ELEMENT</div>
      </Catcher>,
    );
    expect(onError).not.toHaveBeenCalled();
    expect(screen.getByText(/CHILD ELEMENT/i)).toBeVisible();
  });

  test('Render a component with an error', () => {
    vi.spyOn(console, 'error');
    const onError = vi.fn();
    setupTest(
      <Catcher onError={onError}>
        <ErrorComponent />
      </Catcher>,
    );
    expect(onError).toHaveBeenCalled();
    expect(screen.getByText(/error from the test component/i)).toBeVisible();
  });
});
