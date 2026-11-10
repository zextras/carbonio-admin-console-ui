/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { getFieldErrorProps, NumberInput } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from '../domain-general-settings.module.css';
import { QuotaReportDownloadButton } from '../quota-report-download-button';
import { DOMAIN_GENERAL_VALIDATION_MESSAGES } from '../schema';
import type { DomainGeneralSettingsFormApi } from '../use-domain-general-form';

type DomainQuotaSectionProps = {
  form: DomainGeneralSettingsFormApi;
  domainName: string;
  isGlobalAdmin: boolean;
};

export const DomainQuotaSection = ({
  form,
  domainName,
  isGlobalAdmin,
}: DomainQuotaSectionProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  return (
    <div className={styles.section}>
      <ds-text as="h3" size="small" weight="bold" color="gray0">
        {t('label.accountQuotaSetting', 'Account Quota Settings')}
      </ds-text>
      <div className={styles.fieldsGrid}>
        <div className={styles.span3}>
          <form.Field name="domainQuotaGB">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                DOMAIN_GENERAL_VALIDATION_MESSAGES,
              );
              return (
                <NumberInput
                  label={t(
                    'label.max_quota_per_account_in_this_domain',
                    'Max quota per account in this domain (GB)',
                  )}
                  value={field.state.value ?? ''}
                  onChange={(value: string): void => {
                    field.handleChange(value);
                  }}
                  onBlur={() => field.handleBlur()}
                  disabled={!isGlobalAdmin}
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
        </div>
        <div className={`${styles.span3} ${styles.quotaButton}`}>
          <QuotaReportDownloadButton domainName={domainName} />
        </div>
      </div>
    </div>
  );
};
