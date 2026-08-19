/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  CustomTextArea,
  getFieldErrorProps,
  Input,
  LabeledValue,
  ListRow,
  Select,
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
} from '../../../../../constants';
import { timeZoneList } from '../../../../utility/utils';
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
      label: `${t('label.locked', 'Locked')} (${t('label.login_is_disabled', 'Login is disabled')})`,
      value: LOCKED,
    },
    {
      label: `${t('label.in_maintenance', 'In maintenance')} (${t('label.login_is_disabled', 'Login is disabled')})`,
      value: MAINTENANCE,
    },
    {
      label: `${t('label.suspended', 'Suspended')} (${t('label.login_is_disabled', 'Login is disabled')})`,
      value: SUSPENDED,
    },
  ];

  return (
    <Container height="fit" crossAlignment="flex-start" background="gray6" padding={{ all: 'small' }}>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <LabeledValue label={t('label.name', 'Name')} value={domainName} backgroundColor="gray6" />
        </Container>
        <Container padding={{ all: 'small' }}>
          <LabeledValue label={t('label.id', 'Id')} value={domainId} backgroundColor="gray6" />
        </Container>
      </ListRow>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraDomainMaxAccounts">
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
                    'label.max_manageable_account_for_the_domain',
                    'Max manageable account for the domain (0=unlimited)',
                  )}
                  value={field.state.value}
                  backgroundColor="gray6"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={() => field.handleBlur()}
                  disabled={!isGlobalAdmin}
                  hasError={error.hasError}
                  description={error.description}
                />
              );
            }}
          </form.Field>
        </Container>
        <Container padding={{ all: 'small' }}>
          <LabeledValue
            label={t('label.creation_date', 'Creation Date')}
            value={domainCreationDate}
            backgroundColor="gray6"
          />
        </Container>
      </ListRow>

      <ListRow></ListRow>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraPublicServiceProtocol">
            {(field) => (
              <Select
                items={serviceProtocolItems}
                background="gray5"
                label={t('label.public_service_protocol', 'Public Service Protocol')}
                showCheckbox={false}
                onChange={(value: string | null) => {
                  field.handleChange(value ?? NOT_SET);
                }}
                selection={selectedOption(serviceProtocolItems, field.state.value)}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraPublicServiceHostname">
            {(field) => (
              <Input
                isRequired
                label={t('label.public_service_hostname', 'Public Service Host Name')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraPublicServicePort">
            {(field) => (
              <Input
                label={t('label.public_service_port', 'Public Service Port')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraPrefTimeZoneId">
            {(field) => (
              <Select
                items={timezones}
                background="gray5"
                label={t('label.timezone', 'Time Zone')}
                showCheckbox={false}
                onChange={(value: string | null) => {
                  field.handleChange(value ?? NOT_SET);
                }}
                selection={selectedOption(timezones, field.state.value)}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>

      <Container
        orientation="horizontal"
        width="98%"
        crossAlignment="center"
        mainAlignment="space-between"
        style={{ margin: '8px' }}
      >
        <ds-divider></ds-divider>
      </Container>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraDomainDefaultCOSId">
            {(field) => (
              <Select
                items={cosItems}
                background="gray5"
                label={t('label.default_class_of_service', 'Default Class of Service')}
                showCheckbox={false}
                onChange={(value: string | null) => {
                  field.handleChange(value ?? '');
                }}
                selection={selectedOption(cosItems, field.state.value)}
              />
            )}
          </form.Field>
        </Container>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraDomainStatus">
            {(field) => (
              <Select
                items={domainStatusItems}
                background="gray5"
                label={t('label.status', 'Status')}
                showCheckbox={false}
                onChange={(value: string | null) => {
                  field.handleChange(value ?? ACTIVE);
                }}
                selection={selectedOption(domainStatusItems, field.state.value)}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="description">
            {(field) => (
              <Input
                label={t('label.description', 'Description')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>

      <ListRow>
        <Container padding={{ all: 'small' }}>
          <form.Field name="zimbraNotes">
            {(field) => (
              <CustomTextArea
                label={t('label.notes', 'Notes')}
                value={field.state.value}
                backgroundColor="gray5"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  field.handleChange(e.target.value);
                }}
              />
            )}
          </form.Field>
        </Container>
      </ListRow>
    </Container>
  );
};
