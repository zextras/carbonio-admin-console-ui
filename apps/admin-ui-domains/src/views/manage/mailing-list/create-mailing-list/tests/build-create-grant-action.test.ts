/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ALL, EMAIL, GRP, PUB } from '../../../../../constants';
import { buildCreateGrantAction } from '../build-create-grant-action';

const NAME = 'team@example.com';

describe('build-create-grant-action', () => {
	it('builds an empty-grantee action for everyone', () => {
		expect(buildCreateGrantAction(NAME, PUB, [])).toEqual({
			dl: { by: 'name', _content: NAME },
			action: { op: 'setRights', right: { right: 'sendToDistList', grantee: [] } }
		});
	});

	it('grants to the list itself for members only', () => {
		const built = buildCreateGrantAction(NAME, GRP, []);
		expect(built?.action.right.grantee).toEqual([{ type: GRP, by: 'name', _content: NAME }]);
	});

	it('grants to everyone via the all type for internal users only', () => {
		const built = buildCreateGrantAction(NAME, ALL, []);
		expect(built?.action.right.grantee).toEqual([{ type: ALL }]);
	});

	it('maps grant emails by name for only these users', () => {
		const built = buildCreateGrantAction(NAME, EMAIL, ['a@example.com', 'b@example.com']);
		expect(built?.action.right.grantee).toEqual([
			{ type: 'email', by: 'name', _content: 'a@example.com' },
			{ type: 'email', by: 'name', _content: 'b@example.com' }
		]);
	});

	it('returns null for an unknown grant type', () => {
		expect(buildCreateGrantAction(NAME, undefined, [])).toBeNull();
	});
});
