/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AnyColor, Container } from '@zextras/ui-components';
import React from 'react';

import { ComputedLimit } from '../../../../services/get-account-quota';
import { useQuotaElements } from './hooks/useQuotaElements';

export interface QuotaBarEntry {
  label: string;
  color: AnyColor;
  used: number;
}

interface QuotaProps {
  modules: QuotaBarEntry[];
  limit: ComputedLimit;
  background?: AnyColor;
  used: number;
}

export const QuotaBar = ({
  modules,
  limit,
  used,
  background = 'gray3',
}: QuotaProps): React.JSX.Element => {
  const { quotaBarSegmentsNodes, quotaLegendEntryNodes } = useQuotaElements(modules, limit, used);

  return (
    <Container gap="1rem" crossAlignment="flex-start">
      <Container
        style={{ overflow: 'hidden' }}
        background={background}
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        orientation="horizontal"
        height={'0.5rem'}
        minHeight={'0.5rem'}
        width="100%"
        data-testid={'quota-bar'}
      >
        {quotaBarSegmentsNodes}
      </Container>
      <Container orientation="horizontal" mainAlignment="flex-start" gap="1rem" wrap="wrap">
        {quotaLegendEntryNodes}
      </Container>
    </Container>
  );
};
