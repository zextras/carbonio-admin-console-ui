/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  getFieldErrorProps,
  LabeledValue,
  NumberInput,
  PlainTextarea,
  Select,
  TextInput,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import {
  ACTIVE,
  CLOSED,
  HTTP,
  HTTPS,
  LOCKED,
  MAINTENANCE,
  NOT_SET,
  SUSPENDED,
} from '../../../../constants';
import { timeZoneList } from '../../../utility/utils';
import styles from '../domain-general-settings.module.css';
import { DOMAIN_GENERAL_VALIDATION_MESSAGES } from '../schema';
import type { DomainGeneralSettingsFormApi } from '../use-domain-general-form';

type SelectOption = { label: string; value: string };

type DomainBasicsSectionProps = {
  form: DomainGeneralSettingsFormApi;
  domainName: string;
  domainId: string;
  domainCreationDate: string;
  cosItems: Array<SelectOption>;
  isGlobalAdmin: boolean;
};

const EMPTY_SELECTION: SelectOption = { label: '', value: '' };

function selectedOption(items: Array<SelectOption>, value: string): SelectOption {
  return items.find((item) => item.value === value) ?? items[0] ?? EMPTY_SELECTION;
}

export const DomainBasicsSection = ({
  form,
  domainName,
  domainId,
  domainCreationDate,
  cosItems,
  isGlobalAdmin,
}: DomainBasicsSectionProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const timezones = timeZoneList(t);

  const serviceProtocolItems: Array<SelectOption> = [
    { value: NOT_SET, label: t('label.not_set', 'Not Set') },
    {
      label: `${t('label.https', 'https')} (${t('label.secure', 'secure')})`,
      value: HTTPS,
    },
    {
      label: `${t('label.http', 'http')} (${t('label.unsecure', 'unsecure')})`,
      value: HTTP,
    },
  ];

  const domainStatusItems: Array<SelectOption> = [
    { label: t('label.active', 'Active'), value: ACTIVE },
    {
      label: `${t('label.closed', 'Closed')} (${t('label.soft_deleted', 'Soft-deleted')})`,
      value: CLOSED,
    },
    {
      label: `${t('label.locked', 'Locked')} (${t(
        'label.login_is_disabled',
        'Login is disabled',
      )})`,
      value: LOCKED,
    },
    {
      label: `${t('label.in_maintenance', 'In maintenance')} (${t(
        'label.login_is_disabled',
        'Login is disabled',
      )})`,
      value: MAINTENANCE,
    },
    {
      label: `${t('label.suspended', 'Suspended')} (${t(
        'label.login_is_disabled',
        'Login is disabled',
      )})`,
      value: SUSPENDED,
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.fieldsGrid}>
        <div className={styles.span3}>
          <LabeledValue label={t('label.name', 'Name')} value={domainName} />
        </div>
        <div className={styles.span3}>
          <LabeledValue label={t('label.id', 'Id')} value={domainId} />
        </div>

        <div className={styles.span3}>
          <form.Field name="zimbraDomainMaxAccounts">
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
                    'label.max_manageable_account_for_the_domain',
                    'Max manageable account for the domain (0=unlimited)',
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
        <div className={styles.span3}>
          <LabeledValue
            label={t('label.creation_date', 'Creation Date')}
            value={domainCreationDate}
          />
        </div>

        <div className={styles.span2}>
          <form.Field name="zimbraPublicServiceProtocol">
            {(field) => (
              <Select
                items={serviceProtocolItems}
                label={t('label.public_service_protocol', 'Public Service Protocol')}
                selection={selectedOption(serviceProtocolItems, field.state.value)}
                onChange={(value: string): void => {
                  field.handleChange(value);
                }}
              />
            )}
          </form.Field>
        </div>
        <div className={styles.span2}>
          <form.Field name="zimbraPublicServiceHostname">
            {(field) => (
              <TextInput
                required
                label={t('label.public_service_hostname', 'Public Service Host Name')}
                value={field.state.value ?? ''}
                autoComplete="off"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </div>
        <div className={styles.span2}>
          <form.Field name="zimbraPublicServicePort">
            {(field) => (
              <TextInput
                label={t('label.public_service_port', 'Public Service Port')}
                value={field.state.value ?? ''}
                autoComplete="off"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </div>

        <div className={styles.span6}>
          <form.Field name="zimbraPrefTimeZoneId">
            {(field) => (
              <Select
                items={timezones}
                label={t('label.timezone', 'Time Zone')}
                selection={selectedOption(timezones, field.state.value)}
                onChange={(value: string): void => {
                  field.handleChange(value);
                }}
              />
            )}
          </form.Field>
        </div>
      </div>

      <ds-divider className={styles.divider}></ds-divider>

      <div className={styles.fieldsGrid}>
        <div className={styles.span3}>
          <form.Field name="zimbraDomainDefaultCOSId">
            {(field) => (
              <Select
                items={cosItems}
                label={t('label.default_class_of_service', 'Default Class of Service')}
                selection={selectedOption(cosItems, field.state.value)}
                onChange={(value: string): void => {
                  field.handleChange(value);
                }}
              />
            )}
          </form.Field>
        </div>
        <div className={styles.span3}>
          <form.Field name="zimbraDomainStatus">
            {(field) => (
              <Select
                items={domainStatusItems}
                label={t('label.status', 'Status')}
                selection={selectedOption(domainStatusItems, field.state.value)}
                onChange={(value: string): void => {
                  field.handleChange(value);
                }}
              />
            )}
          </form.Field>
        </div>

        <div className={styles.span6}>
          <form.Field name="description">
            {(field) => (
              <TextInput
                label={t('label.description', 'Description')}
                value={field.state.value ?? ''}
                autoComplete="off"
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </div>

        <div className={styles.span6}>
          <form.Field name="zimbraNotes">
            {(field) => (
              <PlainTextarea
                label={t('label.notes', 'Notes')}
                value={field.state.value ?? ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </div>
      </div>
    </div>
  );
};
