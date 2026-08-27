/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { differenceBy, isEqual } from 'lodash';

import { ALL, GRP, PUB, TRUE_FALSE } from '../../../../constants';
type Attribute = { n: string; _content: string };

export type SaveOperation =
	| { type: 'modify'; attributes: Array<Attribute> }
	| { type: 'rename'; id: string; newName: string }
	| { type: 'addAlias'; id: string; alias: string }
	| { type: 'removeAlias'; id: string; alias: string }
	| { type: 'addMemberOf'; listId: string; member: string }
	| { type: 'removeMemberOf'; listId: string; member: string }
	| { type: 'action'; dl: Record<string, unknown>; action: Record<string, unknown> };

export type PreviousDetailSnapshot = {
	displayName?: string;
	distributionName?: string;
	zimbraNotes?: string;
	description?: string;
	zimbraMailStatus?: { value?: string };
	zimbraHideInGal?: boolean;
	zimbraDistributionListSendShareMessageToNewMembers?: boolean;
	memberURL?: string;
	dlMembershipList?: Array<{ id?: string }>;
	ownerOfList?: Array<{ id?: string }>;
	grantEmails?: Array<{ id?: string; name?: string } | string>;
	grantType?: { value?: string };
};

export type CurrentDetailSnapshot = {
	displayName: string;
	distributionName: string;
	zimbraNotes: string;
	description: string;
	zimbraMailStatusValue?: string;
	zimbraHideInGal: boolean;
	sendShareMessageToNewMembers: boolean;
	memberURL: string | undefined;
	dynamic: boolean;
	isACLGroup: boolean;
	listId: string;
	listName: string;
	defaultAliases: Array<{ label: string }>;
	aliases: Array<{ label: string }>;
	dlMembershipList?: Array<{ id?: string }>;
	ownerOfList?: Array<{ id?: string }>;
	grantEmails: Array<{ id?: string; name?: string } | string>;
	grantTypeValue?: string;
};

/**
 * Builds the list of save operations by diffing the current editable state
 * against the last-loaded snapshot, mirroring the original `onSave` logic
 * (including its quirks, preserved on purpose):
 * - dynamic-list owner changes push one identical add/remove member request
 *   per owner (original behavior);
 * - alias changes and grant-type changes are detected with deep equality.
 */
export function buildSaveOperations(
	previous: PreviousDetailSnapshot,
	current: CurrentDetailSnapshot
): Array<SaveOperation> {
	const operations: Array<SaveOperation> = [];
	const attributes: Array<Attribute> = [];

	if (previous.displayName !== undefined && previous.displayName !== current.displayName) {
		attributes.push({ n: 'displayName', _content: current.displayName });
	}

	if (previous.zimbraNotes !== undefined && previous.zimbraNotes !== current.zimbraNotes) {
		attributes.push({ n: 'zimbraNotes', _content: current.zimbraNotes });
	}

	if (previous.description !== undefined && previous.description !== current.description) {
		attributes.push({ n: 'description', _content: current.description });
	}

	if (
		previous.zimbraMailStatus !== undefined &&
		previous.zimbraMailStatus?.value !== current.zimbraMailStatusValue
	) {
		attributes.push({
			n: 'zimbraMailStatus',
			_content: current.zimbraMailStatusValue === TRUE_FALSE.TRUE ? 'enabled' : 'disabled'
		});
	}

	if (
		previous.zimbraHideInGal !== undefined &&
		previous.zimbraHideInGal !== current.zimbraHideInGal
	) {
		attributes.push({
			n: 'zimbraHideInGal',
			_content: current.zimbraHideInGal ? 'TRUE' : 'FALSE'
		});
	}

	if (
		!current.dynamic &&
		previous.zimbraDistributionListSendShareMessageToNewMembers !== undefined &&
		previous.zimbraDistributionListSendShareMessageToNewMembers !==
			current.sendShareMessageToNewMembers
	) {
		attributes.push({
			n: 'zimbraDistributionListSendShareMessageToNewMembers',
			_content: current.sendShareMessageToNewMembers ? 'TRUE' : 'FALSE'
		});
	}

	if (
		current.dynamic &&
		!current.isACLGroup &&
		previous.memberURL !== undefined &&
		previous.memberURL !== current.memberURL
	) {
		attributes.push({ n: 'memberURL', _content: current.memberURL ?? '' });
	}

	if (attributes.length > 0) {
		operations.push({ type: 'modify', attributes });
	}

	if (
		previous.distributionName !== undefined &&
		previous.distributionName !== current.distributionName
	) {
		operations.push({ type: 'rename', id: current.listId, newName: current.distributionName });
	}

	/* Member Of List */
	if (
		previous.dlMembershipList !== undefined &&
		!isEqual(previous.dlMembershipList, current.dlMembershipList)
	) {
		const newAddedMember = (current.dlMembershipList ?? []).filter(
			(item) => !(previous.dlMembershipList ?? []).map((i) => i?.id).includes(item?.id)
		);
		const removeMember = (previous.dlMembershipList ?? []).filter(
			(item) => !(current.dlMembershipList ?? []).map((i) => i?.id).includes(item?.id)
		);

		newAddedMember.forEach((item) => {
			operations.push({
				type: 'addMemberOf',
				listId: item?.id ?? '',
				member: current.distributionName
			});
		});

		removeMember.forEach((item) => {
			operations.push({
				type: 'removeMemberOf',
				listId: item?.id ?? '',
				member: current.distributionName
			});
		});
	}

	/* Dynamic Member List — original behavior: one identical request per owner */
	if (
		current.dynamic &&
		previous.ownerOfList !== undefined &&
		!isEqual(previous.ownerOfList, current.ownerOfList)
	) {
		const newAddedOwner = (current.ownerOfList ?? []).filter(
			(item) => !(previous.ownerOfList ?? []).map((i) => i?.id).includes(item?.id)
		);
		const removeOwner = (previous.ownerOfList ?? []).filter(
			(item) => !(current.ownerOfList ?? []).map((i) => i?.id).includes(item?.id)
		);

		newAddedOwner.forEach(() => {
			operations.push({ type: 'addMemberOf', listId: current.listId, member: current.distributionName });
		});

		removeOwner.forEach(() => {
			operations.push({
				type: 'removeMemberOf',
				listId: current.listId,
				member: current.distributionName
			});
		});
	}

	/* Alias List */
	if (!isEqual(current.defaultAliases, current.aliases)) {
		const deleteAliasArr = differenceBy(current.defaultAliases, current.aliases, 'label');
		const addAliasArr = differenceBy(current.aliases, current.defaultAliases, 'label');

		deleteAliasArr.forEach((aliasName) => {
			operations.push({ type: 'removeAlias', id: current.listId, alias: `${aliasName?.label}` });
		});

		addAliasArr.forEach((aliasName) => {
			operations.push({ type: 'addAlias', id: current.listId, alias: `${aliasName?.label}` });
		});
	}

	/* Grant Type */
	if (
		previous.grantEmails !== undefined &&
		previous.grantType !== undefined &&
		(!isEqual(previous.grantEmails, current.grantEmails) ||
			previous.grantType?.value !== current.grantTypeValue)
	) {
		let action: Record<string, unknown>;
		if (current.grantTypeValue === PUB) {
			action = { op: 'setRights', right: { right: 'sendToDistList', grantee: [] } };
		} else if (current.grantTypeValue === GRP) {
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: [{ type: GRP, by: 'name', _content: current.listName }]
				}
			};
		} else if (current.grantTypeValue === ALL) {
			action = { op: 'setRights', right: { right: 'sendToDistList', grantee: [{ type: ALL }] } };
		} else {
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: current.grantEmails.map((item) => ({
						type: 'email',
						by: 'name',
						_content:
							typeof item === 'string' ? item : item?.name ? item?.name : (item ?? '')
					}))
				}
			};
		}
		operations.push({ type: 'action', dl: { by: 'id', _content: current.listId }, action });
	}

	return operations;
}
