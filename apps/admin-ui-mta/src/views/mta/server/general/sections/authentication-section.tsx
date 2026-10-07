/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomChip,
  InheritedSwitch,
  TextInput,
  Tooltip,
} from '@zextras/ui-components';
import { some } from 'lodash-es';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IpRangeValue } from '../../../../../../types';
import {
  FALSE,
  TRUE,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
} from '../../../../../constants';
import { InheritedChipInput } from '../../../../utility/inherited-components/inherited-chip-input';
import { RevertToInheritedIcon } from '../../../../utility/revert-to-inherited-icon';
import {
  ConfigItem,
  MtaServerGeneralFormApi,
  MtaServerGeneralFormValues,
} from '../types';

type AuthenticationSectionProps = Readonly<{
  form: MtaServerGeneralFormApi;
  mtaServerSpecificGeneralDetail: MtaServerGeneralFormValues | undefined;
  configInformation: Array<ConfigItem>;
  networkValue: Array<IpRangeValue>;
  networkValueGlobal: Array<IpRangeValue>;
  allowSetMTA: boolean;
  onBlockExtensionChange: (ips: Array<IpRangeValue>) => void;
  onResetMyNetwork: () => void;
}>;

export const AuthenticationSection = ({
  form,
  mtaServerSpecificGeneralDetail,
  configInformation,
  networkValue,
  networkValueGlobal,
  allowSetMTA,
  onBlockExtensionChange,
  onResetMyNetwork,
}: AuthenticationSectionProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.authentication', 'Authentication')}
        </ds-text>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaSaslAuthEnable">
            {(field) => (
              <Tooltip
                placement="bottom"
                label={t(
                  'mta.enable_or_disable_authentication_for_email_transfer_agent',
                  'Enable or disable authentication for the Mail Transfer Agent (MTA)',
                )}
                maxWidth="auto"
              >
                <InheritedSwitch
                  subValue={field.state.value}
                  onChange={() =>
                    field.handleChange(field.state.value === TRUE ? FALSE : TRUE)
                  }
                  label={t('mta.enable_authentication', 'Enable Authentication')}
                  iconColor="primary"
                  inheritedValue={
                    configInformation?.find(
                      (item: Record<string, string>) => item?.n === ZIMBRA_MTA_SASL_AUTH_ENABLED,
                    )?._content === 'yes'
                      ? TRUE
                      : FALSE
                  }
                  fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaSaslAuthEnable}
                  inputName={ZIMBRA_MTA_SASL_AUTH_ENABLED}
                  onChangeReset={() => field.handleChange(undefined)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start" height="auto">
          <InheritedChipInput
            placeholder={t('mta.my_netword', 'My Network')}
            background="gray5"
            requireUniqueChips
            onChange={onBlockExtensionChange}
            disabled={!allowSetMTA}
            hasError={some(networkValue || [], { error: true })}
            ChipComponent={CustomChip}
            subValue={networkValue}
            inheritedValue={networkValueGlobal}
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaMyNetworks}
            onChangeReset={onResetMyNetwork}
          />
        </Container>
      </Container>

      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }} height="auto">
          <form.Field name="zimbraMtaRelayHost">
            {(field) => {
              const inheritedRelayHost = configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST,
              )?._content;
              const isOverridden = field.state.value !== undefined;
              return (
                <TextInput
                  label={t('mta.relay_host', 'Relay Host')}
                  name="zimbraMtaRelayHost"
                  value={field.state.value ?? inheritedRelayHost ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  description={
                    isOverridden
                      ? undefined
                      : t(
                          'mta.inherited_from_global_configuration',
                          'Inherited from the global configuration',
                        )
                  }
                  disabled={!allowSetMTA}
                  icon={
                    isOverridden ? (
                      <RevertToInheritedIcon
                        label={t(
                          'mta.click_to_revert',
                          'Click to revert to the inherited value',
                        )}
                        onClick={() => field.handleChange(undefined)}
                      />
                    ) : undefined
                  }
                />
              );
            }}
          </form.Field>
        </Container>
        <Container padding={{ right: 'medium' }}>
          <form.Field name="zimbraMtaFallbackRelayHost">
            {(field) => {
              const inheritedFallbackRelayHost = configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST,
              )?._content;
              const isOverridden = field.state.value !== undefined;
              return (
                <TextInput
                  label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
                  name="zimbraMtaFallbackRelayHost"
                  value={field.state.value ?? inheritedFallbackRelayHost ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  description={
                    isOverridden
                      ? undefined
                      : t(
                          'mta.inherited_from_global_configuration',
                          'Inherited from the global configuration',
                        )
                  }
                  disabled={!allowSetMTA}
                  icon={
                    isOverridden ? (
                      <RevertToInheritedIcon
                        label={t(
                          'mta.click_to_revert',
                          'Click to revert to the inherited value',
                        )}
                        onClick={() => field.handleChange(undefined)}
                      />
                    ) : undefined
                  }
                />
              );
            }}
          </form.Field>
        </Container>
      </Container>
    </>
  );
}
