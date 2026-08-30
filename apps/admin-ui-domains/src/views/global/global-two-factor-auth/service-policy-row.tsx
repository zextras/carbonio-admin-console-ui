/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { ChipInput, type ChipItem, Select, type SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CustomChip } from '../../components/customChip';
import { isValidIpRange } from '../../utility/utils';
import styles from './global-two-factor-auth.module.css';
import type { TwoFactorPoliciesFormValues } from './two-factor-policies-schema';

export type ServicePolicyRowProps = {
  form: AnyFormApi;
  serviceKey: string;
  serviceLabel: string;
  whatToTrust: Array<SelectItem<number>>;
};

/** Placeholder matching no trusted-device value (0/1/2): renders as no selection. */
const EMPTY_TRUST_SELECTION: SelectItem<number> = { value: -1, label: '' };

const asIpChips = (ips: Array<string>): Array<ChipItem> =>
  ips.map((ip) => ({ label: ip, error: !isValidIpRange(ip) }));

export const ServicePolicyRow = ({
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
