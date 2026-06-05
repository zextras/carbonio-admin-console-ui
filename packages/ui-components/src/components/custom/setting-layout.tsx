/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import { Container } from '../layout/Container';
import { Padding } from '../layout/Padding';

type SettingLayoutProps = {
  description: string;
  children: ReactNode;
  descriptionGap?: boolean;
};

export const SettingLayout = ({ description, children, descriptionGap }: SettingLayoutProps) => (
  <Container crossAlignment="flex-start">
    {children}
    {descriptionGap && <Padding top="small" />}
    <Container height="fit" crossAlignment="flex-start">
      <ds-text as="p" weight="light" color="gray1" size="small" overflow="break-word">
        {description}
      </ds-text>
    </Container>
  </Container>
);
