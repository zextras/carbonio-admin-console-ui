/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  useBreakpoint,
  useLicenseInfo,
  useLocalStorage,
  usePrimaryBarState,
} from '@zextras/ui-shared';
import { type ReactNode, useEffect } from 'react';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import { ActivateSubscription } from './subscription/activate-subscription';
import { MeteredSubscription } from './subscription/metered-subscription';
import { PerpetualSubscription } from './subscription/perpetual-subscription';
import { RegularSubscription } from './subscription/regular-subscription';
import { Subscription } from './subscription/subscription';
import { TrialSubscription } from './subscription/trial-subscription';

const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
} as const;

function getMaxWidth(breakpoint: string, isSidebarOpen = false): string {
  if (['2xl', 'xl'].includes(breakpoint)) return '1125px';
  if (breakpoint === 'lg' && !isSidebarOpen) return '1125px';
  return '981px';
}

function getContainerStyle(breakpoint: string, isSidebarOpen = false) {
  return {
    width: '100%',
    maxWidth: getMaxWidth(breakpoint, isSidebarOpen),
    transition: 'max-width 300ms',
    padding: '0 clamp(0.5rem, 2vw, 2rem)',
    boxSizing: 'border-box' as const,
  };
}

type RouteContainerProps = {
  breakpoint: string;
  isSidebarOpen: boolean;
  children: ReactNode;
};

const RouteContainer = ({ breakpoint, isSidebarOpen, children }: RouteContainerProps) => (
  <div style={{ ...baseStyle, ...getContainerStyle(breakpoint, isSidebarOpen) }}>{children}</div>
);

function getSubscriptionView(
  subscriptionType: string | undefined,
  subType: string | undefined,
  featureFlag: boolean | null,
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
  if (subscriptionType === 'Metered' || subscriptionType === 'ISP') {
    return <MeteredSubscription />;
  }
}

export const AppView = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const breakpoint = useBreakpoint();
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    'new_subscription_feature_flag',
    null,
  );
  const { data: licenseData } = useLicenseInfo();
  const subscriptionType = licenseData?.response?.type;
  const subType = licenseData?.response?.subType;

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  return (
    <div style={{ ...baseStyle, height: 'fit-content', width: '100%' }}>
      <Breadcrumb />
      <RouteContainer breakpoint={breakpoint} isSidebarOpen={isPrimaryBarExpanded}>
        {getSubscriptionView(subscriptionType, subType, featureFlag)}
      </RouteContainer>
    </div>
  );
};
