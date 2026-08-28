/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';

type MemberCellProps = {
	member: string;
	onSelect: (member: string) => void;
};

const MemberCell = ({ member, onSelect }: MemberCellProps) => (
	<ds-text
		as="span"
		size="small"
		weight="regular"
		key={member}
		color="gray0"
		onClick={(): void => onSelect(member)}
	>
		{member}
	</ds-text>
);

type DeleteMemberActionProps = {
	member: string;
	deleteLabel: string;
	onDelete: (member: string) => void;
};

const DeleteMemberAction = ({ member, deleteLabel, onDelete }: DeleteMemberActionProps) => (
	<Button
		type="ghost"
		color={'error'}
		size="medium"
		icon="Trash2Outline"
		style={{ position: 'inherit' }}
		aria-label={deleteLabel}
		onClick={(): void => onDelete(member)}
	/>
);

export type BuildMemberRowDeps = {
	dynamic: boolean;
	deleteLabel: string;
	onDelete: (member: string) => void;
	onSelect: (member: string) => void;
};

export function buildMemberRow(member: string, deps: BuildMemberRowDeps) {
	return {
		id: member,
		columns: [
			<MemberCell key={member} member={member} onSelect={deps.onSelect} />,
			deps.dynamic ? null : (
				<DeleteMemberAction
					key={`${member}-delete`}
					member={member}
					deleteLabel={deps.deleteLabel}
					onDelete={deps.onDelete}
				/>
			)
		]
	};
}
