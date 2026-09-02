/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Radio, RadioGroup, Row } from '@zextras/ui-components';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { PermissionLevelValue } from './permission-level-radio-group';

type EditPermissionModalProps = {
	open: boolean;
	value: PermissionLevelValue;
	isRequestInProgress: boolean;
	onValueChange: (value: PermissionLevelValue) => void;
	onCancel: () => void;
	onSaveChanges: () => void;
};

export const EditPermissionModal: FC<EditPermissionModalProps> = ({
	open,
	value,
	isRequestInProgress,
	onValueChange,
	onCancel,
	onSaveChanges
}) => {
	const [t] = useTranslation();

	return (
		<Modal
			size="small"
			title={t('domain.distributionList.sendAs.editPermissionLevel', 'Edit permission level')}
			open={open}
			customFooter={
				<Container orientation="horizontal" mainAlignment="flex-end">
					<Row style={{ gap: '1rem' }}>
						<Button
							key={'modal-cancel-button'}
							label={t('label.cancel', 'Cancel')}
							color="gray0"
							type="outlined"
							onClick={onCancel}
							disabled={isRequestInProgress}
						/>
						<Button
							key={'modal-save-button'}
							label={t('domain.distributionList.sendAs.saveChanges', 'SAVE CHANGES')}
							color="primary"
							onClick={onSaveChanges}
							disabled={isRequestInProgress}
						/>
					</Row>
				</Container>
			}
			showCloseIcon
			onClose={onCancel}
		>
			<RadioGroup
				value={value}
				onChange={(changed: string | undefined): void => {
					if (changed) onValueChange(changed as PermissionLevelValue);
				}}
				style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
			>
				<Radio
					key={'send-as-option'}
					label={t('domain.distributionList.sendAs.sendAs', 'Send As')}
					value="sendAs"
					iconColor="primary"
					padding={{ bottom: 'large' }}
				/>
				<Radio
					key={'send-on-behalf-of-option'}
					label={t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of')}
					value="sendOnBehalfOf"
					iconColor="primary"
				/>
			</RadioGroup>
		</Modal>
	);
};
