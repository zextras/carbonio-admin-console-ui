/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Select, SelectItem, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaPostTuning } from '../../../../../types';
import {
  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL,
  ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL,
  ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
  ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL,
} from '../../../../constants';

type SelectValue = SelectItem[] | string | null;

type TuningSectionProps = Readonly<{
  mtaPostTuningDetail: MtaPostTuning | undefined;
  setValue: (key: string, value: unknown) => void;
  ignoreEnforceDropOptions: Array<SelectItem>;
  intervalOptions: Array<SelectItem>;
  bareNewLineTTLUnit: SelectItem;
  nonSMTPCommandTTLUnit: SelectItem;
  pipeliningTTLUnit: SelectItem;
  onBareNewLineActionChange: (v: string) => void;
  onNonSMTPCommandActionChange: (v: string) => void;
  onPipeLiningActionChange: (v: string) => void;
  onBareNewLineTTLUnitChange: (v: SelectValue) => void;
  onNonSMTPCommandTTLUnitChange: (v: SelectValue) => void;
  onPipelinginTTLUnitChange: (v: SelectValue) => void;
}>;

export function TuningSection({
  mtaPostTuningDetail,
  setValue,
  ignoreEnforceDropOptions,
  intervalOptions,
  bareNewLineTTLUnit,
  nonSMTPCommandTTLUnit,
  pipeliningTTLUnit,
  onBareNewLineActionChange,
  onNonSMTPCommandActionChange,
  onPipeLiningActionChange,
  onBareNewLineTTLUnitChange,
  onNonSMTPCommandTTLUnitChange,
  onPipelinginTTLUnitChange,
}: TuningSectionProps) {
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
            <Switch
              label={t('mta.bare_newline', 'Bare Newline')}
              value={mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_ENABLE,
                  !mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineEnable,
                )
              }
            />
          </Container>
          <Container crossAlignment="flex-end">
            <Select
              items={ignoreEnforceDropOptions}
              background="gray5"
              label={t('mta.action', 'Action')}
              showCheckbox={false}
              selection={ignoreEnforceDropOptions.find(
                (item) =>
                  item.value === mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineAction,
              )}
              // @ts-expect-error - needs a fix // Need to fix it with custom soultion
              onChange={onBareNewLineActionChange}
            />
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <Input
              isRequired
              label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenBareNewlineTTL.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_BARE_NEW_LINE_TTL, e.target.value);
              }}
            />
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
            <Switch
              label={t('mta.non_smtp_command', 'NonSMTP Command')}
              value={mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_ENABLE,
                  !mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandEnable,
                )
              }
            />
          </Container>
          <Container crossAlignment="flex-end">
            <Select
              items={ignoreEnforceDropOptions}
              background="gray5"
              label={t('mta.action', 'Action')}
              showCheckbox={false}
              selection={ignoreEnforceDropOptions.find(
                (item) =>
                  item.value === mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandAction,
              )}
              // @ts-expect-error - needs a fix // Need to fix it with custom soultion
              onChange={onNonSMTPCommandActionChange}
            />
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <Input
              isRequired
              label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenNonSmtpCommandTTL.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_NON_SMTP_COMMAND_TTL, e.target.value);
              }}
            />
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
            <Switch
              label={t('mta.pipelining', 'Pipelining')}
              value={mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_ENABLE,
                  !mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningEnable,
                )
              }
            />
          </Container>
          <Container crossAlignment="flex-end">
            <Select
              items={ignoreEnforceDropOptions}
              background="gray5"
              label={t('mta.action', 'Action')}
              showCheckbox={false}
              selection={ignoreEnforceDropOptions.find(
                (item) =>
                  item.value === mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningAction,
              )}
              // @ts-expect-error - needs a fix // Need to fix it with custom soultion
              onChange={onPipeLiningActionChange}
            />
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
        >
          <Container padding={{ right: 'medium' }} crossAlignment="flex-start" width="70%">
            <Input
              isRequired
              label={t('mta.command_time_to_live_value', 'Command Time to Live (value)')}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenPipeliningTTL.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_PIPE_LINING_TTL, e.target.value);
              }}
            />
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
