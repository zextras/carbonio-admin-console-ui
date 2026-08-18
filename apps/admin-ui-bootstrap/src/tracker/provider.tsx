/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PostHogProvider } from '@posthog/react';
import { useAllConfig, useIsAdvanced } from '@zextras/ui-shared';
import type { PostHogConfig } from 'posthog-js';
import React from 'react';

import { TrackerPageView } from './page-view';

const PH_API_HOST = 'https://stats.zextras.tools';
const PH_PROJECT_API_KEY = 'phc_fMgU1UPSHulWuJCHXbrjyqoEoXwcb7rZJy69HdD7x2h';

export const TrackerProvider = ({
  children,
}: React.PropsWithChildren<Record<never, never>>): React.JSX.Element => {
  const { data: config, isLoading } = useAllConfig();

  const carbonioSendAnalyticsEnabled =
    config?.find((cf) => cf.n === 'carbonioSendAnalytics')?._content === 'TRUE';

  const feedbackPermission =
    config?.find((cf) => cf.n === 'carbonioAllowFeedback')?._content === 'TRUE';

  const isAdvanced = useIsAdvanced();

  const showPostHogSurveys = !isAdvanced && feedbackPermission;

  const options: Partial<PostHogConfig> = {
    api_host: PH_API_HOST,
    person_profiles: 'identified_only',
    opt_out_capturing_by_default: false,
    disable_session_recording: true,
    mask_all_text: true,
    disable_surveys: !showPostHogSurveys,
    autocapture: false,
  };

  if (isLoading) {
    return <>{children}</>;
  }

  if (carbonioSendAnalyticsEnabled) {
    return (
      <PostHogProvider apiKey={PH_PROJECT_API_KEY} options={options}>
        {children}
        <TrackerPageView />
      </PostHogProvider>
    );
  }

  return <>{children}</>;
};
