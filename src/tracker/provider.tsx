/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import type { PostHogConfig } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

import { TrackerPageView } from './page-view';
import { PH_API_HOST, PH_PROJECT_API_KEY, TRUE } from '../constants';
import { useAdvanceStore } from '../store/advanced/store';
import { useConfigurationAttribute } from '../store/config/store';

export const TrackerProvider = ({
	children
}: React.PropsWithChildren<Record<never, never>>): React.JSX.Element => {
	const feedbackPermission = useConfigurationAttribute('carbonioAllowFeedback') === TRUE;
	const { isAdvanced } = useAdvanceStore();
	const showPostHogSurveys = useMemo(
		() => !isAdvanced && feedbackPermission,
		[isAdvanced, feedbackPermission]
	);
	const options = useMemo(
		(): Partial<PostHogConfig> => ({
			api_host: PH_API_HOST,
			person_profiles: 'identified_only',
			opt_out_capturing_by_default: false,
			disable_session_recording: true,
			mask_all_text: true,
			disable_surveys: showPostHogSurveys,
			autocapture: false
		}),
		[showPostHogSurveys]
	);
	const carbonioSendAnalyticsEnabled = useConfigurationAttribute('carbonioSendAnalytics') === TRUE;
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
