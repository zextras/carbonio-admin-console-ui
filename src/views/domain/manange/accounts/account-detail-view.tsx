/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useContext, useMemo } from 'react';
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
	SnackbarManagerContext,
	Chip,
	Divider,
	Table
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { getMailboxQuota } from '../../../../services/account-list-directory-service';
import { AccountContext } from './account-context';
import { deleteAccount } from '../../../../services/delete-account-service';
import { CLOSED } from '../../../../constants';
import { modifyAccountRequest } from '../../../../services/modify-account';
import { getDelegateAuthRequest } from '../../../../services/get-delegate-auth-request';
import { endSession } from '../../../../services/end-session';
import { getSessions } from '../../../../services/get-sessions';
import Paging from '../../../components/paging';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';

const AccountDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 2.688rem;
	right: 0.75rem;
	bottom: 0;
	left: ${'max(calc(100% - 42.5rem), 0.75rem)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: 42rem;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1);
`;

type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const OverlayContainer = styled(Container)`
	position: fixed;
	width: 42.6rem;
	top: 6.438rem;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const rotateKeyframes = keyframes`
from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    }
`;

const KeyFrameContainer = styled(Container)`
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	display: inline-block;
	border-top: 0.188rem solid #fff;
	border-right: 0.188rem solid transparent;
	box-sizing: border-box;
	animation: ${rotateKeyframes} 1s linear infinite;
`;

const OverlayDivision: FC = () => {
	const [t] = useTranslation();
	return (
		<OverlayContainer>
			<KeyFrameContainer></KeyFrameContainer>
			<Container height="auto" padding={{ top: 'small' }}>
				<Text color="gray5" size="medium" weight="bold">
					{t('label.please_wait', 'Please wait')}
				</Text>
			</Container>
		</OverlayContainer>
	);
};

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
	const [accountAliases, setAccountAliases] = useState<any[]>([]);
	const [userSessionList, setUserSessionList] = useState<Array<UserSession>>([]);
	const [sessionListRows, setSessionListRows] = useState<Array<any>>([]);
	const [selectedSession, setSelectedSession] = useState<any>([]);

	const sessionTableHeader: any[] = useMemo(
		() => [
			{
				id: 'accounts',
				label: t('label.accounts', 'Accounts'),
				width: '25%',
				bold: true
			},
			{
				id: 'session_id',
				label: t('label.session_id', 'Session ID'),
				width: '25%',
				bold: true
			},
			{
				id: 'ip',
				label: t('label.ip', 'IP'),
				width: '25%',
				bold: true
			},
			{
				id: 'service',
				label: t('label.service', 'Service'),
				width: '25%',
				bold: true
			}
		],
		[t]
	);

	const getDataSourceDetail = useCallback((): void => {
		getMailboxQuota(selectedAccount?.id).then((data) => {
			setUsedQuota(data?.mbox?.[0]?.s || 0);
		});
	}, [selectedAccount?.id]);
	useEffect(() => {
		getDataSourceDetail();
	}, [getDataSourceDetail]);

	useEffect(() => {
		if (accountDetail?.mail) {
			const aliaes = accountDetail.mail.split(', ').map((ele: string) => ({ label: ele }));
			setAccountAliases(aliaes);
		}
	}, [accountDetail?.mail]);

	const onDeleteAccount = useCallback(() => {
		setIsOpenDeleteDialog(true);
	}, []);
	const onViewMail = useCallback(() => {
		getDelegateAuthRequest(selectedAccount?.id)
			.then((data: any) => {
				if (data?.authToken?.[0]) {
					window.open(
						`https://${window.location.hostname}/service/preauth?authtoken=${data?.authToken?.[0]._content}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
						'blank'
					);
				} else {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
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
	}, [createSnackbar, selectedAccount?.id, t]);

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
						t('label.account_disable_correctly', 'The account has been correctly disabled.')
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

	const getAllUserSession = useCallback(() => {
		const sessionType: string[] = ['admin', 'imap', 'soap'];
		setUserSessionList([]);
		sessionType.forEach((item: string) => {
			getSessions(item, selectedAccount?.name).then((resp: any) => {
				if (resp && resp?.s) {
					const existingSession = resp?.s;
					if (existingSession) {
						const session: UserSession[] = [];
						const filterSession = existingSession.filter(
							(sessionItem: any) => sessionItem?.name === selectedAccount?.name
						);
						if (filterSession.length > 0) {
							filterSession.forEach((element: any) => {
								session.push({
									ip: '',
									name: element?.name,
									sid: element?.sid,
									service: '',
									zid: element?.zid
								});
							});
						}
						setUserSessionList((prev: any) => [...prev, ...session]);
					}
				}
			});
		});
	}, [selectedAccount?.name]);

	useEffect(() => {
		if (userSessionList && userSessionList.length > 0) {
			const allRows = userSessionList.map((item: UserSession) => ({
				id: item?.sid,
				columns: [
					<Text size="medium" weight="bold" key={item?.zid} color="#828282">
						{item?.name}
					</Text>,
					<Text size="medium" weight="bold" key={item?.zid} color="#828282">
						{item?.sid}
					</Text>,
					<Text size="medium" weight="bold" key={item?.zid} color="#828282">
						{''}
					</Text>,
					<Text size="medium" weight="bold" key={item?.zid} color="#828282">
						{''}
					</Text>
				]
			}));
			setSessionListRows(allRows);
		} else {
			setSessionListRows([]);
		}
	}, [userSessionList]);

	useEffect(() => {
		getAllUserSession();
	}, [getAllUserSession]);

	const onEndSession = useCallback(() => {
		setIsRequestInProgress(true);
		getDelegateAuthRequest(selectedAccount?.id)
			.then((res: any) => {
				if (res && res?.authToken) {
					const token = res?.authToken[0]?._content;
					setIsRequestInProgress(true);
					endSession(selectedSession[0], selectedAccount?.name, token)
						.then((resp: any) => {
							setIsRequestInProgress(false);
							if (resp && resp?._jsns) {
								setUserSessionList((prev: any) => [
									...prev.filter((item: UserSession) => item?.sid !== selectedSession[0])
								]);
								setSelectedSession([]);
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t('label.session_end_success', 'Session end successfully'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
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
				}
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
	}, [selectedAccount?.id, selectedSession, selectedAccount?.name, t, createSnackbar]);

	return (
		<>
			{(!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id) && (
				<OverlayDivision />
			)}
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

				<Row
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					orientation="horizontal"
					background="white"
					height="fit"
					padding={{ top: 'extralarge', left: 'large', right: 'large', bottom: 'large' }}
					width="100%"
				>
					<Padding right="large">
						<Container width="fit" height="fit" style={{ border: '1px solid #2b73d2' }}>
							<IconButton
								iconColor="primary"
								backgroundColor="gray6"
								icon="EditAsNewOutline"
								size="large"
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
								size="large"
								disabled={
									!accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id
								}
								onClick={onDeleteAccount}
							/>
						</Container>
					</Padding>

					<Button
						type="outlined"
						label={t('label.view_mail', 'VIEW MAIL')}
						icon="EmailReadOutline"
						iconPlacement="right"
						color="primary"
						size="large"
						onClick={onViewMail}
					/>
				</Row>
				<Container
					padding={{ left: 'large' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100% - 64px)"
					background="white"
					style={{ overflow: 'auto' }}
				>
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
						<Row width="100%" mainAlignment="flex-start" crossAlignment="flex-start">
							<Row padding={{ left: 'large', bottom: 'small' }}>
								<Text size="small" color="secondary">
									{t('account_details.aliases', 'Aliases')}
								</Text>
							</Row>
							<Row width="95%">
								<Container
									orientation="horizontal"
									wrap="wrap"
									mainAlignment="flex-start"
									maxWidth="44rem"
									style={{ gap: '0.5rem' }}
									padding={{ left: 'large' }}
								>
									{accountAliases?.map(
										(ele, index) => index > 0 && <Chip key={`chip${index}`} label={ele.label} />
									)}
								</Container>
								<Row width="100%" padding={{ top: 'medium' }}>
									<Divider color="gray2" />
								</Row>
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
											? moment(
													selectedAccount?.zimbraLastLogonTimestamp,
													'YYYYMMDDHHmmss.Z'
											  ).format('DD MMM YYYY | hh:MM:SS A')
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
							{t('label.active_sessions', 'Active Sessions')}
						</Text>
					</Row>
					<Row
						padding={{ top: 'extralarge' }}
						width="100%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Container width="70%">
							<Input
								label={t('label.i_m_looking_for_the_session', 'I`m looking for the session ...')}
								backgroundColor="gray5"
								width="100%"
								value=""
							></Input>
						</Container>
						<Container width="30%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Button
								label={t('label.end_session', 'End Session')}
								color="error"
								type="outlined"
								icon="StopCircleOutline"
								iconPlacement="right"
								size="extralarge"
								disabled={selectedSession.length === 0 || isRequestInProgress}
								onClick={onEndSession}
								loading={isRequestInProgress}
							/>
						</Container>
					</Row>
					<Row
						padding={{ top: 'extralarge' }}
						width="100%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Table
							rows={sessionListRows}
							headers={sessionTableHeader}
							showCheckbox={false}
							selectedRows={selectedSession}
							multiSelect={false}
							onSelectionChange={(selected: any): any => {
								setSelectedSession(selected);
							}}
							HeaderFactory={CustomHeaderFactory}
							RowFactory={CustomRowFactory}
						></Table>
					</Row>

					<Row
						padding={{ top: 'extralarge' }}
						width="100%"
						mainAlignment="flex-end"
						crossAlignment="flex-end"
					>
						<Paging
							totalItem={1}
							setOffset={(): void => {
								console.log('setOffset for paging');
							}}
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
							{t('label.notes', 'Notes')}
						</Text>
					</Row>
					<Row
						padding={{ top: 'extralarge', bottom: 'extralarge' }}
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
										disabled={
											isRequestInProgress ||
											STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.label ===
												STATUS_COLOR?.closed?.label
										}
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
										defaults="You can <bold>Close it to preserve</bold> the data, instead."
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
		</>
	);
};
export default AccountDetailView;
