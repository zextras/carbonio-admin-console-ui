/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { Button, ChipInput, type ChipItem, Select } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TwoFactorPolicy } from '../../../../types';
import { CustomChip } from '../../components/customChip';
import { isValidIpRange, twoFactorWhatToTrust } from '../../utility/utils';
import styles from './global-two-factor-auth.module.css';
import { ServicePolicyRow } from './service-policy-row';
import type { TwoFactorPoliciesFormValues } from './two-factor-policies-schema';

type TwoFactorPoliciesFormProps = {
  form: AnyFormApi;
  services: Array<TwoFactorPolicy>;
};

export const TwoFactorPoliciesForm = ({ form, services }: TwoFactorPoliciesFormProps) => {
  const [t] = useTranslation();
  const whatToTrust = twoFactorWhatToTrust(t);
  const [applyAllTrustedDevice, setApplyAllTrustedDevice] = useState<number | undefined>(undefined);
  const [applyAllIpRange, setApplyAllIpRange] = useState<Array<ChipItem> | undefined>(undefined);

  const applyAllHasInvalidIp = applyAllIpRange?.some((ip) => ip.error === true);

  const applyToAll = (): void => {
    const values = form.state.values as TwoFactorPoliciesFormValues;
    Object.entries(values).forEach(([serviceKey, entry]) => {
      form.setFieldValue(serviceKey, {
        trustedDevice: applyAllTrustedDevice,
        trustedIpRange:
          applyAllIpRange === undefined
            ? entry?.trustedIpRange ?? []
            : applyAllIpRange.map((ip) => ip.label ?? ''),
      });
    });
  };

  return (
    <div className={styles.form}>
      <div className={styles.card}>
        <div className={styles.sectionTitle}>
          <ds-text as="h2" size="medium" color="gray0" weight="bold">
            {t('label.configuration_lbl', 'Configuration')}
          </ds-text>
        </div>
        <div className={styles.helpText}>
          <ds-text as="p" size="small" color="gray1">
            {t(
              'label.configuration_help_text',
              'Setup the networks or the devices (IPs) that will not require the 2FA authentication',
            )}
          </ds-text>
        </div>
        <div className={styles.applyAllRow}>
          <div className={styles.applyAllSelect}>
            <Select
              items={whatToTrust}
              label={t('label.what_to_trust', 'What to trust?')}
              onChange={(value: number | null): void => {
                setApplyAllTrustedDevice(value ?? undefined);
              }}
              showCheckbox={false}
            />
          </div>
          <div className={styles.applyAllChips}>
            <ChipInput
              background="gray5"
              placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
              onChange={(ips: Array<ChipItem>): void => {
                setApplyAllIpRange(
                  ips.map((ip) => ({ ...ip, error: !isValidIpRange(ip.label ?? '') })),
                );
              }}
              hasError={applyAllHasInvalidIp}
              value={applyAllIpRange}
              description={
                applyAllHasInvalidIp
                  ? t('error.one_or_more_ip_invalid', 'One or more IP are invalid')
                  : ''
              }
              ChipComponent={CustomChip}
              maxChips={null}
            />
          </div>
        </div>
        <div className={styles.applyAllButtonRow}>
          <Button
            width="fill"
            type="outlined"
            label={t('label.apply_to_all', 'APPLY TO ALL SERVICES')}
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              applyToAll();
            }}
          />
        </div>
        {services.map((service) => (
          <ServicePolicyRow
            key={`${service.label}-${service.keyToGet}`}
            form={form}
            serviceKey={service.keyToGet}
            serviceLabel={service.label}
            whatToTrust={whatToTrust}
          />
        ))}
      </div>
    </div>
  );
};
