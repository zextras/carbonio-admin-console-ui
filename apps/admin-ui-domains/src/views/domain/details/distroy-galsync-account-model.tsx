/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container,Modal, Row, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface GalAccountType {
	id: string;
	name: string;
	server: string;
}

interface AccountDataType {
	id?: string;
	name?: string;
	galAccount?: GalAccountType | null;
}

const DistroyGalsyncAccountModel: FC<{
	open: boolean;
	closeHandler: () => void;
	saveHandler: (accountData: any) => void;
	accountData: AccountDataType;
}> = ({ open, closeHandler, saveHandler, accountData }) => {
	const [t] = useTranslation();
	return (
		<>
			<Modal
				size="medium"
				title={`${t('label.destroy_account', 'Destroy')} ${accountData?.galAccount?.name}`}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
							<Button
								label={t('label.keep_it_button', 'NO, KEEP IT')}
								color="primary"
								type="outlined"
								onClick={closeHandler}
							/>
							<Button
								label={t('label.destroy_account_button', 'YES, DELETE IT')}
								color="error"
								type="outlined"
								onClick={(): void => {
									saveHandler(accountData);
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
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
				>
					{t('label.delete_account', `Are you sure you want to delete {{accountId}}?`, {
						accountId: accountData?.galAccount?.name
					})}
				</Text>
			</Modal>
		</>
	);
};

export default DistroyGalsyncAccountModel;
