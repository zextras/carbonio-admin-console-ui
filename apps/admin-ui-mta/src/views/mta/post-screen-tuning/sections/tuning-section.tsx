/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Select, SelectItem, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaPostTuningFormApi } from '../types';

type SelectValue = Array<SelectItem> | string | null;

type TuningSectionProps = Readonly<{
  form: MtaPostTuningFormApi;
  ignoreEnforceDropOptions: Array<SelectItem>;
  intervalOptions: Array<SelectItem>;
  bareNewLineTTLUnit: SelectItem;
  nonSMTPCommandTTLUnit: SelectItem;
  pipeliningTTLUnit: SelectItem;
  onBareNewLineTTLUnitChange: (v: SelectValue) => void;
  onNonSMTPCommandTTLUnitChange: (v: SelectValue) => void;
  onPipelinginTTLUnitChange: (v: SelectValue) => void;
}>;

export const TuningSection = ({
  form,
  ignoreEnforceDropOptions,
  intervalOptions,
  bareNewLineTTLUnit,
  nonSMTPCommandTTLUnit,
  pipeliningTTLUnit,
  onBareNewLineTTLUnitChange,
  onNonSMTPCommandTTLUnitChange,
  onPipelinginTTLUnitChange,
}: TuningSectionProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'medium' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.tuning', 'Tuning')}
        </ds-text>
      </Container>

      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ right: 'medium' }}
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start">
            <form.Field name="zimbraMtaPostscreenBareNewlineEnable">
              {(field) => (
                <Switch
                  label={t('mta.bare_newline', 'Bare Newline')}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end">
            <form.Field name="zimbraMtaPostscreenBareNewlineAction">
              {(field) => (
                <Select
                  items={ignoreEnforceDropOptions}
                  background="gray5"
                  label={t('mta.action', 'Action')}
                  showCheckbox={false}
                  selection={ignoreEnforceDropOptions.find(
                    (item) => item.value === field.state.value,
                  )}
                  // @ts-expect-error - needs a fix
                  onChange={(v: string) => field.handleChange(v)}
                />
              )}
            </form.Field>
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <form.Field name="zimbraMtaPostscreenBareNewlineTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
                  backgroundColor="gray5"
                  value={field.state.value?.replaceAll(/\D/g, '') ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const digits = e.target.value;
                    const unit = field.state.value?.replaceAll(/[^a-zA-Z]/g, '') || 'h';
                    field.handleChange(`${digits}${unit}`);
                  }}
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end" width="30%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={bareNewLineTTLUnit}
              onChange={onBareNewLineTTLUnitChange}
            />
          </Container>
        </Container>
      </Container>

      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ right: 'medium' }}
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start">
            <form.Field name="zimbraMtaPostscreenNonSmtpCommandEnable">
              {(field) => (
                <Switch
                  label={t('mta.non_smtp_command', 'NonSMTP Command')}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end">
            <form.Field name="zimbraMtaPostscreenNonSmtpCommandAction">
              {(field) => (
                <Select
                  items={ignoreEnforceDropOptions}
                  background="gray5"
                  label={t('mta.action', 'Action')}
                  showCheckbox={false}
                  selection={ignoreEnforceDropOptions.find(
                    (item) => item.value === field.state.value,
                  )}
                  // @ts-expect-error - needs a fix
                  onChange={(v: string) => field.handleChange(v)}
                />
              )}
            </form.Field>
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <form.Field name="zimbraMtaPostscreenNonSmtpCommandTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
                  backgroundColor="gray5"
                  value={field.state.value?.replaceAll(/\D/g, '') ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const digits = e.target.value;
                    const unit = field.state.value?.replaceAll(/[^a-zA-Z]/g, '') || 'h';
                    field.handleChange(`${digits}${unit}`);
                  }}
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end" width="30%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={nonSMTPCommandTTLUnit}
              onChange={onNonSMTPCommandTTLUnitChange}
            />
          </Container>
        </Container>
      </Container>

      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ right: 'medium' }}
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start">
            <form.Field name="zimbraMtaPostscreenPipeliningEnable">
              {(field) => (
                <Switch
                  label={t('mta.pipelining', 'Pipelining')}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                  iconColor="primary"
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end">
            <form.Field name="zimbraMtaPostscreenPipeliningAction">
              {(field) => (
                <Select
                  items={ignoreEnforceDropOptions}
                  background="gray5"
                  label={t('mta.action', 'Action')}
                  showCheckbox={false}
                  selection={ignoreEnforceDropOptions.find(
                    (item) => item.value === field.state.value,
                  )}
                  // @ts-expect-error - needs a fix
                  onChange={(v: string) => field.handleChange(v)}
                />
              )}
            </form.Field>
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <form.Field name="zimbraMtaPostscreenPipeliningTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
                  backgroundColor="gray5"
                  value={field.state.value?.replaceAll(/\D/g, '') ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const digits = e.target.value;
                    const unit = field.state.value?.replaceAll(/[^a-zA-Z]/g, '') || 'h';
                    field.handleChange(`${digits}${unit}`);
                  }}
                />
              )}
            </form.Field>
          </Container>
          <Container crossAlignment="flex-end" width="30%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={pipeliningTTLUnit}
              onChange={onPipelinginTTLUnitChange}
            />
          </Container>
        </Container>
      </Container>
    </>
  );
}
