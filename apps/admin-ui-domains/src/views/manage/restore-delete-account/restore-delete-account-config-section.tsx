/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ComboboxInput,
  type ComboboxItem,
  DatePicker,
  Select,
  type SelectItem,
  Switch,
  TextInput,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import {
  clampRestoreDate,
  getRestoreTimeSlots,
  RESTORE_TIME_VALUE_FORMAT,
  withRestoreTime,
} from './restore-time-slots';

const DOMAIN_SEARCH_DEBOUNCE_MS = 700;
const DOMAIN_SEARCH_LIMIT = 50;
const EMPTY_TIME_SELECTION: SelectItem = { label: '', value: '' };

export const RestoreDeleteAccountConfigSection = () => {
  const { t } = useTranslation();
  const { restoreAccountDetail, setRestoreAccountDetail } = useContext(RestoreDeleteAccountContext);

  const [domainSearchText, setDomainSearchText] = useState<string | null>(null);
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const debouncedDomainSearchQuery = useDebouncedValue(
    domainSearchQuery,
    DOMAIN_SEARCH_DEBOUNCE_MS,
  );

  const {
    data: domainSearchData,
    error: domainSearchError,
    isFetching,
    isPending,
  } = useDomainSearch({
    searchQuery: debouncedDomainSearchQuery,
    limit: DOMAIN_SEARCH_LIMIT,
    offset: 0,
  });

  useQueryErrorSnackbar(domainSearchError);

  const domainList = domainSearchData?.domain ?? [];
  const isDomainNotFound =
    !isPending && !domainSearchError && (domainSearchData?.searchTotal ?? 0) === 0;

  const selectedDomainName = restoreAccountDetail?.copyDomain ?? '';
  const domainInputValue = domainSearchText ?? selectedDomainName;

  const updateDetail = (patch: Record<string, unknown>): void => {
    setRestoreAccountDetail((prev: Record<string, unknown>) => ({ ...prev, ...patch }));
  };

  const handleDomainSelect = (domainName: string): void => {
    setDomainSearchText(null);
    setDomainSearchQuery('');
    updateDetail({ copyDomain: domainName });
  };

  const domainItems: Array<ComboboxItem> = domainList.map((domain) => ({
    id: domain.id,
    label: domain.name,
  }));

  function handleDomainPick(item: ComboboxItem): void {
    const domain = domainList.find((d) => d.id === item.id);
    if (domain) handleDomainSelect(domain.name);
  }

  const selectedDate = restoreAccountDetail?.dateTime
    ? new Date(restoreAccountDetail.dateTime)
    : null;
  const selectedTime = selectedDate ? format(selectedDate, RESTORE_TIME_VALUE_FORMAT) : null;
  const timeItems = selectedDate ? getRestoreTimeSlots(selectedDate, new Date()) : [];

  function handleDateChange(date: Date | null): void {
    if (!date) {
      updateDetail({ dateTime: null });
      return;
    }
    const dateWithTime = selectedTime ? withRestoreTime(date, selectedTime) : date;
    updateDetail({ dateTime: clampRestoreDate(dateWithTime, new Date()).toISOString() });
  }

  function handleTimeChange(time: string): void {
    if (!selectedDate) return;
    const dateWithTime = withRestoreTime(selectedDate, time);
    updateDetail({ dateTime: clampRestoreDate(dateWithTime, new Date()).toISOString() });
  }

  return (
    <div className="w-full pt-lg">
      <div className="flex w-full flex-col items-start gap-lg bg-gray6 p-lg">
        <ds-text as="p" size="medium" color="gray0" weight="regular">
          <Trans
            i18nKey="label.restore_config_info_row_1"
            defaults="<bold>{{accountName}}</bold> will be copied in the account you'll select in the field below."
            components={{ bold: <strong /> }}
            values={{ accountName: restoreAccountDetail?.name ?? '' }}
          />
        </ds-text>

        <div className="flex w-full flex-wrap items-center gap-sm">
          <TextInput
            label={t('label.email_address', 'Email address')}
            value={restoreAccountDetail?.copyAccount ?? ''}
            autoComplete="off"
            onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
              updateDetail({ copyAccount: ev.target.value });
            }}
          />
          <ds-icon icon="AtOutline" size="large" color="primary"></ds-icon>
          <ComboboxInput
            label={t('label.domain', 'Domain')}
            items={domainItems}
            value={domainInputValue}
            hasError={isDomainNotFound}
            description={
              isDomainNotFound
                ? t(
                    'label.not_found_check_the_text_and_try_again',
                    'Not found - check the text and try again',
                  )
                : undefined
            }
            onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
              setDomainSearchText(ev.target.value);
              setDomainSearchQuery(ev.target.value);
              updateDetail({ copyDomain: '' });
            }}
            onSelect={handleDomainPick}
            loading={isFetching}
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-xl">
          <Switch
            label={t('label.use_last_available_status', 'Use last available status')}
            value={restoreAccountDetail?.lastAvailableStatus ?? false}
            onClick={(): void => {
              setRestoreAccountDetail((prev: Record<string, unknown>) =>
                prev?.lastAvailableStatus
                  ? { ...prev, lastAvailableStatus: false }
                  : { ...prev, lastAvailableStatus: true, dateTime: null },
              );
            }}
          />
          <DatePicker
            label={t('label.date', 'Date')}
            dateFormat="dd/MM/yyyy"
            isClearable
            disabled={restoreAccountDetail?.lastAvailableStatus}
            selected={selectedDate}
            minDate={
              restoreAccountDetail?.createDate
                ? new Date(restoreAccountDetail.createDate)
                : undefined
            }
            maxDate={new Date()}
            onChange={handleDateChange}
          />
          <div className="w-[15.625rem]">
            <Select
              label={t('label.time', 'Time')}
              items={timeItems}
              selection={
                timeItems.find((item) => item.value === selectedTime) ?? EMPTY_TIME_SELECTION
              }
              disabled={restoreAccountDetail?.lastAvailableStatus || !selectedDate}
              onChange={handleTimeChange}
            />
          </div>
        </div>

        <Switch
          label={t(
            'label.apply_hsm_policy_after_the_restore',
            'Apply HSM Policies after the restore',
          )}
          value={restoreAccountDetail?.hsmApply ?? false}
          onClick={(): void => {
            updateDetail({ hsmApply: !restoreAccountDetail?.hsmApply });
          }}
        />

        <div className="w-full">
          <ds-divider></ds-divider>
        </div>

        <Switch
          label={t('label.email_notification', 'E-mail Notifications')}
          value={restoreAccountDetail?.isEmailNotificationEnable ?? false}
          onClick={(): void => {
            updateDetail({
              isEmailNotificationEnable: !restoreAccountDetail?.isEmailNotificationEnable,
            });
          }}
        />

        <TextInput
          label={t('label.who_needs_receive_this_email', 'Who needs to receive this email?')}
          value={restoreAccountDetail?.notificationReceiver ?? ''}
          disabled={!restoreAccountDetail?.isEmailNotificationEnable}
          autoComplete="off"
          onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
            updateDetail({ notificationReceiver: ev.target.value });
          }}
        />
      </div>
    </div>
  );
};
