/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render, screen } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { Features } from './features';

describe('Features component', () => {
  it('renders COS level features section when cosLevelFeatures is true', () => {
    render(
      <Features
        featuresDetail={{ carbonioFeatureOTPMgmtEnabled: 'TRUE' }}
        setFeaturesDetail={() => {}}
        cosDetail={{ carbonioFeatureOTPMgmtEnabled: 'TRUE' }}
        accSpecificDetail={{ carbonioFeatureOTPMgmtEnabled: 'TRUE' }}
        setEmptyValue={() => {}}
        cosLevelFeatures={true}
      />
    );
    expect(
      screen.getByText('Two-Factor authenticator', { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Allow users to configure 2FA', { exact: false })
    ).toBeInTheDocument();
  });

  it('does not render COS level features section when cosLevelFeatures is false', () => {
    render(
      <Features
        featuresDetail={{}}
        setFeaturesDetail={() => {}}
        cosDetail={{}}
        accSpecificDetail={{}}
        setEmptyValue={() => {}}
        cosLevelFeatures={false}
      />
    );
    expect(
      screen.queryByText('Two-Factor authenticator', { exact: false })
    ).not.toBeInTheDocument();
  });
});
