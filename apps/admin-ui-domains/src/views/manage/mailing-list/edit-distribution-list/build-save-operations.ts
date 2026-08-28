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

function pushChanged(attributes: Array<Attribute>, n: string, _content: string, changed: boolean): void {
	if (changed) {
		attributes.push({ n, _content });
	}
}

function buildAttributeOperations(
	previous: PreviousDetailSnapshot,
	current: CurrentDetailSnapshot
): Array<Attribute> {
	const attributes: Array<Attribute> = [];

	pushChanged(
		attributes,
		'displayName',
		current.displayName,
		previous.displayName !== undefined && previous.displayName !== current.displayName
	);
	pushChanged(
		attributes,
		'zimbraNotes',
		current.zimbraNotes,
		previous.zimbraNotes !== undefined && previous.zimbraNotes !== current.zimbraNotes
	);
	pushChanged(
		attributes,
		'description',
		current.description,
		previous.description !== undefined && previous.description !== current.description
	);
	pushChanged(
		attributes,
		'zimbraMailStatus',
		current.zimbraMailStatusValue === TRUE_FALSE.TRUE ? 'enabled' : 'disabled',
		previous.zimbraMailStatus !== undefined &&
			previous.zimbraMailStatus?.value !== current.zimbraMailStatusValue
	);
	pushChanged(
		attributes,
		'zimbraHideInGal',
		current.zimbraHideInGal ? 'TRUE' : 'FALSE',
		previous.zimbraHideInGal !== undefined && previous.zimbraHideInGal !== current.zimbraHideInGal
	);
	pushChanged(
		attributes,
		'zimbraDistributionListSendShareMessageToNewMembers',
		current.sendShareMessageToNewMembers ? 'TRUE' : 'FALSE',
		!current.dynamic &&
			previous.zimbraDistributionListSendShareMessageToNewMembers !== undefined &&
			previous.zimbraDistributionListSendShareMessageToNewMembers !==
				current.sendShareMessageToNewMembers
	);
	pushChanged(
		attributes,
		'memberURL',
		current.memberURL ?? '',
		current.dynamic &&
			!current.isACLGroup &&
			previous.memberURL !== undefined &&
			previous.memberURL !== current.memberURL
	);

	return attributes;
}

function buildMemberOfOperations(
	previous: PreviousDetailSnapshot,
	current: CurrentDetailSnapshot
): Array<SaveOperation> {
	if (previous.dlMembershipList === undefined) {
		return [];
	}
	if (isEqual(previous.dlMembershipList, current.dlMembershipList)) {
		return [];
	}

	const previousIds = new Set((previous.dlMembershipList ?? []).map((i) => i?.id));
	const currentIds = new Set((current.dlMembershipList ?? []).map((i) => i?.id));
	const newAddedMember = (current.dlMembershipList ?? []).filter((item) => !previousIds.has(item?.id));
	const removeMember = (previous.dlMembershipList ?? []).filter((item) => !currentIds.has(item?.id));

	return [
		...newAddedMember.map((item) => ({
			type: 'addMemberOf' as const,
			listId: item?.id ?? '',
			member: current.distributionName
		})),
		...removeMember.map((item) => ({
			type: 'removeMemberOf' as const,
			listId: item?.id ?? '',
			member: current.distributionName
		}))
	];
}

/* Dynamic Member List — original behavior: one identical request per owner */
function buildDynamicOwnerOperations(
	previous: PreviousDetailSnapshot,
	current: CurrentDetailSnapshot
): Array<SaveOperation> {
	if (!current.dynamic || previous.ownerOfList === undefined) {
		return [];
	}
	if (isEqual(previous.ownerOfList, current.ownerOfList)) {
		return [];
	}

	const previousIds = new Set((previous.ownerOfList ?? []).map((i) => i?.id));
	const currentIds = new Set((current.ownerOfList ?? []).map((i) => i?.id));
	const addedCount = (current.ownerOfList ?? []).filter((item) => !previousIds.has(item?.id)).length;
	const removedCount = (previous.ownerOfList ?? []).filter((item) => !currentIds.has(item?.id)).length;

	return [
		...Array.from({ length: addedCount }, () => ({
			type: 'addMemberOf' as const,
			listId: current.listId,
			member: current.distributionName
		})),
		...Array.from({ length: removedCount }, () => ({
			type: 'removeMemberOf' as const,
			listId: current.listId,
			member: current.distributionName
		}))
	];
}

function buildAliasOperations(current: CurrentDetailSnapshot): Array<SaveOperation> {
	if (isEqual(current.defaultAliases, current.aliases)) {
		return [];
	}

	const deleteAliasArr = differenceBy(current.defaultAliases, current.aliases, 'label');
	const addAliasArr = differenceBy(current.aliases, current.defaultAliases, 'label');

	return [
		...deleteAliasArr.map((aliasName) => ({
			type: 'removeAlias' as const,
			id: current.listId,
			alias: `${aliasName?.label}`
		})),
		...addAliasArr.map((aliasName) => ({
			type: 'addAlias' as const,
			id: current.listId,
			alias: `${aliasName?.label}`
		}))
	];
}

function granteeName(item: { id?: string; name?: string } | string): string {
	if (typeof item === 'string') {
		return item;
	}
	if (item?.name) {
		return item.name;
	}
	return typeof item === 'object' && item !== null ? '' : String(item ?? '');
}

function buildGrantAction(current: CurrentDetailSnapshot): Record<string, unknown> {
	if (current.grantTypeValue === PUB) {
		return { op: 'setRights', right: { right: 'sendToDistList', grantee: [] } };
	}
	if (current.grantTypeValue === GRP) {
		return {
			op: 'setRights',
			right: { right: 'sendToDistList', grantee: [{ type: GRP, by: 'name', _content: current.listName }] }
		};
	}
	if (current.grantTypeValue === ALL) {
		return { op: 'setRights', right: { right: 'sendToDistList', grantee: [{ type: ALL }] } };
	}
	return {
		op: 'setRights',
		right: {
			right: 'sendToDistList',
			grantee: current.grantEmails.map((item) => ({
				type: 'email',
				by: 'name',
				_content: granteeName(item)
			}))
		}
	};
}

function buildGrantOperation(
	previous: PreviousDetailSnapshot,
	current: CurrentDetailSnapshot
): Array<SaveOperation> {
	const grantsUntouched =
		previous.grantEmails === undefined ||
		previous.grantType === undefined ||
		(isEqual(previous.grantEmails, current.grantEmails) &&
			previous.grantType?.value === current.grantTypeValue);
	if (grantsUntouched) {
		return [];
	}
	return [
		{ type: 'action', dl: { by: 'id', _content: current.listId }, action: buildGrantAction(current) }
	];
}

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

	const attributes = buildAttributeOperations(previous, current);
	if (attributes.length > 0) {
		operations.push({ type: 'modify', attributes });
	}

	if (
		previous.distributionName !== undefined &&
		previous.distributionName !== current.distributionName
	) {
		operations.push({ type: 'rename', id: current.listId, newName: current.distributionName });
	}

	operations.push(
		...buildMemberOfOperations(previous, current),
		...buildDynamicOwnerOperations(previous, current),
		...buildAliasOperations(current),
		...buildGrantOperation(previous, current)
	);

	return operations;
}
