/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Padding, Row } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

type DeleteDistributionListModalProps = {
	open: boolean;
	listLabel: string;
	totalGrantRights: number;
	isRequestInProgress: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export const DeleteDistributionListModal = ({
	open,
	listLabel,
	totalGrantRights,
	isRequestInProgress,
	onCancel,
	onConfirm
}: DeleteDistributionListModalProps) => {
	const [t] = useTranslation();

	return (
		<Modal
			size="medium"
			title={t('label.you_are_deleting_ml', 'You are deleting {{name}}', {
				name: listLabel
			})}
			open={open}
			customFooter={
				<Container orientation="horizontal" mainAlignment="flex-end">
					<Row style={{ gap: '1rem' }}>
						<Button
							label={t('label.cancel', 'Cancel')}
							color="gray0"
							type="outlined"
							onClick={onCancel}
							disabled={isRequestInProgress}
						/>
						<Button
							label={t('label.yes_delete_it', 'Yes, Delete it')}
							color="error"
							onClick={onConfirm}
							disabled={isRequestInProgress}
						/>
					</Row>
				</Container>
			}
			showCloseIcon
			onClose={onCancel}
		>
			<Container
				padding={{ top: 'large', bottom: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Padding bottom="large">
					{totalGrantRights !== 0 && (
						<Container>
							<ds-text as="p" size={'large'} overflow="break-word">
								<Trans
									i18nKey="label.total_acc_rights_with_delete_distribution_list_helper_text"
									defaults="This list has <bold>{{totalAccRights}}</bold> shared accounts rights. If you delete it all rights will be lost."
									components={{
										bold: <strong />
									}}
									values={{
										totalAccRights: totalGrantRights
									}}
								/>
							</ds-text>
						</Container>
					)}
					<ds-text as="p" size={'large'} overflow="break-word">
						<Trans
							i18nKey="label.are_you_sure_delete_distribution_list"
							defaults="Are you sure you want to delete <bold>{{name}}</bold> ?"
							components={{ bold: <strong /> }}
							values={{
								name: listLabel
							}}
						/>
					</ds-text>
				</Padding>
			</Container>
		</Modal>
	);
};
