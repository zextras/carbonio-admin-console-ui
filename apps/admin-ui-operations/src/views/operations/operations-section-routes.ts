/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../../constants';
import DoneDetailPanel from './done-detail-panel';
import QueuedDetailPanel from './queued-detail-panel';
import RunningDetailPanel from './running-detail-panel';

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
		Component: RunningDetailPanel,
	},
	{
		id: QUEUED_ROUTE_ID,
		labelKey: 'label.queued',
		labelDefault: 'Queued',
		Component: QueuedDetailPanel,
	},
	{
		id: DONE_ROUTE_ID,
		labelKey: 'label.done',
		labelDefault: 'Done',
		Component: DoneDetailPanel,
	},
];
