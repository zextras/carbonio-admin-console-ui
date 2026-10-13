/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PageHeader } from '@zextras/ui-components';
import {
  useBreakpoint,
  useLicenseInfo,
  useNewSubscriptionFeatureFlag,
  usePrimaryBarState,
} from '@zextras/ui-shared';
import { type CSSProperties, type ReactNode } from 'react';

import styles from './app-view.module.css';
import { ActivateSubscription } from './subscription/activate-subscription';
import { MeteredSubscription } from './subscription/metered-subscription';
import { PerpetualSubscription } from './subscription/perpetual-subscription';
import { RegularSubscription } from './subscription/regular-subscription';
import { Subscription } from './subscription/subscription';
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

function getSubscriptionView(
  subscriptionType: string | undefined,
  subType: string | undefined,
  featureFlag: boolean,
): ReactNode {
  if (!subscriptionType) {
    return <ActivateSubscription />;
  }

  if (!featureFlag) {
    return <Subscription />;
  }

  if (subscriptionType === 'Purchased' && subType === 'REGULAR') {
    return <RegularSubscription />;
  }
  if (subscriptionType === 'Purchased' && subType === 'PERPETUAL') {
    return <PerpetualSubscription />;
  }
  if (subscriptionType === 'Purchased' && subType === 'TRIAL') {
    return <TrialSubscription />;
  }
  if (subscriptionType === 'Purchased' && subType === 'METERED') {
    return <MeteredSubscription />;
  }
  return null;
}

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();
  const featureFlag = useNewSubscriptionFeatureFlag();

  const { data: licenseData, isLoading } = useLicenseInfo();
  const subscriptionType = licenseData?.response?.type;
  const subType = licenseData?.response?.subType;

  return (
    <div className={styles.root}>
      <PageHeader />
      {!isLoading && (
        <div className={styles.detailWrapper}>
          <div
            className={styles.detailContent}
            style={getContainerStyle(breakpoint, isPrimaryBarExpanded)}
          >
            {getSubscriptionView(subscriptionType, subType, featureFlag)}
          </div>
        </div>
      )}
    </div>
  );
};
