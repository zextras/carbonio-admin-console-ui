/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Select, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type MtaAdvanced } from '../../../../../types';
import { ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING } from '../../../../constants';

type LoggingSectionProps = {
  mtaAdvancedDetail: MtaAdvanced | undefined;
  allowSetMTA: boolean;
  setValue: (key: string, value: unknown) => void;
  onAmavisLogLevelChange: (v: string | null) => void;
  onAmavisSALogLevelChange: (v: string) => void;
  onSMTPClientLogLevelChange: (v: string) => void;
  onLMTPTlsLogLevelChange: (v: string) => void;
};

export function LoggingSection({
  mtaAdvancedDetail,
  allowSetMTA,
  setValue,
  onAmavisLogLevelChange,
  onAmavisSALogLevelChange,
  onSMTPClientLogLevelChange,
  onLMTPTlsLogLevelChange,
}: Readonly<LoggingSectionProps>) {
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
        <Switch
          label={t(
            'mta.enable_logging_of_remote_smtp_client_port',
            'Enable logging of the remote SMTP client port',
          )}
          value={mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging}
          onClick={(): void =>
            setValue(
              ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
              !mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging,
            )
          }
          disabled={!allowSetMTA}
        />
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        height="auto"
        padding={{ bottom: 'extralarge' }}
      >
        <Container crossAlignment="flex-start">
          <Select
            items={amavisLogLevelOptions}
            background="gray5"
            label={t('mta.log_level_for_amavis', 'Log level for Amavis')}
            showCheckbox={false}
            selection={
              amavisLogLevelOptions.find(
                (item: Record<string, string>) =>
                  item.value === mtaAdvancedDetail?.zimbraAmavisLogLevel,
              ) || amavisLogLevelOptions[0]
            }
            onChange={onAmavisLogLevelChange}
            disabled={!allowSetMTA}
          />
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <Select
            items={amavisSALogLevelOptions}
            background="gray5"
            label={t('mta.sas_log_level_for_amavis', 'SAS Log level for Amavis')}
            showCheckbox={false}
            selection={amavisSALogLevelOptions.find(
              (item: Record<string, string>) =>
                item.value === mtaAdvancedDetail?.zimbraAmavisSALogLevel,
            )}
            // @ts-expect-error - needs a fix
            onChange={onAmavisSALogLevelChange}
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
      >
        <Container crossAlignment="flex-start">
          <Select
            items={zimbraMtaSmtpdLoglevelOptions}
            background="gray5"
            label={t(
              'mta.smtp_client_logging_of_tls_activity',
              'SMTP client logging of TLS Activity',
            )}
            showCheckbox={false}
            selection={zimbraMtaSmtpdLoglevelOptions.find(
              (item: Record<string, string>) =>
                item.value === mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel,
            )}
            // @ts-expect-error - needs a fix
            onChange={onSMTPClientLogLevelChange}
            disabled={!allowSetMTA}
          />
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <Select
            items={zimbraMtaLmtpTlsLoglevelOptions}
            background="gray5"
            label={t(
              'mta.lmtp_client_logging_of_tls_activity',
              'LMTP client logging of TLS activity',
            )}
            showCheckbox={false}
            selection={zimbraMtaLmtpTlsLoglevelOptions.find(
              (item: Record<string, string>) =>
                item.value === mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel,
            )}
            // @ts-expect-error - needs a fix
            onChange={onLMTPTlsLogLevelChange}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
    </>
  );
}
