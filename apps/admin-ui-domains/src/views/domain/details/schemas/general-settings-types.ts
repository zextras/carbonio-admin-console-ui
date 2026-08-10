/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute, DomainsByFeature, objectType } from '../../../../../types';
import { CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE } from '../../../../constants';

// === Form state ===
export interface GeneralFormState {
	zimbraId: string;
	zimbraDomainName: string;
	zimbraPrefTimeZoneId: string;
	zimbraPublicServiceProtocol: string;
	zimbraPublicServiceHostname: string;
	zimbraPublicServicePort: string;
	zimbraDNSCheckHostname: string;
	zimbraDomainStatus: string;
	zimbraNotes: string;
	description: string;
	zimbraHelpAdminURL: string;
	zimbraHelpDelegatedURL: string;
	zimbraDomainDefaultCOSId: string;
	zimbraDomainMaxAccounts: string;
	carbonioNotificationFrom: string;
	carbonioNotificationRecipients: objectType[];
	carbonioSearchSpecifiedDomainsByFeature: DomainsByFeature[];
	zimbraCreateTimestamp: string;
}

// === Parser function ===
export function parseGeneralFormFromAttributes(
	attrs: Attribute[] | undefined
): GeneralFormState | null {
	if (!attrs || attrs.length === 0) return null;

	const attrMap = new Map(attrs.map((a) => [a.n, a._content]));

	const carbonioSearchDomains = attrs
		.filter((item) => item.n === CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE && item._content)
		.map((item) => ({ label: item._content }));

	const recipientAttrs = attrs.filter((item) => item.n === 'carbonioNotificationRecipients');
	const recipients = recipientAttrs.map((item) => ({ label: item._content }));

	return {
		zimbraId: attrMap.get('zimbraId') ?? '',
		zimbraDomainName: attrMap.get('zimbraDomainName') ?? '',
		zimbraPrefTimeZoneId: attrMap.get('zimbraPrefTimeZoneId') ?? '',
		zimbraPublicServiceProtocol: attrMap.get('zimbraPublicServiceProtocol') ?? '',
		zimbraPublicServiceHostname: attrMap.get('zimbraPublicServiceHostname') ?? '',
		zimbraPublicServicePort: attrMap.get('zimbraPublicServicePort') ?? '',
		zimbraDNSCheckHostname: attrMap.get('zimbraDNSCheckHostname') ?? '',
		zimbraDomainStatus: attrMap.get('zimbraDomainStatus') ?? 'active',
		zimbraNotes: attrMap.get('zimbraNotes') ?? '',
		description: attrMap.get('description') ?? '',
		zimbraHelpAdminURL: attrMap.get('zimbraHelpAdminURL') ?? '',
		zimbraHelpDelegatedURL: attrMap.get('zimbraHelpDelegatedURL') ?? '',
		zimbraDomainDefaultCOSId: attrMap.get('zimbraDomainDefaultCOSId') ?? '',
		zimbraDomainMaxAccounts: attrMap.get('zimbraDomainMaxAccounts') ?? '',
		carbonioNotificationFrom: attrMap.get('carbonioNotificationFrom') ?? '',
		carbonioNotificationRecipients: recipients,
		carbonioSearchSpecifiedDomainsByFeature: carbonioSearchDomains,
		zimbraCreateTimestamp: attrMap.get('zimbraCreateTimestamp') ?? ''
	};
}

// === Dirty check function ===
export function isGeneralFormDirty(
	original: GeneralFormState | null,
	current: GeneralFormState | null,
	domainQuotaGB?: string,
	initDomainQuotaGB?: string
): boolean {
	if (!original || !current) return false;

	const recipientsChanged =
		JSON.stringify(original.carbonioNotificationRecipients) !==
		JSON.stringify(current.carbonioNotificationRecipients);

	const domainsListChanged =
		JSON.stringify(original.carbonioSearchSpecifiedDomainsByFeature) !==
		JSON.stringify(current.carbonioSearchSpecifiedDomainsByFeature);

	const quotaChanged = domainQuotaGB !== undefined && domainQuotaGB !== initDomainQuotaGB;

	return (
		original.zimbraPrefTimeZoneId !== current.zimbraPrefTimeZoneId ||
		original.zimbraPublicServiceProtocol !== current.zimbraPublicServiceProtocol ||
		original.zimbraPublicServiceHostname !== current.zimbraPublicServiceHostname ||
		original.zimbraDomainStatus !== current.zimbraDomainStatus ||
		original.zimbraPublicServicePort !== current.zimbraPublicServicePort ||
		original.zimbraDNSCheckHostname !== current.zimbraDNSCheckHostname ||
		original.zimbraNotes !== current.zimbraNotes ||
		original.description !== current.description ||
		original.zimbraHelpAdminURL !== current.zimbraHelpAdminURL ||
		original.zimbraHelpDelegatedURL !== current.zimbraHelpDelegatedURL ||
		original.zimbraDomainDefaultCOSId !== current.zimbraDomainDefaultCOSId ||
		original.carbonioNotificationFrom !== current.carbonioNotificationFrom ||
		original.zimbraDomainMaxAccounts !== current.zimbraDomainMaxAccounts ||
		recipientsChanged ||
		domainsListChanged ||
		quotaChanged
	);
}

// === Build attributes function ===
export interface BuildAttributesOptions {
	state: GeneralFormState;
	isGlobalAdmin: boolean;
	isAdvanced: boolean;
}

export function buildGeneralAttributes({
	state,
	isGlobalAdmin,
	isAdvanced
}: BuildAttributesOptions): Attribute[] {
	const attributes: Attribute[] = [
		{ n: 'zimbraNotes', _content: state.zimbraNotes },
		{ n: 'description', _content: state.description },
		{ n: 'zimbraDomainStatus', _content: state.zimbraDomainStatus },
		{ n: 'zimbraPublicServicePort', _content: state.zimbraPublicServicePort },
		{ n: 'zimbraDNSCheckHostname', _content: state.zimbraDNSCheckHostname },
		{ n: 'zimbraHelpAdminURL', _content: state.zimbraHelpAdminURL },
		{ n: 'zimbraHelpDelegatedURL', _content: state.zimbraHelpDelegatedURL },
		{ n: 'zimbraPublicServiceHostname', _content: state.zimbraPublicServiceHostname },
		{ n: 'carbonioNotificationFrom', _content: state.carbonioNotificationFrom },
		{ n: 'zimbraPublicServiceProtocol', _content: state.zimbraPublicServiceProtocol }
	];

	if (state.zimbraPrefTimeZoneId) {
		attributes.push({ n: 'zimbraPrefTimeZoneId', _content: state.zimbraPrefTimeZoneId });
	}

	if (state.zimbraDomainDefaultCOSId) {
		attributes.push({ n: 'zimbraDomainDefaultCOSId', _content: state.zimbraDomainDefaultCOSId });
	}

	if (isGlobalAdmin) {
		attributes.push({ n: 'zimbraDomainMaxAccounts', _content: state.zimbraDomainMaxAccounts });
	}

	state.carbonioNotificationRecipients.forEach((item) => {
		attributes.push({ n: 'carbonioNotificationRecipients', _content: item.label ?? '' });
	});

	if (isAdvanced) {
		if (state.carbonioSearchSpecifiedDomainsByFeature.length > 0) {
			state.carbonioSearchSpecifiedDomainsByFeature.forEach((item) => {
				attributes.push({
					n: CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE,
					_content: item.label ?? ''
				});
			});
		} else {
			attributes.push({ n: CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE, _content: '' });
		}
	}

	return attributes;
}
