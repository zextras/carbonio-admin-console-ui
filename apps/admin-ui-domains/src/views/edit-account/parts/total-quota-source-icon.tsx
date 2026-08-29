/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { QuotaSource } from '../../../services/get-account-quota';

type TotalQuotaSourceIconProps = {
  source: QuotaSource;
};

const QUOTA_SOURCE_META = {
  global: {
    icon: 'GlobeOutline',
    tooltipKey: 'label.quota.source.global',
    tooltipDefault: 'Quota inherited from the global configuration',
  },
  domain: {
    icon: 'AtOutline',
    tooltipKey: 'label.quota.source.domain',
    tooltipDefault: 'Quota inherited from the domain settings',
  },
  cos: {
    icon: 'SettingsModOutline',
    tooltipKey: 'label.quota.source.cos',
    tooltipDefault: 'Quota inherited from the assigned Class of Service',
  },
} as const;

type QuotaSourceMeta = (typeof QUOTA_SOURCE_META)[keyof typeof QUOTA_SOURCE_META];

function getQuotaSourceMeta(source: QuotaSource): QuotaSourceMeta | undefined {
  return source === 'account' ? undefined : QUOTA_SOURCE_META[source];
}

export const TotalQuotaSourceIcon = React.memo(
  ({ source }: TotalQuotaSourceIconProps): React.JSX.Element | null => {
    const { t } = useTranslation();
    const meta = getQuotaSourceMeta(source);

    if (!meta) {
      return null;
    }

    return (
      <Tooltip placement={'top-end'} label={t(meta.tooltipKey, meta.tooltipDefault)}>
        <ds-icon icon={meta.icon} size="large" />
      </Tooltip>
    );
  },
);

TotalQuotaSourceIcon.displayName = 'TotalQuotaSourceIcon';
