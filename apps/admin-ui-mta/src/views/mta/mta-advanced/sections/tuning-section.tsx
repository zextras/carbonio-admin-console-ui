/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { MtaAdvancedFormApi } from '../types';

type TuningSectionProps = {
  form: MtaAdvancedFormApi;
  allowSetMTA: boolean;
  isErrorInSmtpdProxy: boolean;
  onSenderLoginMapsChange: (value: string) => void;
};

export const TuningSection = ({
  form,
  allowSetMTA,
  isErrorInSmtpdProxy,
  onSenderLoginMapsChange,
}: Readonly<TuningSectionProps>) => {
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
          <form.Field name="zimbraClamAVMaxThreads">
            {(field) => (
              <Input
                isRequired
                label={t('mta.max_antivirus_threads', 'Max antivirus threads (value)')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <form.Field name="zimbraLmtpNumThreads">
            {(field) => (
              <Input
                isRequired
                label={t('mta.lmtp_threads', 'LMTP threads (Value)')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <form.Field name="zimbraMilterNumThreads">
            {(field) => (
              <Input
                isRequired
                label={t('mta.milter_threads', 'MILTER threads (value)')}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
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
          <form.Field name="zimbraMilterMaxConnections">
            {(field) => (
              <Input
                isRequired
                label={t(
                  'mta.reject_concurrent_milter_connection_above',
                  'Reject concurrent MILTER connections above (value)',
                )}
                backgroundColor="gray5"
                value={field.state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
      </Container>

      <Container crossAlignment="flex-start" padding={{ bottom: 'large' }} height="auto">
        <form.Field name="zimbraMtaSmtpdSenderLoginMaps">
          {(field) => (
            <Input
              label={t('mta.smtpd_sender_login_maps', 'Smtpd sender login maps')}
              backgroundColor="gray5"
              value={field.state.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                onSenderLoginMapsChange(value);
                field.handleChange(value);
              }}
              disabled={!allowSetMTA}
              hasError={isErrorInSmtpdProxy}
            />
          )}
        </form.Field>
      </Container>

      <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
        <form.Field name="zimbraMtaSmtpSaslAuthEnable">
          {(field) => (
            <Switch
              label={t(
                'mta.enable_simple_authentication_and_security_layer',
                'Enable simple authentication and security layer',
              )}
              value={!!field.state.value}
              onClick={() => field.handleChange(!field.state.value)}
              disabled={!allowSetMTA}
            />
          )}
        </form.Field>
      </Container>
    </>
  );
}
