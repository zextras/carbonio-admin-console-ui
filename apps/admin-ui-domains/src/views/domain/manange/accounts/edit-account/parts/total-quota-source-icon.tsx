/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/ui-components';
import { useMemo } from 'react';

import type { QuotaSource } from '../../../../../../services/get-account-quota';

type TotalQuotaSourceIconProps = {
  source?: QuotaSource;
};

export const TotalQuotaSourceIcon = ({
  source,
}: TotalQuotaSourceIconProps): React.JSX.Element | null => {
  const icon = useMemo(() => {
    if (source === 'global') {
      return 'GlobeOutline';
    }

    if (source === 'domain') {
      return 'AtOutline';
    }

    if (source === 'cos') {
      return 'SettingsModOutline';
    }

    return undefined;
  }, [source]);

  const tooltipLabel = useMemo(() => {
    if (source === 'global') {
      return 'Quota inherited from the global configuration';
    }

    if (source === 'domain') {
      return 'Quota inherited from the domain settings.';
    }

    if (source === 'cos') {
      return 'Quota inherited from the assigned Class of Service';
    }

    return undefined;
  }, [source]);

  if (!icon || !tooltipLabel) {
    return null;
  }

  return (
    <Tooltip placement={'top-end'} label={tooltipLabel}>
      <icon-wc icon={icon} size="large"></icon-wc>
    </Tooltip>
  );
};
