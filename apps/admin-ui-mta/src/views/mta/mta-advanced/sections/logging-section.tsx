/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Select, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { MtaAdvancedFormApi } from '../types';

type LoggingSectionProps = {
  form: MtaAdvancedFormApi;
  allowSetMTA: boolean;
};

export const LoggingSection = ({ form, allowSetMTA }: Readonly<LoggingSectionProps>) => {
  const [t] = useTranslation();

  const amavisLogLevelOptions = [
    { label: t('mta.zero', '0'), value: '0' },
    { label: t('mta.one', '1'), value: '1' },
    { label: t('mta.two', '2'), value: '2' },
    { label: t('mta.three', '3'), value: '3' },
    { label: t('mta.four', '4'), value: '4' },
    { label: t('mta.five', '5'), value: '5' },
  ];

  const amavisSALogLevelOptions = [
    { label: t('mta.info', 'Info'), value: '0' },
    { label: t('mta.all', 'All'), value: '1' },
  ];

  const zimbraMtaSmtpdLoglevelOptions = [
    { label: t('mta.one', '1'), value: '1' },
    { label: t('mta.two', '2'), value: '2' },
    { label: t('mta.three', '3'), value: '3' },
    { label: t('mta.four', '4'), value: '4' },
  ];

  const zimbraMtaLmtpTlsLoglevelOptions = [
    { label: t('mta.zero', '0'), value: '0' },
    { label: t('mta.one', '1'), value: '1' },
    { label: t('mta.two', '2'), value: '2' },
    { label: t('mta.three', '3'), value: '3' },
    { label: t('mta.four', '4'), value: '4' },
  ];

  return (
    <>
      <Container crossAlignment="flex-start" mainAlignment="flex-start" height="auto">
        <ds-text as="h3" size="medium" overflow="ellipsis" weight="bold">
          {t('mta.logging', 'Logging')}
        </ds-text>
      </Container>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'large', bottom: 'extralarge' }}
      >
        <form.Field name="zimbraMtaSmtpdClientPortLogging">
          {(field) => (
            <Switch
              label={t(
                'mta.enable_logging_of_remote_smtp_client_port',
                'Enable logging of the remote SMTP client port',
              )}
              value={field.state.value}
              onClick={() => field.handleChange(!field.state.value)}
              disabled={!allowSetMTA}
              iconColor="primary"
            />
          )}
        </form.Field>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        height="auto"
        padding={{ bottom: 'extralarge' }}
      >
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraAmavisLogLevel">
            {(field) => (
              <Select
                items={amavisLogLevelOptions}
                background="gray5"
                label={t('mta.log_level_for_amavis', 'Log level for Amavis')}
                showCheckbox={false}
                selection={
                  amavisLogLevelOptions.find(
                    (item: Record<string, string>) => item.value === field.state.value,
                  ) || amavisLogLevelOptions[0]
                }
                onChange={(v: string | null) => {
                  if (v !== null) field.handleChange(v);
                }}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <form.Field name="zimbraAmavisSALogLevel">
            {(field) => (
              <Select
                items={amavisSALogLevelOptions}
                background="gray5"
                label={t('mta.sas_log_level_for_amavis', 'SAS Log level for Amavis')}
                showCheckbox={false}
                selection={amavisSALogLevelOptions.find(
                  (item: Record<string, string>) => item.value === field.state.value,
                )}
                // @ts-expect-error - needs a fix
                onChange={(v: string) => field.handleChange(v)}
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
      >
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaSmtpdTlsLoglevel">
            {(field) => (
              <Select
                items={zimbraMtaSmtpdLoglevelOptions}
                background="gray5"
                label={t(
                  'mta.smtp_client_logging_of_tls_activity',
                  'SMTP client logging of TLS Activity',
                )}
                showCheckbox={false}
                selection={zimbraMtaSmtpdLoglevelOptions.find(
                  (item: Record<string, string>) => item.value === field.state.value,
                )}
                // @ts-expect-error - needs a fix
                onChange={(v: string) => field.handleChange(v)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <form.Field name="zimbraMtaLmtpTlsLoglevel">
            {(field) => (
              <Select
                items={zimbraMtaLmtpTlsLoglevelOptions}
                background="gray5"
                label={t(
                  'mta.lmtp_client_logging_of_tls_activity',
                  'LMTP client logging of TLS activity',
                )}
                showCheckbox={false}
                selection={zimbraMtaLmtpTlsLoglevelOptions.find(
                  (item: Record<string, string>) => item.value === field.state.value,
                )}
                // @ts-expect-error - needs a fix
                onChange={(v: string) => field.handleChange(v)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
