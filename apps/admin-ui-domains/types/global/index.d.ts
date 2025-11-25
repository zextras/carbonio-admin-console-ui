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
