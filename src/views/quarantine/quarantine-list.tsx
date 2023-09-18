/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, find } from 'lodash';
import {
	Container,
	Input,
	Row,
	Text,
	Button,
	Divider,
	SnackbarManagerContext,
	Modal,
	Select,
	Table
} from '@zextras/carbonio-design-system';

import moment from 'moment';
import { createAccountRequest } from '../../services/create-account';
import { MessageTableHeaders, RandomString } from '../utility/utils';
import { getAllConfig } from '../../services/get-all-config';
import { getDelegateAuthRequest } from '../../services/get-delegate-auth-request';
import { useConfigStore } from '../../store/config/store';
import { modifyConfig } from '../../services/modify-config';
import { deleteAccount } from '../../services/delete-account-service';
import { getAccountRequest } from '../../services/get-account';
import { getQuarantineMessages } from '../../services/get-quarantine-messages-service';
import ListRow from '../list/list-row';
import logo from '../../assets/ninja_robo.svg';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';

const getDateTime = (d: number): string => {
	const date = new Date(d);
	const formattedDate = moment(date).format('DD/MM/YY HH:mm');
	return formattedDate;
};

const MessageListTable: FC<{
	messages: { [key: string]: string }[];
	selectedRows: string[];
	onSelectionChange: (selected: string[]) => void;
}> = ({ messages, selectedRows, onSelectionChange }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			messages.map((v: any, i: number) => ({
				id: i,
				columns: [
					<Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={v.id}>
						<Text size="small" weight="regular">
							{getDateTime(v?.d)}
						</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text size="small" weight="light">
							{find(v?.e, { t: 't' })?.a}
						</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text size="small" weight="light">
							{v.su}
						</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text size="small" weight="light"></Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text size="small" weight="light"></Text>
					</Row>
				],
				clickable: true
			})),
		[messages]
	);
	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<ListRow>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					maxHeight="calc(100vh - 25rem)"
					minHeight="auto"
				>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-ignore */}
					<Table
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						headers={MessageTableHeaders(t)}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						rows={tableRows}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedRows}
						onSelectionChange={onSelectionChange}
						RowFactory={CustomRowFactory}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{tableRows.length === 0 && (
				<Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '3rem' }}>
					<Text overflow="break-word" weight="regular" size="large">
						<img src={logo} alt="logo" />
					</Text>
				</Container>
			)}
		</Container>
	);
};

const QuarantineList: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [quarantineAccountName, setQuarantineAccountName] = useState<string>('');
	const [quarantineDomaintName, setQuarantineDomaintName] = useState<string>('');
	const [configDataLoaded, setConfigDataLoaded] = useState<boolean>(false);
	const [deleteQuarantuneAccModal, setDeleteQuarantuneAccModal] = useState<boolean>(false);
	const [messageListData, setMessageListData] = useState([]);
	const { config, setConfig } = useConfigStore((state) => state);
	const [messageSelection, setMessageSelection] = useState<string[]>([]);
	const onViewMail = useCallback(
		(name) => {
			getDelegateAuthRequest('', name)
				.then((data) => {
					if (data?.authToken?.[0]) {
						window.open(
							`https://${window.location.hostname}/service/preauth?authtoken=${data?.authToken?.[0]._content}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
							'blank'
						);
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t(
								'label.something_wrong_error_msg',
								'Something went wrong. Please try again.'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t]
	);

	const getAllConfigData = useCallback((): void => {
		getAllConfig().then((res) => {
			if (res?.a) {
				setConfig(res.a);
			}
		});
	}, [setConfig]);
	useEffect(() => {
		const propertiesToExtract = ['zimbraAmavisQuarantineAccount', 'zimbraDefaultDomainName'];

		const obj: { [key: string]: string | { label: string }[] } = {};
		propertiesToExtract.forEach((property) => {
			const items = filter(config, { n: property });
			const item = items[0];
			obj[property] = item?._content;
		});
		if (obj.zimbraAmavisQuarantineAccount) {
			setQuarantineAccountName(obj.zimbraAmavisQuarantineAccount.toString());

			getAccountRequest('', obj.zimbraAmavisQuarantineAccount.toString(), 0).then((res) => {
				if (res?.account?.[0]?.id) {
					getQuarantineMessages(res?.account?.[0]?.id).then((response: any): void => {
						const data = response?.Body?.SearchResponse?.m;
						setMessageListData(data);
					});
				}
			});
		}
		if (obj.zimbraDefaultDomainName) {
			setQuarantineDomaintName(obj.zimbraDefaultDomainName.toString());
		}
		setConfigDataLoaded(true);
	}, [config, getAllConfigData]);

	const onChange = (): void => {
		console.log('__interval change');
	};

	const createAccountAPI = useCallback((): void => {
		const deleteAccountName = quarantineAccountName;
		createAccountRequest(
			{
				givenName: `virus-quarantine`,
				initials: '',
				sn: '',
				amavisBypassSpamChecks: 'TRUE',
				zimbraAttachmentsIndexingEnabled: 'FALSE',
				zimbraIsSystemResource: 'TRUE',
				zimbraHideInGal: 'TRUE',
				zimbraMailMessageLifetime: '7d',
				zimbraMailQuota: 0,
				description: 'System account for Anti-virus quarantine.'
			},
			`virus-quarantine.${RandomString()}@${quarantineDomaintName}`,
			''
		)
			.then((data) => {
				if (data?.account[0]?.name) {
					modifyConfig([
						{
							n: 'zimbraAmavisQuarantineAccount',
							_content: data?.account[0]?.name
						}
					])
						.then(() => {
							createSnackbar({
								key: 'success',
								type: 'success',
								label: t(
									'label.account_created_successfully',
									'The account has been created successfully'
								),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
							getAllConfigData();
							if (deleteAccountName) {
								getAccountRequest('', deleteAccountName, 0).then((res) => {
									if (res?.account?.[0]?.id) {
										deleteAccount(res?.account?.[0]?.id).then();
									}
								});
							}
						})
						.catch((error) => {
							createSnackbar({
								key: 'error',
								type: 'error',
								label: error?.message
									? error?.message
									: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						});
				}

				getAllConfigData();
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, getAllConfigData, quarantineAccountName, quarantineDomaintName, t]);
	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('quarantine.quarantine', 'Quarantine')}
							</Text>
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				height="calc(100vh - 12.5rem)"
				padding={{ top: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						{configDataLoaded ? (
							<>
								{!quarantineAccountName ? (
									<>
										<Row>
											<Text size="small">
												{t(
													'quarantine.not_quarantine_account',
													'There is not quarantine account in any of the domains, yet. Do you want to create a system quarantine account?'
												)}
											</Text>
										</Row>
										<Row width="100%" padding={{ top: 'large' }}>
											<Button
												type="outlined"
												label={t('quarantine.create_quarantine', 'CREATE A QUARANTINE ACCOUNT')}
												color="primary"
												width="fill"
												onClick={(): void => {
													createAccountAPI();
												}}
											/>
										</Row>
									</>
								) : (
									<>
										<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
											<Row width="100%" mainAlignment="space-between">
												<Input
													label={t('quarantine.quarantine_account', 'Quarantine Account')}
													value={quarantineAccountName}
												/>
											</Row>
										</Row>
										<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
											<Button
												type="outlined"
												label={t(
													'quarantine.delete_and_recreate_quarantine',
													'DELETE AND RE-CREATE QUARANTINE ACCOUNT'
												)}
												color="error"
												width="fill"
												onClick={(): void => {
													setDeleteQuarantuneAccModal(true);
												}}
											/>
										</Row>
										<Row padding={{ top: 'small' }} width="100%" mainAlignment="center">
											<Text size="small" color={'gray1'}>
												{t(
													'quarantine.to_make_changes_restart_the_MTA',
													'To make the changes effective, please restart the MTA.'
												)}
											</Text>
										</Row>
										<Row
											padding={{ top: 'large' }}
											orientation="horizontal"
											width="100%"
											background="gray6"
										>
											<Divider />
										</Row>
										<Row orientation="horizontal" width="100%" padding={{ vertical: 'large' }}>
											<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
												<Text size="medium" weight="bold" color="gray0">
													{t('label.settings', 'Settings')}
												</Text>
											</Row>
										</Row>
										<ListRow>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												orientation="horizontal"
												padding={{ right: 'small', bottom: 'small' }}
												width="79%"
											>
												<Input
													label={t('label.retention_period', 'Retention Period (value)')}
													backgroundColor="gray5"
													readOnly
												/>
											</Container>
											<Container
												padding={{ bottom: 'small' }}
												mainAlignment="flex-start"
												orientation="horizontal"
												width="20%"
											>
												<Select
													items={[
														{
															label: 'Interval',
															value: '1'
														}
													]}
													label="Interval"
													onChange={onChange}
													showCheckbox={false}
												/>
											</Container>
										</ListRow>
										<Row
											padding={{ vertical: 'extralarge' }}
											orientation="horizontal"
											width="100%"
											background="gray6"
										>
											<Divider />
										</Row>
										<Row
											orientation="horizontal"
											width="100%"
											padding={{ top: 'small', bottom: 'large' }}
										>
											<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
												<Text size="medium" weight="bold" color="gray0">
													{t('label.messages', 'Messages')}
												</Text>
											</Row>
										</Row>
										<Row
											width="100%"
											mainAlignment="flex-end"
											style={{ gap: '1rem' }}
											orientation="horizontal"
											padding={{ bottom: 'large' }}
										>
											<Button
												type="outlined"
												label={t('label.auto_clean_up', 'AUTO CLEAN-UP')}
												color="primary"
												onClick={(): void => {
													console.log('__clicked');
												}}
												disabled
											/>
											<Button
												type="outlined"
												label={t('label.deliver', 'DELIVER')}
												color="primary"
												onClick={(): void => {
													console.log('__clicked');
												}}
											/>
											<Button
												type="ghost"
												label={t('label.delete', 'DELETE')}
												color="error"
												onClick={(): void => {
													console.log('__clicked');
												}}
											/>
										</Row>
										<Row width="100%" padding={{ bottom: 'extralarge' }}>
											<MessageListTable
												messages={messageListData}
												selectedRows={messageSelection}
												onSelectionChange={(selected: any): void => {
													setMessageSelection(selected);
												}}
											/>
										</Row>
										{/* <Row width="100%" padding={{ top: 'large' }}>
											<Button
												type="outlined"
												label={t('label.view_mail', 'VIEW MAIL')}
												color="primary"
												width="fill"
												onClick={(): void => {
													onViewMail(quarantineAccountName);
												}}
											/>
										</Row> */}
									</>
								)}
							</>
						) : (
							<>
								<Container
									crossAlignment="center"
									mainAlignment="center"
									height="auto"
									padding={{ top: 'medium' }}
								>
									<Button
										type="ghost"
										color="primary"
										label=""
										loading
										onClick={(): null => null}
									/>
								</Container>
							</>
						)}
					</Container>
				</Row>
			</Container>
			<Modal
				size="medium"
				title={`${t(
					'quarantine.delete_and_recrate_quarantine_account_title',
					'Delete and re-create quarantine account'
				)}`}
				open={deleteQuarantuneAccModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }} padding={{ right: 'medium' }}>
							<Button
								label={t('label.keep_it_button', 'NO, KEEP IT')}
								color="primary"
								type="outlined"
								onClick={(): void => setDeleteQuarantuneAccModal(false)}
							/>
							<Button
								label={t(
									'quarantine.destroy_account_recreate_button',
									'YES, DELETE AND RE-CREATE IT'
								)}
								color="error"
								type="outlined"
								onClick={(): void => {
									setDeleteQuarantuneAccModal(false);
									createAccountAPI();
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => setDeleteQuarantuneAccModal(false)}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
				>
					{t(
						'quarantine.delete_and_recrate_quarantine_account_warning',
						`Are you sure you want to delete and re-create quarantine account?`
					)}
				</Text>
			</Modal>
		</Container>
	);
};

export default QuarantineList;
