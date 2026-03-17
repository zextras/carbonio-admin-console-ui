/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { QuotaSource } from '../../../../../../services/get-account-quota';

type TotalQuotaSourceIconProps = {
  source: QuotaSource;
};

export const TotalQuotaSourceIcon = React.memo(
  ({ source }: TotalQuotaSourceIconProps): React.JSX.Element | null => {
    const { t } = useTranslation();
    const icon =
      source === 'global'
        ? 'GlobeOutline'
        : source === 'domain'
        ? 'AtOutline'
        : source === 'cos'
        ? 'SettingsModOutline'
        : undefined;

    const tooltipLabel =
      source === 'global'
        ? t('label.quota.source.global', 'Quota inherited from the global configuration')
        : source === 'domain'
        ? t('label.quota.source.domain', 'Quota inherited from the domain settings.')
        : source === 'cos'
        ? t('label.quota.source.cos', 'Quota inherited from the assigned Class of Service')
        : undefined;

    if (!icon || !tooltipLabel) {
      return null;
    }

    return (
      <Tooltip placement={'top-end'} label={tooltipLabel}>
        <icon-wc icon={icon} size="large" />
      </Tooltip>
    );
  },
);

TotalQuotaSourceIcon.displayName = 'TotalQuotaSourceIcon';
