/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import { COS } from '../../../constants';
import { useCosDetail } from '../../../services/use-cos-detail';
import { GeneralInformationForm } from './general-information-form';

export const CosGeneralInformation = () => {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosEntry = cosDetailData?.cos?.[0];
  const cosInformation = [
    ...(cosEntry?.a ?? []),
    ...Object.entries(cosEntry?._attrs ?? {}).map(([n, _content]) => ({ n, _content })),
  ];
  const { data: rights = [] } = useCurrentUserRights();

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return <GeneralInformationForm cosInformation={cosInformation} readonlyCOS={readonlyCOS} />;
};
