/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, ReactElement, useCallback } from 'react';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	Divider,
	ChipInput,
	Icon,
	Switch,
	Input,
	Select
} from '@zextras/carbonio-design-system';
import QRCode from 'qrcode.react';
import styled from 'styled-components';
import { map } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import logo from '../../../../../assets/gardian.svg';
import { Section } from '../../../../app/component/section';
import { sendMail } from '../../../../../services/send-mail-service';
import { emailContent } from '../create-account/email-content';
import { fetchSoap } from '../../../../../services/generateOTP-service';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import ListRow from '../../../../list/list-row';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const StaticCodesContainer = styled(Row)`
	max-width: 350px;
`;
const StaticCodesWrapper = styled.div`
	position: relative;
	width: 100%;
	column-count: 2;
	padding: 16px;
`;
const StaticCode = styled.label`
	display: block;
	font-family: monospace;
	padding: 4.95px 0;
`;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account.new.create_otp_wizard', 'Create OTP Wizard')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const EditAccountSecuritySection: FC = () => {
	const conext = useContext(AccountContext);
	const { otpList, accountDetail, setAccountDetail, getListOtp } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [showCreateOTP, setShowCreateOTP] = useState<boolean>(false);
	const [qrData, setQrData] = useState('');
	const [sendEmailTo, setSendEmailTo] = useState('');
	const [pinCodes, setPinCodes] = useState<any>([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const wizardSteps = useMemo(
		() => [
			{
				name: 'otp',
				label: t('label.create_otp', 'CREATE OTP'),
				icon: 'KeyOutline',
				view: (): ReactElement => (
					<>
						<Container mainAlignment="flex-start">
							<Row
								padding={{ top: 'large', left: 'large' }}
								width="100%"
								mainAlignment="space-between"
							>
								<Row width="40%" mainAlignment="flex-start">
									<QRCode
										data-testid="qrcode-password"
										size={179}
										bgColor="transparent"
										value={qrData}
									/>
								</Row>
								<Row width="60%" mainAlignment="flex-start">
									<Container>
										<Padding top="large">
											<Row mainAlignment="center">
												<StaticCodesContainer background="gray5">
													<StaticCodesWrapper>
														{map(pinCodes, (singleCode: any) => (
															// eslint-disable-next-line max-len
															<StaticCode key={singleCode.code}>{singleCode.code}</StaticCode>
														))}
													</StaticCodesWrapper>
												</StaticCodesContainer>
											</Row>
										</Padding>
									</Container>
									<Container
										orientation="horizontal"
										width="99%"
										crossAlignment="center"
										mainAlignment="space-between"
									>
										<Row
											takeAvwidth="fill"
											mainAlignment="center"
											width="100%"
											padding={{
												top: 'small',
												bottom: 'small'
											}}
										>
											<Text>{t('account_details.secret_code', 'Secret Code')}</Text>
										</Row>
									</Container>
									<Container
										orientation="horizontal"
										width="99%"
										crossAlignment="center"
										mainAlignment="space-between"
									>
										<Row
											takeAvwidth="fill"
											mainAlignment="center"
											width="100%"
											padding={{
												top: 'small',
												bottom: 'small'
											}}
										>
											<Text>{qrData}</Text>
										</Row>
									</Container>
								</Row>
							</Row>
							<Container
								orientation="horizontal"
								width="99%"
								crossAlignment="center"
								mainAlignment="space-between"
							>
								<Row
									takeAvwidth="fill"
									mainAlignment="center"
									width="100%"
									padding={{
										top: 'small',
										bottom: 'small'
									}}
								>
									<Text>
										{t(
											'account_details.please_note_code',
											`Please note: you'll be able to see these codes just once.`
										)}
									</Text>
								</Row>
							</Container>
							<Container
								orientation="horizontal"
								width="99%"
								crossAlignment="center"
								mainAlignment="space-between"
							>
								<Row
									takeAvwidth="fill"
									mainAlignment="center"
									width="100%"
									padding={{
										top: 'small',
										bottom: 'small'
									}}
								>
									<Text>
										{t(
											'account_details.select_email_otp',
											`Select an email address to send the OTP to or copy the code above`
										)}
									</Text>
								</Row>
							</Container>
							<Row
								padding={{ top: 'large', left: 'large' }}
								width="100%"
								mainAlignment="space-between"
							>
								<Row width="80%" mainAlignment="space-between" padding={{ right: 'large' }}>
									<ChipInput
										placeholder={t('account_details.send_the_otp_to', 'Send the OTP to')}
										onChange={(contacts: any): void => {
											const data: any = [];
											map(contacts, (contact) => {
												if (emailRegex.test(contact.label ?? '')) data.push(contact);
											});
											setSendEmailTo(data);
										}}
										defaultValue={sendEmailTo}
										value={sendEmailTo}
										background="gray5"
										// hasError={some(sendEmailTo || [], { error: true })}
									/>
								</Row>
								<Row width="20%" mainAlignment="space-between">
									<Button
										label={t('account_details.send', 'SEND')}
										icon="PaperPlaneOutline"
										size="large"
										iconPlacement="right"
										onClick={(): void => {
											sendMail('SendMsgRequest', {
												_jsns: 'urn:zimbraMail',
												m: {
													attach: { mp: [] },
													su: { _content: 'Account 2FA code' },
													e: [
														{
															t: 'f',
															a: `${accountDetail?.name}@${domainName}`,
															d: accountDetail?.name
														},
														...map(sendEmailTo, (email: any) => ({ t: 't', a: email.label, d: '' }))
													],
													mp: [
														{
															ct: 'text/html',
															body: true,
															content: {
																_content: emailContent(qrData, pinCodes)
															}
														}
													]
												}
											}).then(() => setSendEmailTo(''));
										}}
									></Button>
								</Row>
							</Row>
						</Container>
					</>
				),
				clickDisabled: true,
				CancelButton: () => <></>,
				PrevButton: (): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('commons.i_have_sent_data_to_user', 'I HAVE SENT THE DATA TO THE USER')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateOTP(false)}
					/>
				)
			}
		],
		[accountDetail?.name, domainName, pinCodes, qrData, sendEmailTo, t]
	);
	const [zimbraPasswordLockoutDurationNum, setZimbraPasswordLockoutDurationNum] = useState(
		accountDetail?.zimbraPasswordLockoutDuration?.slice(0, -1)
	);
	const [zimbraPasswordLockoutDurationType, setZimbraPasswordLockoutDurationType] = useState(
		accountDetail?.zimbraPasswordLockoutDuration?.slice(-1) || ''
	);
	const [zimbraPasswordLockoutFailureLifetimeNum, setZimbraPasswordLockoutFailureLifetimeNum] =
		useState(accountDetail?.zimbraPasswordLockoutFailureLifetime?.slice(0, -1));
	const [zimbraPasswordLockoutFailureLifetimeType, setZimbraPasswordLockoutFailureLifetimeType] =
		useState(accountDetail?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || '');

	const headers: any = useMemo(
		() => [
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '40%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '20%',
				bold: true
			},
			{
				id: 'failed',
				label: t('label.failed', 'Failed'),
				width: '20%',
				bold: true
			},
			{
				id: 'creation-date',
				label: t('label.creation_date', 'Creation Date'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const timeItems: any[] = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: 'd'
			},
			{
				label: t('label.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: 's'
			}
		],
		[t]
	);

	const handleOnGenerateOTP = (): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'totp_generate_command',
			account: `${accountDetail?.uid}@${domainName}`
		}).then((res: any) => {
			if (res.ok) {
				setQrData(res.response.secret);
				setPinCodes(res.response.static_otp_codes);
				setShowCreateOTP(true);
				getListOtp(`${accountDetail?.uid}@${domainName}`);
			}
		});
	};
	const handleDeleteOTP = (): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'delete_totp_command',
			account: `${accountDetail?.uid}@${domainName}`,
			id: selectedRows?.[0]
		}).then((res: any) => {
			if (res.ok) {
				setSelectedRows([]);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.otp_deleted_successfully', 'OTP has been deleted successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				getListOtp(`${accountDetail?.uid}@${domainName}`);
			} else {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	};

	const changeValue = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);

	const onZimbraPasswordLockoutDurationTypeChange = useCallback(
		(v: string) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPasswordLockoutDuration: zimbraPasswordLockoutDurationNum
					? `${zimbraPasswordLockoutDurationNum}${v}`
					: ''
			}));
		},
		[zimbraPasswordLockoutDurationNum, setAccountDetail]
	);
	const onZimbraPasswordLockoutDurationNumChange = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPasswordLockoutDuration: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutDurationType}`
					: ''
			}));
			setZimbraPasswordLockoutDurationNum(e.target.value);
		},
		[zimbraPasswordLockoutDurationType, setAccountDetail]
	);

	const onZimbraPasswordLockoutFailureLifetimeTypeChange = useCallback(
		(v: string) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPasswordLockoutFailureLifetime: zimbraPasswordLockoutFailureLifetimeNum
					? `${zimbraPasswordLockoutFailureLifetimeNum}${v}`
					: ''
			}));
		},
		[zimbraPasswordLockoutFailureLifetimeNum, setAccountDetail]
	);
	const onZimbraPasswordLockoutFailureLifetimeNumChange = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPasswordLockoutFailureLifetime: e.target.value
					? `${e.target.value}${zimbraPasswordLockoutFailureLifetimeType}`
					: ''
			}));
			setZimbraPasswordLockoutFailureLifetimeNum(e.target.value);
		},
		[zimbraPasswordLockoutFailureLifetimeType, setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
		>
			{isAdvanced && (
				<>
					{!showCreateOTP && (
						<>
							<Row mainAlignment="flex-start" width="100%">
								<Row
									padding={{ top: 'large', left: 'large' }}
									width="100%"
									mainAlignment="space-between"
								>
									<Text size="small" color="gray0" weight="bold">
										{t('label.OTP', 'OTP')}
									</Text>
								</Row>
								<Row
									width="100%"
									mainAlignment="flex-end"
									crossAlignment="flex-end"
									padding={{ right: 'large' }}
								>
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.NEW_OTP', 'NEW OTP')}
											icon="PlusOutline"
											iconPlacement="right"
											color="primary"
											height={44}
											onClick={(): void => handleOnGenerateOTP()}
										/>
									</Padding>
									<Button
										type="outlined"
										label={t('label.DELETE', 'DELETE')}
										icon="CloseOutline"
										iconPlacement="right"
										color="error"
										height={44}
										disabled={!selectedRows?.length}
										onClick={(): void => handleDeleteOTP()}
									/>
								</Row>
								<Row
									padding={{ top: 'large', left: 'large', right: 'large' }}
									width="100%"
									mainAlignment="space-between"
								>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										width="fill"
										// height="calc(100vh - 340px)"
									>
										{otpList.length !== 0 && (
											<Table
												rows={otpList}
												headers={headers}
												multiSelect={false}
												onSelectionChange={setSelectedRows}
												style={{ overflow: 'auto', height: '100%' }}
												RowFactory={CustomRowFactory}
												HeaderFactory={CustomHeaderFactory}
											/>
										)}
										{otpList.length === 0 && (
											<Container
												orientation="column"
												crossAlignment="center"
												mainAlignment="center"
											>
												<Row>
													<img src={logo} alt="logo" />
												</Row>
												<Row
													padding={{ top: 'extralarge' }}
													orientation="vertical"
													crossAlignment="center"
													style={{ textAlign: 'center' }}
												>
													<Text weight="light" color="#828282" size="large" overflow="break-word">
														{t('label.this_list_is_empty', 'This list is empty.')}
													</Text>
												</Row>
												<Row
													orientation="vertical"
													crossAlignment="center"
													style={{ textAlign: 'center' }}
													padding={{ top: 'small' }}
													width="53%"
												>
													<Text weight="light" color="#828282" size="large" overflow="break-word">
														<Trans
															i18nKey="label.create_otp_list_msg"
															defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
															components={{ bold: <strong /> }}
														/>
													</Text>
												</Row>
											</Container>
										)}
									</Row>
								</Row>
							</Row>
						</>
					)}
					{showCreateOTP && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<HorizontalWizard
									steps={wizardSteps}
									Wrapper={WizardInSection}
									setToggleWizardSection={setShowCreateOTP}
								/>
							</Row>
						</>
					)}
				</>
			)}
			{!showCreateOTP && (
				<Row mainAlignment="flex-start" width="100%">
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large', left: 'large', right: 'large' }}
					>
						<Container
							orientation="horizontal"
							width="100%"
							crossAlignment="center"
							mainAlignment="space-between"
							background="#D3EBF8"
							padding={{
								all: 'large'
							}}
							style={{ borderRadius: '2px 2px 0px 0px' }}
						>
							<Row takeAvwidth="fill" mainAlignment="flex-start">
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
								</Padding>
							</Row>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								padding={{
									all: 'small'
								}}
							>
								<Text overflow="break-word">
									{t(
										'label.account_password_setting_note_for_external_authentication',
										'The settings below ↓ do not affect the passwords set by users in domains that are configured to use external authentication. Changes made here will override COS settings for the password and the failed login lockout.'
									)}
								</Text>
							</Row>
						</Container>
					</Row>
					<Row
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ all: 'large' }}
						width="100%"
					>
						<Text size="extralarge" weight="bold">
							{t('cos.password', 'Password')}
						</Text>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<Switch
											value={accountDetail.zimbraPasswordLocked === 'TRUE'}
											label={t(
												'cos.prevent_user_from_changing_password',
												'Prevent user from changing password'
											)}
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => changeSwitchOption('zimbraPasswordLocked')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<Input
											label={t('cos.minimum_password_length', 'Minimum password length')}
											value={accountDetail.zimbraPasswordMinLength}
											background="gray5"
											inputName="zimbraPasswordMinLength"
											onChange={changeValue}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<Input
											label={t('cos.maximum_password_length', 'Maximum password length')}
											value={accountDetail.zimbraPasswordMaxLength}
											background="gray5"
											inputName="zimbraPasswordMaxLength"
											onChange={changeValue}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<Input
											label={t(
												'cos.minimum_upper_case_characters',
												'Minimum upper case characters'
											)}
											value={accountDetail.zimbraPasswordMinUpperCaseChars}
											background="gray5"
											inputName="zimbraPasswordMinUpperCaseChars"
											onChange={changeValue}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<Input
											label={t(
												'cos.minimum_lower_case_characters',
												'Minimum lower case characters'
											)}
											value={accountDetail.zimbraPasswordMinLowerCaseChars}
											background="gray5"
											inputName="zimbraPasswordMinLowerCaseChars"
											onChange={changeValue}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<Input
											label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
											value={accountDetail.zimbraPasswordMinPunctuationChars}
											background="gray5"
											inputName="zimbraPasswordMinPunctuationChars"
											onChange={changeValue}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<Input
											label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
											value={accountDetail.zimbraPasswordMinNumericChars}
											background="gray5"
											inputName="zimbraPasswordMinNumericChars"
											onChange={changeValue}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<Input
											label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
											value={accountDetail.zimbraPasswordMinAge}
											background="gray5"
											inputName="zimbraPasswordMinAge"
											onChange={changeValue}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<Input
											label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
											value={accountDetail.zimbraPasswordMaxAge}
											background="gray5"
											inputName="zimbraPasswordMaxAge"
											onChange={changeValue}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<Input
											label={t(
												'cos.minimum_numeric_characters_or_punctuation_symbols',
												'Minimum numeric characters or punctuation symbols'
											)}
											value={accountDetail.zimbraPasswordMinDigitsOrPuncs}
											background="gray5"
											inputName="zimbraPasswordMinDigitsOrPuncs"
											onChange={changeValue}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<Input
											label={t(
												'cos.minimum_number_of_unique_password_history',
												'Minimum number of unique passwords history'
											)}
											value={accountDetail.zimbraPasswordEnforceHistory}
											background="gray5"
											inputName="zimbraPasswordEnforceHistory"
											onChange={changeValue}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container height="fit" crossAlignment="flex-start" background="gray6">
								<ListRow>
									<Container crossAlignment="flex-start" padding={{ top: 'large' }}>
										<Switch
											value={accountDetail.zimbraPasswordBlockCommonEnabled === 'TRUE'}
											label={t('cos.reject_common_passwords', 'Reject common passwords')}
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => changeSwitchOption('zimbraPasswordBlockCommonEnabled')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
					</Row>
					<Row
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ all: 'large' }}
						width="100%"
					>
						<Text size="extralarge" weight="bold">
							{t('cos.failed_login_policy', 'Failed Login Policy')}
						</Text>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<Switch
											value={accountDetail.zimbraPasswordLockoutEnabled === 'TRUE'}
											label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
											// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
											onClick={() => changeSwitchOption('zimbraPasswordLockoutEnabled')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<Input
											label={t(
												'cos.number_of_consecutive_failed_login_allowed',
												'Number of consecutive failed logins allowed'
											)}
											value={accountDetail.zimbraPasswordLockoutMaxFailures}
											background="gray5"
											inputName="zimbraPasswordLockoutMaxFailures"
											onChange={changeValue}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container width="75%" padding={{ right: 'small' }}>
										<Input
											label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
											value={zimbraPasswordLockoutDurationNum}
											background="gray5"
											inputName="zimbraPasswordLockoutDuration"
											onChange={onZimbraPasswordLockoutDurationNumChange}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
									<Container width="25%" padding={{ left: 'small' }}>
										<Select
											items={timeItems}
											background="gray5"
											label={t('cos.time_range', 'Time Range')}
											selection={
												zimbraPasswordLockoutDurationType === ''
													? timeItems[-1]
													: timeItems.find(
															// eslint-disable-next-line max-len
															(item: any) => item.value === zimbraPasswordLockoutDurationType
													  )
											}
											showCheckbox={false}
											onChange={onZimbraPasswordLockoutDurationTypeChange}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large', bottom: 'large' }}
							>
								<ListRow>
									<Container width="75%" padding={{ right: 'small' }}>
										<Input
											label={t(
												'cos.time_window_failed_logins_must_occur_to_lock_account',
												'Time window in which the failed logins must occur to lock the account:'
											)}
											value={zimbraPasswordLockoutFailureLifetimeNum}
											background="gray5"
											inputName="zimbraPasswordLockoutFailureLifetime"
											onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
									<Container width="25%" padding={{ left: 'small' }}>
										<Select
											items={timeItems}
											background="gray5"
											label={t('cos.time_range', 'Time Range')}
											selection={
												zimbraPasswordLockoutFailureLifetimeType === ''
													? timeItems[-1]
													: timeItems.find(
															(item: any) =>
																// eslint-disable-next-line max-len
																item.value === zimbraPasswordLockoutFailureLifetimeType
													  )
											}
											showCheckbox={false}
											onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
					</Row>
				</Row>
			)}
		</Container>
	);
};

export default EditAccountSecuritySection;
