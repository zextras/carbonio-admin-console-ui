/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLoginConfigStore } from '../store/login/store';

export const useTotalQuotaActive = (): boolean =>
	useLoginConfigStore((state) => state.featureFlags?.totalQuota === true);
