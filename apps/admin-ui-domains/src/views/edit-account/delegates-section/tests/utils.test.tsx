/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
	buildAdminRightEnvelope,
	buildDelegateRevoke,
	buildDelegateRows,
	buildDelegateSearchQuery,
	buildFolderGrant,
	buildFolderRevoke,
	buildSimplifiedGrantBatch,
	buildSimplifiedRevokeBatch,
	getDelegateRightsType,
	parseDelegateDirectoryOptions,
	resolveDelegateChips,
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
		expect(rightsColumn.props.children).toBe('Send As');
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
			[
				{
					grantee: [{ id: 'g-4', name: 'bob@example.com', type: 'usr' }],
					right: [{ _content: 'sendOnBehalfOf' }],
				},
			],
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
			[{ folder: [{ id: 'f-1', zid: 'z-1', perm: 'r' }] }],
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
					grantee: [{ id: 'g-1', type: 'usr', name: 'bob@example.com' }],
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

describe('selectDelegatesForRemoval without a selection', () => {
	it('should not fall back to remove-all when a single removal has no selected row', () => {
		const rows = buildDelegateRows(IDENTITIES);
		expect(selectDelegatesForRemoval('send', true, undefined, IDENTITIES, rows)).toEqual([]);
		expect(selectDelegatesForRemoval('send', true, '', IDENTITIES, rows)).toEqual([]);
	});
});

describe('multiple send rights on one grantee', () => {
	const both = {
		grantee: [{ id: 'g-9', name: 'both@example.com', type: 'usr' }],
		right: [{ _content: 'viewFreeBusy' }, { _content: 'sendAs' }, { _content: 'sendOnBehalfOf' }],
	};

	it('should revoke every send right and leave other rights alone', () => {
		const batch = buildSimplifiedRevokeBatch([both], 'send', 'jane@example.com');
		expect(batch.revokeUsrRigths.map((r) => r.right._content)).toEqual(['sendAs', 'sendOnBehalfOf']);
	});

	it('should list every send right in the row', () => {
		const [row] = buildDelegateRows([both]);
		const rightsColumn = row.columns[2] as React.ReactElement<{ children: string }>;
		expect(row.sendRights).toBe(true);
		expect(rightsColumn.props.children).toBe('Send As, Send on Behalf Of');
	});

	it('should not flag a grantee that only holds non-send rights', () => {
		const [row] = buildDelegateRows([
			{ grantee: both.grantee, right: [{ _content: 'viewFreeBusy' }] },
		]);
		expect(row.sendRights).toBe(false);
	});
});

describe('buildSimplifiedGrantBatch opposite send right', () => {
	const selected = [{ type: 'usr', ele: { name: 'bob@example.com' } }];
	const checks = {
		sendRightCheck: true,
		sendBehalfRightCheck: false,
		readWriteRightCheck: false,
		readRightCheck: false,
	};

	it('should not revoke a right the grantee does not hold', () => {
		const batch = buildSimplifiedGrantBatch(selected, checks, 'jane@example.com', []);
		expect(batch.revokeUsrRigths).toHaveLength(0);
		expect(batch.grantUsrRigths).toHaveLength(1);
	});

	it('should match the grantee name case-insensitively', () => {
		const batch = buildSimplifiedGrantBatch(selected, checks, 'jane@example.com', [
			{
				grantee: [{ id: 'g-1', name: 'Bob@Example.com', type: 'usr' }],
				right: [{ _content: 'sendOnBehalfOf' }],
			},
		]);
		expect(batch.revokeUsrRigths).toHaveLength(1);
	});
});

describe('resolveDelegateChips', () => {
	const options = [
		{ id: 'a', label: 'a@example.com', type: 'usr', ele: { name: 'a@example.com' } },
		{ id: 'b', label: 'b@example.com', type: 'usr', ele: { name: 'b@example.com' } },
		{ id: 'c', label: 'c@example.com', type: 'grp', ele: { name: 'c@example.com' } },
	];

	it('should keep the remaining entries, not the removed ones, when a chip is deleted', () => {
		const { chips, entries } = resolveDelegateChips(
			[{ label: 'a@example.com' }, { label: 'c@example.com' }],
			options,
			[],
		);
		expect(chips.map((c) => c.label)).toEqual(['a@example.com', 'c@example.com']);
		expect(entries.map((e) => e.id)).toEqual(['a', 'c']);
	});

	it('should drop contacts that resolve to no entry or are not valid emails', () => {
		const { chips, entries } = resolveDelegateChips(
			[{ label: 'a@example.com' }, { label: 'typed@example.com' }, { label: 'not-an-email' }],
			[],
			options,
		);
		expect(chips.map((c) => c.label)).toEqual(['a@example.com']);
		expect(entries.map((e) => e.id)).toEqual(['a']);
	});

	it('should resolve previously selected entries that are no longer in the options', () => {
		const { entries } = resolveDelegateChips([{ label: 'b@example.com' }], [options[1]], []);
		expect(entries).toEqual([options[1]]);
	});
});

describe('buildDelegateRevoke', () => {
	const identity = {
		grantee: [{ id: 'g-9', name: 'both@example.com', type: 'usr' }],
		right: [{ _content: 'sendAs' }, { _content: 'viewFreeBusy' }],
		folder: [
			{ id: '1', zid: 'z-1', perm: 'r' },
			{ id: '2', zid: 'z-1', perm: 'r' },
		],
	};

	it('should revoke every right and every folder grant when removing the row', () => {
		const batch = buildDelegateRevoke(identity, 'jane@example.com', 'all');
		expect(batch.revokeUsrRigths.map((r) => r.right._content)).toEqual(['sendAs', 'viewFreeBusy']);
		expect(batch.folderUsrRights).toHaveLength(2);
	});

	it('should revoke only the send rights before an edit re-grant', () => {
		const batch = buildDelegateRevoke(identity, 'jane@example.com', 'send');
		expect(batch.revokeUsrRigths.map((r) => r.right._content)).toEqual(['sendAs']);
		expect(batch.folderUsrRights).toHaveLength(2);
	});
});

describe('getDelegateRightsType', () => {
	const grantee = [{ id: 'g-9', name: 'x@example.com', type: 'usr' }];
	const send = [{ _content: 'sendOnBehalfOf' }];

	it('should map the current grants to the wizard option', () => {
		expect(getDelegateRightsType({ grantee, right: send })).toBe('send_mails_only');
		expect(getDelegateRightsType({ grantee, folder: [{ id: '1', zid: 'z', perm: 'r' }] })).toBe(
			'read_mails_only',
		);
		expect(
			getDelegateRightsType({ grantee, right: send, folder: [{ id: '1', zid: 'z', perm: 'r' }] }),
		).toBe('send_read_mails');
		expect(
			getDelegateRightsType({ grantee, folder: [{ id: '1', zid: 'z', perm: 'rwidxa' }] }),
		).toBe('manage_no_send');
		expect(
			getDelegateRightsType({
				grantee,
				right: send,
				folder: [{ id: '1', zid: 'z', perm: 'rwidxa' }],
			}),
		).toBe('send_read_manage_mails');
	});

	it('should not treat a non-send right as the ability to send', () => {
		expect(
			getDelegateRightsType({
				grantee,
				right: [{ _content: 'viewFreeBusy' }],
				folder: [{ id: '1', zid: 'z', perm: 'r' }],
			}),
		).toBe('read_mails_only');
	});
});
