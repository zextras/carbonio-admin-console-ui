/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Container,
  DatePicker,
  getFieldErrorProps,
  Input,
  LabeledValue,
  Switch,
} from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { BackupAccountItem } from '../../../../types';
import { RESTORE_VALIDATION_MESSAGES } from './schema';
import type { RestoreFormApi } from './types';

type RestoreSettingsProps = {
  form: RestoreFormApi;
  legalHoldAccount: BackupAccountItem | null;
  account: string;
};

export const RestoreSettings = ({ form, legalHoldAccount, account }: RestoreSettingsProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const unDelete = useSelector(form.store, (s) => s.values.unDelete);
  const fromDate = useSelector(form.store, (s) => s.values.fromDate);

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'large' }}
      >
        <ds-text as="span" size="small" overflow="ellipsis" weight="bold">
          {t('legal_hold.restore_settings', 'Restore Settings')}
        </ds-text>
      </Container>
      <Container
        orientation="horizontal"
        mainAlignment="space-between"
        crossAlignment="flex-start"
        padding={{ bottom: 'large', top: 'large' }}
        height="auto"
      >
        <Container crossAlignment="flex-start">
          <form.Field name="legalHoldPrefix">
            {(field) => {
              const error = getFieldErrorProps(field, isSubmitted, t, RESTORE_VALIDATION_MESSAGES);
              return (
                <Input
                  label={t('legal_hold.legalhold_prefix', 'Legal Hold prefix')}
                  backgroundColor="gray5"
                  value={field.state.value}
                  hasError={error.hasError}
                  description={error.description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    field.handleChange(e.target.value);
                  }}
                  onBlur={() => field.handleBlur()}
                />
              );
            }}
          </form.Field>
        </Container>
        <Container crossAlignment="flex-start" padding={{ left: 'medium' }}>
          <LabeledValue
            label={t('label.account', 'Account')}
            backgroundColor="gray5"
            value={account}
          />
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
          <form.Field name="fromDate">
            {(field) => {
              const error = getFieldErrorProps(field, isSubmitted, t, RESTORE_VALIDATION_MESSAGES);
              return (
                <>
                  <DatePicker
                    label={t('label.account_status_on ', 'Account status on')}
                    onChange={(date) => {
                      field.handleChange(date);
                      const undeleteFromDate = form.getFieldValue('undeleteFromDate');
                      if (undeleteFromDate && date && date.getTime() < undeleteFromDate.getTime()) {
                        form.setFieldValue('undeleteFromDate', date);
                      }
                    }}
                    selected={field.state.value}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
                    maxDate={
                      legalHoldAccount?.deletedTimestamp
                        ? new Date(legalHoldAccount.deletedTimestamp)
                        : new Date()
                    }
                  />
                  {error.hasError && error.description && (
                    <ds-text as="span" size="extrasmall" color="error">
                      {error.description}
                    </ds-text>
                  )}
                </>
              );
            }}
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
          <form.Field name="unDelete">
            {(field) => (
              <Switch
                label={t('legal_hold.include_items_deleted', 'Include items deleted')}
                value={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                iconColor="primary"
              />
            )}
          </form.Field>
        </Container>
      </Container>
      {unDelete && (
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          padding={{ bottom: 'extralarge' }}
          height="auto"
        >
          <Container crossAlignment="flex-start">
            <form.Field name="undeleteFromDate">
              {(field) => (
                <DatePicker
                  isClearable
                  label={t('label.include_items_deleted_after', 'Include items deleted after')}
                  onChange={(date) => field.handleChange(date)}
                  dateFormat="dd/MM/yyyy"
                  selected={field.state.value}
                  minDate={new Date(legalHoldAccount?.creationTimestamp ?? '')}
                  maxDate={fromDate ?? new Date()}
                />
              )}
            </form.Field>
          </Container>
        </Container>
      )}
    </>
  );
};
