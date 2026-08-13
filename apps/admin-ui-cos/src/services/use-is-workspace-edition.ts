/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useParams } from 'react-router';

import { useCosDetail } from './use-cos-detail';

export const useIsWorkspaceEdition = (): boolean => {
  const { cosId } = useParams();
  const { data: cosDetailData } = useCosDetail(cosId);
  const edition = cosDetailData?.cos?.[0]?._attrs?.edition;
  return edition === 'workspace' || edition === '' || edition === undefined;
};
