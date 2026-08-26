/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  ChipInput,
  Container,
  HorizontalWizard,
  Padding,
  Row,
  useSnackbar,
  WizardInSection,
} from '@zextras/ui-components';
import { map } from 'lodash-es';
import { QRCodeSVG } from 'qrcode.react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useSendOtpEmail } from '../../../services/use-send-otp-email';
import CustomChip from '../../components/customChip';
import { emailContent } from '../../manage/accounts/create-account/email-content';
import { isValidEmail } from '../../utility/utils';
import { useAccountForm } from '../account-form-context';
import styles from '../security-section.module.css';

type OtpWizardProps = {
  qrData: string;
  secrateCode: string;
  pinCodes: Array<{ code: string }>;
  onClose: () => void;
};

export const OtpWizard = ({ qrData, secrateCode, pinCodes, onClose }: OtpWizardProps) => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const [sendEmailTo, setSendEmailTo] = useState<any[]>([]);
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const sendOtpEmail = useSendOtpEmail();

  const handleEmailChange = (contacts: any): void => {
    const data = map(contacts, (contact) => ({
      ...contact,
      error: !isValidEmail(contact.label ?? ''),
    }));
    setSendEmailTo(data);
  };

  const hasEmailError = sendEmailTo?.some((contact: any) => contact.error);
  const isSendDisabled = sendEmailTo.length === 0 || hasEmailError;

  const handleSendOTPEmail = (): void => {
    sendOtpEmail.mutate(
      {
        _jsns: 'urn:zimbraMail',
        m: {
          attach: { mp: [] },
          su: { _content: 'Account 2FA code' },
          e: [
            {
              t: 'f',
              a: `${values?.name}@${domainName}`,
              d: values?.name,
            },
            ...map(sendEmailTo, (email: any) => ({ t: 't', a: email.label, d: '' })),
          ],
          mp: [
            {
              ct: 'text/html',
              body: true,
              content: {
                _content: emailContent(pinCodes, secrateCode),
              },
            },
          ],
        },
      },
      {
        onSuccess: (): void => {
          setSendEmailTo([]);
          createSnackbar({
            key: 'success',
            severity: 'success',
            label: t('domain.editAccount.otpSentSuccessfully', 'OTP has been sent successfully'),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        },
        onError: (): void => {
          createSnackbar({
            key: 'error',
            severity: 'error',
            label: t(
              'label.something_wrong_error_msg',
              'Something went wrong. Please try again.',
            ),
            autoHideTimeout: 3000,
            hideButton: true,
            replace: true,
          });
        },
      },
    );
  };

  const wizardSteps = [
    {
      name: 'otp',
      label: t('label.create_otp', 'CREATE OTP'),
      icon: 'KeyOutline',
      view: (): ReactElement => (
        <Container mainAlignment="flex-start">
          <Row
            padding={{ top: 'large', left: 'large' }}
            width="100%"
            mainAlignment="space-between"
          >
            <Row width="40%" mainAlignment="flex-start">
              <QRCodeSVG data-testid="qrcode-password" size={179} value={qrData} />
            </Row>
            <Row width="60%" mainAlignment="flex-start">
              <Container>
                <Padding top="large">
                  <Row mainAlignment="center">
                    <Row background="gray5" style={{ maxWidth: '350px' }}>
                      <div className={styles.staticCodesWrapper}>
                        {map(pinCodes, (singleCode: any) => (
                          <label key={singleCode.code} className={styles.staticCode}>
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
                  <ds-text as="h3">{t('account_details.secret_code', 'Secret Code')}</ds-text>
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
                  <ds-text as="strong">{secrateCode}</ds-text>
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
                onChange={handleEmailChange}
                value={sendEmailTo}
                background="gray5"
                ChipComponent={CustomChip}
                maxChips={null}
                hasError={hasEmailError}
                data-testid="otp-email-input"
              />
              <ds-text as="strong" color="error" size="small">
                {hasEmailError &&
                  t(
                    'domain.editAccount.invalidaEmailError',
                    'One or more email addresses are invalid.',
                  )}
              </ds-text>
            </Row>
            <Row width="20%" mainAlignment="space-between">
              <Button
                label={t('account_details.send', 'SEND')}
                icon="PaperPlaneOutline"
                size="large"
                iconPlacement="right"
                disabled={isSendDisabled}
                onClick={handleSendOTPEmail}
              />
            </Row>
          </Row>
        </Container>
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
          onClick={(): void => onClose()}
        />
      ),
    },
  ];

  return (
    <HorizontalWizard
      steps={wizardSteps}
      title={t('account.new.create_otp_wizard', 'Create OTP Wizard')}
      Wrapper={WizardInSection}
      setToggleWizardSection={onClose}
    />
  );
};
