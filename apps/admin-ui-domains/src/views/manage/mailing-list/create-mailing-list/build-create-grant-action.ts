/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ALL, EMAIL, GRP, PUB } from '../../../../constants';

export type CreateGrantAction = {
	dl: { by: 'name'; _content: string };
	action: {
		op: 'setRights';
		right: {
			right: 'sendToDistList';
			grantee: Array<Record<string, unknown>>;
		};
	};
};

/**
 * Builds the `setRights` action issued right after creating a distribution
 * list (targeted by name — the list id is only known after creation).
 * Returns null when the grant type is unknown, in which case no action
 * should be sent.
 */
export function buildCreateGrantAction(
	listName: string,
	grantTypeValue: string | undefined,
	grantEmails: Array<string>
): CreateGrantAction | null {
	if (grantTypeValue === PUB) {
		return {
			dl: { by: 'name', _content: listName },
			action: { op: 'setRights', right: { right: 'sendToDistList', grantee: [] } }
		};
	}
	if (grantTypeValue === GRP) {
		return {
			dl: { by: 'name', _content: listName },
			action: {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: [{ type: GRP, by: 'name', _content: listName }]
				}
			}
		};
	}
	if (grantTypeValue === ALL) {
		return {
			dl: { by: 'name', _content: listName },
			action: {
				op: 'setRights',
				right: { right: 'sendToDistList', grantee: [{ type: ALL }] }
			}
		};
	}
	if (grantTypeValue === EMAIL) {
		return {
			dl: { by: 'name', _content: listName },
			action: {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: grantEmails.map((item) => ({
						type: 'email',
						by: 'name',
						_content: item
					}))
				}
			}
		};
	}
	return null;
}
