/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import {
  DONE_ROUTE_ID,
  QUEUED,
  QUEUED_ROUTE_ID,
  RUNNING_ROUTE_ID,
  STARTED,
} from '../../constants';
import { DoneDetailPanel } from './done-detail-panel';
import { OperationStateDetailPanel } from './operation-state-detail-panel';

export type SectionRoute = {
  id: string;
  prefix?: string;
  labelKey: string;
  labelDefault: string;
  Component: ComponentType;
};

export const SECTION_ROUTES: Array<SectionRoute> = [
  {
    id: RUNNING_ROUTE_ID,
    labelKey: 'label.running',
    labelDefault: 'Running',
    Component: () => (
      <OperationStateDetailPanel
        state={STARTED}
        headingKey="operations.running_panel_heading"
        headingDefault="Running Operations"
        stopSuccessI18nKey="label.stop_operation_success"
        stopSuccessDefault="The {{name}} operation has been stopped successfully"
      />
    ),
  },
  {
    id: QUEUED_ROUTE_ID,
    labelKey: 'label.queued',
    labelDefault: 'Queued',
    Component: () => (
      <OperationStateDetailPanel
        state={QUEUED}
        headingKey="operations.queued_panel_heading"
        headingDefault="Queued Operations"
        stopSuccessI18nKey="label.cancel_operation_success"
        stopSuccessDefault="The {{name}} operation has been canceled successfully"
      />
    ),
  },
  {
    id: DONE_ROUTE_ID,
    labelKey: 'label.done',
    labelDefault: 'Done',
    Component: DoneDetailPanel,
  },
];
