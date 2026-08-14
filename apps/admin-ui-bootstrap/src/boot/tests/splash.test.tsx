/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingView } from '../splash';

describe('LoadingView', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingView />);
    expect(container).toBeDefined();
  });

  it('contains the splash div', () => {
    const { container } = render(<LoadingView />);
    expect(container.querySelector('.splash')).not.toBeNull();
  });
});
