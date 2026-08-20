/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZIMBRA_ADMIN_URN } from '../../../../constants';

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

/** Table rows for a delegate identity, with derived right flags used by the simplified view filters. */
export function buildDelegateRows(identities: Array<DelegateIdentity>): Array<DelegateRow> {
	return (identities ?? []).map((item) => {
		const grantee = item?.grantee?.[0];
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
					{item?.right?.[0]?._content === 'sendAs' ? 'Send As' : ''}
					{item?.right?.[0]?._content === 'sendOnBehalfOf' ? 'Send on Behalf Of' : ''}
				</ds-text>,
				<ds-text as="span" size="medium" weight="light" key={`${grantee?.id}-sharing`} color="#414141">
					{item?.folder?.some((ele) => ele.perm.includes('r') && !ele.perm.includes('w'))
						? 'Read'
						: ' '}
					{item?.folder?.some((ele) => ele.perm.includes('w')) ? 'Read, Write' : ' '}
				</ds-text>,
			],
			sendRights: !!(
				item?.right?.[0]?._content === 'sendAs' ||
				item?.right?.[0]?._content === 'sendOnBehalfOf'
			),
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

/** ChipInput options from a raw SearchDirectory response; the edited account is excluded. */
export function parseDelegateDirectoryOptions(
	res: any,
	selfId: string | undefined,
): Array<{ id: string; label: string; type: string; ele: any }> {
	const options: Array<{ id: string; label: string; type: string; ele: any }> = [];
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

export type DelegateTarget = {
	targetName: string;
	granteeType: string;
	granteeName: string;
	right: string;
};

/** SOAP RevokeRight envelope for an admin right (sendAs / sendOnBehalfOf). */
export function buildRevokeRight(target: DelegateTarget): any {
	return {
		_jsns: ZIMBRA_ADMIN_URN,
		target: { _content: target.targetName, type: 'account', by: 'name' },
		grantee: { by: 'name', type: target.granteeType, _content: target.granteeName },
		right: { _content: target.right },
	};
}

/** SOAP GrantRight envelope for an admin right (sendAs / sendOnBehalfOf). */
export function buildGrantRight(target: DelegateTarget): any {
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

export type SimplifiedRightsChecks = {
	sendRightCheck: boolean;
	sendBehalfRightCheck: boolean;
	readRightWriteCheck: boolean;
	readRightCheck: boolean;
};

/** Grant batch for the simplified view: revoke-then-grant send rights, folder grants. */
export function buildSimplifiedGrantBatch(
	selected: Array<any>,
	checks: SimplifiedRightsChecks,
	targetName: string,
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
			revokeUsrRigths.push(
				buildRevokeRight({ ...target, right: checks.sendRightCheck ? 'sendOnBehalfOf' : 'sendAs' }),
			);
			grantUsrRigths.push(buildGrantRight(target));
		}
		if (checks.readRightWriteCheck || checks.readRightCheck) {
			folderUsrRights.push(
				buildFolderGrant({
					folderIds: '1',
					granteeType: item?.type,
					granteeName: item?.ele?.name,
					perm: checks.readRightWriteCheck ? 'rwidxa' : 'r',
				}),
			);
		}
	});

	return { revokeUsrRigths, grantUsrRigths, folderUsrRights };
}

/** Revoke batch for the simplified view tables, scoped by rights type. */
export function buildSimplifiedRevokeBatch(
	selectedDelegates: Array<any>,
	rightsType: string,
	targetName: string,
): { revokeUsrRigths: any[]; folderUsrRights: any[] } {
	const revokeUsrRigths: any[] = [];
	const folderUsrRights: any[] = [];

	selectedDelegates.forEach((selectedDelegate: any) => {
		if (selectedDelegate) {
			if (
				(rightsType === 'readWrite' || rightsType === 'read') &&
				selectedDelegate?.folder?.length
			) {
				selectedDelegate.folder.forEach((ele: any) => {
					folderUsrRights.push(buildFolderRevoke(ele));
				});
			}
			if (rightsType === 'send' && selectedDelegate?.right?.[0]?._content) {
				revokeUsrRigths.push(
					buildRevokeRight({
						targetName,
						granteeType: selectedDelegate?.grantee?.[0]?.type,
						granteeName: selectedDelegate?.grantee?.[0]?.name,
						right: selectedDelegate?.right?.[0]?._content,
					}),
				);
			}
		}
	});

	return { revokeUsrRigths, folderUsrRights };
}
