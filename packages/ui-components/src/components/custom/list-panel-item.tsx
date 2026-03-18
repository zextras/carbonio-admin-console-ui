/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash-es';
import type { FC } from 'react';

import { Button } from '../basic/button/Button';
import { Text } from '../basic/text/Text';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';

type ListPanelItemProps = {
  title: string;
  isListExpanded: boolean;
  setToggleView: () => void;
};

const ListPanelItem: FC<ListPanelItemProps> = ({ title, isListExpanded, setToggleView }) => (
  <>
    <Container
      height={52}
      orientation="vertical"
      mainAlignment="flex-start"
      width="100%"
      style={{ cursor: 'pointer' }}
    >
      <Row padding={{ all: 'small' }} width="100%" mainAlignment="space-between"></Row>
      <Row
        padding={{ all: 'small' }}
        width="100%"
        mainAlignment="space-between"
        onClick={setToggleView}
      >
        <Padding horizontal="small">
          <Text size="small" color="gray0" weight="bold">
            {title}
          </Text>
        </Padding>
        <Padding horizontal="small">
          <Button
            type="ghost"
            color="text"
            icon={isListExpanded ? 'ChevronUpOutline' : 'ChevronDownOutline'}
            size="small"
            onClick={noop}
          />
        </Padding>
      </Row>
    </Container>
    <divider-wc color="gray3"></divider-wc>
  </>
);

export { ListPanelItem, type ListPanelItemProps };
