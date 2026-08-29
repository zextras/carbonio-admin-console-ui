/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Button, ChipInput, Container, Padding, Row, Switch } from '@zextras/ui-components';
import { map } from 'lodash-es';
import { QRCodeSVG } from 'qrcode.react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import { useSendOtpEmail } from '../../../../services/use-send-otp-email';
import CustomChip from '../../../components/customChip';
import { isValidEmail } from '../../../utility/utils';
import staticCodesStyles from './account-otp-section.module.css';
import { useCreateAccountFormContext } from './create-account-form-context';
import { emailContent } from './email-content';
const AccountOtpSection: FC<{
  setToggleNextBtn?: (newValue: boolean) => void;
}> = () => {
  const { form } = useCreateAccountFormContext();
  const accountDetail = useSelector(form.store, (s) => s.values);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [sendEmailTo, setSendEmailTo] = useState<any>('');
  const [t] = useTranslation();
  const sendOtpEmail = useSendOtpEmail();

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
              bottom: 'large',
            }}
            style={{ borderRadius: '2px 2px 0px 0px' }}
          >
            <Row mainAlignment="center" width="100%">
              <Padding horizontal="small">
                <ds-icon
                  icon="InfoOutline"
                  color="success"
                  style={{ width: '20px', height: '20px' }}
                ></ds-icon>
              </Padding>
              <ds-text overflow="break-word" as="p">
                {t(
                  'domain.the_account_has_been_successfully_created',
                  'The account has been successfully created',
                )}
              </ds-text>
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
                  form.setFieldValue('generateOTP', !accountDetail.generateOTP);
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
                  form.setFieldValue('administrationRigths', !accountDetail.administrationRigths);
                }}
                padding={{ top: 'large' }}
                label={t('label.add_administration_rights', 'Add Administration rights')}
                iconColor="primary"
              />
            </Row>
          </Container>
        </>
      ) : (
        <Container mainAlignment="flex-start">
            <Row
              padding={{ top: 'large', left: 'large' }}
              width="100%"
              mainAlignment="space-between"
            >
              <Row width="40%" mainAlignment="flex-start">
                <QRCodeSVG data-testid="qrcode-password" size={179} value={accountDetail?.qrData} />
              </Row>
              <Row width="60%" mainAlignment="flex-start">
                <Container>
                  <Padding top="large">
                    <Row mainAlignment="center">
                      <Row background="gray5" style={{ maxWidth: '350px' }}>
                        <div className={staticCodesStyles.staticCodesWrapper}>
                          {map(accountDetail?.pinCodes, (singleCode: any) => (
                            <label key={singleCode.code} className={staticCodesStyles.staticCode}>
                              {singleCode.code}
                            </label>
                          ))}
                        </div>
                      </Row>
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
                      bottom: 'small',
                    }}
                  >
                    <ds-text as="p">{t('account_details.secret_code', 'Secret Code')}</ds-text>
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
                      bottom: 'small',
                    }}
                  >
                    <ds-text as="strong">{accountDetail?.secrateCode}</ds-text>
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
                  bottom: 'small',
                }}
              >
                <ds-text as="p">
                  {t(
                    'account_details.please_note_code',
                    `Please note: you'll be able to see these codes just once.`,
                  )}
                </ds-text>
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
                  bottom: 'small',
                }}
              >
                <ds-text as="p">
                  {t(
                    'account_details.select_email_otp',
                    `Select an email address to send the OTP to or copy the code above`,
                  )}
                </ds-text>
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
                  defaultValue={sendEmailTo}
                  value={sendEmailTo}
                  background="gray5"
                  ChipComponent={CustomChip}
                  maxChips={null}
                />
              </Row>
              <Row width="20%" mainAlignment="space-between">
                <Button
                  label={t('account_details.send', 'SEND')}
                  icon="PaperPlaneOutline"
                  iconPlacement="right"
                  onClick={(): void => {
                    sendOtpEmail.mutate(
                      {
                        _jsns: 'urn:zimbraMail',
                        m: {
                          attach: { mp: [] },
                          su: { _content: 'Account 2FA code' },
                          e: [
                            {
                              t: 'f',
                              a: `${accountDetail?.name}@${domainName}`,
                              d: accountDetail?.name,
                            },
                            ...map(sendEmailTo, (email: any) => ({
                              t: 't',
                              a: email.label,
                              d: '',
                            })),
                          ],
                          mp: [
                            {
                              ct: 'text/html',
                              body: true,
                              content: {
                                _content: emailContent(
                                  accountDetail?.pinCodes,
                                  accountDetail?.secrateCode,
                                ),
                              },
                            },
                          ],
                        },
                      },
                      {
                        onSuccess: (): void => {
                          setSendEmailTo([]);
                        },
                      },
                    );
                  }}
                ></Button>
              </Row>
            </Row>
        </Container>
      )}
    </Container>
  );
};

export default AccountOtpSection;
