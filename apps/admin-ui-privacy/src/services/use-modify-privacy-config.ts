/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useModifyConfig } from '@zextras/ui-shared';

import { modifyPrivacyConfig, type ModifyPrivacyConfigInput } from './modify-privacy-config';

export function useModifyPrivacyConfig() {
  return useModifyConfig<ModifyPrivacyConfigInput>(modifyPrivacyConfig);
}
