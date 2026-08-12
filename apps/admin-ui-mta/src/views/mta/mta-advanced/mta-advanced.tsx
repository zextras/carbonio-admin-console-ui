/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, ListRow, Padding, Row, useSnackbar } from '@zextras/ui-components';
import { useAllConfig, useCurrentUserRights } from '@zextras/ui-shared';
import { find, isEqual } from 'lodash-es';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type MtaAdvanced } from '../../../../types';
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
import { useModifyConfig } from '../../../services/use-modify-config';
import { bytesToMB, isValidProxy, mbToBytes } from '../../utility/utils';
import { LoggingSection } from './sections/logging-section';
import { MailMessageSizeSection } from './sections/mail-message-size-section';
import { TuningSection } from './sections/tuning-section';

type FormState = {
  initial: MtaAdvanced;
  current: MtaAdvanced;
};

type LocalUIState = {
  limitMaxMessageSize: boolean;
  zimbraMtaMaxMessageSizeState: number | string;
};

function findConfigValue(
  config: Array<Record<string, string>>,
  key: string,
): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

function findConfigValueYesNo(
  config: Array<Record<string, string>>,
  key: string,
): boolean {
  const item = config.find((c) => c?.n === key);
  return item?._content === 'yes';
}

function buildInitialState(configInformation: Array<Record<string, string>>): MtaAdvanced {
  const state: Partial<MtaAdvanced> = {};

  const portLogging = findConfigValueYesNo(configInformation, ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING);
  state.zimbraMtaSmtpdClientPortLogging = portLogging;

  const amavisLogLevel = findConfigValue(configInformation, ZIMBRA_AMAVIS_LOG_LEVEL);
  if (amavisLogLevel) state.zimbraAmavisLogLevel = amavisLogLevel;

  const amavisSALogLevel = findConfigValue(configInformation, ZIMBRA_AMAVIS_SA_LOG_LEVEL);
  if (amavisSALogLevel) state.zimbraAmavisSALogLevel = amavisSALogLevel;

  const smtpdTlsLoglevel = findConfigValue(configInformation, ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL);
  if (smtpdTlsLoglevel) state.zimbraMtaSmtpdTlsLoglevel = smtpdTlsLoglevel;

  const lmtpTlsLoglevel = findConfigValue(configInformation, ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL);
  if (lmtpTlsLoglevel) state.zimbraMtaLmtpTlsLoglevel = lmtpTlsLoglevel;

  const clamAVMaxThreads = findConfigValue(configInformation, ZIMBRA_CLAM_AV_MAX_THREADS);
  if (clamAVMaxThreads) state.zimbraClamAVMaxThreads = clamAVMaxThreads;

  const milterNumThreads = findConfigValue(configInformation, ZIMBRA_MITER_NUM_THREADS);
  if (milterNumThreads) state.zimbraMilterNumThreads = milterNumThreads;

  const lmtpNumThreads = findConfigValue(configInformation, ZIMBRA_LMTP_NUM_THREADS);
  if (lmtpNumThreads) state.zimbraLmtpNumThreads = lmtpNumThreads;

  const maxMessageSize = findConfigValue(configInformation, ZIMBRA_MTA_MESSAGE_SIZE);
  if (maxMessageSize) state.zimbraMtaMaxMessageSize = maxMessageSize;

  const milterMaxConnections = findConfigValue(configInformation, ZIMBRA_MILTER_MAX_CONNECTIONS);
  if (milterMaxConnections) state.zimbraMilterMaxConnections = milterMaxConnections;

  const smtpSaslAuthEnable = findConfigValueYesNo(configInformation, ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE);
  state.zimbraMtaSmtpSaslAuthEnable = smtpSaslAuthEnable;

  const senderLoginMaps = findConfigValue(configInformation, ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS);
  if (senderLoginMaps) state.zimbraMtaSmtpdSenderLoginMaps = senderLoginMaps;

  return state as MtaAdvanced;
}

function buildLocalUIState(configInformation: Array<Record<string, string>>): LocalUIState {
  const maxMessageSize = findConfigValue(configInformation, ZIMBRA_MTA_MESSAGE_SIZE);
  const hasLimit = !!maxMessageSize;
  return {
    limitMaxMessageSize: hasLimit,
    zimbraMtaMaxMessageSizeState: hasLimit ? bytesToMB(Number(maxMessageSize)) : 0,
  };
}

function MTAAdvancedForm({
  configInformation,
}: {
  configInformation: Array<Record<string, string>>;
}) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const { data: rights } = useCurrentUserRights();

  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(configInformation);
    return { initial: initialState, current: initialState };
  });

  const [localUIState, setLocalUIState] = useState<LocalUIState>(() =>
    buildLocalUIState(configInformation),
  );

  const [isErrorInSmtpdProxy, setIsErrorInSmtpdProxy] = useState<boolean>(false);

  const mtaAdvancedInitialDetail = formState.initial;
  const mtaAdvancedDetail = formState.current;
  const { limitMaxMessageSize, zimbraMtaMaxMessageSizeState } = localUIState;

  const rightsConfig = find(rights, { type: CONFIG }) || {
    all: [],
    type: CONFIG,
  };
  const allowSetMTA = !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const isDirty = !!mtaAdvancedDetail && !isEqual(mtaAdvancedDetail, mtaAdvancedInitialDetail);

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaAdvanced,
    }));
  }

  function setLimitMaxMessageSize(value: boolean): void {
    setLocalUIState((prev) => ({ ...prev, limitMaxMessageSize: value }));
  }

  function setZimbraMtaMaxMessageSizeState(value: number | string): void {
    setLocalUIState((prev) => ({ ...prev, zimbraMtaMaxMessageSizeState: value }));
  }

  function onAmavisLogLevelChange(v: string | null) {
    if (v !== null) setValue(ZIMBRA_AMAVIS_LOG_LEVEL, v);
  }

  function onAmavisSALogLevelChange(v: string) {
    setValue(ZIMBRA_AMAVIS_SA_LOG_LEVEL, v);
  }

  function onSMTPClientLogLevelChange(v: string) {
    setValue(ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL, v);
  }

  function onLMTPTlsLogLevelChange(v: string) {
    setValue(ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL, v);
  }

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
  }

  async function modifyConfigRequest(attributes: Array<Record<string, string>>): Promise<void> {
    try {
      await modifyConfigAsync(attributes);
      setFormState((prev) => ({ ...prev, initial: prev.current }));
    } catch {
      // Error snackbar is already shown by the hook
    }
  }

  function onSave() {
    const attributes: Array<Record<string, string>> = [];
    attributes.push({
      n: ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING,
      _content: mtaAdvancedDetail?.zimbraMtaSmtpdClientPortLogging ? 'yes' : 'no',
    });
    if (mtaAdvancedDetail?.zimbraAmavisLogLevel) {
      attributes.push({
        n: ZIMBRA_AMAVIS_LOG_LEVEL,
        _content: mtaAdvancedDetail?.zimbraAmavisLogLevel,
      });
    }
    if (mtaAdvancedDetail?.zimbraAmavisSALogLevel) {
      attributes.push({
        n: ZIMBRA_AMAVIS_SA_LOG_LEVEL,
        _content: mtaAdvancedDetail?.zimbraAmavisSALogLevel,
      });
    }
    if (mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel) {
      attributes.push({
        n: ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL,
        _content: mtaAdvancedDetail?.zimbraMtaSmtpdTlsLoglevel,
      });
    }
    if (mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel) {
      attributes.push({
        n: ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL,
        _content: mtaAdvancedDetail?.zimbraMtaLmtpTlsLoglevel,
      });
    }
    if (mtaAdvancedDetail?.zimbraClamAVMaxThreads) {
      attributes.push({
        n: ZIMBRA_CLAM_AV_MAX_THREADS,
        _content: mtaAdvancedDetail?.zimbraClamAVMaxThreads,
      });
    }
    if (mtaAdvancedDetail?.zimbraLmtpNumThreads) {
      attributes.push({
        n: ZIMBRA_LMTP_NUM_THREADS,
        _content: mtaAdvancedDetail?.zimbraLmtpNumThreads,
      });
    }
    if (mtaAdvancedDetail?.zimbraMilterNumThreads) {
      attributes.push({
        n: ZIMBRA_MITER_NUM_THREADS,
        _content: mtaAdvancedDetail?.zimbraMilterNumThreads,
      });
    }

    if (limitMaxMessageSize === false) {
      attributes.push({
        n: ZIMBRA_MTA_MESSAGE_SIZE,
        _content: '',
      });
    } else if (mtaAdvancedDetail?.zimbraMtaMaxMessageSize) {
      attributes.push({
        n: ZIMBRA_MTA_MESSAGE_SIZE,
        _content: mbToBytes(Number(mtaAdvancedDetail?.zimbraMtaMaxMessageSize)).toString(),
      });
    }

    if (mtaAdvancedDetail?.zimbraMilterMaxConnections) {
      attributes.push({
        n: ZIMBRA_MILTER_MAX_CONNECTIONS,
        _content: mtaAdvancedDetail?.zimbraMilterMaxConnections,
      });
    }

    attributes.push({
      n: ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE,
      _content: mtaAdvancedDetail?.zimbraMtaSmtpSaslAuthEnable ? 'yes' : 'no',
    });

    attributes.push({
      n: ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS,
      _content: mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps
        ? mtaAdvancedDetail?.zimbraMtaSmtpdSenderLoginMaps
        : '',
    });
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
    modifyConfigRequest(attributes);
  }

  function onSenderLoginMapsChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (!isValidProxy(value)) {
      setIsErrorInSmtpdProxy(true);
    } else {
      setIsErrorInSmtpdProxy(false);
    }
    setValue(ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS, value);
  }

  const hasErrorMaxMessageSize =
    Number(zimbraMtaMaxMessageSizeState) <= 0 || Number.isNaN(Number(zimbraMtaMaxMessageSizeState));

  return (
    <Container background="gray6" mainAlignment="flex-start">
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="gray6"
        width="fill"
        height="56px"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('label.advanced', 'Advanced')}
          </ds-text>
        </Row>
        <Row>
          {isDirty && (
            <Container
              orientation="horizontal"
              mainAlignment="flex-end"
              crossAlignment="flex-end"
              background="gray6"
            >
              <Padding right="small">
                <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
              </Padding>
              <Padding right="small">
                <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
              </Padding>
            </Container>
          )}
        </Row>
      </Row>
      <ListRow>
        <ds-divider></ds-divider>
      </ListRow>

      <Container
        padding={{ all: 'extralarge' }}
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="calc(100vh - 10.5rem)"
        style={{ overflow: 'auto' }}
      >
        <LoggingSection
          mtaAdvancedDetail={mtaAdvancedDetail}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
          onAmavisLogLevelChange={onAmavisLogLevelChange}
          onAmavisSALogLevelChange={onAmavisSALogLevelChange}
          onSMTPClientLogLevelChange={onSMTPClientLogLevelChange}
          onLMTPTlsLogLevelChange={onLMTPTlsLogLevelChange}
        />

        <TuningSection
          mtaAdvancedDetail={mtaAdvancedDetail}
          allowSetMTA={allowSetMTA}
          isErrorInSmtpdProxy={isErrorInSmtpdProxy}
          setValue={setValue}
          onSenderLoginMapsChange={onSenderLoginMapsChange}
        />

        <MailMessageSizeSection
          limitMaxMessageSize={limitMaxMessageSize}
          zimbraMtaMaxMessageSizeState={zimbraMtaMaxMessageSizeState}
          hasErrorMaxMessageSize={hasErrorMaxMessageSize}
          allowSetMTA={allowSetMTA}
          setValue={setValue}
          setLimitMaxMessageSize={setLimitMaxMessageSize}
          setZimbraMtaMaxMessageSizeState={setZimbraMtaMaxMessageSizeState}
        />
      </Container>
    </Container>
  );
}

export function MTAAdvanced() {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return <MTAAdvancedForm key={configInformation.length} configInformation={configInformation} />;
}
