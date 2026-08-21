/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Button, ChipInput, type ChipItem, Select, type SelectItem } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TwoFactorPolicy } from '../../../../../types';
import CustomChip from '../../../components/customChip';
import { isValidIpRange, twoFactorWhatToTrust } from '../../../utility/utils';
import styles from './global-two-factor-auth.module.css';
import type { TwoFactorPoliciesFormValues } from './two-factor-policies-schema';

type TwoFactorPoliciesFormProps = {
  form: AnyFormApi;
  services: Array<TwoFactorPolicy>;
};

type ServicePolicyRowProps = {
  form: AnyFormApi;
  serviceKey: string;
  serviceLabel: string;
  whatToTrust: Array<SelectItem<number>>;
};

/** Placeholder matching no trusted-device value (0/1/2): renders as no selection. */
const EMPTY_TRUST_SELECTION: SelectItem<number> = { value: -1, label: '' };

const asIpChips = (ips: Array<string>): Array<ChipItem> =>
  ips.map((ip) => ({ label: ip, error: !isValidIpRange(ip) }));

const ServicePolicyRow = ({
  form,
  serviceKey,
  serviceLabel,
  whatToTrust,
}: ServicePolicyRowProps) => {
  const [t] = useTranslation();
  const entry = useSelector(
    form.store,
    (s) => (s.values as TwoFactorPoliciesFormValues)[serviceKey],
  );
  const trustedIpRange = entry?.trustedIpRange ?? [];
  const hasInvalidIp = trustedIpRange.some((ip) => !isValidIpRange(ip));

  return (
    <div className={styles.serviceRow}>
      <div className={styles.serviceLabel}>
        <ds-text as="span">{serviceLabel}</ds-text>
      </div>
      <div className={styles.serviceSelect}>
        <Select
          items={whatToTrust}
          label={t('label.what_to_trust', 'What to trust?')}
          onChange={(value: number | null): void => {
            form.setFieldValue(serviceKey, {
              trustedDevice: value ?? undefined,
              trustedIpRange: entry?.trustedIpRange ?? [],
            });
          }}
          selection={
            whatToTrust.find((item) => item.value === entry?.trustedDevice) ?? EMPTY_TRUST_SELECTION
          }
          showCheckbox={false}
        />
      </div>
      <div className={styles.serviceChips}>
        <ChipInput
          background="gray5"
          placeholder={t('label.trusted_network_ip', 'Trusted Networks (IP ranges)')}
          onChange={(ips: Array<ChipItem>): void => {
            form.setFieldValue(serviceKey, {
              trustedDevice: entry?.trustedDevice,
              trustedIpRange: ips.map((ip) => ip.label ?? ''),
            });
          }}
          hasError={hasInvalidIp}
          value={asIpChips(trustedIpRange)}
          description={
            hasInvalidIp ? t('error.one_or_more_ip_invalid', 'One or more IP are invalid') : ''
          }
          ChipComponent={CustomChip}
          maxChips={null}
        />
      </div>
    </div>
  );
};

/**
 * Form-driven editor for the global 2FA policies: an "apply to all services"
 * section plus one row per service, bound to a TanStack Form instance whose
 * values are keyed by service name.
 */
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
          applyAllIpRange !== undefined
            ? applyAllIpRange.map((ip) => ip.label ?? '')
            : entry?.trustedIpRange ?? [],
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
            onClick={applyToAll}
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
