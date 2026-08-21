/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, useSnackbar } from '@zextras/ui-components';
import { type ConfigAttribute, useAllConfig, useCurrentUserRights, useModifyConfig } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CONFIG,
  ZIMBRA_AMAVIS_LOG_LEVEL,
  ZIMBRA_AMAVIS_SA_LOG_LEVEL,
  ZIMBRA_CLAM_AV_MAX_THREADS,
  ZIMBRA_LMTP_NUM_THREADS,
  ZIMBRA_MILTER_MAX_CONNECTIONS,
  ZIMBRA_MITER_NUM_THREADS,
  ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
  ZIMBRA_MTA_MESSAGE_SIZE,
  ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
  ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
  ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
  ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
} from '../../../constants';
import { bytesToMB, isValidProxy, mbToBytes } from '../../utility/utils';
import { LoggingSection } from './sections/logging-section';
import { MailMessageSizeSection } from './sections/mail-message-size-section';
import { TuningSection } from './sections/tuning-section';
import type { MtaAdvancedFormValues } from './types';

function findConfigValue(config: Array<Record<string, string>>, key: string): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

function findConfigValueYesNo(config: Array<Record<string, string>>, key: string): boolean {
  const item = config.find((c) => c?.n === key);
  return item?._content === 'yes';
}

function buildInitialState(
  configInformation: Array<Record<string, string>>,
): MtaAdvancedFormValues {
  const maxMessageSize = findConfigValue(configInformation, ZIMBRA_MTA_MESSAGE_SIZE);
  const hasLimit = !!maxMessageSize;

  return {
    zimbraMtaSmtpdClientPortLogging: findConfigValueYesNo(
      configInformation,
      ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
    ),
    zimbraAmavisLogLevel: findConfigValue(configInformation, ZIMBRA_AMAVIS_LOG_LEVEL) ?? '',
    zimbraAmavisSALogLevel: findConfigValue(configInformation, ZIMBRA_AMAVIS_SA_LOG_LEVEL) ?? '',
    zimbraMtaSmtpdTlsLoglevel:
      findConfigValue(configInformation, ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL) ?? '',
    zimbraMtaLmtpTlsLoglevel:
      findConfigValue(configInformation, ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL) ?? '',
    zimbraClamAVMaxThreads: findConfigValue(configInformation, ZIMBRA_CLAM_AV_MAX_THREADS) ?? '',
    zimbraMilterNumThreads: findConfigValue(configInformation, ZIMBRA_MITER_NUM_THREADS) ?? '',
    zimbraLmtpNumThreads: findConfigValue(configInformation, ZIMBRA_LMTP_NUM_THREADS) ?? '',
    zimbraMtaMaxMessageSize: maxMessageSize ?? '',
    zimbraMilterMaxConnections:
      findConfigValue(configInformation, ZIMBRA_MILTER_MAX_CONNECTIONS) ?? '',
    zimbraMtaSmtpSaslAuthEnable: findConfigValueYesNo(
      configInformation,
      ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
    ),
    zimbraMtaSmtpdSenderLoginMaps:
      findConfigValue(configInformation, ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS) ?? '',
    limitMaxMessageSize: hasLimit,
    zimbraMtaMaxMessageSizeState: hasLimit ? bytesToMB(Number(maxMessageSize)) : 0,
  };
}

function buildMessageSizeAttributes(
  limitMaxMessageSize: boolean,
  zimbraMtaMaxMessageSize: string,
): Array<ConfigAttribute> {
  if (limitMaxMessageSize === false) {
    return [{ n: ZIMBRA_MTA_MESSAGE_SIZE, _content: '' }];
  }
  if (zimbraMtaMaxMessageSize) {
    return [
      {
        n: ZIMBRA_MTA_MESSAGE_SIZE,
        _content: mbToBytes(Number(zimbraMtaMaxMessageSize)).toString(),
      },
    ];
  }
  return [];
}

type MTAAdvancedFormProps = Readonly<{
  configInformation: Array<Record<string, string>>;
}>;

const MTAAdvancedForm = ({ configInformation }: MTAAdvancedFormProps) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: rights } = useCurrentUserRights();

  const [isErrorInSmtpdProxy, setIsErrorInSmtpdProxy] = useState<boolean>(false);

  const form = useForm({
    defaultValues: buildInitialState(configInformation),
    onSubmit: async ({ value }) => {
      if (isErrorInSmtpdProxy) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('mta.smtpd_not_valid_error', 'Smtpd sender login maps is not valid'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }

      const attributes: Array<ConfigAttribute> = [];
      attributes.push(
        {
          n: ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
          _content: value.zimbraMtaSmtpdClientPortLogging ? 'yes' : 'no',
        },
        ...(value.zimbraAmavisLogLevel
          ? [{ n: ZIMBRA_AMAVIS_LOG_LEVEL, _content: value.zimbraAmavisLogLevel }]
          : []),
        ...(value.zimbraAmavisSALogLevel
          ? [{ n: ZIMBRA_AMAVIS_SA_LOG_LEVEL, _content: value.zimbraAmavisSALogLevel }]
          : []),
        ...(value.zimbraMtaSmtpdTlsLoglevel
          ? [{ n: ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL, _content: value.zimbraMtaSmtpdTlsLoglevel }]
          : []),
        ...(value.zimbraMtaLmtpTlsLoglevel
          ? [{ n: ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL, _content: value.zimbraMtaLmtpTlsLoglevel }]
          : []),
        ...(value.zimbraClamAVMaxThreads
          ? [{ n: ZIMBRA_CLAM_AV_MAX_THREADS, _content: value.zimbraClamAVMaxThreads }]
          : []),
        ...(value.zimbraLmtpNumThreads
          ? [{ n: ZIMBRA_LMTP_NUM_THREADS, _content: value.zimbraLmtpNumThreads }]
          : []),
        ...(value.zimbraMilterNumThreads
          ? [{ n: ZIMBRA_MITER_NUM_THREADS, _content: value.zimbraMilterNumThreads }]
          : []),
        ...buildMessageSizeAttributes(value.limitMaxMessageSize, value.zimbraMtaMaxMessageSize),
        ...(value.zimbraMilterMaxConnections
          ? [{ n: ZIMBRA_MILTER_MAX_CONNECTIONS, _content: value.zimbraMilterMaxConnections }]
          : []),
        {
          n: ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
          _content: value.zimbraMtaSmtpSaslAuthEnable ? 'yes' : 'no',
        },
        {
          n: ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
          _content: value.zimbraMtaSmtpdSenderLoginMaps ? value.zimbraMtaSmtpdSenderLoginMaps : '',
        },
      );

      try {
        await modifyConfigAsync(attributes);
        form.reset(value, { keepDefaultValues: true });
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const rightsConfig = find(rights, { type: CONFIG }) || {
    all: [],
    type: CONFIG,
  };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  function handleSenderLoginMapsChange(value: string) {
    if (!isValidProxy(value)) {
      setIsErrorInSmtpdProxy(true);
    } else {
      setIsErrorInSmtpdProxy(false);
    }
  }

  return (
    <FormPageLayout
      title={t('label.advanced', 'Advanced')}
      onSave={() => form.handleSubmit()}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <LoggingSection form={form} allowSetMTA={allowSetMTA} />

      <TuningSection
        form={form}
        allowSetMTA={allowSetMTA}
        isErrorInSmtpdProxy={isErrorInSmtpdProxy}
        onSenderLoginMapsChange={handleSenderLoginMapsChange}
      />

      <MailMessageSizeSection form={form} allowSetMTA={allowSetMTA} />
    </FormPageLayout>
  );
};

export const MTAAdvanced = () => {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return <MTAAdvancedForm key={configInformation.length} configInformation={configInformation} />;
};
