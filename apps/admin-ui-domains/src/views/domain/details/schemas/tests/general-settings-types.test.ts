/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { Attribute } from '../../../../../../types';
import {
	buildGeneralAttributes,
	type GeneralFormState,
	isGeneralFormDirty,
	parseGeneralFormFromAttributes
} from '../general-settings-types';

describe('general-settings-types', () => {
	describe('parseGeneralFormFromAttributes', () => {
		it('returns null when attrs is undefined', () => {
			const result = parseGeneralFormFromAttributes(undefined);
			expect(result).toBeNull();
		});

		it('returns null when attrs is empty array', () => {
			const result = parseGeneralFormFromAttributes([]);
			expect(result).toBeNull();
		});

		it('parses basic attributes correctly', () => {
			const attrs: Attribute[] = [
				{ n: 'zimbraId', _content: 'domain-123' },
				{ n: 'zimbraDomainName', _content: 'example.com' },
				{ n: 'zimbraDomainStatus', _content: 'active' },
				{ n: 'description', _content: 'Test domain' }
			];

			const result = parseGeneralFormFromAttributes(attrs);

			expect(result).not.toBeNull();
			expect(result?.zimbraId).toBe('domain-123');
			expect(result?.zimbraDomainName).toBe('example.com');
			expect(result?.zimbraDomainStatus).toBe('active');
			expect(result?.description).toBe('Test domain');
		});

		it('parses notification recipients as array', () => {
			const attrs: Attribute[] = [
				{ n: 'zimbraId', _content: 'domain-123' },
				{ n: 'carbonioNotificationRecipients', _content: 'admin@example.com' },
				{ n: 'carbonioNotificationRecipients', _content: 'ops@example.com' }
			];

			const result = parseGeneralFormFromAttributes(attrs);

			expect(result?.carbonioNotificationRecipients).toHaveLength(2);
			expect(result?.carbonioNotificationRecipients[0].label).toBe('admin@example.com');
			expect(result?.carbonioNotificationRecipients[1].label).toBe('ops@example.com');
		});

		it('parses carbonioSearchSpecifiedDomainsByFeature as array', () => {
			const attrs: Attribute[] = [
				{ n: 'zimbraId', _content: 'domain-123' },
				{ n: 'carbonioSearchSpecifiedDomainsByFeature', _content: 'other1.com' },
				{ n: 'carbonioSearchSpecifiedDomainsByFeature', _content: 'other2.com' }
			];

			const result = parseGeneralFormFromAttributes(attrs);

			expect(result?.carbonioSearchSpecifiedDomainsByFeature).toHaveLength(2);
			expect(result?.carbonioSearchSpecifiedDomainsByFeature[0].label).toBe('other1.com');
		});

		it('returns empty strings for missing attributes', () => {
			const attrs: Attribute[] = [{ n: 'zimbraId', _content: 'domain-123' }];

			const result = parseGeneralFormFromAttributes(attrs);

			expect(result?.zimbraNotes).toBe('');
			expect(result?.description).toBe('');
			expect(result?.zimbraPublicServicePort).toBe('');
		});
	});

	describe('isGeneralFormDirty', () => {
		const createBaseState = (): GeneralFormState => ({
			zimbraId: 'domain-123',
			zimbraDomainName: 'example.com',
			zimbraPrefTimeZoneId: 'America/New_York',
			zimbraPublicServiceProtocol: 'https',
			zimbraPublicServiceHostname: 'mail.example.com',
			zimbraPublicServicePort: '443',
			zimbraDNSCheckHostname: '',
			zimbraDomainStatus: 'active',
			zimbraNotes: '',
			description: 'Test domain',
			zimbraHelpAdminURL: '',
			zimbraHelpDelegatedURL: '',
			zimbraDomainDefaultCOSId: 'cos-123',
			zimbraDomainMaxAccounts: '100',
			carbonioNotificationFrom: 'noreply@example.com',
			carbonioNotificationRecipients: [{ label: 'admin@example.com' }],
			carbonioSearchSpecifiedDomainsByFeature: [],
			zimbraCreateTimestamp: '20240101120000Z'
		});

		it('returns false when both states are null', () => {
			expect(isGeneralFormDirty(null, null)).toBe(false);
		});

		it('returns false when original is null', () => {
			expect(isGeneralFormDirty(null, createBaseState())).toBe(false);
		});

		it('returns false when current is null', () => {
			expect(isGeneralFormDirty(createBaseState(), null)).toBe(false);
		});

		it('returns false when states are identical', () => {
			const state = createBaseState();
			expect(isGeneralFormDirty(state, { ...state })).toBe(false);
		});

		it('returns true when description changes', () => {
			const original = createBaseState();
			const current = { ...original, description: 'Changed description' };
			expect(isGeneralFormDirty(original, current)).toBe(true);
		});

		it('returns true when zimbraNotes changes', () => {
			const original = createBaseState();
			const current = { ...original, zimbraNotes: 'New notes' };
			expect(isGeneralFormDirty(original, current)).toBe(true);
		});

		it('returns true when domain status changes', () => {
			const original = createBaseState();
			const current = { ...original, zimbraDomainStatus: 'locked' };
			expect(isGeneralFormDirty(original, current)).toBe(true);
		});

		it('returns true when notification recipients change', () => {
			const original = createBaseState();
			const current = {
				...original,
				carbonioNotificationRecipients: [
					{ label: 'admin@example.com' },
					{ label: 'new@example.com' }
				]
			};
			expect(isGeneralFormDirty(original, current)).toBe(true);
		});

		it('returns true when domain quota changes', () => {
			const original = createBaseState();
			expect(isGeneralFormDirty(original, original, '10', '5')).toBe(true);
		});

		it('returns false when domain quota is same', () => {
			const original = createBaseState();
			expect(isGeneralFormDirty(original, original, '10', '10')).toBe(false);
		});
	});

	describe('buildGeneralAttributes', () => {
		const createBaseState = (): GeneralFormState => ({
			zimbraId: 'domain-123',
			zimbraDomainName: 'example.com',
			zimbraPrefTimeZoneId: 'America/New_York',
			zimbraPublicServiceProtocol: 'https',
			zimbraPublicServiceHostname: 'mail.example.com',
			zimbraPublicServicePort: '443',
			zimbraDNSCheckHostname: '',
			zimbraDomainStatus: 'active',
			zimbraNotes: 'Test notes',
			description: 'Test domain',
			zimbraHelpAdminURL: '',
			zimbraHelpDelegatedURL: '',
			zimbraDomainDefaultCOSId: 'cos-123',
			zimbraDomainMaxAccounts: '100',
			carbonioNotificationFrom: 'noreply@example.com',
			carbonioNotificationRecipients: [{ label: 'admin@example.com' }],
			carbonioSearchSpecifiedDomainsByFeature: [],
			zimbraCreateTimestamp: '20240101120000Z'
		});

		it('builds basic attributes', () => {
			const state = createBaseState();
			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});

			expect(attrs.find((a) => a.n === 'zimbraNotes')?._content).toBe('Test notes');
			expect(attrs.find((a) => a.n === 'description')?._content).toBe('Test domain');
			expect(attrs.find((a) => a.n === 'zimbraDomainStatus')?._content).toBe('active');
		});

		it('includes zimbraDomainMaxAccounts only for global admin', () => {
			const state = createBaseState();

			const attrsNonAdmin = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});
			expect(attrsNonAdmin.find((a) => a.n === 'zimbraDomainMaxAccounts')).toBeUndefined();

			const attrsAdmin = buildGeneralAttributes({
				state,
				isGlobalAdmin: true,
				isAdvanced: false
			});
			expect(attrsAdmin.find((a) => a.n === 'zimbraDomainMaxAccounts')?._content).toBe('100');
		});

		it('includes notification recipients', () => {
			const state = {
				...createBaseState(),
				carbonioNotificationRecipients: [
					{ label: 'admin@example.com' },
					{ label: 'ops@example.com' }
				]
			};

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});

			const recipientAttrs = attrs.filter((a) => a.n === 'carbonioNotificationRecipients');
			expect(recipientAttrs).toHaveLength(2);
		});

		it('includes search domains for advanced mode', () => {
			const state = {
				...createBaseState(),
				carbonioSearchSpecifiedDomainsByFeature: [{ label: 'other.com' }]
			};

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: true
			});

			const searchDomains = attrs.filter(
				(a) => a.n === 'carbonioSearchSpecifiedDomainsByFeature'
			);
			expect(searchDomains).toHaveLength(1);
			expect(searchDomains[0]._content).toBe('other.com');
		});

		it('sends empty string when search domains list is empty in advanced mode', () => {
			const state = {
				...createBaseState(),
				carbonioSearchSpecifiedDomainsByFeature: []
			};

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: true
			});

			const searchDomains = attrs.filter(
				(a) => a.n === 'carbonioSearchSpecifiedDomainsByFeature'
			);
			expect(searchDomains).toHaveLength(1);
			expect(searchDomains[0]._content).toBe('');
		});

		it('does not include search domains when not in advanced mode', () => {
			const state = {
				...createBaseState(),
				carbonioSearchSpecifiedDomainsByFeature: [{ label: 'other.com' }]
			};

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});

			const searchDomains = attrs.filter(
				(a) => a.n === 'carbonioSearchSpecifiedDomainsByFeature'
			);
			expect(searchDomains).toHaveLength(0);
		});

		it('includes timezone when present', () => {
			const state = createBaseState();

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});

			expect(attrs.find((a) => a.n === 'zimbraPrefTimeZoneId')?._content).toBe(
				'America/New_York'
			);
		});

		it('does not include timezone when empty', () => {
			const state = { ...createBaseState(), zimbraPrefTimeZoneId: '' };

			const attrs = buildGeneralAttributes({
				state,
				isGlobalAdmin: false,
				isAdvanced: false
			});

			expect(attrs.find((a) => a.n === 'zimbraPrefTimeZoneId')).toBeUndefined();
		});
	});
});
