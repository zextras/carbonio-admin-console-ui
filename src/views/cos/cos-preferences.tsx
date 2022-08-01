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
import { charactorSet, conversationGroupBy } from '../utility/utils';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);

	const TIME_TYPES = useMemo(
		() => [
			{ label: `${t('label.days', 'Days')}`, value: 'd' },
			{ label: `${t('label.hours', 'Hours')}`, value: 'h' },
			{ label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
			{ label: `${t('label.seconds', 'Seconds')}`, value: 's' }
		],
		[t]
	);

	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('account_details.as_new_mail_arrives', 'As New Mail Arrives'),
				value: '',
				disabled: true
			},
			{ label: `2 ${t('label.minutes', 'minutes')}`, value: '2m' },
			{ label: `3 ${t('label.minutes', 'minutes')}`, value: '3m' },
			{ label: `4 ${t('label.minutes', 'minutes')}`, value: '4m' },
			{ label: `5 ${t('label.minutes', 'minutes')}`, value: '5m' },
			{ label: `6 ${t('label.minutes', 'minutes')}`, value: '6m' },
			{ label: `7 ${t('label.minutes', 'minutes')}`, value: '7m' },
			{ label: `8 ${t('label.minutes', 'minutes')}`, value: '8m' },
			{ label: `9 ${t('label.minutes', 'minutes')}`, value: '9m' },
			{ label: `10 ${t('label.minutes', 'minutes')}`, value: '10m' },
			{ label: `15 ${t('label.minutes', 'minutes')}`, value: '15m' },
			{
				label: t('account_details.manuallly', 'Manually'),
				value: 0
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
						{t('cos.mailing_options', 'Mail Options')}
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
										label={t('cos.group_by', 'Group by')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
										items={GROUP_BY}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.default_charset', 'Default Charset')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
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
						{t('cos.receiving_mails', 'Receiving Mails')}
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
								items={POLLING_INTERVAL}
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
						{t('cos.sending_mails', 'Sending Mails')}
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
			</Container>
		</Container>
	);
};

export default CosPreferences;
