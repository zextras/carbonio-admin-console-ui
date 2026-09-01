/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	parseDistributionListDetail,
	parseDistributionListGrants,
	parseDistributionListMembership
} from '../parse-distribution-list-detail';

const LIST_ID = 'dl-1';
const LIST_NAME = 'team@example.com';

describe('parse-distribution-list-detail', () => {
	describe('parseDistributionListDetail', () => {
		it('returns undefined when the response has no dl entry', () => {
			expect(parseDistributionListDetail({}, LIST_NAME)).toBeUndefined();
			expect(parseDistributionListDetail(undefined, LIST_NAME)).toBeUndefined();
		});

		it('parses attributes, dlm and aliases', () => {
			const parsed = parseDistributionListDetail(
				{
					dl: [
						{
							id: LIST_ID,
							dlm: [{ _content: 'user1@example.com' }, { _content: 'user2@example.com' }],
							a: [
								{ n: 'displayName', _content: 'Team List' },
								{ n: 'zimbraHideInGal', _content: 'TRUE' },
								{ n: 'zimbraNotes', _content: 'notes' },
								{ n: 'description', _content: 'desc' },
								{ n: 'zimbraDistributionListSendShareMessageToNewMembers', _content: 'TRUE' },
								{ n: 'zimbraMailAlias', _content: LIST_NAME },
								{ n: 'zimbraMailAlias', _content: 'alias1@example.com' },
								{ n: 'zimbraCreateTimestamp', _content: '20240115103000Z' },
								{ n: 'zimbraMailStatus', _content: 'enabled' },
								{ n: 'memberURL', _content: 'ldap://member' },
								{ n: 'zimbraIsACLGroup', _content: 'TRUE' }
							]
						}
					]
				},
				LIST_NAME
			);

			expect(parsed).toEqual({
				dlId: LIST_ID,
				displayName: 'Team List',
				dlm: ['user1@example.com', 'user2@example.com'],
				zimbraHideInGal: true,
				zimbraNotes: 'notes',
				description: 'desc',
				sendShareMessageToNewMembers: true,
				aliases: [{ label: 'alias1@example.com' }],
				createTimestamp: '20240115103000Z',
				mailStatusEnabled: true,
				memberURL: 'ldap://member',
				isACLGroup: true
			});
		});

		it('excludes the list own address from aliases and defaults missing attributes', () => {
			const parsed = parseDistributionListDetail({ dl: [{ id: LIST_ID, a: [] }] }, LIST_NAME);
			expect(parsed?.aliases).toEqual([]);
			expect(parsed?.displayName).toBe('');
			expect(parsed?.zimbraHideInGal).toBe(false);
			expect(parsed?.mailStatusEnabled).toBe(false);
			expect(parsed?.memberURL).toBeUndefined();
			expect(parsed?.dlm).toEqual([]);
		});
	});

	describe('parseDistributionListMembership', () => {
		it('maps dl entries to members', () => {
			expect(
				parseDistributionListMembership({
					dl: [{ id: 'dl-2', name: 'other@example.com' }]
				})
			).toEqual([{ id: 'dl-2', name: 'other@example.com' }]);
		});

		it('returns an empty list when there are no members', () => {
			expect(parseDistributionListMembership({ dl: [] })).toEqual([]);
			expect(parseDistributionListMembership(undefined)).toEqual([]);
		});
	});

	describe('parseDistributionListGrants', () => {
		it('returns PUB defaults when there are no grants', () => {
			expect(parseDistributionListGrants({}, LIST_ID)).toEqual({
				grantType: 'pub',
				grantEmails: [],
				owners: [],
				sendAs: []
			});
		});

		it('classifies owners, send-as and send-to grants', () => {
			const parsed = parseDistributionListGrants(
				{
					grant: [
						{
							right: [{ _content: 'ownDistList' }],
							grantee: [{ id: 'owner-1', name: 'owner@example.com', type: 'usr' }]
						},
						{
							right: [{ _content: 'sendAsDistList' }],
							grantee: [{ id: 'send-1', name: 'sender@example.com', type: 'usr' }]
						},
						{
							right: [{ _content: 'sendOnBehalfOfDistList' }],
							grantee: [{ id: 'send-2', name: 'behalf@example.com', type: 'usr' }]
						},
						{
							right: [{ _content: 'sendToDistList' }],
							grantee: [{ id: 'send-3', name: 'too@example.com', type: 'all' }]
						}
					]
				},
				LIST_ID
			);

			expect(parsed.grantType).toBe('all');
			expect(parsed.owners).toEqual([{ id: 'owner-1', name: 'owner@example.com' }]);
			expect(parsed.sendAs).toEqual([
				{ id: 'send-1', name: 'sender@example.com', sendAcl: 'sendAsDistList' },
				{ id: 'send-2', name: 'behalf@example.com', sendAcl: 'sendOnBehalfOfDistList' }
			]);
			// all-type sendTo grants do not become grant emails
			expect(parsed.grantEmails).toEqual([]);
		});

		it('maps usr sendTo grants without list grantee to EMAIL type', () => {
			const parsed = parseDistributionListGrants(
				{
					grant: [
						{
							right: [{ _content: 'sendToDistList' }],
							grantee: [{ id: 'send-3', name: 'too@example.com', type: 'usr' }]
						}
					]
				},
				LIST_ID
			);
			expect(parsed.grantType).toBe('email');
			expect(parsed.grantEmails).toEqual([{ id: 'send-3', name: 'too@example.com' }]);
		});

		it('maps grp sendTo grant on the list itself to GRP type', () => {
			const parsed = parseDistributionListGrants(
				{
					grant: [
						{
							right: [{ _content: 'sendToDistList' }],
							grantee: [{ id: LIST_ID, name: LIST_NAME, type: 'grp' }]
						}
					]
				},
				LIST_ID
			);
			expect(parsed.grantType).toBe('grp');
			expect(parsed.grantEmails).toEqual([]);
		});
	});
});
