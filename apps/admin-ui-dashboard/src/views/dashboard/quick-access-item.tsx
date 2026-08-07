/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, IconName, ListRow } from '@zextras/ui-components';

export type QuickAccessItemData = {
  upperText: string;
  operationText: string;
  bottomText: string;
  operationIcon: IconName;
  bottomIcon: IconName;
  bgColor: string;
  operation: string;
};

type QuickAccessItemProps = {
  item: QuickAccessItemData;
  onOpen: (operation: string) => void;
};

export const QuickAccessItem = ({ item, onOpen }: QuickAccessItemProps) => (
  <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ left: 'extralarge' }}>
    <Container
      height={'8.75rem'}
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      width={'21.75rem'}
      style={{ borderRadius: '0.5rem', background: `var(--color-${item.bgColor})` }}
    >
      <ListRow>
        <Container padding={{ all: 'large' }}>
          <Container mainAlignment="flex-start" crossAlignment="flex-start">
            <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
              {item.upperText}
            </ds-text>
          </Container>
          <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
            <ds-text as="strong" color="gray6" overflow="break-word" weight="bold" size="large">
              {item.operationText}
            </ds-text>
          </Container>
        </Container>
        <Container crossAlignment="flex-end" padding={{ right: 'large' }}>
          <ds-icon color="gray6" icon={item.operationIcon} size="large" />
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ left: 'large', right: 'large' }}>
          <ds-divider />
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="space-between"
          crossAlignment="center"
          width="fill"
          padding={{ all: 'large' }}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onClick={() => onOpen(item.operation)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen(item.operation);
            }
          }}
        >
          <ds-text as="span" color="gray6" overflow="break-word" weight="light" size="medium">
            {item.bottomText}
          </ds-text>
          <ds-icon color="gray6" icon={item.bottomIcon} size="medium" />
        </Container>
      </ListRow>
    </Container>
  </Container>
);
