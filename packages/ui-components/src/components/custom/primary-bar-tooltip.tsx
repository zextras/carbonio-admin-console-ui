/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC } from 'react';

import { Text } from '../basic/text/Text';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';

type PrimaryBarTooltipItem = {
  header: string | React.ReactNode;
  options: Array<{ label: string }>;
};

type PrimaryBarTooltipProps = {
  items: Array<PrimaryBarTooltipItem>;
};

export const PrimaryBarTooltip: FC<PrimaryBarTooltipProps> = ({ items }) => (
  <Container
    orientation="horizontal"
    mainAlignment="flex-start"
    background="gray3"
    height="fit"
    maxWidth="22.063rem"
    crossAlignment="flex-start"
  >
    <Padding left="small" right="small">
      {items.map((item, index) => (
        <Padding bottom="small" key={index} all="small">
          <Text size="medium" color="text" weight="regular" style={{ whiteSpace: 'break-spaces' }}>
            {item.header}
          </Text>
          {item.options.map((v) => (
            <Text size="extrasmall" color="text" key={v.label}>
              {v.label}
            </Text>
          ))}
        </Padding>
      ))}
    </Padding>
  </Container>
);
