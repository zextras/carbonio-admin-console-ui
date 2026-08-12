/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Switch } from '@zextras/ui-components';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { type MtaAdvanced } from '../../../../../types';
import {
  ZIMBRA_CLAM_AV_MAX_THREADS,
  ZIMBRA_LMTP_NUM_THREADS,
  ZIMBRA_MILTER_MAX_CONNECTIONS,
  ZIMBRA_MITER_NUM_THREADS,
  ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
} from '../../../../constants';

type TuningSectionProps = {
  mtaAdvancedDetail: MtaAdvanced | undefined;
  allowSetMTA: boolean;
  isErrorInSmtpdProxy: boolean;
  setValue: (key: string, value: unknown) => void;
  onSenderLoginMapsChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function TuningSection({
  mtaAdvancedDetail,
  allowSetMTA,
  isErrorInSmtpdProxy,
  setValue,
  onSenderLoginMapsChange,
}: Readonly<TuningSectionProps>) {
  const [t] = useTranslation();

  return (
    <>
      <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
        <ds-text as="h3" size="medium" overflow="ellipsis" weight="bold">
          {t('mta.tuning', 'Tuning')}
        </ds-text>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge', top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <Input
            isRequired
            label={t('mta.max_antivirus_threads', 'Max antivirus threads (value)')}
            backgroundColor="gray5"
            value={mtaAdvancedDetail?.zimbraClamAVMaxThreads}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_CLAM_AV_MAX_THREADS, e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <Input
            isRequired
            label={t('mta.lmtp_threads', 'LMTP threads (Value)')}
            backgroundColor="gray5"
            value={mtaAdvancedDetail?.zimbraLmtpNumThreads}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_LMTP_NUM_THREADS, e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <Input
            isRequired
            label={t('mta.milter_threads', 'MILTER threads (value)')}
            backgroundColor="gray5"
            value={mtaAdvancedDetail?.zimbraMilterNumThreads}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_MITER_NUM_THREADS, e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
        width="100%"
      >
        <Container crossAlignment="flex-start" height="auto">
          <Input
            isRequired
            label={t(
              'mta.reject_concurrent_milter_connection_above',
              'Reject concurrent MILTER connections above (value)',
            )}
            backgroundColor="gray5"
            value={mtaAdvancedDetail?.zimbraMilterMaxConnections}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_MILTER_MAX_CONNECTIONS, e.target.value);
            }}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>

      <Container crossAlignment="flex-start" padding={{ bottom: 'large' }} height="auto">
        <Input
          label={t('mta.smtpd_sender_login_maps', 'Smtpd sender login maps')}
          backgroundColor="gray5"
          value={mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps}
          onChange={onSenderLoginMapsChange}
          disabled={!allowSetMTA}
          hasError={isErrorInSmtpdProxy}
        />
      </Container>

      <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
        <Switch
          label={t(
            'mta.enable_simple_authentication_and_security_layer',
            'Enable simple authentication and security layer',
          )}
          value={!!mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable}
          onClick={(): void =>
            setValue(
              ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
              !mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable,
            )
          }
          disabled={!allowSetMTA}
        />
      </Container>
    </>
  );
}
