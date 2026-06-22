/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import { type AccountType } from '../../types/account';
import { type Attribute } from '../../types/attribute';
import { COS } from '../constants';
import { useCosDetail } from '../services/use-cos-detail';
import { WscCosForm } from './wsc-cos-form';

function buildCosData(cosInformation: Array<Attribute> | undefined): AccountType {
  if (!cosInformation?.length) return {} as AccountType;
  const obj: AccountType = {};
  cosInformation.forEach((item) => {
    obj[item?.n as keyof AccountType] = item._content;
  });
  return obj;
}

export const WscCosSettings = () => {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const { data: rights = [] } = useCurrentUserRights();

  const cosData = buildCosData(cosInformation);

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  if (isPending) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return <WscCosForm cosData={cosData} readonlyCOS={readonlyCOS} />;
};
