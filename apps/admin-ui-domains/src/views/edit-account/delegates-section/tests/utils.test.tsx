/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
	buildAdminRightEnvelope,
	buildDelegateRows,
	buildDelegateSearchQuery,
	buildFolderGrant,
	buildFolderRevoke,
	buildSimplifiedGrantBatch,
	buildSimplifiedRevokeBatch,
	parseDelegateDirectoryOptions,
	selectDelegatesForRemoval,
} from '../utils';

const IDENTITIES = [
	{
		grantee: [{ id: 'g-1', name: 'sender@example.com', type: 'usr' }],
		right: [{ _content: 'sendAs' }],
	},
	{
		grantee: [{ id: 'g-2', name: 'writer@example.com', type: 'usr' }],
		folder: [{ id: 'f-1', zid: 'z-1', perm: 'rwidxa' }],
	},
	{
		grantee: [{ id: 'g-3', name: 'reader@example.com', type: 'grp' }],
		folder: [{ id: 'f-2', zid: 'z-2', perm: 'r' }],
	},
];

describe('buildDelegateRows', () => {
	it('should derive the right flags used by the simplified-view filters', () => {
		const rows = buildDelegateRows(IDENTITIES);

		expect(rows).toHaveLength(3);
		expect(rows[0]).toMatchObject({ id: 'g-1', sendRights: true, readFolder: false, writeFolder: false });
		expect(rows[1]).toMatchObject({ id: 'g-2', sendRights: false, readFolder: true, writeFolder: true });
		expect(rows[2]).toMatchObject({ id: 'g-3', sendRights: false, readFolder: true, writeFolder: false });
	});

		it('should render the grantee type and rights text in the columns', () => {
		const [sender] = buildDelegateRows(IDENTITIES);
		const typeColumn = sender.columns[1] as React.ReactElement<{ children: string }>;
		const rightsColumn = sender.columns[2] as React.ReactElement<{ children: Array<string> }>;
		expect(typeColumn.props.children).toBe('Single User');
		// two conditional expressions render as two children
		expect(rightsColumn.props.children).toEqual(['Send As', '']);
	});

	it('should return an empty array for an empty list', () => {
		expect(buildDelegateRows([])).toEqual([]);
	});
});

describe('buildDelegateSearchQuery', () => {
	it('should build the combined account + dl filter for searches of 2+ chars', () => {
		expect(buildDelegateSearchQuery('ja')).toBe(
			'(|(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*ja*))(&(objectClass=zimbraDistributionList)(mail=*ja*)))',
		);
	});

	it('should return an empty query below the threshold', () => {
		expect(buildDelegateSearchQuery('j')).toBe('');
		expect(buildDelegateSearchQuery('')).toBe('');
	});
});

describe('parseDelegateDirectoryOptions', () => {
	it('should merge usr and grp entries, excluding the edited account', () => {
		const options = parseDelegateDirectoryOptions(
			{
				account: [
					{ id: 'self-id', name: 'self@example.com' },
					{ id: 'acc-1', name: 'jane@example.com' },
				],
				dl: [{ id: 'dl-1', name: 'team@example.com' }],
			},
			'self-id',
		);

		expect(options).toEqual([
			{ id: 'acc-1', label: 'jane@example.com', type: 'usr', ele: { id: 'acc-1', name: 'jane@example.com' } },
			{ id: 'dl-1', label: 'team@example.com', type: 'grp', ele: { id: 'dl-1', name: 'team@example.com' } },
		]);
	});
});

describe('batch envelope builders', () => {
	const target = { targetName: 'jane@example.com', granteeType: 'usr', granteeName: 'bob@example.com', right: 'sendAs' };

	it('should build the admin-right envelope', () => {
		expect(buildAdminRightEnvelope(target)).toEqual({
			_jsns: 'urn:zimbraAdmin',
			target: { _content: 'jane@example.com', type: 'account', by: 'name' },
			grantee: { by: 'name', type: 'usr', _content: 'bob@example.com' },
			right: { _content: 'sendAs' },
		});
	});

	it('should build the folder grant envelope', () => {
		expect(
			buildFolderGrant({ folderIds: '1', granteeType: 'usr', granteeName: 'bob@example.com', perm: 'rwidxa' }),
		).toMatchObject({ _jsns: 'urn:zimbraMail', action: { op: 'grant', id: '1', grant: { perm: 'rwidxa', gt: 'usr', d: 'bob@example.com' } } });
	});

	it('should build the folder revoke envelope', () => {
		expect(buildFolderRevoke({ id: 'f-1', zid: 'z-1' })).toEqual({
			_jsns: 'urn:zimbraMail',
			action: { op: '!grant', id: 'f-1', zid: 'z-1' },
		});
	});

});

describe('buildSimplifiedGrantBatch', () => {
	const selected = [{ type: 'usr', ele: { name: 'bob@example.com' } }];

	it('should build revoke+grant send rights when a send option is checked', () => {
		const batch = buildSimplifiedGrantBatch(
			selected,
			{ sendRightCheck: true, sendBehalfRightCheck: false, readWriteRightCheck: false, readRightCheck: false },
			'jane@example.com',
		);
		expect(batch.revokeUsrRigths).toHaveLength(1);
		expect(batch.revokeUsrRigths[0].right._content).toBe('sendOnBehalfOf');
		expect(batch.grantUsrRigths).toHaveLength(1);
		expect(batch.grantUsrRigths[0].right._content).toBe('sendAs');
		expect(batch.folderUsrRights).toHaveLength(0);
	});

	it('should build a read/write folder grant when a read option is checked', () => {
		const batch = buildSimplifiedGrantBatch(
			selected,
			{ sendRightCheck: false, sendBehalfRightCheck: false, readWriteRightCheck: true, readRightCheck: false },
			'jane@example.com',
		);
		expect(batch.revokeUsrRigths).toHaveLength(0);
		expect(batch.grantUsrRigths).toHaveLength(0);
		expect(batch.folderUsrRights).toHaveLength(1);
		expect(batch.folderUsrRights[0].action.grant.perm).toBe('rwidxa');
	});
});

describe('buildSimplifiedRevokeBatch', () => {
	it('should build folder revokes for read-type deletions', () => {
		const batch = buildSimplifiedRevokeBatch(
			[{ folder: [{ id: 'f-1', zid: 'z-1' }] }],
			'read',
			'jane@example.com',
		);
		expect(batch.folderUsrRights).toHaveLength(1);
		expect(batch.revokeUsrRigths).toHaveLength(0);
	});

	it('should build a right revoke for send-type deletions', () => {
		const batch = buildSimplifiedRevokeBatch(
			[
				{
					grantee: [{ type: 'usr', name: 'bob@example.com' }],
					right: [{ _content: 'sendAs' }],
				},
			],
			'send',
			'jane@example.com',
		);
		expect(batch.revokeUsrRigths).toHaveLength(1);
		expect(batch.revokeUsrRigths[0].right._content).toBe('sendAs');
		expect(batch.folderUsrRights).toHaveLength(0);
	});
});

describe('selectDelegatesForRemoval', () => {
	const rows = buildDelegateRows(IDENTITIES);

	it('should return the single selected identity for row removals', () => {
		const selected = selectDelegatesForRemoval('send', true, 'g-1', IDENTITIES, rows);
		expect(selected).toEqual([IDENTITIES[0]]);
	});

	it('should return an empty list when the single selection is not found', () => {
		expect(selectDelegatesForRemoval('send', true, 'missing', IDENTITIES, rows)).toEqual([]);
	});

	it('should return the matching identities for remove-all by rights type', () => {
		expect(selectDelegatesForRemoval('readWrite', false, undefined, IDENTITIES, rows)).toEqual([
			IDENTITIES[1],
		]);
		expect(selectDelegatesForRemoval('read', false, undefined, IDENTITIES, rows)).toEqual([
			IDENTITIES[2],
		]);
		expect(selectDelegatesForRemoval('send', false, undefined, IDENTITIES, rows)).toEqual([
			IDENTITIES[0],
		]);
	});
});
