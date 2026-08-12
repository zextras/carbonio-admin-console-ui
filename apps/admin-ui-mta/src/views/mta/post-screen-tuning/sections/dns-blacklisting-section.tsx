/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Select, SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { MtaPostTuning } from '../../../../../types';
import {
  ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL,
  ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD,
} from '../../../../constants';

type SelectValue = SelectItem[] | string | null;

type DnsBlacklistingSectionProps = Readonly<{
  mtaPostTuningDetail: MtaPostTuning | undefined;
  setValue: (key: string, value: unknown) => void;
  ignoreEnforceDropOptions: Array<SelectItem>;
  intervalOptions: Array<SelectItem>;
  dnsblMinTTLUnit: SelectItem;
  dnsblMaxTTLUnit: SelectItem;
  dnsblTTLUnit: SelectItem;
  onDNSBlackListActionChange: (v: string) => void;
  onDNSMinTTLUnitChange: (v: SelectValue) => void;
  onDNSMaxTTLUnitChange: (v: SelectValue) => void;
  onDNSTTLUnitChange: (v: SelectValue) => void;
}>;

export function DnsBlacklistingSection({
  mtaPostTuningDetail,
  setValue,
  ignoreEnforceDropOptions,
  intervalOptions,
  dnsblMinTTLUnit,
  dnsblMaxTTLUnit,
  dnsblTTLUnit,
  onDNSBlackListActionChange,
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
          <Input
            isRequired
            label={t('mta.dns_blacklist_sites', 'DNS Blacklist Sites')}
            backgroundColor="gray5"
            value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblSites}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_SITES, e.target.value);
            }}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <Select
            items={ignoreEnforceDropOptions}
            background="gray5"
            label={t('mta.dns_blacklist_action', 'DNS Blacklist Action')}
            showCheckbox={false}
            selection={ignoreEnforceDropOptions.find(
              (item) => item.value === mtaPostTuningDetail?.zimbraMtaPostscreenDnsblAction,
            )}
            // @ts-expect-error - needs a fix // Need to fix it with custom soultion
            onChange={onDNSBlackListActionChange}
          />
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
          <Input
            isRequired
            label={t('mta.dns_blacklist_threshold_value', 'DNS Blacklist Threshold (value)')}
            backgroundColor="gray5"
            value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblThreshold}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_THRESHOLD, e.target.value);
            }}
          />
        </Container>
        <Container crossAlignment="flex-start">
          <Input
            isRequired
            label={t(
              'mta.dns_blacklist_whitelist_threshold_value',
              'DNS Blacklist Whitelist Threshold  (value)',
            )}
            backgroundColor="gray5"
            value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblWhitelistThreshold}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_WHITE_LIST_THRESHOLD, e.target.value);
            }}
          />
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
            <Input
              isRequired
              label={t(
                'mta.dns_blacklist_min_time_to_live',
                'DNS Blacklist Min Time to Live (value)',
              )}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMinTTL.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MIN_TTL, e.target.value);
              }}
            />
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
            <Input
              isRequired
              label={t(
                'mta.dns_blacklist_max_time_to_live',
                'DNS Blacklist Max Time to Live (value)',
              )}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblMaxTTL.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_MAX_TTL, e.target.value);
              }}
            />
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
            <Input
              isRequired
              label={t('mta.dns_blacklist_time_to_live', 'DNS Blacklist Time to Live (value)')}
              backgroundColor="gray5"
              value={mtaPostTuningDetail?.zimbraMtaPostscreenDnsblTTL?.replaceAll(/\D/g, '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setValue(ZIMBRA_MTA_POST_SCREEN_DNSBL_TTL, e.target.value);
              }}
            />
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
