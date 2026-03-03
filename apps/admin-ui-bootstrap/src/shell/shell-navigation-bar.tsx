/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import type { AppRoute } from '@zextras/ui-shared';

import ShellPrimaryBar from './shell-primary-bar';

export default function ShellNavigationBar({ activeRoute }: { activeRoute: AppRoute | undefined }) {
  return (
    <Container
      orientation="horizontal"
      background="gray5"
      width="fit"
      height="fill"
      mainAlignment="flex-start"
      crossAlignment="flex-start"
    >
      <ShellPrimaryBar activeRoute={activeRoute} />
    </Container>
  );
}
