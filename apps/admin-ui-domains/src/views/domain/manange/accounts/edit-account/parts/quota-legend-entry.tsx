/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AnyColor, Container, Text } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { humanFileSize } from './size-utils';

type QuotaLegendEntryProps = {
  label: string;
  color: AnyColor;
  used: number;
};

export const QuotaLegendEntry = ({
  label,
  used,
  color,
}: QuotaLegendEntryProps): React.JSX.Element => {
  const [t] = useTranslation();

  return (
    <Container
      height={'fit'}
      key={label}
      orientation="horizontal"
      width="fit"
      gap="0.25rem"
      crossAlignment="center"
      data-testid={'quota-bar-legend-entry'}
    >
      <Container
        background={color}
        width="0.75rem"
        height="0.75rem"
        minWidth="0.75rem"
        minHeight="0.75rem"
        flexShrink={0}
        data-testid="color-indicator"
      />
      <Text size="small">{`${label} (${humanFileSize(used, t)})`}</Text>
    </Container>
  );
};
