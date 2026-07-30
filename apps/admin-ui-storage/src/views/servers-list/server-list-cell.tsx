/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row } from '@zextras/ui-components';
import { type ReactNode } from 'react';

const nameCellStyle = {
  textAlign: 'left',
  justifyContent: 'flex-start',
} as const;

const detailCellStyle = {
  textAlign: 'left',
  justifyContent: 'flex-start',
  textTransform: 'capitalize',
} as const;

export const ServerListCell = ({ children, name }: { children: ReactNode; name?: boolean }) => (
  <Row style={name ? nameCellStyle : detailCellStyle}>
    <ds-text as="span" size="small" weight={name ? 'regular' : 'light'}>
      {children}
    </ds-text>
  </Row>
);
