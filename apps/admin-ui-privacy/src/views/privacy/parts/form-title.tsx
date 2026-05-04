/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, Padding } from '@zextras/ui-components';

export const SwitchDescription = ({ label }: { label: string }) => (
  <ListRow>
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ left: 'extralarge' }}
    >
      <Padding left="large">
        <ds-text as="span" size="small" weight="regular" color="gray1">
          {label}
        </ds-text>
      </Padding>
    </Container>
  </ListRow>
);
