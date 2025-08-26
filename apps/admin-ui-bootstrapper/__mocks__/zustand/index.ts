/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from '@testing-library/react';
import { noop } from 'lodash';
import { create as actualCreate, StateCreator, StoreApi, UseBoundStore } from 'zustand';

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set();
const extension = {
	subscribe: jest.fn(() => (): void => noop()),
	unsubscribe: jest.fn(),
	send: jest.fn(),
	init: jest.fn(),
	error: jest.fn()
};
const extensionConnector = { connect: jest.fn(() => extension) };
(window as any).__REDUX_DEVTOOLS_EXTENSION__ = extensionConnector;

const createInternalFn = <S>(createState: StateCreator<S>): UseBoundStore<StoreApi<S>> => {
	const store = actualCreate(createState);
	const initialState = store.getState();
	storeResetFns.add(() => store.setState(initialState, true));
	return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
// See: https://github.com/pmndrs/zustand/issues/905
const create = <S>(createState: StateCreator<S>): UseBoundStore<StoreApi<S>> =>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	typeof createState === 'function' ? createInternalFn(createState) : createInternalFn;

// Reset all stores after each test run
afterEach(() => {
	act(() => storeResetFns.forEach((resetFn: any) => resetFn()));
});

export { create };
