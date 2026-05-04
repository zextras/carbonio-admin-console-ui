/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { type FC, type ReactNode } from 'react';

import { PaddingVarObj } from '../../../theme/theme-utils';
import { Container } from '../Container';
import { SectionFooter } from './SectionFooter';
import { SectionHeader } from './SectionHeader';

export type SectionProps = {
  children: ReactNode;
  title: string;
  divider: boolean;
  footer?: ReactNode;
  padding?: PaddingVarObj | string | 0;
  showClose?: boolean;
  onClose: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
};

export const Section: FC<SectionProps> = ({
  children,
  title,
  divider,
  footer,
  padding = { all: 'large' },
  showClose,
  onClose,
}) => (
  <Container background="gray6">
    <SectionHeader title={title} divider={divider} showClose={showClose} onClose={onClose} />
    <Container mainAlignment="flex-start" padding={padding} style={{ overflowY: 'auto' }}>
      {children}
    </Container>
    {footer && <SectionFooter divider={divider} footer={footer} />}
  </Container>
);
