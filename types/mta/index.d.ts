/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MtaInboundSecurity = {
	zimbraMtaBlockedExtension: Array<string>;
	zimbraMtaBlockedExtensionWarnAdmin: boolean;
	zimbraMtaBlockedExtensionWarnRecipient: boolean;
	zimbraMtaSmtpdRejectUnlistedSender: boolean;
	zimbraMtaSmtpdRejectUnlistedRecipient: boolean;
	zimbraMtaSmtpdSenderRestrictions: boolean;
	rejectUnknownClientHostname: boolean;
	rejectUnknownReverseClientHostname: boolean;
	rejectInvalidHeloHostname: boolean;
	rejectNonFqdnHeloHostname: boolean;
	rejectUnknownHeloHostname: boolean;
	rejectUnknownSenderDomain: boolean;
	rejectNonFqdnSender: boolean;
};

export type MtaOutboundFlow = {
	zimbraSmtpSendAddOriginatingIP: boolean;
	zimbraSmtpSendAddAuthenticatedUser: boolean;
	zimbraMtaAuthEnabled: boolean;
	zimbraMtaMyNetworks: string;
	zimbraMtaSmtpHeloName: string;
	zimbraMtaMyHostname: string;
	zimbraMtaFallbackRelayHost: string;
	zimbraMtaRelayHost: string;
	zimbraMtaMyOrigin: string;
};
