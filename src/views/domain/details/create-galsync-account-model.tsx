/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import {
	Modal,
	Row,
	Button,
	Text,
	Container,
	Padding,
	Input
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../../list/list-row';
import { useDomainStore } from '../../../store/domain/store';

const CreateGalsyncAccountModel: FC<{
	open: boolean;
	closeHandler: () => void;
	saveHandler: (
		accountData: {
			id?: string;
			name: string;
			galAccount?: null;
		},
		galDomainName: string
	) => void;
	accountData: any;
}> = ({ open, closeHandler, saveHandler, accountData }) => {
	const [t] = useTranslation();
	const domain: { name?: string } = useDomainStore((state) => state.domain);

	const [galDomainName, setGalDomainName] = useState('');
	return (
		<>
			<Modal
				size="medium"
				title={t('label.model_label_create_account', 'Create Account')}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
							<Button
								label={t('label.go_back_button', 'GO BACK')}
								color="secondary"
								type="ghost"
								onClick={(): void => {
									closeHandler();
									setGalDomainName('');
								}}
							/>
							<Button
								label={t('label.create_account_button', 'CREATE ACCOUNT')}
								color="primary"
								type="outlined"
								onClick={(): void => {
									saveHandler(accountData, galDomainName);
									setGalDomainName('');
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => {
					setGalDomainName('');
					closeHandler();
				}}
			>
				<ListRow>
					<Padding top="large" horizontal="small" width="100%">
						<Text size="small" color="gray0">
							{t(
								'label.type_account_name_for_global_address_list',
								'Type the Account Name for the Global Address List (GAL)'
							)}
						</Text>
					</Padding>
				</ListRow>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="center"
					width="fill"
					wrap="nowrap"
				>
					<Container padding={{ horizontal: 'small', bottom: 'small' }}>
						<Padding top="medium" bottom="small" horizontal="small" width="100%">
							<Input
								label={t('label.account_name', 'Account Name')}
								backgroundColor="gray5"
								value={galDomainName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setGalDomainName(e.target.value);
								}}
							/>
						</Padding>
					</Container>
					<Container
						padding={{ all: 'small' }}
						width="55%"
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="center"
					>
						<Text weight="bold">{`.${accountData?.name}@${domain?.name}`}</Text>
					</Container>
				</Row>
			</Modal>
		</>
	);
};

export default CreateGalsyncAccountModel;
