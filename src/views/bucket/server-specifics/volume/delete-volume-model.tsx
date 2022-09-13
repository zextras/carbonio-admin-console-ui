/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Modal, Row, Button, Text, Padding, Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const DeleteVolumeModel: FC<{
	open: boolean;
	closeHandler: any;
	deleteHandler: any;
	volumeDetail: any;
}> = ({ open, closeHandler, deleteHandler, volumeDetail }) => {
	const [t] = useTranslation();
	return (
		<>
			<Modal
				size="medium"
				title={t('label.delet_bucket_header', 'Removing {{name}}', {
					name: volumeDetail.name
				})}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="space-between">
						<Button
							style={{ marginLeft: '10px' }}
							type="outlined"
							label={t('label.need_help_button', 'NEED HELP?')}
							color="primary"
							onClick={closeHandler}
						/>
						<Row style={{ gap: '8px' }}>
							<Button
								label={t('label.cancle_button', 'NO')}
								color="secondary"
								onClick={closeHandler}
							/>
							<Button
								label={t('lable.delete_button', 'DELETE')}
								color="error"
								onClick={(): void => {
									deleteHandler(volumeDetail.id);
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={closeHandler}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '32px 0' }}
				>
					{t(
						'label.delete_content',
						`You are deleting {{name}}. This will be removed. \n Are you sure you want to delete {{name}} ?`,
						{
							name: volumeDetail.name
						}
					)}
				</Text>
			</Modal>
		</>
	);
};

export default DeleteVolumeModel;
