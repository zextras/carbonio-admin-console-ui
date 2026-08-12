/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ListRow, Padding, Row, SelectItem } from '@zextras/ui-components';
import { useAllConfig, useLocalStorage } from '@zextras/ui-shared';
import { isEqual } from 'lodash-es';
import { useState } from 'react';
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
import { useModifyConfig } from '../../../services/use-modify-config';
import { BlacklistingSection } from './sections/blacklisting-section';
import { DnsBlacklistingSection } from './sections/dns-blacklisting-section';
import { TuningSection } from './sections/tuning-section';

type SelectValue = SelectItem[] | string | null;

function findConfigValue(config: Array<Record<string, string>>, key: string): string | undefined {
  return config.find((item) => item?.n === key)?._content;
}

type FormState = {
  initial: MtaPostTuning;
  current: MtaPostTuning;
};

function buildInitialState(configInformation: Array<Record<string, string>>): MtaPostTuning {
  const state: Partial<MtaPostTuning> = {};

  const configKeys = [
    ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION,
    ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION,
    ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION,
    ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
    ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
    ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
    ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
    ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
    ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
    ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
    ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION,
    ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST,
    ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION,
  ];
  configKeys.forEach((key) => {
    const val = findConfigValue(configInformation, key);
    if (val) state[key as keyof MtaPostTuning] = val as never;
  });

  const boolKeys = [
    { key: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE, name: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE },
    { key: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE, name: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE },
    { key: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE, name: ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE },
  ];
  boolKeys.forEach(({ key, name }) => {
    const val = findConfigValue(configInformation, key);
    if (val) state[name as keyof MtaPostTuning] = (val === 'yes') as never;
  });

  const threshold = findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD);
  state[ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD as keyof MtaPostTuning] = (threshold || '') as never;

  const sites = findConfigValue(configInformation, ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES);
  state[ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES as keyof MtaPostTuning] = (sites || '') as never;

  return state as MtaPostTuning;
}

function MTAPostScreenTuningForm({ configInformation }: { configInformation: Array<Record<string, string>> }) {
  const [t] = useTranslation();
  const { mutateAsync: modifyConfigAsync } = useModifyConfig();
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState = buildInitialState(configInformation);
    return { initial: initialState, current: initialState };
  });
  const [isShowBanner, setIsShowBanner] = useLocalStorage(IS_SHOW_POST_TUNING_BANNER, true);

  const mtaPostTuningInitialDetail = formState.initial;
  const mtaPostTuningDetail = formState.current;

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

  const isDirty = !!mtaPostTuningDetail && !isEqual(mtaPostTuningDetail, mtaPostTuningInitialDetail);

  function setValue(key: string, value: unknown): void {
    setFormState((prev) => ({
      ...prev,
      current: { ...prev.current, [key]: value } as MtaPostTuning,
    }));
  }

  function extractUnit(value: string | undefined): SelectItem {
    if (!value) return intervalOptions[2];
    const unit = value.replaceAll(/[^a-zA-Z]/g, '');
    return intervalOptions.find((item) => item.value === unit) || intervalOptions[2];
  }

  const dnsblMinTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL);
  const dnsblMaxTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL);
  const dnsblTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL);
  const pipeliningTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL);
  const nonSMTPCommandTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL);
  const bareNewLineTTLUnit = extractUnit(mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL);

  function createTTLUnitChangeHandler(key: string, getValue: () => string | undefined) {
    return (v: SelectValue) => {
      const opt = intervalOptions.find((item) => item.value === v) || intervalOptions[2];
      setValue(key, `${getValue()?.replaceAll(/\D/g, '')}${opt.value}`);
    };
  }

  const onDNSMinTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL,
  );
  const onDNSMaxTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL,
  );
  const onDNSTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL,
  );
  const onPipelinginTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL,
  );
  const onNonSMTPCommandTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL,
  );
  const onBareNewLineTTLUnitChange = createTTLUnitChangeHandler(
    ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
    () => mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL,
  );

  function onCancel() {
    setFormState((prev) => ({ ...prev, current: prev.initial }));
  }

  async function onSave() {
    const d = mtaPostTuningDetail;
    const attrs: Array<Record<string, string>> = [];

    const pushIfExists = (key: string, val: string | undefined) => {
      if (val) attrs.push({ n: key, _content: val });
    };

    pushIfExists(ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION, d?.zimbraMtaPostscreenBlacklistAction);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_ACCESS_LIST, d?.zimbraMtaPostscreenAccessList);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION, d?.zimbraMtaPostscreenDnsblAction);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, d?.zimbraMtaPostscreenDnsblSites);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, d?.zimbraMtaPostscreenDnsblThreshold);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD, d?.zimbraMtaPostscreenDnsblWhitelistThreshold);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL, d?.zimbraMtaPostscreenDnsblMinTTL);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL, d?.zimbraMtaPostscreenDnsblMaxTTL);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL, d?.zimbraMtaPostscreenDnsblTTL);

    attrs.push({ n: ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE, _content: d?.zimbraMtaPostscreenBareNewlineEnable ? 'yes' : 'no' });
    attrs.push({ n: ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE, _content: d?.zimbraMtaPostscreenNonSmtpCommandEnable ? 'yes' : 'no' });
    attrs.push({ n: ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE, _content: d?.zimbraMtaPostscreenPipeliningEnable ? 'yes' : 'no' });

    pushIfExists(ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION, d?.zimbraMtaPostscreenPipeliningAction);
    pushIfExists(ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION, d?.zimbraMtaPostscreenNonSmtpCommandAction);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION, d?.zimbraMtaPostscreenBareNewlineAction);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL, d?.zimbraMtaPostscreenPipeliningTTL);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL, d?.zimbraMtaPostscreenNonSmtpCommandTTL);
    pushIfExists(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL, d?.zimbraMtaPostscreenBareNewlineTTL);

    try {
      await modifyConfigAsync(attrs);
      setFormState((prev) => ({ ...prev, initial: d }));
    } catch {
      // Error snackbar is already shown by the hook
    }
  }

  return (
    <Container background="gray6" mainAlignment="flex-start">
      <Row mainAlignment="flex-start" crossAlignment="center" orientation="horizontal" background="gray6" width="fill" height="3.5rem">
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('mta.postscreen_tuning', 'Postscreen Tuning')}
          </ds-text>
        </Row>
        <Row>
          {isDirty && (
            <Container orientation="horizontal" mainAlignment="flex-end" crossAlignment="flex-end" background="gray6">
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
      <ListRow><ds-divider></ds-divider></ListRow>
      <Container padding={{ all: 'extralarge' }} mainAlignment="flex-start" crossAlignment="flex-start" height="calc(100vh - 10.5rem)" style={{ overflow: 'auto' }}>
        <BlacklistingSection
          mtaPostTuningDetail={mtaPostTuningDetail}
          isShowBanner={isShowBanner}
          setIsShowBanner={setIsShowBanner}
          setValue={setValue}
          ignoreEnforceDropOptions={ignoreEnforceDropOptions}
          onBlackListActionChange={(v) => setValue(ZIMBRA_MTA_POST_SCREEN_BLACK_LIST_ACTION, v)}
        />
        <DnsBlacklistingSection
          mtaPostTuningDetail={mtaPostTuningDetail}
          setValue={setValue}
          ignoreEnforceDropOptions={ignoreEnforceDropOptions}
          intervalOptions={intervalOptions}
          dnsblMinTTLUnit={dnsblMinTTLUnit}
          dnsblMaxTTLUnit={dnsblMaxTTLUnit}
          dnsblTTLUnit={dnsblTTLUnit}
          onDNSBlackListActionChange={(v) => setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_ACTION, v)}
          onDNSMinTTLUnitChange={onDNSMinTTLUnitChange}
          onDNSMaxTTLUnitChange={onDNSMaxTTLUnitChange}
          onDNSTTLUnitChange={onDNSTTLUnitChange}
        />
        <TuningSection
          mtaPostTuningDetail={mtaPostTuningDetail}
          setValue={setValue}
          ignoreEnforceDropOptions={ignoreEnforceDropOptions}
          intervalOptions={intervalOptions}
          bareNewLineTTLUnit={bareNewLineTTLUnit}
          nonSMTPCommandTTLUnit={nonSMTPCommandTTLUnit}
          pipeliningTTLUnit={pipeliningTTLUnit}
          onBareNewLineActionChange={(v) => setValue(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ACTION, v)}
          onNonSMTPCommandActionChange={(v) => setValue(ZIIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ACTION, v)}
          onPipeLiningActionChange={(v) => setValue(ZIMBRA_POST_SCREEN_PIPE_LINING_ACTION, v)}
          onBareNewLineTTLUnitChange={onBareNewLineTTLUnitChange}
          onNonSMTPCommandTTLUnitChange={onNonSMTPCommandTTLUnitChange}
          onPipelinginTTLUnitChange={onPipelinginTTLUnitChange}
        />
      </Container>
    </Container>
  );
}

export function MTAPostScreenTuning() {
  const { data: configInformation = [] } = useAllConfig();

  if (!configInformation.length) {
    return (
      <Container background="gray6" mainAlignment="center" crossAlignment="center">
        <ds-spinner />
      </Container>
    );
  }

  return <MTAPostScreenTuningForm key={configInformation.length} configInformation={configInformation} />;
}
