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
import { useTranslation } from 'react-i18next';

import { IpRangeValue } from '../../../../../types';
import { CustomChip } from '../../../components/customChip';
import type { OutboundFlowFormApi } from '../types';

type GeneralSectionProps = {
  form: OutboundFlowFormApi;
  networkValue: Array<IpRangeValue>;
  allowSetMTA: boolean;
  onBlockExtensionChange: (ips: Array<ChipItem<string>>) => void;
};

export const GeneralSection = ({
  form,
  networkValue,
  allowSetMTA,
  onBlockExtensionChange,
}: Readonly<GeneralSectionProps>) => {
  const [t] = useTranslation();

  const tlsSecurityOptions = [
    { label: t('mta.may', 'May'), value: 'may' },
    { label: t('mta.none', 'None'), value: 'none' },
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
          <form.Field name="zimbraSmtpSendAddOriginatingIP">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraSmtpSendAddAuthenticatedUser">
            {(field) => (
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
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
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
                <Switch
                  label={t('mta.enable_authentication', 'Enable Authentication')}
                  value={field.state.value === 'yes'}
                  onClick={() => field.handleChange(field.state.value === 'yes' ? 'no' : 'yes')}
                  disabled={!allowSetMTA}
                />
              </Tooltip>
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaTlsSecurityLevel">
            {(field) => (
              <Select
                items={tlsSecurityOptions}
                background="gray5"
                label={t('mta.tls_security_level', 'TLS Security Level')}
                showCheckbox={false}
                selection={tlsSecurityOptions.find(
                  (item: Record<string, string>) => item.value === field.state.value,
                )}
                // @ts-expect-error - needs a fix
                onChange={(v: string) => field.handleChange(v)}
                disabled={!allowSetMTA}
              />
            )}
          </form.Field>
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
          <form.Field name="zimbraMtaSmtpHeloName">
            {(field) => (
              <Input
                label={t('mta.smtp_helo_name', 'SMTP HELO Name')}
                value={field.state.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (allowSetMTA) {
                    field.handleChange(e.target.value);
                  }
                }}
                backgroundColor="gray5"
              />
            )}
          </form.Field>
        </Container>
        <Container>
          <form.Field name="zimbraMtaMyHostname">
            {(field) => (
              <Input
                label={t('mta.my_hostname', 'My Hostname')}
                value={field.state.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (allowSetMTA) {
                    field.handleChange(e.target.value);
                  }
                }}
                backgroundColor="gray5"
              />
            )}
          </form.Field>
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
          <form.Field name="zimbraMtaFallbackRelayHost">
            {(field) => (
              <Input
                label={t('mta.fallback_relay_host', 'Fallback Relay Host')}
                value={field.state.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (allowSetMTA) {
                    field.handleChange(e.target.value);
                  }
                }}
                backgroundColor="gray5"
              />
            )}
          </form.Field>
        </Container>
        <Container>
          <form.Field name="zimbraMtaRelayHost">
            {(field) => (
              <Input
                label={t('mta.relay_host', 'Relay Host')}
                value={field.state.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (allowSetMTA) {
                    field.handleChange(e.target.value);
                  }
                }}
                backgroundColor="gray5"
              />
            )}
          </form.Field>
        </Container>
      </Container>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        height="auto"
        padding={{ top: 'large' }}
      >
        <form.Field name="zimbraMtaMyOrigin">
          {(field) => (
            <Input
              label={t('mta.my_origin', 'My Origin')}
              value={field.state.value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (allowSetMTA) {
                  field.handleChange(e.target.value);
                }
              }}
              backgroundColor="gray5"
            />
          )}
        </form.Field>
      </Container>
    </>
  );
}
