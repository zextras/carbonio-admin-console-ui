/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Global configuration store state interface
 */
export interface GlobalConfigState {
	/** The current global configuration */
	globalConfig: any;
	/** List of all global configurations */
	globalConfigList: Array<any>;
	/** Current view identifier for global config pages */
	globalConfigView: string;
	/** Whether Carbonio analytics sending is enabled */
	globalCarbonioSendAnalytics: boolean;

	// Actions
	/** Set the current global configuration */
	setGlobalConfig: (config: any) => void;
	/** Set the list of all global configurations */
	setGlobalConfigList: (configList: Array<any>) => void;
	/** Remove/clear the current global configuration */
	removeGlobalConfig: () => void;
	/** Set the current global config view */
	setGlobalConfigView: (configView: string) => void;
	/** Set whether Carbonio analytics sending is enabled */
	setGlobalCarbonioSendAnalytics: (globalCarbonioSendAnalytics: boolean) => void;
}

/**
 * Zustand store for managing global configuration state across admin UI applications
 * 
 * This store manages:
 * - Global configuration settings
 * - Configuration lists
 * - UI state (views)
 * - Analytics preferences
 * 
 * @example
 * ```tsx
 * import { useGlobalConfigStore } from '@zextras/admin-ui-bootstrap';
 * 
 * function MyComponent() {
 *   const globalConfig = useGlobalConfigStore((state) => state.globalConfig);
 *   const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
 *   
 *   return <div>{globalConfig.name}</div>;
 * }
 * ```
 */
export const useGlobalConfigStore = create<GlobalConfigState>()(
	devtools(
		(set) => ({
			globalConfig: {},
			globalConfigList: [],
			globalConfigView: '',
			globalCarbonioSendAnalytics: false,

			setGlobalConfig: (globalConfig): void => 
				set({ globalConfig }, false, 'setGlobalConfig'),
			
			setGlobalConfigList: (globalConfigList): void =>
				set({ globalConfigList }, false, 'setGlobalConfigList'),
			
			removeGlobalConfig: (): void =>
				set(
					produce((state) => {
						state.globalConfig = {};
					}),
					false,
					'removeGlobalConfig'
				),
			
			setGlobalConfigView: (globalConfigView): void =>
				set(
					produce((state) => {
						state.globalConfigView = globalConfigView;
					}),
					false,
					'setGlobalConfigView'
				),
			
			setGlobalCarbonioSendAnalytics: (globalCarbonioSendAnalytics): void =>
				set({ globalCarbonioSendAnalytics }, false, 'setGlobalCarbonioSendAnalytics')
		}),
		{ name: 'GlobalConfigStore' }
	)
);
