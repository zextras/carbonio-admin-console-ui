/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, InheritedInput, InheritedSwitch, Tooltip } from '@zextras/ui-components';
import { some } from 'lodash-es';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { IpRangeValue, MtaServerGeneral } from '../../../../../../types';
import {
  FALSE,
  TRUE,
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
  ZIMBRA_MTA_MY_NETWORKS,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
} from '../../../../../constants';
import { CustomChip } from '../../../../components/customChip';
import { InheritedChipInput } from '../../../../utility/inherited-components/inherited-chip-input';

type AuthenticationSectionProps = Readonly<{
  mtaServerGeneralDetail: MtaServerGeneral | undefined;
  mtaServerSpecificGeneralDetail: MtaServerGeneral | undefined;
  configInformation: Array<{ n: string; _content: string }>;
  networkValue: Array<IpRangeValue>;
  networkValueGlobal: Array<IpRangeValue>;
  allowSetMTA: boolean;
  onBlockExtensionChange: (ips: Array<IpRangeValue>) => void;
  changeSwitchOption: (key: keyof MtaServerGeneral) => void;
  changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
  setEmptyValue: (keyName: keyof MtaServerGeneral) => void;
  setEmptyValueMyNetwork: (keyName: keyof MtaServerGeneral) => void;
}>;

export function AuthenticationSection({
  mtaServerGeneralDetail,
  mtaServerSpecificGeneralDetail,
  configInformation,
  networkValue,
  networkValueGlobal,
  allowSetMTA,
  onBlockExtensionChange,
  changeSwitchOption,
  changeValue,
  setEmptyValue,
  setEmptyValueMyNetwork,
}: AuthenticationSectionProps) {
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
          <Tooltip
            placement="bottom"
            label={t(
              'mta.enable_or_disable_authentication_for_email_transfer_agent',
              'Enable or disable authentication for the Mail Transfer Agent (MTA)',
            )}
            maxWidth="auto"
          >
            <InheritedSwitch
              subValue={mtaServerGeneralDetail?.zimbraMtaSaslAuthEnable}
              onChange={changeSwitchOption}
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
              onChangeReset={(): void => setEmptyValue(ZIMBRA_MTA_SASL_AUTH_ENABLED)}
              disabled={!allowSetMTA}
            />
          </Tooltip>
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
            onChangeReset={(): void => setEmptyValueMyNetwork(ZIMBRA_MTA_MY_NETWORKS)}
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
          <InheritedInput
            label={t('mta.relay_host', 'Relay Host')}
            subValue={mtaServerGeneralDetail?.zimbraMtaRelayHost}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_RELAY_HOST,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaRelayHost}
            background="gray5"
            inputName="zimbraMtaRelayHost"
            onChange={changeValue}
            onChangeReset={(): void => setEmptyValue('zimbraMtaRelayHost')}
            disabled={!allowSetMTA}
          />
        </Container>
        <Container padding={{ right: 'medium' }}>
          <InheritedInput
            label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
            subValue={mtaServerGeneralDetail?.zimbraMtaFallbackRelayHost}
            inheritedValue={
              configInformation?.find(
                (item: Record<string, string>) => item?.n === ZIMBRA_MTA_FALLBACK_RELAY_HOST,
              )?._content
            }
            fromSubValue={mtaServerSpecificGeneralDetail?.zimbraMtaFallbackRelayHost}
            background="gray5"
            inputName="zimbraMtaFallbackRelayHost"
            onChange={changeValue}
            onChangeReset={(): void => setEmptyValue('zimbraMtaFallbackRelayHost')}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
    </>
  );
}
