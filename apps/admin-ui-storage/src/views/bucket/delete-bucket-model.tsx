/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container,Modal, Row, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const DeleteBucketModel: FC<{
	open: boolean;
	closeHandler: any;
	saveHandler: any;
	BucketDetail: any;
}> = ({ open, closeHandler, saveHandler, BucketDetail }) => {
	const [t] = useTranslation();
	return (
		<>
			<Modal
				size="medium"
				title={t('label.delet_bucket_header', 'Removing {{name}}', {
					name: BucketDetail.bucketName
				})}
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
								onClick={(): void => {
									saveHandler();
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
						`You are deleting {{name}}. Are you sure you want to delete it?`,
						{
							name: BucketDetail.bucketName
						}
					)}
				</Text>
			</Modal>
		</>
	);
};

export default DeleteBucketModel;
