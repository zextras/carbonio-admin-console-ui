/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AnyColor, Container } from '@zextras/ui-components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { QuotaLegendEntry } from './quota-legend-entry';
import { getExactPercentage } from './size-utils';

export interface QuotaBarEntry {
  label: string;
  color: AnyColor;
  used: number;
}

interface QuotaProps {
  modules: QuotaBarEntry[];
  limit: number;
  background?: AnyColor;
  height?: string;
  used: number;
}

function computeFills(modules: QuotaBarEntry[], total: number): number[] {
  return modules.map((m) => getExactPercentage(m.used, total));
}

export const QuotaBar = ({
  modules,
  background = 'gray3',
  height = '0.5rem',
  limit,
  used,
}: QuotaProps): React.JSX.Element => {
  const fills = useMemo(() => computeFills(modules, Math.max(limit, used)), [modules, limit, used]);

  const [t] = useTranslation();

  const availableSpace = useMemo(() => Math.max(limit - used, 0), [limit, used]);

  return (
    <Container gap="1rem" crossAlignment="flex-start">
      <Container
        style={{ overflow: 'hidden' }}
        background={background}
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        orientation="horizontal"
        height={height}
        minHeight={height}
        width="100%"
        data-testid={'quota-bar'}
      >
        {modules.map((module, index) => (
          <Container
            key={module.label}
            background={module.color}
            width={`${Math.min(fills[index] ?? 0, 100)}%`}
            height="100%"
            flexShrink={0}
            borderRadius="none"
          />
        ))}
      </Container>
      <Container orientation="horizontal" mainAlignment="flex-start" gap="1rem" wrap="wrap">
        {modules.map((module) => (
          <QuotaLegendEntry
            key={module.label}
            label={module.label}
            used={module.used}
            color={module.color}
          />
        ))}
        <QuotaLegendEntry
          label={t('quota.available', 'Available')}
          used={availableSpace}
          color="gray3"
        />
      </Container>
    </Container>
  );
};
