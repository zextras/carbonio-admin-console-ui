/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';

import { VolumesDetailPanel } from './server-specifics/volume/volumes-list';

export function VolumesDetailRoute() {
  return (
    <Container style={{ transition: 'max-width 300ms' }}>
      <VolumesDetailPanel />
    </Container>
  );
}
