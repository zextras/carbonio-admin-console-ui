/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Modal, Row, Button, Text, Container } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { STARTED } from '../../constants';

const DeleteOpearationsModel: FC<{
	open: boolean;
	closeHandler: any;
	saveHandler: any;
	selectedData: any;
}> = ({ open, closeHandler, saveHandler, selectedData }) => {
	const [t] = useTranslation();

	return (
		<>
			<Modal
				size="medium"
				title={
					selectedData?.state === STARTED
						? t(
								'operations.stopping_operation_model_title_helperText',
								'You are stopping {{operationName}}',
								{
									operationName: selectedData?.name
								}
						  )
						: t(
								'operations.cancel_operation_model_title_helperText',
								'You are cancelling {{operationName}}',
								{
									operationName: selectedData?.name
								}
						  )
				}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '1rem' }} padding={{ right: 'small' }}>
							<Button
								type="outlined"
								label={t('operations.label.let_it_run_btn', 'LET IT RUN')}
								color="primary"
								onClick={closeHandler}
							/>
							<Button
								label={
									selectedData?.state !== STARTED
										? t('operations.label.cancel_operation_btn', 'CANCEL OPERATION')
										: t('operations.label.stop_operation_btn', 'STOP OPERATION')
								}
								color="error"
								onClick={saveHandler}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={closeHandler}
			>
				<Row
					mainAlignment="center"
					crossAlignment="center"
					padding={{ top: 'small', bottom: 'large' }}
				>
					<Text
						size={'extralarge'}
						overflow="break-word"
						style={{ whiteSpace: 'pre-line', textAlign: 'center', paddingBottom: '1rem' }}
					>
						{selectedData?.state !== STARTED ? (
							<Trans
								i18nKey="label.cancel_operations_message"
								defaults="Are you sure you want to CANCEL this operation? <br /> By clicking CANCEL OPERATION, it will be <br /> removed from the operations queue list."
								components={{ break: <br /> }}
							/>
						) : (
							<Trans
								i18nKey="label.stop_operations_message"
								defaults="Are you sure you want to STOP this operation? <br /> By clicking STOP OPERATION, it will be stopped and <br /> removed from the operations queue list."
								components={{ break: <br /> }}
							/>
						)}
					</Text>
				</Row>
			</Modal>
		</>
	);
};

export default DeleteOpearationsModel;
