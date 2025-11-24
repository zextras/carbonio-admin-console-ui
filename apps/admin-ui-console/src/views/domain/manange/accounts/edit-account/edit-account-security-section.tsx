/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useDomainStore, useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	ChipInput,
	Icon,
	Switch,
	Input,
	Select
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import QRCode from 'qrcode.react';
import React, {
	FC,
	useMemo,
	useContext,
	useState,
	ReactElement,
	useCallback,
	ChangeEvent
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import logo from '../../../../../assets/gardian.svg';
import { DISABLED, ENABLED, ZIMBRA_ADMIN_URN } from '../../../../../constants';
import { fetchSoap } from '../../../../../services/generateOTP-service';
import { sendMail } from '../../../../../services/send-mail-service';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section-component';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomChip from '../../../../components/customChip';
import ListRow from '../../../../list/list-row';
import InheritedInput from '../../../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../../../utility/inherited-components/inherited-select';
import InheritedSwitch from '../../../../utility/inherited-components/inherited-switch';
import { isValidEmail } from '../../../../utility/utils';
import { AccountContext } from '../account-context';
import { emailContent } from '../create-account/email-content';

import { ServicesPassphrase } from './services-passphrase';

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
	const context = useContext(AccountContext);
	const { otpList, accountDetail, setAccountDetail, getListOtp, accSpecificDetail, cosDetail } =
		context;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [showCreateOTP, setShowCreateOTP] = useState<boolean>(false);
	const [qrData, setQrData] = useState('');
	const [secrateCode, setSecrateCode] = useState('');
	const [sendEmailTo, setSendEmailTo] = useState<any>([]);
	const [pinCodes, setPinCodes] = useState<any>([]);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useIsAdvanced();

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
									<QRCode data-testid="qrcode-password" size={179} value={qrData} />
								</Row>
								<Row width="60%" mainAlignment="flex-start">
									<Container>
										<Padding top="large">
											<Row mainAlignment="center">
												<StaticCodesContainer background="gray5">
													<StaticCodesWrapper>
														{map(pinCodes, (singleCode: any) => (
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
											mainAlignment="center"
											width="100%"
											padding={{
												top: 'small',
												bottom: 'small'
											}}
										>
											<Text>{secrateCode}</Text>
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
												const isValid = isValidEmail(contact.label ?? '');
												data.push({
													...contact,
													error: !isValid
												});
											});
											setSendEmailTo(data);
										}}
										defaultValue={sendEmailTo}
										value={sendEmailTo}
										background="gray5"
										ChipComponent={CustomChip}
										maxChips={null}
										hasError={sendEmailTo?.some((contact: any) => contact.error)}
									/>
									<Text color="error" size="small">
										{sendEmailTo?.some((contact: any) => contact.error) && t('domain.editAccount.invalidaEmailError', 'One or more email addresses are invalid.')}
									</Text>
								</Row>
								<Row width="20%" mainAlignment="space-between">
									<Button
										label={t('account_details.send', 'SEND')}
										icon="PaperPlaneOutline"
										size="large"
										iconPlacement="right"
										disabled={sendEmailTo.length === 0 || sendEmailTo?.some((contact: any) => contact.error)}
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
																_content: emailContent(pinCodes, secrateCode)
															}
														}
													]
												}
											}).then(() => {
												setSendEmailTo([])
												createSnackbar({
													key: 'success',
													severity: 'success',
													label: t('domain.editAccount.otpSentSuccessfully', 'OTP has been sent successfully'),
													autoHideTimeout: 3000,
													hideButton: true,
													replace: true
												});
											}).catch(() => {
												createSnackbar({
													key: 'error',
													severity: 'error',
													label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
													autoHideTimeout: 3000,
													hideButton: true,
													replace: true
												});
											});
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
						label={t('commons.data_already_sent_to_the_user', 'DATA ALREADY SENT TO THE USER')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateOTP(false)}
					/>
				)
			}
		],
		[accountDetail?.name, domainName, pinCodes, qrData, secrateCode, sendEmailTo, createSnackbar, t]
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
	const [recoveryEmailError, setRecoveryEmailError] = useState<boolean>(false);

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

	const recoveryStatus: any[] = useMemo(
		() => [
			{
				label: t('label.pending', 'Pending'),
				value: 'pending'
			},
			{
				label: t('label.verified', 'Verified'),
				value: 'verified'
			}
		],
		[t]
	);

	const handleOnGenerateOTP = (): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'totp_generate_command',
			account: `${accountDetail?.uid}@${domainName}`
		}).then((res: any) => {
			if (res.ok) {
				setQrData(
					`otpauth://totp/${encodeURIComponent(res.response.label)}?secret=${
						res.response.secret
					}&issuer=${res.response.issuer}&algorithm=${res.response.algorithm}&digits=${
						res.response.digits_length
					}&period=${res.response.period}`
				);
				setSecrateCode(res.response.secret);
				setPinCodes(res.response.static_otp_codes);
				setShowCreateOTP(true);
				getListOtp(`${accountDetail?.uid}@${domainName}`);
			}
		});
	};
	const handleDeleteOTP = (): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'delete_totp_command',
			account: `${accountDetail?.uid}@${domainName}`,
			id: selectedRows?.[0]
		}).then((res: any) => {
			if (res.ok) {
				setSelectedRows([]);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.otp_deleted_successfully', 'OTP has been deleted successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				getListOtp(`${accountDetail?.uid}@${domainName}`);
			} else {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	};

	const changeValue = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	const setEmptyValue = useCallback(
		(keyName: string) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
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

	const changeSwitchOptionBoolean = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: !accountDetail[key]
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
		(e: ChangeEvent<HTMLInputElement>) => {
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
		(e: ChangeEvent<HTMLInputElement>) => {
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

	const onRecoveryStatusChange = (v: any): any => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefPasswordRecoveryAddressStatus: v }));
	};

	const changeRecoverOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === ENABLED ? DISABLED : ENABLED
			}));
		},
		[accountDetail, setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
		>
			{isAdvanced && <ServicesPassphrase />}
			{isAdvanced && (
				<>
					{!showCreateOTP && (
						<Row mainAlignment="flex-start" width="100%">
							<Row
								padding={{ top: 'large', left: 'large' }}
								width="100%"
								mainAlignment="space-between"
							>
								<Text size="small" color="gray0" weight="bold">
									{t('label.two_factor_auth', 'Second Factor Authentication')}
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
										onClick={(): void => handleOnGenerateOTP()}
									/>
								</Padding>
								<Button
									type="outlined"
									label={t('label.DELETE', 'DELETE')}
									icon="CloseOutline"
									iconPlacement="right"
									color="error"
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
										<Container orientation="column" crossAlignment="center" mainAlignment="center">
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
							<Row mainAlignment="flex-start" width="100%" padding={{ left: 'large' }}>
								<Container
									height="fit"
									crossAlignment="flex-start"
									background="gray6"
									padding={{ top: 'large' }}
								>
									<ListRow>
										<Container crossAlignment="flex-start">
											<InheritedSwitch
												subValue={accountDetail?.carbonioFeatureOTPMgmtEnabled}
												onChange={changeSwitchOption}
												label={t(
													'label.one_time_password_management',
													'One Time Password management'
												)}
												iconColor="primary"
												inheritedValue={cosDetail.carbonioFeatureOTPMgmtEnabled}
												fromSubValue={accSpecificDetail?.carbonioFeatureOTPMgmtEnabled}
												inputName={'carbonioFeatureOTPMgmtEnabled'}
												onChangeReset={(): void => setEmptyValue('carbonioFeatureOTPMgmtEnabled')}
											/>
										</Container>
									</ListRow>
								</Container>
							</Row>
						</Row>
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
			{isAdvanced && (
				<Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('label.backup', 'Backup')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Switch
										value={accountDetail?.backupSelfUndeleteAllowed}
										onClick={(): void => changeSwitchOptionBoolean('backupSelfUndeleteAllowed')}
										label={t('label.allow_restore_message', 'Allow user to restore messages')}
										iconColor="primary"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Row>
			)}
			{!showCreateOTP && (
				<Row mainAlignment="flex-start" width="100%">
					<Row
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
							<Row mainAlignment="flex-start">
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
								</Padding>
							</Row>
							<Row
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
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<InheritedSwitch
											subValue={accountDetail?.zimbraPasswordLocked}
											onChange={changeSwitchOption}
											label={t(
												'cos.prevent_user_from_changing_password',
												'Prevent user from changing password'
											)}
											iconColor="primary"
											inheritedValue={cosDetail.zimbraPasswordLocked}
											fromSubValue={accSpecificDetail?.zimbraPasswordLocked}
											inputName={'zimbraPasswordLocked'}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordLocked')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<InheritedInput
											label={t('cos.minimum_password_length', 'Minimum password length')}
											subValue={accountDetail.zimbraPasswordMinLength}
											inheritedValue={cosDetail.zimbraPasswordMinLength}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinLength}
											background="gray5"
											inputName="zimbraPasswordMinLength"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinLength')}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<InheritedInput
											label={t('cos.maximum_password_length', 'Maximum password length')}
											subValue={accountDetail.zimbraPasswordMaxLength}
											inheritedValue={cosDetail.zimbraPasswordMaxLength}
											fromSubValue={accSpecificDetail?.zimbraPasswordMaxLength}
											background="gray5"
											inputName="zimbraPasswordMaxLength"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMaxLength')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<InheritedInput
											label={t(
												'cos.minimum_upper_case_characters',
												'Minimum upper case characters'
											)}
											subValue={accountDetail.zimbraPasswordMinUpperCaseChars}
											inheritedValue={cosDetail.zimbraPasswordMinUpperCaseChars}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinUpperCaseChars}
											background="gray5"
											inputName="zimbraPasswordMinUpperCaseChars"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinUpperCaseChars')}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<InheritedInput
											label={t(
												'cos.minimum_lower_case_characters',
												'Minimum lower case characters'
											)}
											subValue={accountDetail.zimbraPasswordMinLowerCaseChars}
											inheritedValue={cosDetail.zimbraPasswordMinLowerCaseChars}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinLowerCaseChars}
											background="gray5"
											inputName="zimbraPasswordMinLowerCaseChars"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinLowerCaseChars')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<InheritedInput
											label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
											subValue={accountDetail.zimbraPasswordMinPunctuationChars}
											inheritedValue={cosDetail.zimbraPasswordMinPunctuationChars}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinPunctuationChars}
											background="gray5"
											inputName="zimbraPasswordMinPunctuationChars"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinPunctuationChars')}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<InheritedInput
											label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
											subValue={accountDetail.zimbraPasswordMinNumericChars}
											inheritedValue={cosDetail.zimbraPasswordMinNumericChars}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinNumericChars}
											background="gray5"
											inputName="zimbraPasswordMinNumericChars"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinNumericChars')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<InheritedInput
											label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
											subValue={accountDetail.zimbraPasswordMinAge}
											inheritedValue={cosDetail.zimbraPasswordMinAge}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinAge}
											background="gray5"
											inputName="zimbraPasswordMinAge"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinAge')}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<InheritedInput
											label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
											subValue={accountDetail.zimbraPasswordMaxAge}
											inheritedValue={cosDetail.zimbraPasswordMaxAge}
											fromSubValue={accSpecificDetail?.zimbraPasswordMaxAge}
											background="gray5"
											inputName="zimbraPasswordMaxAge"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMaxAge')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container padding={{ right: 'small' }}>
										<InheritedInput
											label={t(
												'cos.minimum_numeric_characters_or_punctuation_symbols',
												'Minimum numeric characters or punctuation symbols'
											)}
											subValue={accountDetail.zimbraPasswordMinDigitsOrPuncs}
											inheritedValue={cosDetail.zimbraPasswordMinDigitsOrPuncs}
											fromSubValue={accSpecificDetail?.zimbraPasswordMinDigitsOrPuncs}
											background="gray5"
											inputName="zimbraPasswordMinDigitsOrPuncs"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordMinDigitsOrPuncs')}
										/>
									</Container>
									<Container padding={{ left: 'small' }}>
										<InheritedInput
											label={t(
												'cos.minimum_number_of_unique_password_history',
												'Minimum number of unique passwords history'
											)}
											subValue={accountDetail.zimbraPasswordEnforceHistory}
											inheritedValue={cosDetail.zimbraPasswordEnforceHistory}
											fromSubValue={accSpecificDetail?.zimbraPasswordEnforceHistory}
											background="gray5"
											inputName="zimbraPasswordEnforceHistory"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordEnforceHistory')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container height="fit" crossAlignment="flex-start" background="gray6">
								<ListRow>
									<Container crossAlignment="flex-start" padding={{ top: 'large' }}>
										<InheritedSwitch
											subValue={accountDetail?.zimbraPasswordBlockCommonEnabled}
											onChange={changeSwitchOption}
											label={t('cos.reject_common_passwords', 'Reject common passwords')}
											iconColor="primary"
											inheritedValue={cosDetail.zimbraPasswordBlockCommonEnabled}
											fromSubValue={accSpecificDetail?.zimbraPasswordBlockCommonEnabled}
											inputName={'zimbraPasswordBlockCommonEnabled'}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordBlockCommonEnabled')}
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
							{t('label.forgotten_password', 'Forgotten Password')}
						</Text>
						<Row mainAlignment="center" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start" width="30%" padding={{ right: 'small' }}>
										<Switch
											value={accountDetail?.zimbraFeatureResetPasswordStatus === 'enabled'}
											onClick={(): void => changeRecoverOption('zimbraFeatureResetPasswordStatus')}
											label={t(
												'label.user_can_ask_for_forgotten_password_token',
												'User can ask for a forgotten password token'
											)}
											iconColor="primary"
										/>
									</Container>
									<Container width="40%" padding={{ right: 'small', left: 'small' }}>
										<Input
											backgroundColor="gray5"
											label={t('label.user_recovery_email', 'User Recovery Email')}
											defaultValue={accountDetail?.zimbraPrefPasswordRecoveryAddress || ''}
											onChange={(e: ChangeEvent<HTMLInputElement>): void => {
												if (isValidEmail(e?.target?.value)) {
													changeValue(e);
													setRecoveryEmailError(false);
												} else {
													setRecoveryEmailError(true);
												}
											}}
											inputName="zimbraPrefPasswordRecoveryAddress"
											description={t(
												'label.enter_valid_email_address',
												'Enter valid email Address'
											)}
											hasError={recoveryEmailError}
										/>
									</Container>
									<Container width="30%" padding={{ left: 'small' }}>
										<Select
											items={recoveryStatus}
											background="gray5"
											label={t('label.status', 'Status')}
											showCheckbox={false}
											onChange={onRecoveryStatusChange}
											defaultSelection={recoveryStatus.find(
												(item: any) =>
													item.value === accountDetail?.zimbraPrefPasswordRecoveryAddressStatus
											)}
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
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<InheritedSwitch
											subValue={accountDetail?.zimbraPasswordLockoutEnabled}
											onChange={changeSwitchOption}
											label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
											iconColor="primary"
											inheritedValue={cosDetail.zimbraPasswordLockoutEnabled}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutEnabled}
											inputName={'zimbraPasswordLockoutEnabled'}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutEnabled')}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container crossAlignment="flex-start">
										<InheritedInput
											label={t(
												'cos.number_of_consecutive_failed_login_allowed',
												'Number of consecutive failed logins allowed'
											)}
											subValue={accountDetail.zimbraPasswordLockoutMaxFailures}
											inheritedValue={cosDetail.zimbraPasswordLockoutMaxFailures}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutMaxFailures}
											background="gray5"
											inputName="zimbraPasswordLockoutMaxFailures"
											onChange={changeValue}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutMaxFailures')}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large' }}
							>
								<ListRow>
									<Container width="75%" padding={{ right: 'small' }}>
										<InheritedInput
											label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
											subValue={accountDetail.zimbraPasswordLockoutDuration?.slice(0, -1)}
											inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(0, -1)}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
											background="gray5"
											inputName="zimbraPasswordLockoutDuration"
											onChange={onZimbraPasswordLockoutDurationNumChange}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
									<Container width="25%" padding={{ left: 'small' }}>
										<InheritedSelect
											label={t('cos.time_range', 'Time Range')}
											items={timeItems}
											subValue={accountDetail?.zimbraPasswordLockoutDuration?.slice(-1) || ''}
											inheritedValue={cosDetail.zimbraPasswordLockoutDuration?.slice(-1) || ''}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutDuration}
											background="gray5"
											selectName="zimbraPasswordLockoutDuration"
											onChange={onZimbraPasswordLockoutDurationTypeChange}
											onChangeReset={(): void => setEmptyValue('zimbraPasswordLockoutDuration')}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
								</ListRow>
							</Container>
						</Row>
						<Row mainAlignment="flex-start" width="100%">
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'large', bottom: 'large' }}
							>
								<ListRow>
									<Container width="75%" padding={{ right: 'small' }}>
										<InheritedInput
											label={t(
												'cos.time_window_failed_logins_must_occur_to_lock_account',
												'Time window in which the failed logins must occur to lock the account:'
											)}
											subValue={accountDetail.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)} 
											inheritedValue={cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(0, -1)}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
											background="gray5"
											inputName="zimbraPasswordLockoutFailureLifetime"
											onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
											onChangeReset={(): void =>
												setEmptyValue('zimbraPasswordLockoutFailureLifetime')
											}
											disabled={accountDetail.zimbraPasswordLockoutEnabled !== 'TRUE'}
										/>
									</Container>
									<Container width="25%" padding={{ left: 'small' }}>
										<InheritedSelect
											label={t('cos.time_range', 'Time Range')}
											items={timeItems}
											subValue={
												accountDetail?.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''
											}
											inheritedValue={
												cosDetail.zimbraPasswordLockoutFailureLifetime?.slice(-1) || ''
											}
											fromSubValue={accSpecificDetail?.zimbraPasswordLockoutFailureLifetime}
											background="gray5"
											selectName="zimbraPasswordLockoutFailureLifetime"
											onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
											onChangeReset={(): void =>
												setEmptyValue('zimbraPasswordLockoutFailureLifetime')
											}
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
