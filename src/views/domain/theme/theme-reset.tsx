/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import {
	Container,
	Row,
	Padding,
	Text,
	Button,
	Icon,
	Modal
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

export const ResetTheme: FC<{
	title: string;
	isOpenResetDialog: boolean;
	isRequestInProgress: boolean;
	closeHandler: CallableFunction;
	onResetHandler: CallableFunction;
}> = ({ title, isOpenResetDialog, isRequestInProgress, closeHandler, onResetHandler }) => {
	const [t] = useTranslation();
	return (
		<Modal
			size="medium"
			title={title}
			open={isOpenResetDialog}
			customFooter={
				<Container orientation="horizontal" mainAlignment="space-between">
					<Button
						style={{ marginLeft: '10px' }}
						type="outlined"
						label={t('label.help', 'Help')}
						color="primary"
					/>
					<Row style={{ gap: '8px' }}>
						<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={closeHandler} />
						<Button
							label={t('label.yes', 'Yes')}
							color="error"
							onClick={onResetHandler}
							disabled={isRequestInProgress}
						/>
					</Row>
				</Container>
			}
			showCloseIcon
			onClose={closeHandler}
		>
			<Container>
				<Padding bottom="medium" top="medium">
					<Text size={'extralarge'} overflow="break-word">
						<Trans
							i18nKey="label.reset_theme_content_1"
							defaults="You are you sure to reset the theme ?"
							components={{}}
						/>
					</Text>
				</Padding>
				<Padding bottom="medium">
					<Text size="extralarge" overflow="break-word">
						<Trans
							i18nKey="label.reset_theme_content_2"
							defaults="If you click YES button all data will be lost."
							components={{}}
						/>
					</Text>
				</Padding>
				<Row padding={{ bottom: 'large' }}>
					<Icon
						icon="AlertTriangleOutline"
						size="large"
						style={{ height: '48px', width: '48px' }}
					/>
				</Row>
			</Container>
		</Modal>
	);
};
