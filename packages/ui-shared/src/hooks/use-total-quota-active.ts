/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced } from '../react-query/use-is-advanced-supported';
import { useLoginConfigStore } from '../store/login/store';

export const useTotalQuotaActive = (): boolean => {
	const isAdvanced = useIsAdvanced();
	const isTotalQuotaFeatureFlagEnabled = useLoginConfigStore(
		(state) => state.featureFlags?.totalQuota === true,
	);
	return isAdvanced && isTotalQuotaFeatureFlagEnabled;
};
