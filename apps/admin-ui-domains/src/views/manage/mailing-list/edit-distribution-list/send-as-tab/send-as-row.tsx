/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container } from '@zextras/ui-components';

type SendAsRowDeps = {
	editLabel: string;
	deleteLabel: string;
	sendAsLabel: string;
	sendOnBehalfOfLabel: string;
	onEdit: (item: { name?: string; sendAcl?: string; id?: string }) => void;
	onDelete: (item: { name?: string; sendAcl?: string; id?: string }) => void;
	onSelect: (name: string) => void;
};

export function buildSendAsRow(
	item: { id?: string; name?: string; sendAcl?: string },
	deps: SendAsRowDeps
) {
	return {
		id: item?.name,
		columns: [
			<ds-text
				key={item?.id}
				as="span"
				size="small"
				weight="regular"
				color="gray0"
				onClick={(): void => deps.onSelect(item?.name ?? '')}
			>
				{item?.name}
			</ds-text>,
			<ds-text
				key={item?.id + '_acl'}
				as="span"
				size="small"
				weight="regular"
				color="gray0"
				onClick={(): void => deps.onSelect(item?.name ?? '')}
			>
				{item?.sendAcl === 'sendAsDistList' ? deps.sendAsLabel : deps.sendOnBehalfOfLabel}
			</ds-text>,
			<Container key="send_email_actions" orientation="horizontal" mainAlignment="flex-start">
				<Button
					type="ghost"
					color="primary"
					size="medium"
					icon="EditOutline"
					style={{ position: 'inherit', marginRight: '0.5rem' }}
					aria-label={deps.editLabel}
					onClick={(): void => deps.onEdit(item)}
				/>
				<Button
					type="ghost"
					color={'error'}
					size="medium"
					icon="Trash2Outline"
					style={{ position: 'inherit' }}
					aria-label={deps.deleteLabel}
					onClick={(): void => deps.onDelete(item)}
				/>
			</Container>
		]
	};
}
