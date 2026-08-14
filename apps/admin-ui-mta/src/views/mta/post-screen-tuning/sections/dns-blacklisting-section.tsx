/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Select, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaPostTuningFormApi } from '../types';

type SelectValue = Array<SelectItem> | string | null;

type DnsBlacklistingSectionProps = Readonly<{
  form: MtaPostTuningFormApi;
  ignoreEnforceDropOptions: Array<SelectItem>;
  intervalOptions: Array<SelectItem>;
  dnsblMinTTLUnit: SelectItem;
  dnsblMaxTTLUnit: SelectItem;
  dnsblTTLUnit: SelectItem;
  onDNSMinTTLUnitChange: (v: SelectValue) => void;
  onDNSMaxTTLUnitChange: (v: SelectValue) => void;
  onDNSTTLUnitChange: (v: SelectValue) => void;
}>;

export function DnsBlacklistingSection({
  form,
  ignoreEnforceDropOptions,
  intervalOptions,
  dnsblMinTTLUnit,
  dnsblMaxTTLUnit,
  dnsblTTLUnit,
  onDNSMinTTLUnitChange,
  onDNSMaxTTLUnitChange,
  onDNSTTLUnitChange,
}: DnsBlacklistingSectionProps) {
  const [t] = useTranslation();

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'medium' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.dns_black_listing', 'DNS Blacklisting')}
        </ds-text>
      </Container>
      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ top: 'large', bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraMtaPostscreenDnsblSites">
            {(field) => (
              <Input
                isRequired
                label={t('mta.dns_blacklist_sites', 'DNS Blacklist Sites')}
                backgroundColor="gray5"
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaPostscreenDnsblAction">
            {(field) => (
              <Select
                items={ignoreEnforceDropOptions}
                background="gray5"
                label={t('mta.dns_blacklist_action', 'DNS Blacklist Action')}
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
        padding={{ bottom: 'extralarge' }}
        height="auto"
      >
        <Container crossAlignment="flex-start" padding={{ right: 'medium' }}>
          <form.Field name="zimbraMtaPostscreenDnsblThreshold">
            {(field) => (
              <Input
                isRequired
                label={t('mta.dns_blacklist_threshold_value', 'DNS Blacklist Threshold (value)')}
                backgroundColor="gray5"
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start">
          <form.Field name="zimbraMtaPostscreenDnsblWhitelistThreshold">
            {(field) => (
              <Input
                isRequired
                label={t(
                  'mta.dns_blacklist_whitelist_threshold_value',
                  'DNS Blacklist Whitelist Threshold  (value)',
                )}
                backgroundColor="gray5"
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </Container>

      <Container
        crossAlignment="flex-start"
        orientation="horizontal"
        mainAlignment="space-between"
        padding={{ bottom: 'extralarge' }}
        height="auto"
        width="100%"
      >
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          padding={{ right: 'medium' }}
          width="55%"
        >
          <Container
            padding={{ right: 'medium' }}
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            width="75%"
          >
            <form.Field name="zimbraMtaPostscreenDnsblMinTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t(
                    'mta.dns_blacklist_min_time_to_live',
                    'DNS Blacklist Min Time to Live (value)',
                  )}
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
          <Container crossAlignment="flex-start" mainAlignment="flex-start" width="25%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={dnsblMinTTLUnit}
              onChange={onDNSMinTTLUnitChange}
            />
          </Container>
        </Container>
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="54%"
        >
          <Container padding={{ right: 'medium' }} width="75%">
            <form.Field name="zimbraMtaPostscreenDnsblMaxTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t(
                    'mta.dns_blacklist_max_time_to_live',
                    'DNS Blacklist Max Time to Live (value)',
                  )}
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
          <Container width="25%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={dnsblMaxTTLUnit}
              onChange={onDNSMaxTTLUnitChange}
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
        width="100%"
      >
        <Container
          crossAlignment="flex-start"
          orientation="horizontal"
          mainAlignment="space-between"
          width="100%"
          padding={{ right: 'small' }}
        >
          <Container padding={{ right: 'small' }} width="75%">
            <form.Field name="zimbraMtaPostscreenDnsblTTL">
              {(field) => (
                <Input
                  isRequired
                  label={t('mta.dns_blacklist_time_to_live', 'DNS Blacklist Time to Live (value)')}
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
          <Container width="25%">
            <Select
              items={intervalOptions}
              background="gray5"
              label={t('mta.interval', 'Interval')}
              showCheckbox={false}
              selection={dnsblTTLUnit}
              onChange={onDNSTTLUnitChange}
            />
          </Container>
        </Container>
        <Container></Container>
      </Container>
    </>
  );
}
