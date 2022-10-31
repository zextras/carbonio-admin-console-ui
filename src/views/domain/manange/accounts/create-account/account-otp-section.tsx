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

	const codeRows = (): string => `<tr>
				<td style="color:#696969;">${pinCodes?.[0]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[1]?.code || ''}</td>
			</tr>
			<tr>
				<td style="color:#696969;">${pinCodes?.[2]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[3]?.code || ''}</td>
			</tr>
			<tr>
				<td style="color:#696969;">${pinCodes?.[4]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[5]?.code || ''}</td>
			</tr>
			<tr>
				<td style="color:#696969;">${pinCodes?.[6]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[7]?.code || ''}</td>
			</tr>
			<tr>
				<td style="color:#696969;">${pinCodes?.[8]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[9]?.code || ''}</td>
			</tr>
			<tr>
				<td style="color:#696969;">${pinCodes?.[10]?.code || ''}</td>
				<td style="color:#696969;">${pinCodes?.[11]?.code || ''}</td>
			</tr>`;

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
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
															_content: `<html>

															<head>
																<meta charset="utf-8">
																<meta name="viewport" content="width=device-width, initial-scale=1">
																<title></title>
															</head>
															
															<body style="max-width: 650px;">
																<table style="width: 100%; max-width: 650px; margin: 0 auto; font-family: sans-serif;line-height: 20px;">
																	<tbody>
																		<tr>
																			<td style="padding: 0 30px;">
																				<p style="margin-bottom: 0;">Hey there!</p>
																				<p style="margin-top: 0;">This is Sys from the System Administration team, here's the OTP code you need to login into your account.</p>
																				<p>You can use the ones down here, but you should also save them in a safe place (you might need them again in the future).</p>
																			</td>
																		</tr>
																		<tr>
																			<td style="padding: 0 30px;">
																				<p style="font-weight: bold; margin-bottom: 5px;">Scan the QR code with your devices or use the static codes to access</p>
																			</td>
																		</tr>
																		<tr style="margin-bottom:20px;">
																			<td style="padding: 0 30px;">
																				<table style="width: 100%; margin-bottom: 20px;">
																					<tr>
																						<td rowspan="9"><img src="${
																							window?.document
																								?.getElementsByTagName('canvas')[0]
																								?.toDataURL() || ''
																						}" alt="qr" style="width: 180px;" /></td>
																					</tr>
																					${codeRows()}
																					<tr>
																						<td colspan="2" style="text-align: center; font-weight: bold; padding-top:10px;">Secret Code</td>
																					</tr>
																					<tr>
																						<td colspan="2" style="text-align: center;">${qrData}</td>
																					</tr>
																				</table>
																			</td>
																		</tr>
																		<tr>
																			<td style="padding: 0 30px;">
																				<table style="background-color: #f5f6f8;">
																					<tr>
																						<td colspan="3" style="text-align: center; padding: 20px; color: #3a7dd5; font-weight: bold;">How to use the codes?</td>
																					</tr>
																					<tr>
																						<td style="text-align: center; padding:10px 20px 20px;"><span style="background-color: #d5e3f6; border-radius: 50%; padding: 10px 14px;">1</span></td>
																						<td style="text-align: center; padding:10px 20px 20px;"><span style="background-color: #d5e3f6; border-radius: 50%; padding: 10px 14px;">2</span></td>
																						<td style="text-align: center; padding:10px 20px 20px;"><span style="background-color: #d5e3f6; border-radius: 50%; padding: 10px 14px;">3</span></td>
																					</tr>
																					<tr>
																						<td style="padding:0 20px;">
																							<div style="min-height: 140px;"><img src="data:image/png;base64,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" alt="login" /></div>
																						</td>
																						<td style="padding:0 20px;">
																							<div style="min-height: 140px;"><img src="data:image/png;base64,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" alt="insert" /></div>
																						</td>
																						<td style="padding:0 20px;">
																							<div style="min-height: 140px;"><img src="data:image/png;base64,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" alt="erase" /></div>
																						</td>
																					</tr>
																					<tr>
																						<td style="text-align: center; padding:0 20px 20px;">Log in using your password</td>
																						<td style="text-align: center; padding:0 20px 20px;">Insert one of the PIN codes listed above</td>
																						<td style="text-align: center; padding:0 20px 20px;">Erase the used PIN from the list</td>
																					</tr>
																				</table>
																			</td>
																		</tr>
																		<tr>
																			<td style="padding: 0 30px;">
																				<p>Keep in mind that each code can be used just <b>once.</b> Whenever you'll use a code, you are going to receive a notification e-mail.</p>
																				<p>If you have any question you can reply to this mail.</p>
																			</td>
																		</tr>
																	</tbody>
																</table>
															</body>
															
															</html>`
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
