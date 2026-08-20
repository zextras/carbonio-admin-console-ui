/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Tooltip } from '@zextras/ui-components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ComputedLimit } from '../../../../../services/get-account-quota';
import { QuotaBarEntry } from '../quota-bar';
import { QuotaLegendEntry } from '../quota-legend-entry';
import { getExactPercentage, humanFileSize } from '../size-utils';

export const useQuotaElements = (
  modules: QuotaBarEntry[],
  limit: ComputedLimit,
  used: number,
): {
  quotaLegendEntryNodes: React.ReactNode[];
  quotaBarSegmentsNodes: React.ReactNode[];
} => {
  const [t] = useTranslation();

  const quotaBarSegmentsNodes = modules.map((module) => (
    <Tooltip key={module.label} label={`${module.label} (${humanFileSize(module.used, t)})`}>
      <Container
        key={module.label}
        background={module.color}
        width={`${getExactPercentage(
          module.used,
          limit.type === 'limited' ? Math.max(limit.value, used) : used,
        )}%`}
        height="100%"
        flexShrink={0}
        borderRadius="none"
        data-testid={'quota-bar-module-segment'}
      />
    </Tooltip>
  ));

  const quotaLegendEntryNodes = modules.map((module) => (
    <QuotaLegendEntry
      key={module.label}
      label={module.label}
      used={module.used}
      color={module.color}
    />
  ));

  if (limit.type === 'limited') {
    quotaLegendEntryNodes.push(
      <QuotaLegendEntry
        key="available"
        label={t('quota.available', 'Available')}
        used={Math.max(limit.value - used, 0)}
        color="gray3"
      />,
    );
  }

  return useMemo(
    () => ({
      quotaBarSegmentsNodes,
      quotaLegendEntryNodes,
    }),
    [quotaBarSegmentsNodes, quotaLegendEntryNodes],
  );
};
