/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type Operation } from '../../types/operations';

type OperationState = {
	alloperationDetail: Array<Operation>;
	setAlloperationDetail: (alloperationDetail: Array<Operation>) => void;
	runningData: Array<Operation>;
	setRunningData: (runningData: Array<Operation>) => void;
	queuedData: Array<Operation>;
	setQueuedData: (queuedData: Array<Operation>) => void;
	doneData: Array<Operation>;
	setDoneData: (doneData: Array<Operation>) => void;
};

export const useOperationStore = create<OperationState>()(
	devtools((set) => ({
		alloperationDetail: [],
		setAlloperationDetail: (alloperationDetail): void =>
			set({ alloperationDetail }, false, 'setAlloperationDetail'),
		runningData: [],
		setRunningData: (runningData): void => set({ runningData }, false, 'setRunningData'),
		queuedData: [],
		setQueuedData: (queuedData): void => set({ queuedData }, false, 'setQueuedData'),
		doneData: [],
		setDoneData: (doneData): void => set({ doneData }, false, 'setDoneData')
	}))
);
