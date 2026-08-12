/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, InheritedSelect } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaServerGeneral } from '../../../../../../types';
import {
  ZIMBRA_AMAVIS_LOG_LEVEL,
  ZIMBRA_AMAVIS_SA_LOG_LEVEL,
  ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
  ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
} from '../../../../../constants';

type LoggingSectionProps = Readonly<{
  mtaServerGeneralDetail: MtaServerGeneral | undefined;
  mtaServerSpecificGeneralDetail: MtaServerGeneral | undefined;
  configInformation: Array<{ n: string; _content: string }>;
  onAmavisLogLevelChange: (v: string) => void;
  onAmavisSALogLevelChange: (v: string) => void;
  onSMTPClientLogLevelChange: (v: string) => void;
  onLMTPTlsLogLevelChange: (v: string) => void;
  setEmptyValue: (keyName: keyof MtaServerGeneral) => void;
}>;

export function LoggingSection({
  mtaServerGeneralDetail,
  mtaServerSpecificGeneralDetail,
  configInformation,
  onAmavisLogLevelChange,
  onAmavisSALogLevelChange,
  onSMTPClientLogLevelChange,
  onLMTPTlsLogLevelChange,
  setEmptyValue,
}: LoggingSectionProps) {
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
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.logging', 'Logging')}
        </ds-text>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        height="auto"
        padding={{ bottom: 'extralarge' }}
      >
        <Container crossAlignment="flex-start">
          <InheritedSelect
            label={t('mta.log_level_for_amavis', 'Log level for Amavis')}
            items={amavisLogLevelOptions}
            subValue={mtaServerGeneralDetail?.zimbraAmavisLogLevel}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_LOG_LEVEL,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisLogLevel}
            background="gray5"
            selectName="zimbraAmavisLogLevel"
            onChange={onAmavisLogLevelChange}
            onChangeReset={(): void => setEmptyValue('zimbraAmavisLogLevel')}
          />
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <InheritedSelect
            label={t('mta.sas_log_level_for_amavis', 'SAS Log level for Amavis')}
            items={amavisSALogLevelOptions}
            subValue={mtaServerGeneralDetail?.zimbraAmavisSALogLevel}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_AMAVIS_SA_LOG_LEVEL,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraAmavisSALogLevel}
            background="gray5"
            selectName="zimbraAmavisSALogLevel"
            onChange={onAmavisSALogLevelChange}
            onChangeReset={(): void => setEmptyValue('zimbraAmavisSALogLevel')}
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
          <InheritedSelect
            label={t(
              'mta.smtp_client_logging_of_tls_activity',
              'SMTP client logging of TLS Activity',
            )}
            items={zimbraMtaSmtpdLoglevelOptions}
            subValue={mtaServerGeneralDetail?.zimbraMtaSmtpdTlsLoglevel}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaSmtpdTlsLoglevel}
            background="gray5"
            selectName="zimbraMtaSmtpdTlsLoglevel"
            onChange={onSMTPClientLogLevelChange}
            onChangeReset={(): void => setEmptyValue('zimbraMtaSmtpdTlsLoglevel')}
          />
        </Container>

        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <InheritedSelect
            label={t(
              'mta.lmtp_client_logging_of_tls_activity',
              'LMTP client logging of TLS activity',
            )}
            items={zimbraMtaLmtpTlsLoglevelOptions}
            subValue={mtaServerGeneralDetail?.zimbraMtaLmtpTlsLoglevel}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaLmtpTlsLoglevel}
            background="gray5"
            selectName="zimbraMtaLmtpTlsLoglevel"
            onChange={onLMTPTlsLogLevelChange}
            onChangeReset={(): void => setEmptyValue('zimbraMtaLmtpTlsLoglevel')}
          />
        </Container>
      </Container>
    </>
  );
}
