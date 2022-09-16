/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useContext } from 'react';
import moment from 'moment';
import {
	Container,
	Input,
	Row,
	Text,
	IconButton,
	Padding,
	Icon,
	Quota,
	Button,
	Modal,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getMailboxQuota } from '../../../../services/account-list-directory-service';
import { AccountContext } from './account-context';
import { deleteAccount } from '../../../../services/delete-account-service';
import { CLOSED } from '../../../../constants';
import { modifyAccountRequest } from '../../../../services/modify-account';

const AccountDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 43px;
	right: 12px;
	bottom: 0px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
`;

const AccountDetailView: FC<any> = ({
	selectedAccount,
	setShowAccountDetailView,
	setShowEditAccountView,
	STATUS_COLOR,
	getAccountList
}) => {
	const [t] = useTranslation();
	const [usedQuota, setUsedQuota] = useState(0);
	const conext = useContext(AccountContext);
	const { accountDetail } = conext;
	const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);

	const getDataSourceDetail = useCallback((): void => {
		getMailboxQuota(selectedAccount?.id).then((data) => {
			setUsedQuota(data?.mbox?.[0]?.s || 0);
		});
	}, [selectedAccount?.id]);
	useEffect(() => {
		getDataSourceDetail();
	}, [getDataSourceDetail]);

	const onDeleteAccount = useCallback(() => {
		setIsOpenDeleteDialog(true);
	}, []);

	const closeHandler = useCallback(() => {
		setIsOpenDeleteDialog(false);
	}, []);

	const onSuccess = useCallback(
		(message) => {
			createSnackbar({
				key: 'success',
				type: 'success',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setIsRequestInProgress(false);
			closeHandler();
			setShowAccountDetailView(false);
			getAccountList();
		},
		[closeHandler, createSnackbar, getAccountList, setShowAccountDetailView]
	);

	const onDeleteHandler = useCallback(() => {
		setIsRequestInProgress(true);
		deleteAccount(selectedAccount?.id)
			.then((data: any) => {
				onSuccess(t('label.account_remove_correctly', 'The account has been correctly removed.'));
			})
			.then((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, onSuccess, t, selectedAccount?.id]);

	const onDisableAccount = useCallback(() => {
		setIsRequestInProgress(true);
		modifyAccountRequest(accountDetail?.zimbraId, { zimbraAccountStatus: CLOSED })
			.then((data) => {
				if (data?.account && Array.isArray(data?.account)) {
					onSuccess(
						t('label.account_disable_correctly', 'The account has been correctly disable.')
					);
				}
			})
			.catch((error) => {
				setIsRequestInProgress(false);
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
	}, [accountDetail?.zimbraId, createSnackbar, t, onSuccess]);

	return (
		<AccountDetailContainer background="gray5" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="48px"
				style={{ borderBottom: '1px solid #E6E9ED' }}
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{`${selectedAccount?.name} ${t('label.details', 'Details')}`}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setShowAccountDetailView(false)}
					/>
				</Row>
			</Row>
			<Container
				padding={{ left: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100% - 64px)"
				background="white"
			>
				<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
					<Padding right="large" top="large">
						<Container width="fit" height="fit" style={{ border: '1px solid #2b73d2' }}>
							<IconButton
								iconColor="primary"
								backgroundColor="gray6"
								icon="EditAsNewOutline"
								height={42}
								width={42}
								onClick={(): void => {
									setShowAccountDetailView(false);
									setShowEditAccountView(true);
								}}
								disabled={
									!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id
								}
								loading={!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id}
							/>
						</Container>
					</Padding>
					<Padding right="large">
						<Container width="fit" height="fit" style={{ border: '1px solid #d74942' }}>
							<IconButton
								iconColor="error"
								backgroundColor="gray6"
								icon="Trash2Outline"
								height={42}
								width={42}
								disabled={
									!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id
								}
								// loading={!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id}
								onClick={onDeleteAccount}
							/>
						</Container>
					</Padding>
					<Padding right="large">
						<Button
							type="outlined"
							label={t('label.view_mail', 'VIEW MAIL')}
							icon="EmailReadOutline"
							iconPlacement="right"
							color="primary"
							height={44}
							disabled
						/>
					</Padding>
					<Button
						type="outlined"
						label={t('label.restart_replica', 'RESTART REPLICA')}
						icon="RefreshOutline"
						iconPlacement="right"
						color="primary"
						height={44}
						disabled
					/>
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.account', 'Account')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray6"
								value={selectedAccount?.displayName || ''}
								readOnly
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.email', 'E-mail')}
								backgroundColor="gray6"
								value={selectedAccount?.name || ''}
								readOnly
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.server', 'Server')}
								readOnly
								backgroundColor="gray6"
								value={selectedAccount?.zimbraMailHost}
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								readOnly
								label={t('label.space', 'Space')}
								backgroundColor="gray6"
								value={`${(usedQuota / 1048576).toFixed(3)} MB of ${
									selectedAccount?.zimbraMailQuota
										? `${(selectedAccount.zimbraMailQuota / 1048576).toFixed(3)} MB`
										: t('label.unlimited', 'Unlimited')
								}`}
							/>
							<Quota
								fill={
									!selectedAccount?.zimbraMailQuota
										? 1
										: (usedQuota / selectedAccount.zimbraMailQuota) * 100
								}
								background="gray5"
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input readOnly label="ID" backgroundColor="gray6" value={selectedAccount?.id} />
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.status', 'Status')}
								backgroundColor="gray6"
								readOnly
								value={STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.label}
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.creation_date', 'Creation Date')}
								backgroundColor="gray6"
								readOnly
								value={moment(selectedAccount?.zimbraCreateTimestamp, 'YYYYMMDDHHmmss.Z').format(
									'DD MMM YYYY | hh:MM:SS A'
								)}
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row width="95%">
							<Input
								label={t('label.last_access', 'Last Access')}
								backgroundColor="gray6"
								readOnly
								value={
									selectedAccount?.zimbraLastLogonTimestamp
										? moment(selectedAccount?.zimbraLastLogonTimestamp, 'YYYYMMDDHHmmss.Z').format(
												'DD MMM YYYY | hh:MM:SS A'
										  )
										: t('label.never_logged_in', 'Never logged in')
								}
							/>
						</Row>
					</Row>
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<Row
					padding={{ top: 'extralarge' }}
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Input
						label={t('label.notes', 'Notes')}
						backgroundColor="gray6"
						width="100%"
						value={selectedAccount?.zimbraNotes || ''}
						readOnly
					></Input>
				</Row>
			</Container>
			{isOpenDeleteDialog && (
				<Modal
					size="medium"
					title={t('label.deleting_account_name', 'You are deleting {{name}} account', {
						name: selectedAccount?.name
					})}
					open={isOpenDeleteDialog}
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button
								style={{ marginLeft: '10px' }}
								type="outlined"
								label={t('label.help', 'Help')}
								color="primary"
							/>
							<Row style={{ gap: '8px' }}>
								<Button
									label={t('label.delete_it_instead', 'Delete it instead')}
									color="error"
									type="outlined"
									onClick={onDeleteHandler}
									disabled={isRequestInProgress}
								/>
								<Button
									label={t('label.close_the_account', 'Close the account')}
									color="primary"
									onClick={onDisableAccount}
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
									i18nKey="label.deleting_account_content_1"
									defaults="Are you sure you want to delete <bold>{{name}}</bod> ?"
									components={{ bold: <strong />, name: selectedAccount?.name }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_2"
									defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_3"
									defaults="You can <bold>Disable it to preserve</bold> the data, instead."
									components={{ bold: <strong /> }}
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
			)}
		</AccountDetailContainer>
	);
};
export default AccountDetailView;
