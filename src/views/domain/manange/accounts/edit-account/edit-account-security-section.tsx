/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, ReactElement } from 'react';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	Divider,
	ChipInput
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
	const { otpList, accountDetail, getListOtp } = conext;
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
	return (
		<>
			{isAdvanced && (
				<Container
					mainAlignment="flex-start"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					{!showCreateOTP && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
									<Text size="small" color="gray0" weight="bold">
										{t('label.OTP', 'OTP')}
									</Text>
								</Row>
								<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
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
									padding={{ top: 'large', left: 'large' }}
									width="100%"
									mainAlignment="space-between"
								>
									<Row
										orientation="horizontal"
										mainAlignment="space-between"
										crossAlignment="flex-start"
										width="fill"
										height="calc(100vh - 340px)"
									>
										{otpList.length !== 0 && (
											<Table
												rows={otpList}
												headers={headers}
												multiSelect={false}
												onSelectionChange={setSelectedRows}
												style={{ overflow: 'auto', height: '100%' }}
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
										<Row
											orientation="horizontal"
											mainAlignment="space-between"
											crossAlignment="flex-start"
											width="fill"
											padding={{ top: 'medium' }}
										>
											<Divider />
										</Row>
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
				</Container>
			)}
		</>
	);
};

export default EditAccountSecuritySection;
