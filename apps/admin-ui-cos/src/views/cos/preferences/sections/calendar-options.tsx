/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, ListRow, Row, Select, SelectItem, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { appointmentReminder, timeZoneList } from '../../../utility/utils';
import { findSelectItemWithFallback } from '../../utils';
import { CosPreferencesFormApi } from '../types';

type CalendarOptionsProps = {
  form: CosPreferencesFormApi;
  readonlyCOS: boolean;
};

export const CalendarOptions = ({ form, readonlyCOS }: CalendarOptionsProps) => {
  const [t] = useTranslation();
  const APPOINTMENT_REMINDER: SelectItem[] = appointmentReminder(t);
  const TIMEZONES: SelectItem[] = timeZoneList(t);
  const MINUTES_LABEL = t('label.minutes', 'minutes');
  const DEFAULT_APPOINTMENT_DURATION: SelectItem[] = [
    { label: `30 ${MINUTES_LABEL}`, value: '30m' },
    { label: `60 ${MINUTES_LABEL}`, value: '60m' },
    { label: `90 ${MINUTES_LABEL}`, value: '90m' },
    { label: `120 ${MINUTES_LABEL}`, value: '120m' },
  ];
  const DEFAULT_VIEW_OPTIONS: SelectItem[] = [
    { label: t('cos.default_view.month', 'Month View'), value: 'month' },
    { label: t('cos.default_view.week', 'Week View'), value: 'week' },
    { label: t('cos.default_view.day', 'Day View'), value: 'day' },
    { label: t('cos.default_view.work_week', 'Work Week View'), value: 'workWeek' },
    { label: t('cos.default_view.list', 'List View'), value: 'list' },
  ];
  const FIRST_DAY_OF_WEEK: SelectItem[] = [
    { label: t('label.week_day.sunday', 'Sunday'), value: '0' },
    { label: t('label.week_day.monday', 'Monday'), value: '1' },
    { label: t('label.week_day.tuesday', 'Tuesday'), value: '2' },
    { label: t('label.week_day.wednesday', 'Wednesday'), value: '3' },
    { label: t('label.week_day.thursday', 'Thursday'), value: '4' },
    { label: t('label.week_day.friday', 'Friday'), value: '5' },
    { label: t('label.week_day.saturday', 'Saturday'), value: '6' },
  ];
  const APPOINTMENT_VISIBILITY: SelectItem[] = [
    { label: t('label.public', 'Public'), value: 'public' },
    { label: t('label.private', 'Private'), value: 'private' },
  ];

  return (
    <Row
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'large' }}
      width="100%"
    >
      <ds-text as="strong" weight="bold">
        {t('label.calendar_options', 'Calendar Options')}
      </ds-text>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefTimeZoneId">
                {(field) => (
                  <Select
                    items={TIMEZONES}
                    background="gray5"
                    label={t('label.time_zone', 'Time Zone')}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(TIMEZONES, field.state.value)}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarDefaultApptDuration">
                {(field) => (
                  <Select
                    items={DEFAULT_APPOINTMENT_DURATION}
                    background="gray5"
                    label={t(
                      'label.appointments_default_duration',
                      'Appointment\u2019s Default Duration',
                    )}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(
                      DEFAULT_APPOINTMENT_DURATION,
                      field.state.value,
                    )}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarApptReminderWarningTime">
                {(field) => (
                  <Select
                    items={APPOINTMENT_REMINDER}
                    background="gray5"
                    label={t(
                      'label.appointment_reminder_in_minutes',
                      'Appointment Reminder (minutes before)',
                    )}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(APPOINTMENT_REMINDER, field.state.value)}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarInitialView">
                {(field) => (
                  <Select
                    items={DEFAULT_VIEW_OPTIONS}
                    background="gray5"
                    label={t('label.default_calendar_view', 'Default Calendar View')}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(DEFAULT_VIEW_OPTIONS, field.state.value)}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarFirstDayOfWeek">
                {(field) => (
                  <Select
                    items={FIRST_DAY_OF_WEEK}
                    background="gray5"
                    label={t('label.the_week_starts_on', 'The Week starts on')}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(FIRST_DAY_OF_WEEK, field.state.value)}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarApptVisibility">
                {(field) => (
                  <Select
                    items={APPOINTMENT_VISIBILITY}
                    background="gray5"
                    label={t(
                      'label.default_appointment_visibility',
                      'Default appointment visibility',
                    )}
                    showCheckbox={false}
                    selection={findSelectItemWithFallback(
                      APPOINTMENT_VISIBILITY,
                      field.state.value,
                    )}
                    onChange={(value): void => {
                      const v =
                        typeof value === 'object' && value !== null && 'value' in value
                          ? (value as SelectItem).value
                          : (value as string);
                      field.handleChange(v);
                    }}
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarShowPastDueReminders">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.enable_past_due_reminders',
                      'Enable reminders of appointments in the past',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarAllowCancelEmailToSelf">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.allow_sending_cancellation_mail',
                      'Allow sending cancellation mail',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarAllowForwardedInvite">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.add_forwarded_invites_to_calendar',
                      'Automatically add forwarded appointments to the calendar',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarAllowPublishMethodInvite">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.add_invites_with_publish_method',
                      'Add invites with PUBLISH method',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarAutoAddInvites">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'label.add_appointments_when_invited',
                      'Automatically add appointments when the user is invited',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefCalendarSendInviteDeniedAutoReply">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.auto_decline_if_inviter_is_blacklisted',
                      'Auto-decline if the sender is blacklisted',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
      <Row mainAlignment="flex-start" width="100%">
        <Container
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
          padding={{ top: 'large' }}
        >
          <ListRow>
            <Container crossAlignment="flex-start" padding={{ right: 'small' }}>
              <form.Field name="zimbraPrefCalendarNotifyDelegatedChanges">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.notify_changes_by_delegated_access',
                      'Notify changes made by delegated accounts',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
            <Container crossAlignment="flex-start" padding={{ left: 'small' }}>
              <form.Field name="zimbraPrefAppleIcalDelegationEnabled">
                {(field) => (
                  <Switch
                    value={field.state.value === 'TRUE'}
                    onClick={() =>
                      field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')
                    }
                    label={t(
                      'cos.use_ical_delegation_model_for_shared_calendars',
                      'Use iCal delegation model for shared calendars',
                    )}
                    iconColor="primary"
                    disabled={readonlyCOS}
                  />
                )}
              </form.Field>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Row>
  );
};
