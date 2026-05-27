/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCurrentUserRights, useIsAdvanced, useTotalQuotaActive } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useParams } from 'react-router';

import { AccountType } from '../../../types/account';
import { Attribute } from '../../../types/attribute';
import { BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED, COS } from '../../constants';
import { useCoreAttributes } from '../../services/use-core-attributes';
import { useCosDetail } from '../../services/use-cos-detail';
import { useCosQuota } from '../../services/use-cos-quota';
import { CosAdvancedForm } from './cos-advanced-form';

const COS_ADVANCED_FIELD_DEFAULTS: Array<[keyof AccountType, string]> = [
  ['zimbraMailForwardingAddressMaxLength', ''],
  ['zimbraMailForwardingAddressMaxNumAddrs', ''],
  ['zimbraMailQuota', ''],
  ['zimbraContactMaxNumEntries', ''],
  ['zimbraQuotaWarnPercent', ''],
  ['zimbraQuotaWarnInterval', ''],
  ['zimbraQuotaWarnMessage', ''],
  ['zimbraPasswordLocked', 'FALSE'],
  ['zimbraPasswordMinLength', ''],
  ['zimbraPasswordMaxLength', ''],
  ['zimbraPasswordMinUpperCaseChars', ''],
  ['zimbraPasswordMinLowerCaseChars', ''],
  ['zimbraPasswordMinPunctuationChars', ''],
  ['zimbraPasswordMinNumericChars', ''],
  ['zimbraPasswordMinDigitsOrPuncs', ''],
  ['zimbraPasswordMinAge', ''],
  ['zimbraPasswordMaxAge', ''],
  ['zimbraPasswordEnforceHistory', ''],
  ['zimbraPasswordBlockCommonEnabled', 'FALSE'],
  ['zimbraPasswordLockoutEnabled', 'FALSE'],
  ['zimbraPasswordLockoutMaxFailures', ''],
  ['zimbraPasswordLockoutDuration', ''],
  ['zimbraPasswordLockoutFailureLifetime', ''],
  ['zimbraAdminAuthTokenLifetime', ''],
  ['zimbraAuthTokenLifetime', ''],
  ['zimbraMailIdleSessionTimeout', ''],
  ['zimbraMailMessageLifetime', ''],
  ['zimbraMailTrashLifetime', ''],
  ['zimbraMailSpamLifetime', ''],
  ['zimbraFreebusyExchangeUserOrg', ''],
];

function buildCosData(cosInformation: Array<Attribute> | undefined): AccountType {
  if (!cosInformation?.length) return {} as AccountType;
  const obj: AccountType = {};
  cosInformation.forEach((item) => {
    obj[item?.n as keyof AccountType] = item._content;
  });
  COS_ADVANCED_FIELD_DEFAULTS.forEach(([key, defaultVal]) => {
    if (!obj[key]) obj[key] = defaultVal;
  });
  return obj;
}

export const CosAdvanced = () => {
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const cosName = cosDetailData?.cos?.[0]?.name;
  const { data: rights = [] } = useCurrentUserRights();
  const isAdvanced = useIsAdvanced();
  const isTotalQuotaActive = useTotalQuotaActive();
  const cosData = buildCosData(cosInformation);

  const { data: cosQuotaData, isPending: isCosQuotaPending } = useCosQuota(
    cosData?.zimbraId,
    !!cosData?.zimbraId && isAdvanced && isTotalQuotaActive,
  );

  const coreAttributesBody =
    isAdvanced && cosName
      ? [
          {
            configType: COS,
            configName: [cosName],
            attrName: [BACKUP_SELF_UNDELETE_ALLOWED, BACKUP_ENABLED],
          },
        ]
      : [];

  const { data: coreAttributesData, isPending: isCoreAttributesPending } =
    useCoreAttributes(coreAttributesBody);

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isQuotaLoading = isTotalQuotaActive && isCosQuotaPending;
  const isBackupLoading = isAdvanced && isCoreAttributesPending;

  if (isPending || isQuotaLoading || isBackupLoading) {
    return <ds-page-shimmer></ds-page-shimmer>;
  }

  return (
    <CosAdvancedForm
      cosData={cosData}
      cosName={cosName}
      cosQuotaData={cosQuotaData}
      coreAttributesData={coreAttributesData}
      readonlyCOS={readonlyCOS}
      isAdvanced={isAdvanced}
      isTotalQuotaActive={isTotalQuotaActive}
    />
  );
};
