/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create from 'zustand';
import produce from 'immer';
import { devtools } from 'zustand/middleware';
import { Cos, Domain } from '../../../types';

type DomainState = {
	domain: Domain;
	cosList: Array<Cos>;
	setDomain: (domain: Domain) => void;
	setCosList: (cosList: Array<Cos>) => void;
	removeDomain: () => void;
};

export const useDomainStore = create<DomainState>(
	devtools((set) => ({
		domain: {},
		cosList: [],
		setDomain: (domain): void => set({ domain }, false, 'setDomain'),
		setCosList: (cosList): void => set({ cosList }, false, 'setCosList'),
		removeDomain: (): void =>
			set(
				produce((state) => {
					state.domain = {};
				})
			)
	}))
);
