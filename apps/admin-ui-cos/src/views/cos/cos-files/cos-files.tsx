/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import { COS, SHARES_ENABLED } from '../../../constants';
import { useCosDetail } from '../../../services/use-cos-detail';
import { useFilesConfigDefaults } from '../../../services/use-files-config-defaults';
import { useFilesConfigRaw } from '../../../services/use-files-config-raw';
import { FilesSharingForm } from './files-sharing-form';

export function CosFiles() {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const zimbraId = cosInformation?.find((attribute) => attribute.n === 'zimbraId')?._content;
  const { data: rights = [] } = useCurrentUserRights();

  const { data: rawData, isPending: isRawPending } = useFilesConfigRaw('cos', zimbraId, !!zimbraId);
  const { data: defaultsData, isPending: isDefaultsPending } = useFilesConfigDefaults();

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  if (isPending || (!!zimbraId && isRawPending) || isDefaultsPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <FilesSharingForm
      zimbraId={zimbraId}
      initialOverride={rawData?.overrides?.[SHARES_ENABLED]}
      baseline={defaultsData?.defaults?.[SHARES_ENABLED]}
      readonlyCOS={readonlyCOS}
    />
  );
}
