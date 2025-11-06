/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Server } from './types';

/**
 * Server store state interface
 */
export interface ServerState {
	/** The currently selected server */
	server: Server;
	/** List of all servers */
	serverList: Array<Server>;
	/** Current view identifier for server pages */
	serverView: string;
	/** List of MTA servers */
	mtaServerList: Array<Server>;

	// Actions
	/** Set the current server */
	setServer: (server: Server) => void;
	/** Set the list of all servers */
	setServerList: (serverList: Array<Server>) => void;
	/** Remove/clear the current server */
	removeServer: () => void;
	/** Set the current server view */
	setServerView: (serverView: string) => void;
	/** Set the list of MTA servers */
	setMtaServerList: (mtaServerList: Array<Server>) => void;
}

/**
 * Zustand store for managing server-related state across admin UI applications
 * 
 * This store manages:
 * - Current server selection
 * - Server lists (all servers and MTA servers)
 * - UI state (views)
 * 
 * @example
 * ```tsx
 * import { useServerStore } from '@zextras/admin-ui-bootstrap';
 * 
 * function MyComponent() {
 *   const server = useServerStore((state) => state.server);
 *   const setServer = useServerStore((state) => state.setServer);
 *   
 *   return <div>{server.name}</div>;
 * }
 * ```
 */
export const useServerStore = create<ServerState>()(
	devtools(
		(set) => ({
			server: {},
			serverList: [],
			serverView: '',
			mtaServerList: [],

			setServer: (server): void => set({ server }, false, 'setServer'),
			
			setServerList: (serverList): void => set({ serverList }, false, 'setServerList'),
			
			removeServer: (): void =>
				set(
					produce((state) => {
						state.server = {};
					}),
					false,
					'removeServer'
				),
			
			setServerView: (serverView): void =>
				set(
					produce((state) => {
						state.serverView = serverView;
					}),
					false,
					'setServerView'
				),
			
			setMtaServerList: (mtaServerList): void => 
				set({ mtaServerList }, false, 'setMtaServerList')
		}),
		{ name: 'ServerStore' }
	)
);
