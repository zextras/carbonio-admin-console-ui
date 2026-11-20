/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PageHeader } from '@zextras/ui-components';
import {
	type LicenseV1Type,
	useBreakpoint,
	useLicenseV1Info,
	usePrimaryBarState,
} from '@zextras/ui-shared';
import { type CSSProperties, type ReactNode } from 'react';

import styles from './app-view.module.css';
import { ActivateSubscription } from './subscription/activate-subscription';
import { MeteredSubscription } from './subscription/metered-subscription';
import { PerpetualSubscription } from './subscription/perpetual-subscription';
import { RegularSubscription } from './subscription/regular-subscription';
import { TrialSubscription } from './subscription/trial-subscription';

function getMaxWidth(breakpoint: string, isSidebarOpen = false): string {
  if (['2xl', 'xl'].includes(breakpoint)) return '1125px';
  if (breakpoint === 'lg' && !isSidebarOpen) return '1125px';
  return '981px';
}

function getContainerStyle(breakpoint: string, isSidebarOpen = false): CSSProperties {
  return {
    maxWidth: getMaxWidth(breakpoint, isSidebarOpen),
  };
}

function getSubscriptionView(licenseType: LicenseV1Type | null): ReactNode {
  if (!licenseType) {
    return <ActivateSubscription />;
  }

  if (licenseType === 'regular') {
    return <RegularSubscription />;
  }
  if (licenseType === 'perpetual') {
    return <PerpetualSubscription />;
  }
  if (licenseType === 'trial') {
    return <TrialSubscription />;
  }
  if (licenseType === 'metered' || licenseType === 'isp') {
    return <MeteredSubscription />;
  }
  return null;
}

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();

  const { data: license, isLoading } = useLicenseV1Info();
  const licenseType = license?.licenseType ?? null;

  return (
    <div className={styles.root}>
      <PageHeader />
      {!isLoading && (
        <div className={styles.detailWrapper}>
          <div
            className={styles.detailContent}
            style={getContainerStyle(breakpoint, isPrimaryBarExpanded)}
          >
            {getSubscriptionView(licenseType)}
          </div>
        </div>
      )}
    </div>
  );
};
