/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useState, useEffect } from 'react';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	Icon,
	ChipInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import { map } from 'lodash';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from './account-context';
import { fetchSoap } from '../../../../../services/generateOTP-service';
import { sendMail } from '../../../../../services/send-mail-service';
import { emailContent } from './email-content';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;
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
const AccountOtpSection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail, setShowCreateAccountView } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [showOtpOptionSection, setShowOtpOptionSection] = useState<boolean>(true);
	const [qrData, setQrData] = useState('');
	const [sendEmailTo, setSendEmailTo] = useState('');
	const [pinCodes, setPinCodes] = useState<any>([]);
	const [t] = useTranslation();

	const handleOnGenerateOTP = (): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'totp_generate_command',
			account: `${accountDetail?.name}@${domainName}`
		}).then((res) => {
			if (res.ok) {
				setQrData(res.response.secret);
				setPinCodes(res.response.static_otp_codes);
				setShowOtpOptionSection(false);
			} else {
				// setErrorLabel(t('error.alreadyInUse'));
			}
		});
	};

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
			height="calc(100vh - 18.75rem)"
		>
			{showOtpOptionSection ? (
				<>
					<Container
						orientation="horizontal"
						width="99%"
						crossAlignment="center"
						mainAlignment="space-between"
						background="#E6F2D8"
						padding={{
							top: 'large',
							bottom: 'large'
						}}
						style={{ borderRadius: '2px 2px 0px 0px' }}
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
							<Padding horizontal="small">
								<CustomIcon icon="InfoOutline" color="success"></CustomIcon>
							</Padding>
							<Text overflow="break-word">
								{t(
									'domain.the_account_has_been_successfully_created',
									'The account has been successfully created'
								)}
							</Text>
						</Row>
					</Container>

					<Row
						takeAvwidth="fill"
						mainAlignment="center"
						width="100%"
						padding={{
							top: 'large',
							bottom: 'large'
						}}
					>
						<Button
							label={t('domain.i_want_to_generate_an_otp_code', 'I WANT TO GENERATE AN OTP CODE')}
							onClick={(): void => handleOnGenerateOTP()}
							width="fill"
						/>
					</Row>
					<Row
						takeAvwidth="fill"
						mainAlignment="center"
						width="100%"
						padding={{
							top: 'large',
							bottom: 'large'
						}}
					>
						<Button
							label={t(
								'domain.proceed_without_generating_an_otp_code',
								'PROCEED WITHOUT GENERATING AN OTP CODE'
							)}
							onClick={(): void => setShowCreateAccountView(false)}
							width="fill"
							type="outlined"
						/>
					</Row>
				</>
			) : (
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
			)}
			{!showOtpOptionSection ? <></> : <></>}
		</Container>
	);
};

export default AccountOtpSection;
