/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ChipInput,
  type ChipItem,
  Container,
  Input,
  Select,
  Switch,
  Tooltip,
} from '@zextras/ui-components';
import { some } from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IpRangeValue, MtaOutboundFlow } from '../../../../../types';
import {
  ZIMBRA_MTA_FALLBACK_RELAY_HOST,
  ZIMBRA_MTA_MY_HOSTNAME,
  ZIMBRA_MTA_MY_ORIGIN,
  ZIMBRA_MTA_RELAY_HOST,
  ZIMBRA_MTA_SASL_AUTH_ENABLED,
  ZIMBRA_MTA_SMTP_HELLO_NAME,
  ZIMBRA_MTA_TLS_SECURITY_LEVEL,
  ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
  ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
} from '../../../../constants';
import { CustomChip } from '../../../components/customChip';

type GeneralSectionProps = {
  mtaOutboundDetail: MtaOutboundFlow | undefined;
  networkValue: Array<IpRangeValue>;
  allowSetMTA: boolean;
  setValue: (key: string, value: unknown) => void;
  onBlockExtensionChange: (ips: Array<ChipItem<string>>) => void;
};

export function GeneralSection({
  mtaOutboundDetail,
  networkValue,
  allowSetMTA,
  setValue,
  onBlockExtensionChange,
}: Readonly<GeneralSectionProps>) {
  const [t] = useTranslation();

  const tlsSecurityOptions = [
    { label: t('mta.may', 'May'), value: 'may' },
    { label: t('mta.none', 'None'), value: 'none' },
  ];

  function onTlsSecurityOptions(v: string) {
    setValue(ZIMBRA_MTA_TLS_SECURITY_LEVEL, v);
  }

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('label.general_lbl', 'General')}
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
              'mta.include_originating_ip_address_in_smtp_header_outgoing_emails',
              'Include the originating IP address in the SMTP headers of outgoing emails',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.add_client_ip_to_header', 'Add client IP to the header')}
              value={mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP}
              onClick={(): void =>
                setValue(
                  ZIMBRA_SMTP_SEND_ADD_ORIGINATING_IP,
                  !mtaOutboundDetail?.zimbraSmtpSendAddOriginatingIP,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
        <Container crossAlignment="flex-start">
          <Tooltip
            placement="bottom"
            label={t(
              'mta.include_authenticated_user_information_in_smtp_header_for_outgoing_emails',
              'Include the authenticated user information in the SMTP headers of outgoing emails',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.add_username_to_header', 'Add username to the header')}
              value={mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser}
              onClick={(): void =>
                setValue(
                  ZIMBRA_SMTP_SEND_ADD_AUTHENTICATED_USER,
                  !mtaOutboundDetail?.zimbraSmtpSendAddAuthenticatedUser,
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
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
          <Tooltip
            placement="bottom"
            label={t(
              'mta.enable_or_disable_authentication_for_email_transfer_agent',
              'Enable or disable authentication for the Mail Transfer Agent (MTA)',
            )}
            maxWidth="auto"
          >
            <Switch
              label={t('mta.enable_authentication', 'Enable Authentication')}
              value={mtaOutboundDetail?.zimbraMtaSaslAuthEnable === 'yes'}
              onClick={(): void =>
                setValue(
                  ZIMBRA_MTA_SASL_AUTH_ENABLED,
                  mtaOutboundDetail?.zimbraMtaSaslAuthEnable === 'yes' ? 'no' : 'yes',
                )
              }
              disabled={!allowSetMTA}
            />
          </Tooltip>
        </Container>
        <Container crossAlignment="flex-start">
          <Select
            items={tlsSecurityOptions}
            background="gray5"
            label={t('mta.tls_security_level', 'TLS Security Level')}
            showCheckbox={false}
            selection={tlsSecurityOptions.find(
              (item: Record<string, string>) =>
                item.value === mtaOutboundDetail?.zimbraMtaTlsSecurityLevel,
            )}
            // @ts-expect-error - needs a fix
            onChange={onTlsSecurityOptions}
            disabled={!allowSetMTA}
          />
        </Container>
      </Container>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="auto"
        padding={{ top: 'large' }}
      >
        <ChipInput
          placeholder={t('mta.my_netword', 'My Network')}
          background="gray5"
          requireUniqueChips
          value={networkValue}
          onChange={onBlockExtensionChange}
          disabled={!allowSetMTA}
          hasError={some(networkValue || [], { error: true })}
          ChipComponent={CustomChip}
          description={
            some(networkValue || [], { error: true })
              ? t(
                  'error.invalid_ip_address_error_text',
                  'Supported ip format for ipv4 is ipv4/netmask and for ipv6 is [ipv6]/netmask',
                )
              : ''
          }
          maxChips={null}
        />
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ top: 'large' }}
        height="auto"
      >
        <Container padding={{ right: 'medium' }}>
          <Input
            label={t('mta.smtp_helo_name', 'SMTP HELO Name')}
            value={mtaOutboundDetail?.zimbraMtaSmtpHeloName || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              if (allowSetMTA) {
                setValue(ZIMBRA_MTA_SMTP_HELLO_NAME, e.target.value);
              }
            }}
            backgroundColor="gray5"
          />
        </Container>
        <Container>
          <Input
            label={t('mta.my_hostname', 'My Hostname')}
            value={mtaOutboundDetail?.zimbraMtaMyHostname || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              if (allowSetMTA) {
                setValue(ZIMBRA_MTA_MY_HOSTNAME, e.target.value);
              }
            }}
            backgroundColor="gray5"
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
        <Container padding={{ right: 'medium' }}>
          <Input
            label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
            value={mtaOutboundDetail?.zimbraMtaFallbackRelayHost || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              if (allowSetMTA) {
                setValue(ZIMBRA_MTA_FALLBACK_RELAY_HOST, e.target.value);
              }
            }}
            backgroundColor="gray5"
          />
        </Container>
        <Container>
          <Input
            label={t('mta.relay_host', 'Relay Host')}
            value={mtaOutboundDetail?.zimbraMtaRelayHost || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              if (allowSetMTA) {
                setValue(ZIMBRA_MTA_RELAY_HOST, e.target.value);
              }
            }}
            backgroundColor="gray5"
          />
        </Container>
      </Container>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="auto"
        padding={{ top: 'large' }}
      >
        <Input
          label={t('mta.my_origin', 'My Origin')}
          value={mtaOutboundDetail?.zimbraMtaMyOrigin || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            if (allowSetMTA) {
              setValue(ZIMBRA_MTA_MY_ORIGIN, e.target.value);
            }
          }}
          backgroundColor="gray5"
        />
      </Container>
    </>
  );
}
