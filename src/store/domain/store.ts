/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';
import { produce } from 'immer';
import { devtools } from 'zustand/middleware';
import { Cos, Domain } from '../../../types';
import { DOMAINS_ROUTE_ID, GLOBAL_ROUTE } from '../../constants';

type DomainState = {
	domain: Domain;
	cosList: Array<Cos>;
	domainView: string;
	setDomain: (domain: Domain) => void;
	domainList: Array<Domain>;
	setCosList: (cosList: Array<Cos>) => void;
	setDomainList: (domainList: Array<Domain>) => void;
	removeDomain: () => void;
	setDomainView: (domainView: string) => void;
	isDomainSupportDelegatedAdmin: boolean;
	setIsDomainSupportDelegatedAdmin: (isDomainSupportDelegatedAdmin: boolean) => void;
	closeDomainBanner: string;
	setCloseDomainBanner: (domainName: string) => void;
	isQuickAccess: boolean;
	setIsQuickAccess: (isQuickAccess: boolean) => void;
	isCertificateAvailbale: boolean;
	setIsCertificateAvailbale: (isCertificateAvailbale: boolean) => void;
};

export const useDomainStore = create<DomainState>()(
	devtools((set) => ({
		domain: {},
		cosList: [],
		domainView: `${GLOBAL_ROUTE}/${DOMAINS_ROUTE_ID}`,
		setDomain: (domain): void => set({ domain }, false, 'setDomain'),
		domainList: [],
		isDomainSupportDelegatedAdmin: false,
		isQuickAccess: false,
		isCertificateAvailbale: false,
		setDomainList: (domainList): void => set({ domainList }, false, 'setDomainList'),
		setCosList: (cosList): void => set({ cosList }, false, 'setCosList'),
		removeDomain: (): void =>
			set(
				produce((state) => {
					state.domain = {};
				})
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
		closeDomainBanner: '',
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
	}))
);
