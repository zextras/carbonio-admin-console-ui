/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type TabDirtyGuardModalProps = {
	open: boolean;
	onExitWithoutSave: () => void;
	onSaveAndExit: () => void;
	onClose: () => void;
};

export const TabDirtyGuardModal = ({
	open,
	onExitWithoutSave,
	onSaveAndExit,
	onClose
}: TabDirtyGuardModalProps) => {
	const [t] = useTranslation();

	return (
		<Modal
			size="small"
			title={t('domain.distributionList.unsavedChanges', 'Unsaved Changes')}
			open={open}
			customFooter={
				<Container orientation="horizontal" mainAlignment="flex-end">
					<Row style={{ gap: '1rem' }}>
						<Button
							label={t('domain.distributionList.exitWithoutSave', 'Exit without Save')}
							color="gray0"
							type="outlined"
							onClick={onExitWithoutSave}
						/>
						<Button
							label={t('domain.distributionList.saveAndExit', 'Save & Exit')}
							color="primary"
							onClick={onSaveAndExit}
						/>
					</Row>
				</Container>
			}
			showCloseIcon
			onClose={onClose}
		>
			<Container padding={{ top: 'extralarge', bottom: 'extralarge' }} mainAlignment="flex-start">
				<ds-text as="p" size="large" overflow="break-word">
					{t(
						'domain.distributionList.unsavedChangesMessage',
						'Are you sure you want to leave this page without saving?'
					)}
				</ds-text>
			</Container>
		</Modal>
	);
};
