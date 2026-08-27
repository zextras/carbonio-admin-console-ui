/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Row } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useState } from 'react';

import { useSelectedDomain } from '../../hooks/use-selected-domain';
import { useGenerateTotp } from '../../services/use-otp-mutations';
import { useAccountForm } from './account-form-context';
import { BackupSettings } from './security-section/backup-settings';
import { FailedLoginPolicy } from './security-section/failed-login-policy';
import { ForgottenPassword } from './security-section/forgotten-password';
import { OtpList } from './security-section/otp-list';
import { OtpWizard } from './security-section/otp-wizard';
import { PasswordPolicies } from './security-section/password-policies';
import { TwoFactorSettings } from './security-section/two-factor-settings';
import { ServicesPassphrase } from './services-passphrase';

const EditAccountSecuritySection = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, any>);
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name;
  const isAdvanced = useIsAdvanced();

  const [showCreateOTP, setShowCreateOTP] = useState(false);
  const [qrData, setQrData] = useState('');
  const [secrateCode, setSecrateCode] = useState('');
  const [pinCodes, setPinCodes] = useState<any>([]);

  const generateTotpMutation = useGenerateTotp();

  const handleGenerate = (): void => {
    generateTotpMutation.mutate(
      { account: `${values?.uid}@${domainName}` },
      {
        onSuccess: (res) => {
          if (!res.ok) {
            return;
          }
          const response = res.response ?? {};
          setQrData(
            `otpauth://totp/${encodeURIComponent(response.label ?? '')}?secret=${
              response.secret ?? ''
            }&issuer=${response.issuer ?? ''}&algorithm=${response.algorithm ?? ''}&digits=${
              response.digits_length ?? ''
            }&period=${response.period ?? ''}`,
          );
          setSecrateCode(response.secret ?? '');
          setPinCodes(response.static_otp_codes ?? []);
          setShowCreateOTP(true);
        },
      },
    );
  };

  return (
    <Container
      mainAlignment="flex-start"
      padding={{ right: 'extralarge', bottom: 'large' }}
      style={{ overflow: 'auto' }}
    >
      {isAdvanced && <ServicesPassphrase />}
      {isAdvanced && (
        <>
          {!showCreateOTP && <OtpList onGenerate={handleGenerate} />}
          {showCreateOTP && (
            <Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
              <OtpWizard
                qrData={qrData}
                secrateCode={secrateCode}
                pinCodes={pinCodes}
                onClose={(): void => setShowCreateOTP(false)}
              />
            </Row>
          )}
        </>
      )}
      {isAdvanced && <TwoFactorSettings />}
      {isAdvanced && <BackupSettings />}
      {!showCreateOTP && (
        <>
          <PasswordPolicies />
          <ForgottenPassword />
          <FailedLoginPolicy />
        </>
      )}
    </Container>
  );
};

export default EditAccountSecuritySection;
