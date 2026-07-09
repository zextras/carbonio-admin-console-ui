/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Outlet } from 'react-router';

import { DomainDetailPanel } from './domain-detail-panel';

export const DomainOperationsLayout = () => {
  return (
    <DomainDetailPanel>
      <Outlet />
    </DomainDetailPanel>
  );
};
