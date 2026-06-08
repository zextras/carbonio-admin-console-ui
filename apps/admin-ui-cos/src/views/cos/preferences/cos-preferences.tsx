/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import { COS } from '../../../constants';
import { useCosDetail } from '../../../services/use-cos-detail';
import { PreferencesForm } from './preferences-form';

export const COSPreferences = (): React.JSX.Element => {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const { data: rights = [] } = useCurrentUserRights();

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return <PreferencesForm cosInformation={cosInformation} readonlyCOS={readonlyCOS} />;
};
