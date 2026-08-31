/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { InheritedSelect, InheritedSwitch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { appointmentReminder, timeZoneList } from '../../utility/utils';
import { useAccountForm, useSetAccountValues, useToggleAccountValue } from '../account-form-context';
import styles from './calendar-options.module.css';

/**
 * Calendar Options cluster of the user-preferences section: time zone,
 * appointment defaults and the calendar switches, all bound to the account
 * form through the shared context hooks.
 */
export const CalendarOptionsSection = () => {
  const [t] = useTranslation();
  const { form, cosDetail, accSpecificDetail } = useAccountForm();
  const setAccountValues = useSetAccountValues();
  const toggleAccountValue = useToggleAccountValue();
  const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

  const timezones = timeZoneList(t);
  const APPOINTMENT_DURATION = [
    {
      label: t('reminder.minute', {
        count: 30,
        defaultValue_one: '{{count}} minute',
        defaultValue_other: '{{count}} minutes',
      }),
      value: '30m',
    },
    {
      label: t('reminder.minute', {
        count: 60,
        defaultValue_one: '{{count}} minute',
        defaultValue_other: '{{count}} minutes',
      }),
      value: '60m',
    },
    {
      label: t('reminder.minute', {
        count: 90,
        defaultValue_one: '{{count}} minute',
        defaultValue_other: '{{count}} minutes',
      }),
      value: '90m',
    },
    {
      label: t('reminder.minute', {
        count: 120,
        defaultValue_one: '{{count}} minute',
        defaultValue_other: '{{count}} minutes',
      }),
      value: '120m',
    },
  ];
  const APPOINTMENT_REMINDER = appointmentReminder(t);
  const DefaultViewOptions = [
    { label: t('account_details.default_view.month', 'Month View'), value: 'month' },
    { label: t('account_details.default_view.week', 'Week View'), value: 'week' },
    { label: t('account_details.default_view.day', 'Day View'), value: 'day' },
    { label: t('account_details.default_view.work_week', 'Work Week View'), value: 'workWeek' },
    { label: t('account_details.default_view.list', 'List View'), value: 'list' },
  ];
  const APPOINTMENT_VISIBILITY = [
    { label: t('label.public', 'Public'), value: 'public' },
    { label: t('label.private', 'Private'), value: 'private' },
  ];
  const FIRST_DAY_OF_WEEK = [
    { label: t('label.week_day.sunday', 'Sunday'), value: '0' },
    { label: t('label.week_day.monday', 'Monday'), value: '1' },
    { label: t('label.week_day.tuesday', 'Tuesday'), value: '2' },
    { label: t('label.week_day.wednesday', 'Wednesday'), value: '3' },
    { label: t('label.week_day.thursday', 'Thursday'), value: '4' },
    { label: t('label.week_day.friday', 'Friday'), value: '5' },
    { label: t('label.week_day.saturday', 'Saturday'), value: '6' },
  ];

  const onPrefTimeZoneChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, zimbraPrefTimeZoneId: v }));
  };
  const onCalendarDefaultApptDurationChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefCalendarDefaultApptDuration: v,
    }));
  };
  const onReminderWarningTimeChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefCalendarApptReminderWarningTime: v,
    }));
  };
  const onCalendarInitialViewChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefCalendarInitialView: v,
    }));
  };
  const onFirstDayOfWeekChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefCalendarFirstDayOfWeek: v,
    }));
  };
  const onAppointmentVisibilityChange = (v: string): void => {
    setAccountValues((prev: Record<string, any>) => ({
      ...prev,
      zimbraPrefCalendarApptVisibility: v,
    }));
  };
  const setEmptyValue = (keyName: string): void => {
    setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
  };

  return (
    <div className="w-full">
      <div className={styles.headerRow}>
        <ds-text size="small" color="gray0" weight="bold" as="h2">
          {t('label.calendar_options', 'Calendar Options')}
        </ds-text>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSelect
            label={t('label.time_zone', 'Time Zone')}
            items={timezones}
            subValue={accountDetail?.zimbraPrefTimeZoneId}
            inheritedValue={cosDetail.zimbraPrefTimeZoneId}
            fromSubValue={accSpecificDetail?.zimbraPrefTimeZoneId}
            background="gray5"
            selectName="zimbraPrefTimeZoneId"
            onChange={onPrefTimeZoneChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefTimeZoneId')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSelect
            label={t(
              'account_details.appointments_default_duration',
              'Appointment’s Default Duration',
            )}
            items={APPOINTMENT_DURATION}
            subValue={accountDetail?.zimbraPrefCalendarDefaultApptDuration}
            inheritedValue={cosDetail.zimbraPrefCalendarDefaultApptDuration}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarDefaultApptDuration}
            background="gray5"
            selectName="zimbraPrefCalendarDefaultApptDuration"
            onChange={onCalendarDefaultApptDurationChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarDefaultApptDuration')}
          />
        </div>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSelect
            label={t('label.appointment_reminder_in_minutes', 'Appointment Reminder in minutes')}
            items={APPOINTMENT_REMINDER}
            subValue={accountDetail?.zimbraPrefCalendarApptReminderWarningTime}
            inheritedValue={cosDetail.zimbraPrefCalendarApptReminderWarningTime}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarApptReminderWarningTime}
            background="gray5"
            selectName="zimbraPrefCalendarApptReminderWarningTime"
            onChange={onReminderWarningTimeChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarApptReminderWarningTime')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSelect
            label={t('label.default_calendar_view', 'Default Calendar View')}
            items={DefaultViewOptions}
            subValue={accountDetail?.zimbraPrefCalendarInitialView}
            inheritedValue={cosDetail.zimbraPrefCalendarInitialView}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarInitialView}
            background="gray5"
            selectName="zimbraPrefCalendarInitialView"
            onChange={onCalendarInitialViewChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarInitialView')}
          />
        </div>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSelect
            label={t('label.the_week_starts_on', 'The Week starts on')}
            items={FIRST_DAY_OF_WEEK}
            subValue={accountDetail?.zimbraPrefCalendarFirstDayOfWeek}
            inheritedValue={cosDetail.zimbraPrefCalendarFirstDayOfWeek}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarFirstDayOfWeek}
            background="gray5"
            selectName="zimbraPrefCalendarFirstDayOfWeek"
            onChange={onFirstDayOfWeekChange}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarFirstDayOfWeek')}
          />
        </div>
        <div className={styles.optionCol}>
          {accountDetail?.zimbraId ? (
            <InheritedSelect
              label={t('label.default_appointment_visibility', 'Default Appointment visibility')}
              items={APPOINTMENT_VISIBILITY}
              subValue={accountDetail?.zimbraPrefCalendarApptVisibility}
              inheritedValue={cosDetail.zimbraPrefCalendarApptVisibility}
              fromSubValue={accSpecificDetail?.zimbraPrefCalendarApptVisibility}
              background="gray5"
              selectName="zimbraPrefCalendarApptVisibility"
              onChange={onAppointmentVisibilityChange}
              onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarApptVisibility')}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarShowPastDueReminders}
            onChange={toggleAccountValue}
            label={t(
              'account_details.enable_past_due_reminders',
              'Enable reminders of appointments in the past',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarShowPastDueReminders}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarShowPastDueReminders}
            inputName={'zimbraPrefCalendarShowPastDueReminders'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarShowPastDueReminders')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
            onChange={toggleAccountValue}
            label={t(
              'account_details.allow_sending_cancellation_mail',
              'Allow sending cancellation mail',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarAllowCancelEmailToSelf}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
            inputName={'zimbraPrefCalendarAllowCancelEmailToSelf'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowCancelEmailToSelf')}
          />
        </div>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarAllowForwardedInvite}
            onChange={toggleAccountValue}
            label={t(
              'account_details.add_forwarded_invites_to_calendar',
              'Automatically add forwarded appointments to the calendar',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarAllowForwardedInvite}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowForwardedInvite}
            inputName={'zimbraPrefCalendarAllowForwardedInvite'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowForwardedInvite')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
            onChange={toggleAccountValue}
            label={t(
              'account_details.add_invites_with_publish_method',
              `Add invites with PUBLISH method`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarAllowPublishMethodInvite}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
            inputName={'zimbraPrefCalendarAllowPublishMethodInvite'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowPublishMethodInvite')}
          />
        </div>
      </div>
      <div className={styles.optionsRow}>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarAutoAddInvites}
            onChange={toggleAccountValue}
            label={t(
              'label.add_appointments_when_invited',
              'Automatically add appointments when the user is invited',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarAutoAddInvites}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarAutoAddInvites}
            inputName={'zimbraPrefCalendarAutoAddInvites'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAutoAddInvites')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
            onChange={toggleAccountValue}
            label={t(
              'account_details.auto_decline_if_inviter_is_blacklisted',
              `Auto-decline if the sender is blacklisted`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarSendInviteDeniedAutoReply}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
            inputName={'zimbraPrefCalendarSendInviteDeniedAutoReply'}
            onChangeReset={(): void =>
              setEmptyValue('zimbraPrefCalendarSendInviteDeniedAutoReply')
            }
          />
        </div>
      </div>
      <div className={styles.lastRow}>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
            onChange={toggleAccountValue}
            label={t(
              'account_details.notify_changes_by_delegated_access',
              `Notify changes made by delegated accounts`,
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefCalendarNotifyDelegatedChanges}
            fromSubValue={accSpecificDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
            inputName={'zimbraPrefCalendarNotifyDelegatedChanges'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarNotifyDelegatedChanges')}
          />
        </div>
        <div className={styles.optionCol}>
          <InheritedSwitch
            subValue={accountDetail?.zimbraPrefAppleIcalDelegationEnabled}
            onChange={toggleAccountValue}
            label={t(
              'account_details.use_ical_delegation_model_for_shared_calendars',
              'Use iCal delegation model for shared calendars',
            )}
            iconColor="primary"
            inheritedValue={cosDetail.zimbraPrefAppleIcalDelegationEnabled}
            fromSubValue={accSpecificDetail?.zimbraPrefAppleIcalDelegationEnabled}
            inputName={'zimbraPrefAppleIcalDelegationEnabled'}
            onChangeReset={(): void => setEmptyValue('zimbraPrefAppleIcalDelegationEnabled')}
          />
        </div>
      </div>
    </div>
  );
};
