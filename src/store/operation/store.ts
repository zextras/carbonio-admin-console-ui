/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware';

type OperationState = {
	alloperationDetail: Array<any>;
	setAlloperationDetail: (alloperationDetail: Array<any>) => void;
	runningData: Array<any>;
	setRunningData: (runningData: Array<any>) => void;
	queuedData: Array<any>;
	setQueuedData: (queuedData: Array<any>) => void;
	doneData: Array<any>;
	setDoneData: (doneData: Array<any>) => void;
};

export const useOperationStore = create<OperationState>(
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
