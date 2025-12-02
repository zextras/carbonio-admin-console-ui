/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row, Padding, Button } from '@zextras/carbonio-design-system';
import { t } from 'i18next';
import React from 'react';

type FormButtonsProps = { onSave: () => void; onCancel: () => void };

export const FormButtons = ({ onCancel, onSave }: FormButtonsProps) => (
	<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
		<Padding right="large">
			<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
		</Padding>
		<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
	</Row>
);
