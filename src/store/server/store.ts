/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import produce from 'immer';
import { devtools } from 'zustand/middleware';
import { Server } from '../../../types';
import { DOMAIN_DETAIL_VIEW, SERVER_DETAIL_VIEW } from '../../constants';

type ServerState = {
	server: Server;
	serverList: Array<Server>;
	serverView: string;
	setServer: (server: Server) => void;
	setServerList: (serverList: Array<Server>) => void;
	removeServer: () => void;
	setServerView: (serverView: string) => void;
};

export const useServerStore = create<ServerState>(
	devtools((set) => ({
		server: {},
		serverList: [],
		serverView: SERVER_DETAIL_VIEW,
		setServer: (server): void => set({ server }, false, 'setServer'),
		setServerList: (serverList): void => set({ serverList }, false, 'setServerList'),
		removeServer: (): void =>
			set(
				produce((state) => {
					state.server = {};
				})
			),
		setServerView: (serverView): void =>
			set(
				produce((state) => {
					state.serverView = serverView;
				}),
				false,
				'setServerView'
			)
	}))
);
