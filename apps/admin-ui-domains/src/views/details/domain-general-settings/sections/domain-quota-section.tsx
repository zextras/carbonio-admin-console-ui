/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { Container, getFieldErrorProps, Input, ListRow, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { QuotaReportDownloadButton } from '../quota-report-download-button';
import { DOMAIN_GENERAL_VALIDATION_MESSAGES } from '../schema';
import type { DomainGeneralSettingsFormApi } from '../use-domain-general-form';

type DomainQuotaSectionProps = {
  form: DomainGeneralSettingsFormApi;
  domainName: string;
  isGlobalAdmin: boolean;
};

export const DomainQuotaSection = ({ form, domainName, isGlobalAdmin }: DomainQuotaSectionProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

  return (
    <>
      <Row
        mainAlignment="flex-start"
        width="100%"
        background="gray6"
        padding={{ top: 'large', left: 'small' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('label.accountQuotaSetting', 'Account Quota Settings')}
        </ds-text>
      </Row>
      <ListRow>
        <Container
          orientation="horizontal"
          crossAlignment="stretch"
          padding={{ all: 'small' }}
          gap="1rem"
        >
          <form.Field name="domainQuotaGB">
            {(field) => {
              const error = getFieldErrorProps(
                field,
                isSubmitted,
                t,
                DOMAIN_GENERAL_VALIDATION_MESSAGES,
              );
              return (
                <Input
                  label={t(
                    'label.max_quota_per_account_in_this_domain',
                    'Max quota per account in this domain (GB)',
                  )}
                  value={field.state.value}
                  backgroundColor="gray5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value.replaceAll(/\D/g, '');
                    field.handleChange(digits.replace(/^0+/, ''));
                  }}
                  onBlur={() => field.handleBlur()}
                  disabled={!isGlobalAdmin}
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
          <QuotaReportDownloadButton domainName={domainName} />
        </Container>
      </ListRow>
    </>
  );
};
