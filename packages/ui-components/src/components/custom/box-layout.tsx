/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from 'react';

import { Container } from '../layout/Container';

type BoxLayoutProps = {
  title: string;
  description: string;
  disabled?: boolean;
  children: ReactNode | ReactNode[];
};

export const BoxLayout = ({ title, description, disabled = false, children }: BoxLayoutProps) => (
  <Container orientation="vertical" height="fit" gap="1rem">
    <Container orientation="vertical" height="fit" crossAlignment="flex-start" gap="0.5rem">
      <ds-text as="h3" weight="bold" overflow="break-word" disabled={disabled}>
        {title}
      </ds-text>
      <ds-text as="p" size="small" overflow="break-word" disabled={disabled}>
        {description}
      </ds-text>
    </Container>
    <Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit" gap="1rem">
      {children}
    </Container>
  </Container>
);
