/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type ListPanelItemProps = {
  title: string;
  isListExpanded: boolean;
  setToggleView: () => void;
};

export function ListPanelItem({
  title,
  isListExpanded,
  setToggleView,
}: Readonly<ListPanelItemProps>) {
  const [t] = useTranslation();
  const ariaLabel = isListExpanded
    ? t('label.collapse', 'Collapse')
    : t('label.expand', 'Expand');

  function handleKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setToggleView();
    }
  }

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
              color={'text'}
              icon={isListExpanded ? 'ChevronUpOutline' : 'ChevronDownOutline'}
              size="small"
              onClick={setToggleView}
              aria-label={ariaLabel}
            />
          </Padding>
        </Row>
      </Container>
      <ds-divider color="gray3"></ds-divider>
    </>
  );
}
