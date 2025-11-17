/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext } from 'react';

const BoardValueContext = createContext({
	boards: {},
	currentBoard: 0,
	largeView: false,
	minimized: false
});
const BoardSetterContext = createContext({
	addBoard: (url: string, title: unknown, context: unknown) => undefined,
	removeBoard: (key: string) => undefined,
	removeCurrentBoard: () => undefined,
	removeAllBoards: () => undefined,
	updateBoard: (key: string, url: string, title: string) => undefined,
	setCurrentBoard: (key: string) => undefined,
	updateCurrentBoard: (url: string, title: string) => undefined,
	toggleLargeView: () => undefined,
	toggleMinimized: () => undefined
});

export { BoardValueContext, BoardSetterContext };
