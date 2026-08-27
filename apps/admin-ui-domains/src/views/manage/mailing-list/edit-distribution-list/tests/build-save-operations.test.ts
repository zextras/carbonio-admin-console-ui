/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildSaveOperations, type PreviousDetailSnapshot } from '../build-save-operations';

const BASE_PREVIOUS: PreviousDetailSnapshot = {
	displayName: 'Team List',
	distributionName: 'team@example.com',
	zimbraNotes: '',
	description: '',
	zimbraMailStatus: { value: 'TRUE' },
	zimbraHideInGal: false,
	zimbraDistributionListSendShareMessageToNewMembers: false,
	dlMembershipList: [],
	grantEmails: [],
	grantType: { value: 'pub' }
};

function buildCurrent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		displayName: 'Team List',
		distributionName: 'team@example.com',
		zimbraNotes: '',
		description: '',
		zimbraMailStatusValue: 'TRUE',
		zimbraHideInGal: false,
		sendShareMessageToNewMembers: false,
		memberURL: undefined,
		dynamic: false,
		isACLGroup: false,
		listId: 'dl-1',
		listName: 'team@example.com',
		defaultAliases: [],
		aliases: [],
		dlMembershipList: [],
		ownerOfList: undefined,
		grantEmails: [],
		grantTypeValue: 'pub',
		...overrides
	};
}

describe('build-save-operations', () => {
	it('returns no operations when nothing changed', () => {
		expect(buildSaveOperations(BASE_PREVIOUS, buildCurrent() as never)).toEqual([]);
	});

	it('collects modified attributes into a single modify operation', () => {
		const operations = buildSaveOperations(
			BASE_PREVIOUS,
			buildCurrent({
				displayName: 'Renamed',
				zimbraNotes: 'new notes',
				zimbraHideInGal: true
			}) as never
		);
		expect(operations).toEqual([
			{
				type: 'modify',
				attributes: [
					{ n: 'displayName', _content: 'Renamed' },
					{ n: 'zimbraNotes', _content: 'new notes' },
					{ n: 'zimbraHideInGal', _content: 'TRUE' }
				]
			}
		]);
	});

	it('emits share-message for static lists but skips memberURL', () => {
		const operations = buildSaveOperations(
			{ ...BASE_PREVIOUS, memberURL: 'ldap://x' },
			buildCurrent({
				sendShareMessageToNewMembers: true,
				memberURL: 'ldap://y'
			}) as never
		);
		expect(operations).toEqual([
			{
				type: 'modify',
				attributes: [
					{ n: 'zimbraDistributionListSendShareMessageToNewMembers', _content: 'TRUE' }
				]
			}
		]);
	});

	it('emits memberURL attribute for dynamic non-ACL lists', () => {
		const operations = buildSaveOperations(
			{ ...BASE_PREVIOUS, memberURL: 'ldap://x' },
			buildCurrent({ dynamic: true, memberURL: 'ldap://y' }) as never
		);
		expect(operations).toEqual([
			{ type: 'modify', attributes: [{ n: 'memberURL', _content: 'ldap://y' }] }
		]);
	});

	it('maps a renamed address to a rename operation', () => {
		const operations = buildSaveOperations(
			BASE_PREVIOUS,
			buildCurrent({ distributionName: 'newteam@example.com' }) as never
		);
		expect(operations).toEqual([
			{ type: 'rename', id: 'dl-1', newName: 'newteam@example.com' }
		]);
	});

	it('diffs member-of lists into add and remove operations', () => {
		const operations = buildSaveOperations(
			{ ...BASE_PREVIOUS, dlMembershipList: [{ id: 'dl-2' }, { id: 'dl-3' }] },
			buildCurrent({ dlMembershipList: [{ id: 'dl-3' }, { id: 'dl-4' }] }) as never
		);
		expect(operations).toEqual([
			{ type: 'addMemberOf', listId: 'dl-4', member: 'team@example.com' },
			{ type: 'removeMemberOf', listId: 'dl-2', member: 'team@example.com' }
		]);
	});

	it('keeps the original dynamic-owner behavior of one identical request per owner', () => {
		const operations = buildSaveOperations(
			{ ...BASE_PREVIOUS, ownerOfList: [{ id: 'o-1' }, { id: 'o-2' }] },
			buildCurrent({
				dynamic: true,
				ownerOfList: [{ id: 'o-2' }, { id: 'o-3' }, { id: 'o-4' }]
			}) as never
		);
		expect(operations).toEqual([
			{ type: 'addMemberOf', listId: 'dl-1', member: 'team@example.com' },
			{ type: 'addMemberOf', listId: 'dl-1', member: 'team@example.com' },
			{ type: 'removeMemberOf', listId: 'dl-1', member: 'team@example.com' }
		]);
	});

	it('diffs aliases into remove and add operations', () => {
		const operations = buildSaveOperations(
			BASE_PREVIOUS,
			buildCurrent({
				defaultAliases: [{ label: 'a@example.com' }, { label: 'b@example.com' }],
				aliases: [{ label: 'b@example.com' }, { label: 'c@example.com' }]
			}) as never
		);
		expect(operations).toEqual([
			{ type: 'removeAlias', id: 'dl-1', alias: 'a@example.com' },
			{ type: 'addAlias', id: 'dl-1', alias: 'c@example.com' }
		]);
	});

	it('emits a setRights action when the grant type changes', () => {
		const operations = buildSaveOperations(
			BASE_PREVIOUS,
			buildCurrent({ grantTypeValue: 'grp' }) as never
		);
		expect(operations).toEqual([
			{
				type: 'action',
				dl: { by: 'id', _content: 'dl-1' },
				action: {
					op: 'setRights',
					right: {
						right: 'sendToDistList',
						grantee: [{ type: 'grp', by: 'name', _content: 'team@example.com' }]
					}
				}
			}
		]);
	});

	it('maps grant emails by name for the email grant type', () => {
		const operations = buildSaveOperations(
			{ ...BASE_PREVIOUS, grantEmails: [{ id: 'e-1', name: 'one@example.com' }] },
			buildCurrent({
				grantTypeValue: 'email',
				grantEmails: [
					{ id: 'e-1', name: 'one@example.com' },
					{ id: 'e-2', name: 'two@example.com' }
				]
			}) as never
		);
		expect(operations).toEqual([
			{
				type: 'action',
				dl: { by: 'id', _content: 'dl-1' },
				action: {
					op: 'setRights',
					right: {
						right: 'sendToDistList',
						grantee: [
							{ type: 'email', by: 'name', _content: 'one@example.com' },
							{ type: 'email', by: 'name', _content: 'two@example.com' }
						]
					}
				}
			}
		]);
	});

	it('does not emit a grant action when nothing about grants changed', () => {
		const operations = buildSaveOperations(
			BASE_PREVIOUS,
			buildCurrent({ grantTypeValue: 'pub', grantEmails: [] }) as never
		);
		expect(operations).toEqual([]);
	});
});
