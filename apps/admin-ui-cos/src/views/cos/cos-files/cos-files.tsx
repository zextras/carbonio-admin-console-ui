/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useParams } from 'react-router';

import { SHARES_ENABLED } from '../../../constants';
import { useCosDetail } from '../../../services/use-cos-detail';
import { useFilesConfigRaw } from '../../../services/use-files-config-raw';
import { FilesSharingForm } from './files-sharing-form';

export function CosFiles() {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const zimbraId = cosInformation?.find((attribute) => attribute.n === 'zimbraId')?._content;

  const { data: rawData, isPending: isRawPending } = useFilesConfigRaw('cos', zimbraId, !!zimbraId);

  if (isPending || (!!zimbraId && isRawPending)) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <FilesSharingForm zimbraId={zimbraId} initialOverride={rawData?.overrides?.[SHARES_ENABLED]} />
  );
}
