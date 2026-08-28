/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Modal, Row } from '@zextras/ui-components';
import { type FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type RemoveOwnerModalProps = {
	open: boolean;
	ownerName: string | undefined;
	isRequestInProgress: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export const RemoveOwnerModal: FC<RemoveOwnerModalProps> = ({
	open,
	ownerName,
	isRequestInProgress,
	onCancel,
	onConfirm
}) => {
	const [t] = useTranslation();

	return (
		<Modal
			size="small"
			title={t('domain.distributionList.owners.removeOwner', 'Remove owner')}
			open={open}
			customFooter={
				<Container orientation="horizontal" mainAlignment="flex-end">
					<Row style={{ gap: '1rem' }}>
						<Button
							label={t('domain.distributionList.NoCancel', 'NO, CANCEL')}
							color="gray0"
							type="outlined"
							onClick={onCancel}
							disabled={isRequestInProgress}
						/>
						<Button
							label={t('domain.distributionList.yesRemoveIt', 'YES, REMOVE IT')}
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
			<Container padding={{ top: 'extralarge', bottom: 'extralarge' }} mainAlignment="flex-start">
				<ds-text as="p" size={'large'} overflow="break-word">
					<Trans
						i18nKey="domain.distributionList.owners.areYouSureDeleteOwner"
						defaults="Are you sure you want to remove <bold>{{name}}</bold> from the owners list?"
						components={{ bold: <strong /> }}
						values={{
							name: ownerName
						}}
					/>
				</ds-text>
			</Container>
		</Modal>
	);
};
