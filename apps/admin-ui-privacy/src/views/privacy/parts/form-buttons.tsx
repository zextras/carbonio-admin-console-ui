/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding, Button } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

type FormButtonsProps = { onSave: () => void; onCancel: () => void };

export const FormButtons = ({ onCancel, onSave }: FormButtonsProps) => {
	const [t] = useTranslation();
	return (
		<>
			<Padding right="large">
				<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
			</Padding>
			<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
		</>
	);
};
