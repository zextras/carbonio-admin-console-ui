/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash-es';
import React from 'react';

import { Button } from '../basic/button/Button';
import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';
import { Row } from '../layout/Row';

type ListPanelItemProps = {
  title: string;
  isListExpanded: boolean;
  setToggleView: () => void;
};

export const ListPanelItem = ({ title, isListExpanded, setToggleView }: ListPanelItemProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setToggleView();
    }
  };

  return (
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
          role="button"
          tabIndex={0}
          aria-expanded={isListExpanded}
          onKeyDown={handleKeyDown}
        >
          <Padding horizontal="small">
            <ds-text as="span" size="small" color="gray0" weight="bold">
              {title}
            </ds-text>
          </Padding>
          <Padding horizontal="small">
            <Button
              type="ghost"
              color="text"
              icon={isListExpanded ? 'ChevronUpOutline' : 'ChevronDownOutline'}
              size="small"
              onClick={noop}
              tabIndex={-1}
              aria-hidden="true"
            />
          </Padding>
        </Row>
      </Container>
      <ds-divider color="gray3"></ds-divider>
    </>
  );
};

export { type ListPanelItemProps };
