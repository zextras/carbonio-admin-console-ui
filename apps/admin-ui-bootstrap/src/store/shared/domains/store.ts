/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Cos, Domain } from './types';

/**
 * Domain store state interface
 */
interface DomainState {
	/** The currently selected domain with full configuration */
	domain: Domain;
	/** The currently selected domain without configuration */
	domainWithoutConfig: Domain;
	/** List of available Classes of Service */
	cosList: Array<Cos>;
	/** Current view identifier for domain pages */
	domainView: string;
	/** List of all domains */
	domainList: Array<Domain>;
	/** Whether the current domain supports delegated admin */
	isDomainSupportDelegatedAdmin: boolean;
	/** Domain name for which the banner was closed */
	closeDomainBanner: string;
	/** Whether quick access mode is enabled */
	isQuickAccess: boolean;
	/** Whether certificate is available for the domain */
	isCertificateAvailbale: boolean;

	// Actions
	/** Set the current domain with full configuration */
	setDomain: (domain: Domain) => void;
	/** Set the current domain without configuration */
	setDomainWioutConfig: (domain: Domain) => void;
	/** Set the list of Classes of Service */
	setCosList: (cosList: Array<Cos>) => void;
	/** Set the list of all domains */
	setDomainList: (domainList: Array<Domain>) => void;
	/** Remove/clear the current domain */
	removeDomain: () => void;
	/** Set the current domain view */
	setDomainView: (domainView: string) => void;
	/** Set whether the domain supports delegated admin */
	setIsDomainSupportDelegatedAdmin: (isDomainSupportDelegatedAdmin: boolean) => void;
	/** Set the domain name for which banner was closed */
	setCloseDomainBanner: (domainName: string) => void;
	/** Set quick access mode */
	setIsQuickAccess: (isQuickAccess: boolean) => void;
	/** Set certificate availability */
	setIsCertificateAvailbale: (isCertificateAvailbale: boolean) => void;
}

/**
 * Zustand store for managing domain-related state across admin UI applications
 *
 * This store manages:
 * - Current domain selection (with and without config)
 * - Domain lists and Classes of Service
 * - UI state (views, quick access, banners)
 * - Domain capabilities (delegated admin, certificates)
 *
 * @example
 * ```tsx
 * import { useDomainStore } from '@zextras/admin-ui-domain-store';
 *
 * function MyComponent() {
 *   const domain = useDomainStore((state) => state.domain);
 *   const setDomain = useDomainStore((state) => state.setDomain);
 *
 *   return <div>{domain.name}</div>;
 * }
 * ```
 */
export const useDomainStore = create<DomainState>()(
	devtools(
		(set) => ({
			domain: {},
			domainWithoutConfig: {},
			cosList: [],
			domainView: '',
			domainList: [],
			isDomainSupportDelegatedAdmin: false,
			closeDomainBanner: '',
			isQuickAccess: false,
			isCertificateAvailbale: false,

			setDomain: (domain): void => set({ domain }, false, 'setDomain'),

			setDomainWioutConfig: (domainWithoutConfig): void =>
				set({ domainWithoutConfig }, false, 'setDomainWioutConfig'),

			setDomainList: (domainList): void => set({ domainList }, false, 'setDomainList'),

			setCosList: (cosList): void => set({ cosList }, false, 'setCosList'),

			removeDomain: (): void =>
				set(
					produce((state) => {
						state.domain = {};
					}),
					false,
					'removeDomain'
				),

			setDomainView: (domainView): void =>
				set(
					produce((state) => {
						state.domainView = domainView;
					}),
					false,
					'setDomainView'
				),

			setIsDomainSupportDelegatedAdmin: (isDomainSupportDelegatedAdmin): void =>
				set({ isDomainSupportDelegatedAdmin }, false, 'setIsDomainSupportDelegatedAdmin'),

			setCloseDomainBanner: (domainName): void =>
				set(
					produce((state) => {
						state.closeDomainBanner = domainName;
					}),
					false,
					'setCloseDomainBanner'
				),

			setIsQuickAccess: (isQuickAccess): void => set({ isQuickAccess }, false, 'setIsQuickAccess'),

			setIsCertificateAvailbale: (isCertificateAvailbale): void =>
				set({ isCertificateAvailbale }, false, 'setIsCertificateAvailbale')
		}),
		{ name: 'DomainStore' }
	)
);
