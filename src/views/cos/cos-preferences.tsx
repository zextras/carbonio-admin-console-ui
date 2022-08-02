/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useMemo, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Icon,
	Select,
	Switch,
	Padding,
	SnackbarManagerContext,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../list/list-row';
import {
	appointmentReminder,
	charactorSet,
	conversationGroupBy,
	timeZoneList
} from '../utility/utils';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const APPOINTMENT_REMINDER = useMemo(() => appointmentReminder(t), [t]);

	const TIME_TYPES = useMemo(
		() => [
			{ label: `${t('label.days', 'Days')}`, value: 'd' },
			{ label: `${t('label.hours', 'Hours')}`, value: 'h' },
			{ label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
			{ label: `${t('label.seconds', 'Seconds')}`, value: 's' }
		],
		[t]
	);

	const DefaultViewOptions = useMemo(
		() => [
			{ label: t('cos.default_view.month', 'Month View'), value: 'month' },
			{ label: t('cos.default_view.week', 'Week View'), value: 'week' },
			{ label: t('cos.default_view.day', 'Day View'), value: 'day' },
			{ label: t('cos.default_view.work_week', 'Work Week View'), value: 'workWeek' },
			{ label: t('cos.default_view.list', 'List View'), value: 'list' }
		],
		[t]
	);
	const APPOINTMENT_VISIBILITY = useMemo(
		() => [
			{ label: t('label.public', 'Public'), value: 'public' },
			{ label: t('label.private', 'Private'), value: 'private' }
		],
		[t]
	);
	const FIRST_DAY_OF_WEEK = useMemo(
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

	const DEFAULT_APPOINTMENT_DURATION = useMemo(
		() => [
			{ label: `30 ${t('label.minutes', 'minutes')}`, value: '1800' },
			{ label: `60 ${t('label.minutes', 'minutes')}`, value: '3600' },
			{ label: `90 ${t('label.minutes', 'minutes')}`, value: '5400' },
			{ label: `120 ${t('label.minutes', 'minutes')}`, value: '7200' }
		],
		[t]
	);

	const SEND_READ_RECEIPTS = useMemo(
		() => [
			{ label: t('label.prompt', 'Prompt'), value: 'prompt' },
			{ label: t('label.always', 'Always'), value: 'always' },
			{ label: t('label.never', 'Never'), value: 'never' }
		],
		[t]
	);

	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('cos.as_new_mail_arrives', 'As New Mail Arrives'),
				value: '',
				disabled: true
			},
			{ label: `2 ${t('label.minutes', 'minutes')}`, value: '120s' },
			{ label: `3 ${t('label.minutes', 'minutes')}`, value: '180s' },
			{ label: `4 ${t('label.minutes', 'minutes')}`, value: '240s' },
			{ label: `5 ${t('label.minutes', 'minutes')}`, value: '300s' },
			{ label: `6 ${t('label.minutes', 'minutes')}`, value: '360s' },
			{ label: `7 ${t('label.minutes', 'minutes')}`, value: '420s' },
			{ label: `8 ${t('label.minutes', 'minutes')}`, value: '480s' },
			{ label: `9 ${t('label.minutes', 'minutes')}`, value: '540s' },
			{ label: `10 ${t('label.minutes', 'minutes')}`, value: '600s' },
			{ label: `15 ${t('label.minutes', 'minutes')}`, value: '900s' },
			{
				label: t('cos.manuallly', 'Manually'),
				value: '31536000s'
			}
		],
		[t]
	);
	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.preferences', 'Preferences')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && <Button label={t('label.cancel', 'Cancel')} color="secondary" />}
							</Padding>
							{isDirty && <Button label={t('label.save', 'Save')} color="primary" />}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<Switch value label={t('cos.view_mail_as_html', 'View mail as HTML')} />
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.display_by', 'Display by')}
										showCheckbox={false}
										items={GROUP_BY}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.default_charset', 'Default Charset')}
										showCheckbox={false}
										items={CHARACTOR_SET}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t(
											'cos.auto_delete_duplicate_messages',
											'Auto-Delete duplicate messages'
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t(
											'cos.enable_notification_for_new_emails',
											`Enable notification for new emails`
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.receiving_mails', 'Receiving Mails')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										inputName="zimbraPrefMailPollingInterval"
										label={t('cos.check_new_mail_every', 'Check new mail every')}
										backgroundColor="gray5"
										value=""
										type="number"
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={TIME_TYPES}
										background="gray5"
										label={t('cos.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
										showCheckbox={false}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="center" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t('cos.cannot_check_for_less_than', `Cannot check for less than`)}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={POLLING_INTERVAL}
										background="gray5"
										label={t('cos.min_new_check_interval_value', 'Min new check interval (value)')}
										showCheckbox={false}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<Switch
								value
								label={t(
									'cos.automatically_delete_duplicate_copies_of_same_message_received',
									'Automatically delete duplicate copies of the same message when received'
								)}
							/>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<Select
								items={SEND_READ_RECEIPTS}
								background="gray5"
								label={t('cos.send_read_receipts', 'Send read receipts')}
								showCheckbox={false}
							/>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.sending_mails', 'Sending Mails')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch value label={t('cos.save_to_Sent', `Save to sent`)} />
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t(
											'cos.allow_sending_from_any_address',
											'Allow sending from any address'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.contact_options', 'Contact Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t('cos.enable_auto_add_contacts', `Enable auto-add contacts`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch value label={t('cos.use_gal_to_auto_fill', 'Use GAL to auto-fill')} />
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.calendar_options', 'Calendar Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										items={timezones}
										background="gray5"
										label={t('label.time_zone', 'Time Zone')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={DEFAULT_APPOINTMENT_DURATION}
										background="gray5"
										label={t(
											'label.appointments_default_duration',
											'Appointment’s Default Duration'
										)}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
										label={t('label.remind_appointments_timer', 'Remind Appointments Timer')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={DefaultViewOptions}
										background="gray5"
										label={t('label.initial_calendar_view', 'Initial Calendar View')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
										label={t('label.first_day_of_week', 'First Day of Week')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={APPOINTMENT_VISIBILITY}
										background="gray5"
										label={t(
											'label.default_appointment_visibility',
											'Default Appointment visibility'
										)}
										showCheckbox={false}
										padding={{ right: 'medium' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t('cos.enable_past_due_reminders', `Enable past-due reminders`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch value label={t('cos.enable_notifications', 'Enable notifications')} />
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t(
											'cos.allow_sending_cancellation_mail',
											`Allow sending cancellation mail`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t(
											'cos.add_invites_with_publish_method',
											'Add invites with PUBLISH method'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t(
											'cos.add_forwarded_invites_to_calendar',
											`Add forwarded invites to calendar`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t('cos.audible_reminder_notification', 'Audible reminder notification')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t('cos.add_appointments_when_invited', `Add appointments when invited`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t(
											'cos.auto_decline_if_inviter_is_blacklisted',
											'Auto-decline if inviter is blacklisted'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t(
											'cos.notify_changes_by_delegated_access',
											`Notify changes by delegated access`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t(
											'cos.use_quickadd_dialog_in_creation',
											'Use QuickAdd dialog in creation'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value
										label={t(
											'cos.use_ical_delegation_model_for_shared_calendars',
											`Use iCal delegation model for shared calendars`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value
										label={t('cos.show_time_zone_lists_in_view', 'Show time zone lists in view')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
			</Container>
		</Container>
	);
};

export default CosPreferences;
