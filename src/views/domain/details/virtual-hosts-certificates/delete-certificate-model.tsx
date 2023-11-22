/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Modal, Row, Button, Text, Container } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

const DeleteCertificateModel: FC<{
	open: boolean;
	closeHandler: any;
	deleteHandler: any;
}> = ({ open, closeHandler, deleteHandler }) => {
	const [t] = useTranslation();

	return (
		<>
			<Modal
				size="medium"
				title={t('label.delete_certificate_header', 'Delete Certificates?')}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '1rem' }}>
							<Button
								label={t('label.cancle_button', 'NO')}
								color="secondary"
								onClick={closeHandler}
							/>
							<Button
								label={t('label.delete_button', 'DELETE')}
								color="error"
								onClick={deleteHandler}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={closeHandler}
			>
				<Row padding={{ vertical: 'extralarge' }} mainAlignment="center" crossAlignment="center">
					<Text size={'extralarge'} overflow="break-word" style={{ whiteSpace: 'pre-line' }}>
						<Trans
							i18nKey="label.delete_all_certificates_content"
							defaults="You are deleting All Certificates.<br /> Are you sure you want to delete it?"
							components={{ break: <br /> }}
						/>
					</Text>
				</Row>
			</Modal>
		</>
	);
};

export default DeleteCertificateModel;
