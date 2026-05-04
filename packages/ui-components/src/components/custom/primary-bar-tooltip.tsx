/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ReactNode } from 'react';

import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';

interface PrimaryBarTooltipProps {
  children: ReactNode;
}

export const PrimaryBarTooltip = ({ children }: PrimaryBarTooltipProps) => (
  <Container
    orientation="horizontal"
    mainAlignment="flex-start"
    background="gray3"
    height="fit"
    maxWidth="22.063rem"
    crossAlignment="flex-start"
  >
    <Padding left="small" right="small">
      <Padding bottom="small" all="small">
        <ds-text as="span" size="medium" color="text" weight="regular" overflow="break-word" style={{ whiteSpace: 'break-spaces' }}>
          {children}
        </ds-text>
      </Padding>
    </Padding>
  </Container>
);
