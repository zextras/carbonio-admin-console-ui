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
	Switch,
	ChipInput
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AccountContext } from './account-context';
import { emailContent } from './email-content';
import { sendMail } from '../../../../../services/send-mail-service';
import { useDomainStore } from '../../../../../store/domain/store';
import CustomChip from '../../../../components/customChip';
import { isValidEmail } from '../../../../utility/utils';

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
const AccountOtpSection: FC<{
	setToggleNextBtn: (newValue: boolean) => void;
}> = ({ setToggleNextBtn }) => {
	const context = useContext(AccountContext);
	const { accountDetail, setAccountDetail } = context;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [sendEmailTo, setSendEmailTo] = useState('');
	const [t] = useTranslation();

	useEffect(() => {
		if (accountDetail?.generateOTP || accountDetail?.administrationRigths) {
			setToggleNextBtn(true);
		} else {
			setToggleNextBtn(false);
		}
	}, [accountDetail?.administrationRigths, accountDetail?.generateOTP, setToggleNextBtn]);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
			height="calc(100vh - 18.75rem)"
		>
			{accountDetail?.showOtpOptionSection ? (
				<>
					<Container
						orientation="horizontal"
						width="99%"
						height="fit"
						crossAlignment="center"
						mainAlignment="space-between"
						background="#E6F2D8"
						padding={{
							top: 'large',
							bottom: 'large'
						}}
						style={{ borderRadius: '2px 2px 0px 0px' }}
					>
						<Row mainAlignment="center" width="100%">
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
					<Container
						height="fit"
						width="100%"
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="center"
					>
						<Row>
							<Switch
								defaultChecked={accountDetail.generateOTP}
								onClick={(): void => {
									setAccountDetail((prev: any) => ({
										...prev,
										generateOTP: !accountDetail.generateOTP
									}));
								}}
								padding={{ top: 'large' }}
								label={t('label.create_otp_code', 'Create OTP code')}
								iconColor="primary"
							/>
						</Row>
					</Container>
					<Container
						height="fit"
						width="100%"
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="center"
					>
						<Row>
							<Switch
								defaultChecked={accountDetail.administrationRigths}
								onClick={(): void => {
									setAccountDetail((prev: any) => ({
										...prev,
										administrationRigths: !accountDetail.administrationRigths
									}));
								}}
								padding={{ top: 'large' }}
								label={t('label.add_administration_rights', 'Add Administration rights')}
								iconColor="primary"
							/>
						</Row>
					</Container>
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
								<QRCode data-testid="qrcode-password" size={179} value={accountDetail?.qrData} />
							</Row>
							<Row width="60%" mainAlignment="flex-start">
								<Container>
									<Padding top="large">
										<Row mainAlignment="center">
											<StaticCodesContainer background="gray5">
												<StaticCodesWrapper>
													{map(accountDetail?.pinCodes, (singleCode: any) => (
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
										<Text>{accountDetail?.secrateCode}</Text>
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
											if (isValidEmail(contact.label ?? '')) data.push(contact);
										});
										setSendEmailTo(data);
									}}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									defaultValue={sendEmailTo}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									value={sendEmailTo}
									background="gray5"
									ChipComponent={CustomChip}
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
															_content: emailContent(
																accountDetail?.pinCodes,
																accountDetail?.secrateCode
															)
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
		</Container>
	);
};

export default AccountOtpSection;
