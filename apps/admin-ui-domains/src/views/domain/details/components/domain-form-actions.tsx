/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Padding, Row } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

type DomainFormActionsProps = {
	isDirty: boolean;
	isPending?: boolean;
	isValid?: boolean;
	onCancel: () => void;
	onSave: () => void;
};

export function DomainFormActions({
	isDirty,
	isPending = false,
	isValid = true,
	onCancel,
	onSave
}: Readonly<DomainFormActionsProps>): React.JSX.Element | null {
	const [t] = useTranslation();

	if (!isDirty) return null;

	return (
		<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
			<Padding right="small">
				<Button
					label={t('label.cancel', 'Cancel')}
					color="secondary"
					onClick={onCancel}
					disabled={isPending}
				/>
			</Padding>
			<Button
				label={t('label.save', 'Save')}
				color="primary"
				onClick={onSave}
				disabled={!isValid || isPending}
				loading={isPending}
			/>
		</Row>
	);
}
