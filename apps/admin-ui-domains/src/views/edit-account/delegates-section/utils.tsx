/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter } from 'lodash-es';

import {
	MANAGE_NO_SEND,
	READ_MAILS_ONLY,
	SEND_MAILS_ONLY,
	SEND_READ_MAILS,
	SEND_READ_MANAGE_MAILS,
	ZIMBRA_ADMIN_URN,
} from '../../../constants';
import { isValidEmail } from '../../utility/utils';

export type DelegateIdentity = {
	grantee?: Array<{ id: string; name: string; type: string }>;
	right?: Array<{ _content: string }>;
	folder?: Array<{ id: string; zid: string; perm: string }>;
};

export type DelegateRow = {
	id: string;
	columns: Array<React.ReactElement>;
	sendRights: boolean;
	readFolder: boolean;
	writeFolder: boolean;
	identity: DelegateIdentity;
	clickable: boolean;
};

const SEND_RIGHT_LABELS: Record<string, string> = {
	sendAs: 'Send As',
	sendOnBehalfOf: 'Send on Behalf Of',
};

/** Rights of the identity that are send rights (sendAs / sendOnBehalfOf), in stored order. */
export function getSendRights(identity: DelegateIdentity | undefined): Array<string> {
	return (identity?.right ?? [])
		.map((right) => right._content)
		.filter((content) => Object.hasOwn(SEND_RIGHT_LABELS, content));
}

/** Table rows for a delegate identity, with derived right flags used by the simplified view filters. */
export function buildDelegateRows(identities: Array<DelegateIdentity>): Array<DelegateRow> {
	return (identities ?? []).map((item) => {
		const grantee = item?.grantee?.[0];
		const sendRights = getSendRights(item);
		return {
			id: grantee?.id ?? '',
			columns: [
				<ds-text as="span" size="medium" weight="light" key={`${grantee?.id}-name`} color="#414141">
					{grantee?.name || ' '}
				</ds-text>,
				<ds-text as="span" size="medium" weight="light" key={`${grantee?.id}-type`} color="#414141">
					{grantee?.type === 'usr' ? 'Single User' : 'Group'}
				</ds-text>,
				<ds-text as="span" size="medium" weight="light" key={`${grantee?.id}-rights`} color="#414141">
					{sendRights.map((right) => SEND_RIGHT_LABELS[right]).join(', ')}
				</ds-text>,
				<ds-text as="span" size="medium" weight="light" key={`${grantee?.id}-sharing`} color="#414141">
					{item?.folder?.some((ele) => ele.perm.includes('r') && !ele.perm.includes('w'))
						? 'Read'
						: ' '}
					{item?.folder?.some((ele) => ele.perm.includes('w')) ? 'Read, Write' : ' '}
				</ds-text>,
			],
			sendRights: sendRights.length > 0,
			readFolder: !!item?.folder?.some((ele) => ele.perm.includes('r')),
			writeFolder: !!item?.folder?.some((ele) => ele.perm.includes('w')),
			identity: item,
			clickable: true,
		};
	});
}

/** Combined account + distribution-list LDAP filter for the delegates chip search. */
export function buildDelegateSearchQuery(search: string): string {
	if (search.length < 2) {
		return '';
	}
	return `(|(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*${search}*))(&(objectClass=zimbraDistributionList)(mail=*${search}*)))`;
}

export type DelegateOption = { id: string; label: string; type: string; ele: any };

/** ChipInput options from a raw SearchDirectory response; the edited account is excluded. */
export function parseDelegateDirectoryOptions(
	res: any,
	selfId: string | undefined,
): Array<DelegateOption> {
	const options: Array<DelegateOption> = [];
	(res?.account ?? []).forEach((entry: any) => {
		if (entry.id !== selfId) {
			options.push({ id: entry.id, label: entry.name, type: 'usr', ele: entry });
		}
	});
	(res?.dl ?? []).forEach((entry: any) => {
		options.push({ id: entry.id, label: entry.name, type: 'grp', ele: entry });
	});
	return options;
}

/**
 * Chips and grant targets for the chip input's current contacts. Both lists come from the same
 * filtered set, so a visible chip is always a grant target and vice versa: a contact is kept only
 * when it is a valid address that resolves to a previously selected entry or a search option.
 */
export function resolveDelegateChips<T extends { label?: string }>(
	contacts: Array<T>,
	previousEntries: Array<DelegateOption>,
	options: Array<DelegateOption>,
): { chips: Array<T>; entries: Array<DelegateOption> } {
	const chips: Array<T> = [];
	const entries: Array<DelegateOption> = [];
	(contacts ?? []).forEach((contact) => {
		if (!isValidEmail(contact.label ?? '')) {
			return;
		}
		const entry =
			previousEntries.find((e) => e.label === contact.label) ??
			options.find((o) => o.label === contact.label);
		if (entry) {
			chips.push(contact);
			entries.push(entry);
		}
	});
	return { chips, entries };
}

export type DelegateTarget = {
	targetName: string;
	granteeType: string;
	granteeName: string;
	right: string;
};

/** SOAP GrantRight/RevokeRight envelope for an admin right (sendAs / sendOnBehalfOf). */
export function buildAdminRightEnvelope(target: DelegateTarget): any {
	return {
		_jsns: ZIMBRA_ADMIN_URN,
		target: { _content: target.targetName, type: 'account', by: 'name' },
		grantee: { by: 'name', type: target.granteeType, _content: target.granteeName },
		right: { _content: target.right },
	};
}

/** SOAP FolderAction envelope granting folder permissions. */
export function buildFolderGrant(params: {
	folderIds: string;
	granteeType: string;
	granteeName: string;
	perm: string;
}): any {
	return {
		_jsns: 'urn:zimbraMail',
		action: {
			op: 'grant',
			id: params.folderIds,
			grant: {
				perm: params.perm,
				gt: params.granteeType,
				d: params.granteeName,
				pw: '',
			},
		},
	};
}

/** SOAP FolderAction envelope revoking a folder grant. */
export function buildFolderRevoke(folder: { id: string; zid: string }): any {
	return {
		_jsns: 'urn:zimbraMail',
		action: { op: '!grant', id: folder.id, zid: folder.zid },
	};
}

/**
 * Revoke batch removing a delegate: every folder grant plus either all of its rights ('all',
 * removing the row) or only its send rights ('send', used before re-granting on edit so
 * unrelated rights such as viewFreeBusy survive).
 */
export function buildDelegateRevoke(
	identity: DelegateIdentity,
	targetName: string,
	rights: 'all' | 'send',
): { revokeUsrRigths: any[]; folderUsrRights: any[] } {
	const rightNames =
		rights === 'send' ? getSendRights(identity) : (identity.right ?? []).map((r) => r._content);
	return {
		revokeUsrRigths: rightNames.map((right) =>
			buildAdminRightEnvelope({
				targetName,
				granteeType: identity.grantee?.[0]?.type ?? '',
				granteeName: identity.grantee?.[0]?.name ?? '',
				right,
			}),
		),
		folderUsrRights: (identity.folder ?? []).map((folder) => buildFolderRevoke(folder)),
	};
}

/** Advanced-wizard "what rights" option matching an identity's current grants, if any. */
export function getDelegateRightsType(identity: DelegateIdentity): string | undefined {
	const perm = identity.folder?.[0]?.perm;
	const canSend = getSendRights(identity).length > 0;
	if (!identity.folder?.length) {
		return SEND_MAILS_ONLY;
	}
	if (perm === 'r') {
		return canSend ? SEND_READ_MAILS : READ_MAILS_ONLY;
	}
	if (perm === 'rwidxa') {
		return canSend ? SEND_READ_MANAGE_MAILS : MANAGE_NO_SEND;
	}
	return undefined;
}

export type SimplifiedRightsChecks = {
	sendRightCheck: boolean;
	sendBehalfRightCheck: boolean;
	readWriteRightCheck: boolean;
	readRightCheck: boolean;
};

/**
 * Grant batch for the simplified view. Choosing a send right replaces the other one, so the
 * opposite right is revoked only when the grantee currently holds it (a revoke of a missing grant
 * would otherwise surface as a batch fault).
 */
export function buildSimplifiedGrantBatch(
	selected: Array<any>,
	checks: SimplifiedRightsChecks,
	targetName: string,
	identities: Array<DelegateIdentity> = [],
): { revokeUsrRigths: any[]; grantUsrRigths: any[]; folderUsrRights: any[] } {
	const revokeUsrRigths: any[] = [];
	const grantUsrRigths: any[] = [];
	const folderUsrRights: any[] = [];

	selected?.forEach((item: any) => {
		if (checks.sendRightCheck || checks.sendBehalfRightCheck) {
			const target = {
				targetName,
				granteeType: item.type,
				granteeName: item?.ele?.name,
				right: checks.sendRightCheck ? 'sendAs' : 'sendOnBehalfOf',
			};
			const oppositeRight = checks.sendRightCheck ? 'sendOnBehalfOf' : 'sendAs';
			const current = identities.find(
				(identity) =>
					identity.grantee?.[0]?.name?.toLowerCase() === target.granteeName?.toLowerCase(),
			);
			if (getSendRights(current).includes(oppositeRight)) {
				revokeUsrRigths.push(buildAdminRightEnvelope({ ...target, right: oppositeRight }));
			}
			grantUsrRigths.push(buildAdminRightEnvelope(target));
		}
		if (checks.readWriteRightCheck || checks.readRightCheck) {
			folderUsrRights.push(
				buildFolderGrant({
					folderIds: '1',
					granteeType: item?.type,
					granteeName: item?.ele?.name,
					perm: checks.readWriteRightCheck ? 'rwidxa' : 'r',
				}),
			);
		}
	});

	return { revokeUsrRigths, grantUsrRigths, folderUsrRights };
}

/** Revoke batch for the simplified view tables, scoped by rights type. */
export function buildSimplifiedRevokeBatch(
	selectedDelegates: Array<DelegateIdentity>,
	rightsType: string,
	targetName: string,
): { revokeUsrRigths: any[]; folderUsrRights: any[] } {
	const revokeUsrRigths: any[] = [];
	const folderUsrRights: any[] = [];

	selectedDelegates.forEach((selectedDelegate) => {
		if (!selectedDelegate) {
			return;
		}
		if (rightsType === 'readWrite' || rightsType === 'read') {
			selectedDelegate.folder?.forEach((ele) => {
				folderUsrRights.push(buildFolderRevoke(ele));
			});
		}
		if (rightsType === 'send') {
			getSendRights(selectedDelegate).forEach((right) => {
				revokeUsrRigths.push(
					buildAdminRightEnvelope({
						targetName,
						granteeType: selectedDelegate.grantee?.[0]?.type ?? '',
						granteeName: selectedDelegate.grantee?.[0]?.name ?? '',
						right,
					}),
				);
			});
		}
	});

	return { revokeUsrRigths, folderUsrRights };
}

export type DelegateRightsType = 'readWrite' | 'read' | 'send';

type RightsSelectionSpec = {
	/** lodash-style filter over the derived rows for "remove all". */
	allFilter: Partial<{ writeFolder: boolean; readFolder: boolean; sendRights: boolean }>;
};

const RIGHTS_SELECTION_SPECS: Record<DelegateRightsType, RightsSelectionSpec> = {
	readWrite: { allFilter: { writeFolder: true, readFolder: true } },
	read: { allFilter: { writeFolder: false, readFolder: true } },
	send: { allFilter: { sendRights: true } },
};

/**
 * Identities selected for a simplified-view removal: the single selection of
 * the matching table when `single` is true, otherwise every row matching the
 * rights type.
 */
export function selectDelegatesForRemoval(
	rightsType: DelegateRightsType,
	single: boolean,
	selectedRowId: string | undefined,
	identitiesList: Array<DelegateIdentity>,
	identityRows: Array<DelegateRow>,
): Array<DelegateIdentity> {
	if (single) {
		const found = selectedRowId
			? identitiesList.find((o) => o?.grantee?.[0]?.id === selectedRowId)
			: undefined;
		return found ? [found] : [];
	}
	return (
		filter(identityRows, RIGHTS_SELECTION_SPECS[rightsType].allFilter) as Array<DelegateRow>
	).map((row) => row.identity);
}
