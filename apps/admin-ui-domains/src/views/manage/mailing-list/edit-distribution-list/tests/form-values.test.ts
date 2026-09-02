/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isDeferredSaveDirty, mapToFormValues } from '../form-values';
import type {
	DistributionListDetail,
	DistributionListGrants,
	DistributionListMemberOf
} from '../parse-distribution-list-detail';

const SELECTED_MAILING_LIST = {
	id: 'dl-1',
	name: 'team@example.com',
	dynamic: false,
	a: [{ n: 'displayName', _content: 'Team List' }]
};

const DETAIL: DistributionListDetail = {
	dlId: 'dl-1',
	displayName: 'Team List',
	dlm: ['user1@example.com'],
	zimbraHideInGal: true,
	zimbraNotes: 'notes',
	description: 'desc',
	sendShareMessageToNewMembers: true,
	aliases: [{ label: 'alias1@example.com' }],
	createTimestamp: '20240115103000Z',
	mailStatusEnabled: true,
	memberURL: 'ldap:///??sub?x',
	isACLGroup: false
};

const MEMBERSHIP: Array<DistributionListMemberOf> = [{ id: 'dl-2', name: 'other@example.com' }];

const GRANTS: DistributionListGrants = {
	grantType: 'grp',
	grantEmails: [{ id: 'e-1', name: 'one@example.com' }],
	owners: [{ id: 'owner-1', name: 'owner@example.com' }],
	sendAs: [{ id: 'send-1', name: 'sender@example.com', sendAcl: 'sendAsDistList' }]
};

describe('mapToFormValues', () => {
	it('maps all data sources into the form values', () => {
		expect(mapToFormValues(DETAIL, MEMBERSHIP, GRANTS, SELECTED_MAILING_LIST)).toEqual({
			displayName: 'Team List',
			distributionName: 'team@example.com',
			zimbraNotes: 'notes',
			description: 'desc',
			zimbraMailStatusValue: 'TRUE',
			zimbraHideInGal: true,
			sendShareMessageToNewMembers: true,
			memberURL: 'ldap:///??sub?x',
			aliases: [{ label: 'alias1@example.com' }],
			dlm: ['user1@example.com'],
			dlMembershipList: [{ id: 'dl-2', name: 'other@example.com' }],
			ownersList: [{ id: 'owner-1', name: 'owner@example.com' }],
			ownerOfList: [],
			sendEmails: [{ id: 'send-1', name: 'sender@example.com', sendAcl: 'sendAsDistList' }],
			grantEmails: [{ id: 'e-1', name: 'one@example.com' }],
			grantTypeValue: 'grp'
		});
	});

	it('falls back to safe defaults when the detail is missing', () => {
		const values = mapToFormValues(undefined, [], undefined, SELECTED_MAILING_LIST);
		expect(values.displayName).toBe('Team List');
		expect(values.zimbraMailStatusValue).toBe('FALSE');
		expect(values.zimbraHideInGal).toBe(false);
		expect(values.aliases).toEqual([]);
		expect(values.dlm).toEqual([]);
		expect(values.memberURL).toBe('');
	});

	it('falls back to pub when grants are missing', () => {
		expect(mapToFormValues(DETAIL, [], undefined, SELECTED_MAILING_LIST).grantTypeValue).toBe(
			'pub'
		);
	});

	it('defaults the display name to empty when the list has no displayName attribute', () => {
		expect(
			mapToFormValues({ ...DETAIL, displayName: '' }, [], GRANTS, {
				id: 'dl-1',
				name: 'x@example.com',
				a: [],
			}).displayName,
		).toBe('');
	});

	it('prefers displayName from detail over stale selectedMailingList', () => {
		const detail = { ...DETAIL, displayName: 'Fresh From Detail' };
		const staleRow = {
			...SELECTED_MAILING_LIST,
			a: [{ n: 'displayName', _content: 'Stale Row Name' }],
		};
		expect(mapToFormValues(detail, MEMBERSHIP, GRANTS, staleRow).displayName).toBe(
			'Fresh From Detail',
		);
	});
});

describe('isDeferredSaveDirty', () => {
	const defaults = mapToFormValues(DETAIL, MEMBERSHIP, GRANTS, SELECTED_MAILING_LIST);

	it('returns false when only immediate-save fields differ', () => {
		expect(
			isDeferredSaveDirty(
				{
					...defaults,
					dlm: ['user1@example.com', 'new@example.com'],
					ownersList: [{ id: 'owner-2', name: 'newowner@example.com' }],
					sendEmails: [{ name: 'new@example.com', sendAcl: 'sendAsDistList' }],
				},
				defaults,
			),
		).toBe(false);
	});

	it('returns true when a deferred-save field differs', () => {
		expect(
			isDeferredSaveDirty({ ...defaults, displayName: 'Updated Name' }, defaults),
		).toBe(true);
		expect(
			isDeferredSaveDirty({ ...defaults, grantTypeValue: 'pub' }, defaults),
		).toBe(true);
	});

	it('returns false when values match defaults', () => {
		expect(isDeferredSaveDirty(defaults, defaults)).toBe(false);
	});

	it('returns false when values or defaults are undefined', () => {
		expect(isDeferredSaveDirty(undefined, defaults)).toBe(false);
		expect(isDeferredSaveDirty(defaults, undefined)).toBe(false);
	});
});
