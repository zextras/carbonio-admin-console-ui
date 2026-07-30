/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type GlobalDisclaimerType = {
	zimbraDomainMandatoryMailSignatureEnabled: boolean;
	zimbraAmavisOutboundDisclaimersOnly: boolean;
	zimbraAmavisDomainDisclaimerText: string;
	zimbraAmavisDomainDisclaimerHTML: string;
	carbonioSearchAllDomainsByFeature: boolean;
};

export type AddressBookServiceStatus = {
	running: boolean;
	couldStart: boolean;
	couldStop: boolean;
};

export type AddressBookZextrasSoapResponse = {
	Body?: {
		response?: {
			content?: string;
		};
		Fault?: {
			Reason?: {
				Text?: string;
			};
		};
	};
};
