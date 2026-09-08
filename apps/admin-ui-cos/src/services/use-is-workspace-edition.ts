/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCosDetail } from './use-cos-detail';

export const useIsWorkspaceEdition = (cosId: string | undefined): boolean => {
  const { data: cosDetailData } = useCosDetail(cosId);
  return cosDetailData?.cos?.[0]?._attrs?.edition === 'workspace';
};
