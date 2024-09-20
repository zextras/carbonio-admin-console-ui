/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Row, Select, SelectItem, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';
import { appointmentReminder, timeZoneList } from '../../utility/utils';
import { AttributeValue } from '../constants/types';
import { findSelectItemWithFallback } from '../utils';

interface CalendarOptionsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
	// typing is hard to achieve here
	onSwitchOptionChanged: (value: any) => void;
}

const CalendarOptions: React.FC<CalendarOptionsProps> = ({
	cosPrefAttributes,
	isReadOnlyCosEntry,
	onSwitchOptionChanged,
	onCosAttributeChanged
}) => {
	const [t] = useTranslation();
	const APPOINTMENT_REMINDER: SelectItem[] = useMemo(() => appointmentReminder(t), [t]);
	const TIMEZONES: SelectItem[] = useMemo(() => timeZoneList(t), [t]);
	const MINUTES_LABEL = t('label.minutes', 'minutes');
	const DEFAULT_APPOINTMENT_DURATION: SelectItem[] = useMemo(
		() => [
			{ label: `30 ${MINUTES_LABEL}`, value: '30m' },
			{ label: `60 ${MINUTES_LABEL}`, value: '60m' },
			{ label: `90 ${MINUTES_LABEL}`, value: '90m' },
			{ label: `120 ${MINUTES_LABEL}`, value: '120m' }
		],
		[MINUTES_LABEL]
	);
	const DEFAULT_VIEW_OPTIONS: SelectItem[] = useMemo(
		() => [
			{ label: t('cos.default_view.month', 'Month View'), value: 'month' },
			{ label: t('cos.default_view.week', 'Week View'), value: 'week' },
			{ label: t('cos.default_view.day', 'Day View'), value: 'day' },
			{ label: t('cos.default_view.work_week', 'Work Week View'), value: 'workWeek' },
			{ label: t('cos.default_view.list', 'List View'), value: 'list' }
		],
		[t]
	);
	const FIRST_DAY_OF_WEEK: SelectItem[] = useMemo(
		() => [
			{ label: t('label.week_day.sunday', 'Sunday'), value: '0' },
			{ label: t('label.week_day.monday', 'Monday'), value: '1' },
			{ label: t('label.week_day.tuesday', 'Tuesday'), value: '2' },
			{ label: t('label.week_day.wednesday', 'Wednesday'), value: '3' },
			{ label: t('label.week_day.thursday', 'Thursday'), value: '4' },
			{ label: t('label.week_day.friday', 'Friday'), value: '5' },
			{ label: t('label.week_day.saturday', 'Saturday'), value: '6' }
		],
		[t]
	);
	const APPOINTMENT_VISIBILITY: SelectItem[] = useMemo(
		() => [
			{ label: t('label.public', 'Public'), value: 'public' },
			{ label: t('label.private', 'Private'), value: 'private' }
		],
		[t]
	);
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.calendar_options', 'Calendar Options')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container padding={{ right: 'small' }}>
							<Select
								items={TIMEZONES}
								background="gray5"
								label={t('label.time_zone', 'Time Zone')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									TIMEZONES,
									cosPrefAttributes?.zimbraPrefTimeZoneId
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefTimeZoneId', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Select
								items={DEFAULT_APPOINTMENT_DURATION}
								background="gray5"
								label={t('label.appointments_default_duration', 'Appointment’s Default Duration')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									DEFAULT_APPOINTMENT_DURATION,
									cosPrefAttributes?.zimbraPrefCalendarDefaultApptDuration
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefCalendarDefaultApptDuration', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
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
							<Select
								items={APPOINTMENT_REMINDER}
								background="gray5"
								label={t(
									'label.appointment_reminder_in_minutes',
									'Appointment Reminder (minutes before)'
								)}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									APPOINTMENT_REMINDER,
									cosPrefAttributes?.zimbraPrefCalendarApptReminderWarningTime
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefCalendarApptReminderWarningTime', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Select
								items={DEFAULT_VIEW_OPTIONS}
								background="gray5"
								label={t('label.default_calendar_view', 'Default Calendar View')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									DEFAULT_VIEW_OPTIONS,
									cosPrefAttributes?.zimbraPrefCalendarInitialView
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefCalendarInitialView', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
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
							<Select
								items={FIRST_DAY_OF_WEEK}
								background="gray5"
								label={t('label.the_week_starts_on', 'The Week starts on')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									FIRST_DAY_OF_WEEK,
									cosPrefAttributes?.zimbraPrefCalendarFirstDayOfWeek
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefCalendarFirstDayOfWeek', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Select
								items={APPOINTMENT_VISIBILITY}
								background="gray5"
								label={t('label.default_appointment_visibility', 'Default appointment visibility')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									APPOINTMENT_VISIBILITY,
									cosPrefAttributes?.zimbraPrefCalendarApptVisibility
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefCalendarApptVisibility', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
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
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarShowPastDueReminders')
								}
								label={t(
									'cos.enable_past_due_reminders',
									`Enable reminders of appointments in the past`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarAllowCancelEmailToSelf')
								}
								label={t('cos.allow_sending_cancellation_mail', `Allow sending cancellation mail`)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
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
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarAllowForwardedInvite === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarAllowForwardedInvite')
								}
								label={t(
									'cos.add_forwarded_invites_to_calendar',
									`Automatically add forwarded appointments to the calendar`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarAllowPublishMethodInvite === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarAllowPublishMethodInvite')
								}
								label={t('cos.add_invites_with_publish_method', 'Add invites with PUBLISH method')}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
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
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
								onClick={(): void => onSwitchOptionChanged('zimbraPrefCalendarAutoAddInvites')}
								label={t(
									'cos.add_appointments_when_invited',
									`Automatically add appointments when the user is invited`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarSendInviteDeniedAutoReply')
								}
								label={t(
									'cos.auto_decline_if_inviter_is_blacklisted',
									'Auto-decline if the sender is blacklisted'
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
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
							<Switch
								value={cosPrefAttributes?.zimbraPrefCalendarNotifyDelegatedChanges === 'TRUE'}
								onClick={(): void =>
									onSwitchOptionChanged('zimbraPrefCalendarNotifyDelegatedChanges')
								}
								label={t(
									'cos.notify_changes_by_delegated_access',
									`Notify changes made by delegated accounts`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
								onClick={(): void => onSwitchOptionChanged('zimbraPrefAppleIcalDelegationEnabled')}
								label={t(
									'cos.use_ical_delegation_model_for_shared_calendars',
									`Use iCal delegation model for shared calendars`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};

export default CalendarOptions;
