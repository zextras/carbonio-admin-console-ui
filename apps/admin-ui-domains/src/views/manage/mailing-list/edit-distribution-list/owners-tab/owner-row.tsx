/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';

type OwnerCellProps = {
	ownerId: string;
	ownerName: string;
	onSelect: (ownerName: string) => void;
};

const OwnerCell = ({ ownerId, ownerName, onSelect }: OwnerCellProps) => (
	<ds-text
		as="span"
		size="small"
		weight="regular"
		key={ownerId}
		color="gray0"
		onClick={(): void => onSelect(ownerName)}
	>
		{ownerName}
	</ds-text>
);

type DeleteOwnerActionProps = {
	owner: { id?: string; name?: string };
	deleteLabel: string;
	onDelete: (owner: { id?: string; name?: string }) => void;
};

const DeleteOwnerAction = ({ owner, deleteLabel, onDelete }: DeleteOwnerActionProps) => (
	<Button
		key="delete_owner_btn"
		type="ghost"
		color="error"
		size="medium"
		icon="Trash2Outline"
		style={{ position: 'inherit' }}
		aria-label={deleteLabel}
		onClick={(): void => onDelete(owner)}
	/>
);

export type BuildOwnerRowDeps = {
	deleteLabel: string;
	onDelete: (owner: { id?: string; name?: string }) => void;
	onSelect: (ownerName: string) => void;
};

export function buildOwnerRow(
	owner: { id?: string; name?: string },
	deps: BuildOwnerRowDeps
) {
	return {
		id: owner?.name,
		columns: [
			<OwnerCell
				key={owner?.id}
				ownerId={owner?.id ?? ''}
				ownerName={owner?.name ?? ''}
				onSelect={deps.onSelect}
			/>,
			<DeleteOwnerAction
				key="delete_owner_btn"
				owner={owner}
				deleteLabel={deps.deleteLabel}
				onDelete={deps.onDelete}
			/>
		]
	};
}
