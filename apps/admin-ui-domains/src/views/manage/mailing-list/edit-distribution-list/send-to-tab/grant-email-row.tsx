/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';

type GrantEmailCellProps = {
	email: string;
	onSelect: (email: string) => void;
};

const GrantEmailCell = ({ email, onSelect }: GrantEmailCellProps) => (
	<ds-text
		as="span"
		size="small"
		weight="regular"
		key={email}
		color="gray0"
		onClick={(): void => onSelect(email)}
	>
		{email}
	</ds-text>
);

export type BuildGrantEmailRowDeps = {
	deleteLabel: string;
	onDelete: (email: string) => void;
	onSelect: (email: string) => void;
};

export function buildGrantEmailRow(email: string, deps: BuildGrantEmailRowDeps) {
	return {
		id: email,
		columns: [
			<GrantEmailCell key={email} email={email} onSelect={deps.onSelect} />,
			<Button
				key={email + '_delete'}
				type="ghost"
				color={'error'}
				size="medium"
				icon="Trash2Outline"
				style={{ position: 'inherit' }}
				aria-label={deps.deleteLabel}
				onClick={(): void => deps.onDelete(email)}
			/>
		]
	};
}
