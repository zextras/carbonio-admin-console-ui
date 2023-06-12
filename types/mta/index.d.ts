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
	zimbraMtaSaslAuthEnable: string;
	zimbraMtaMyNetworks: string;
	zimbraMtaSmtpHeloName: string;
	zimbraMtaMyHostname: string;
	zimbraMtaFallbackRelayHost: string;
	zimbraMtaRelayHost: string;
	zimbraMtaMyOrigin: string;
	zimbraMtaTlsSecurityLevel: string;
};

export type MtaAntivirusAndAntispam = {
	zimbraSpamTagPercent: string;
	zimbraSpamSubjectTag: string;
	zimbraSpamKillPercent: string;
	zimbraAmavisFinalSpamDestiny: string;
	zimbraAmavisOriginatingBypassSA: boolean;
	zimbraAmavisEnableDKIMVerification: boolean;
	zimbraClamAVDatabaseMirror: string;
	zimbraVirusDefinitionsUpdateFrequency: string;
	zimbraVirusWarnRecipient: boolean;
	zimbraVirusBlockEncryptedArchive: boolean;
	zimbraVirusWarnAdmin: boolean;
	carbonioClamAVDatabaseCustomURL: string;
};

export type MtaPostTuning = {
	zimbraMtaPostscreenBlacklistAction: string;
	zimbraMtaPostscreenAccessList: string;
	zimbraMtaPostscreenDnsblAction: string;
	zimbraMtaPostscreenDnsblSites: string;
	zimbraMtaPostscreenDnsblThreshold: string;
	zimbraMtaPostscreenDnsblWhitelistThreshold: string;
	zimbraMtaPostscreenDnsblMinTTL: string;
	zimbraMtaPostscreenDnsblMaxTTL: string;
	zimbraMtaPostscreenDnsblTTL: string;
	zimbraMtaPostscreenBareNewlineEnable: boolean;
	zimbraMtaPostscreenNonSmtpCommandEnable: boolean;
	zimbraMtaPostscreenPipeliningEnable: boolean;
};
