/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Container, FormPageLayout, SelectItem } from '@zextras/ui-components';
import { type ConfigAttribute, useAllConfig, useLocalStorage, useModifyConfig } from '@zextras/ui-shared';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { MtaPostTuning } from '../../../../types';
import {
  IS_SHOW_POST_TUNING_BANNER,
  ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
  ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
  ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
  ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
  ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
  ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION,
} from '../../../constants';
import { BlacklistingSection } from './sections/blacklisting-section';
import { DnsBlacklistingSection } from './sections/dns-blacklisting-section';
import { TuningSection } from './sections/tuning-section';

function findConfigValue(config: Array<Record<string, string>>, key: string): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

function buildInitialState(configInformation: Array<Record<string, string>>): MtaPostTuning {
  return {
    zimbraMtaPostscreenPipeliningAction:
      findConfigValue(configInformation, ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION) ?? '',
    zimbraMtaPostscreenNonSmtpCommandAction:
      findConfigValue(configInformation, ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION) ?? '',
    zimbraMtaPostscreenBareNewlineAction:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION) ?? '',
    zimbraMtaPostscreenPipeliningTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL) ?? '',
    zimbraMtaPostscreenNonSmtpCommandTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL) ?? '',
    zimbraMtaPostscreenBareNewlineTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL) ?? '',
    zimbraMtaPostscreenDnsblWhitelistThreshold:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD) ?? '',
    zimbraMtaPostscreenDnsblMinTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL) ?? '',
    zimbraMtaPostscreenDnsblMaxTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL) ?? '',
    zimbraMtaPostscreenDnsblTTL:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL) ?? '',
    zimbraMtaPostscreenBlacklistAction:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION) ?? '',
    zimbraMtaPostscreenAccessList:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST) ?? '',
    zimbraMtaPostscreenDnsblAction:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION) ?? '',
    zimbraMtaPostscreenBareNewlineEnable:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE) === 'yes',
    zimbraMtaPostscreenNonSmtpCommandEnable:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE) === 'yes',
    // Preserve prior mapping: pipelining enable was sourced from non-SMTP command enable attr
    zimbraMtaPostscreenPipeliningEnable:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE) === 'yes',
    zimbraMtaPostscreenDnsblThreshold:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD) || '',
    zimbraMtaPostscreenDnsblSites:
      findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES) || '',
  };
}

type MTAPostScreenTuningFormProps = Readonly<{
  configInformation: Array<Record<string, string>>;
}>;

const MTAPostScreenTuningForm = ({ configInformation }: MTAPostScreenTuningFormProps) => {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const [isShowBanner, setIsShowBanner] = useLocalStorage(IS_SHOW_POST_TUNING_BANNER, true);
  const saveInFlightRef = useRef(false);

  const form = useForm({
    defaultValues: buildInitialState(configInformation),
    onSubmit: async ({ value }) => {
      const attrs: Array<ConfigAttribute> = [];

      const pushIfExists = (key: string, val: string | undefined) => {
        if (val) attrs.push({ n: key, _content: val });
      };

      pushIfExists(
        ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
        value.zimbraMtaPostscreenBlacklistAction,
      );
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST, value.zimbraMtaPostscreenAccessList);
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION, value.zimbraMtaPostscreenDnsblAction);
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, value.zimbraMtaPostscreenDnsblSites);
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, value.zimbraMtaPostscreenDnsblThreshold);
      pushIfExists(
        ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
        value.zimbraMtaPostscreenDnsblWhitelistThreshold,
      );
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL, value.zimbraMtaPostscreenDnsblMinTTL);
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL, value.zimbraMtaPostscreenDnsblMaxTTL);
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL, value.zimbraMtaPostscreenDnsblTTL);

      attrs.push(
        {
          n: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
          _content: value.zimbraMtaPostscreenBareNewlineEnable ? 'yes' : 'no',
        },
        {
          n: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
          _content: value.zimbraMtaPostscreenNonSmtpCommandEnable ? 'yes' : 'no',
        },
        {
          n: ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
          _content: value.zimbraMtaPostscreenPipeliningEnable ? 'yes' : 'no',
        },
      );

      pushIfExists(
        ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION,
        value.zimbraMtaPostscreenPipeliningAction,
      );
      pushIfExists(
        ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
        value.zimbraMtaPostscreenNonSmtpCommandAction,
      );
      pushIfExists(
        ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
        value.zimbraMtaPostscreenBareNewlineAction,
      );
      pushIfExists(ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL, value.zimbraMtaPostscreenPipeliningTTL);
      pushIfExists(
        ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
        value.zimbraMtaPostscreenNonSmtpCommandTTL,
      );
      pushIfExists(
        ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
        value.zimbraMtaPostscreenBareNewlineTTL,
      );

      try {
        await modifyConfigAsync(attrs);
        form.reset(value, { keepDefaultValues: true });
      } catch {
        // Error snackbar is already shown by the hook
      }
    },
  });

  const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);

  const ignoreEnforceDropOptions = [
    { label: t('mta.ignore', 'Ignore'), value: 'ignore' },
    { label: t('mta.enforce', 'Enforce'), value: 'enforce' },
    { label: t('mta.drop', 'Drop'), value: 'drop' },
  ];

  const intervalOptions = [
    { label: t('mta.seconds', 'Seconds'), value: 's' },
    { label: t('mta.minutes', 'Minutes'), value: 'm' },
    { label: t('mta.hours', 'Hours'), value: 'h' },
    { label: t('mta.days', 'Days'), value: 'd' },
    { label: t('mta.weeks', 'Weeks'), value: 'w' },
  ];

  function extractUnit(value: string | undefined): SelectItem {
    if (!value) return intervalOptions[2];
    const unit = value.replaceAll(/[^a-zA-Z]/g, '');
    return intervalOptions.find((item) => item.value === unit) || intervalOptions[2];
  }

  const dnsblMinTTL = useSelector(
    form.store,
    (state) => state.values.zimbraMtaPostscreenDnsblMinTTL,
  );
  const dnsblMaxTTL = useSelector(
    form.store,
    (state) => state.values.zimbraMtaPostscreenDnsblMaxTTL,
  );
  const dnsblTTL = useSelector(form.store, (state) => state.values.zimbraMtaPostscreenDnsblTTL);
  const pipeliningTTL = useSelector(
    form.store,
    (state) => state.values.zimbraMtaPostscreenPipeliningTTL,
  );
  const nonSMTPCommandTTL = useSelector(
    form.store,
    (state) => state.values.zimbraMtaPostscreenNonSmtpCommandTTL,
  );
  const bareNewLineTTL = useSelector(
    form.store,
    (state) => state.values.zimbraMtaPostscreenBareNewlineTTL,
  );

  const dnsblMinTTLUnit = extractUnit(dnsblMinTTL);
  const dnsblMaxTTLUnit = extractUnit(dnsblMaxTTL);
  const dnsblTTLUnit = extractUnit(dnsblTTL);
  const pipeliningTTLUnit = extractUnit(pipeliningTTL);
  const nonSMTPCommandTTLUnit = extractUnit(nonSMTPCommandTTL);
  const bareNewLineTTLUnit = extractUnit(bareNewLineTTL);

  function createTTLUnitChangeHandler(
    fieldName: keyof MtaPostTuning,
    getValue: () => string | undefined,
  ) {
    return (v: Array<SelectItem> | string | null) => {
      const opt = intervalOptions.find((item) => item.value === v) || intervalOptions[2];
      form.setFieldValue(fieldName, `${getValue()?.replaceAll(/\D/g, '')}${opt.value}`);
    };
  }

  const onDNSMinTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenDnsblMinTTL',
    () => dnsblMinTTL,
  );
  const onDNSMaxTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenDnsblMaxTTL',
    () => dnsblMaxTTL,
  );
  const onDNSTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenDnsblTTL',
    () => dnsblTTL,
  );
  const onPipelinginTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenPipeliningTTL',
    () => pipeliningTTL,
  );
  const onNonSMTPCommandTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenNonSmtpCommandTTL',
    () => nonSMTPCommandTTL,
  );
  const onBareNewLineTTLUnitChange = createTTLUnitChangeHandler(
    'zimbraMtaPostscreenBareNewlineTTL',
    () => bareNewLineTTL,
  );

  function handleSave() {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    void form.handleSubmit().finally(() => {
      saveInFlightRef.current = false;
    });
  }

  return (
    <FormPageLayout
      title={t('mta.postscreen_tuning', 'Postscreen Tuning')}
      onSave={handleSave}
      onCancel={() => form.reset()}
      unsavedChanges={isDirty}
    >
      <BlacklistingSection
        form={form}
        isShowBanner={isShowBanner}
        setIsShowBanner={setIsShowBanner}
        ignoreEnforceDropOptions={ignoreEnforceDropOptions}
      />
      <DnsBlacklistingSection
        form={form}
        ignoreEnforceDropOptions={ignoreEnforceDropOptions}
        intervalOptions={intervalOptions}
        dnsblMinTTLUnit={dnsblMinTTLUnit}
        dnsblMaxTTLUnit={dnsblMaxTTLUnit}
        dnsblTTLUnit={dnsblTTLUnit}
        onDNSMinTTLUnitChange={onDNSMinTTLUnitChange}
        onDNSMaxTTLUnitChange={onDNSMaxTTLUnitChange}
        onDNSTTLUnitChange={onDNSTTLUnitChange}
      />
      <TuningSection
        form={form}
        ignoreEnforceDropOptions={ignoreEnforceDropOptions}
        intervalOptions={intervalOptions}
        bareNewLineTTLUnit={bareNewLineTTLUnit}
        nonSMTPCommandTTLUnit={nonSMTPCommandTTLUnit}
        pipeliningTTLUnit={pipeliningTTLUnit}
        onBareNewLineTTLUnitChange={onBareNewLineTTLUnitChange}
        onNonSMTPCommandTTLUnitChange={onNonSMTPCommandTTLUnitChange}
        onPipelinginTTLUnitChange={onPipelinginTTLUnitChange}
      />
    </FormPageLayout>
  );
};

export const MTAPostScreenTuning = () => {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <MTAPostScreenTuningForm key={configInformation.length} configInformation={configInformation} />
  );
};
