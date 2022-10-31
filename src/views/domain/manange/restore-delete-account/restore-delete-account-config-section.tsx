/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Switch,
	DateTimePicker,
	Icon
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../../../list/list-row';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { useDomainStore } from '../../../../store/domain/store';

const DatePickerContainer = styled(Container)`
	.react-datepicker__input-container {
		> div:first-child {
			width: 100%;
		}
	}
`;

const RestoreDeleteAccountConfigSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(RestoreDeleteAccountContext);
	const { restoreAccountDetail, setRestoreAccountDetail } = context;
	const [date, setDate] = useState(
		restoreAccountDetail?.dateTime === null ? null : restoreAccountDetail?.dateTime
	);
	const domainName = useDomainStore((state) => state.domain?.name);
	const handleChange = useCallback(
		(d) => {
			setDate(d);
			setRestoreAccountDetail((prev: any) => ({
				...prev,
				dateTime: d
			}));
		},
		[setRestoreAccountDetail]
	);
	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large', right: 'large', left: 'large' }}
					>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', right: 'small' }}
							>
								<Input
									backgroundColor="gray5"
									label={t('label.email_address', 'Email address')}
									value={restoreAccountDetail?.copyAccount}
									onChange={(e: any): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											copyAccount: e.target.value
										}));
									}}
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="center"
								orientation="horizontal"
								padding={{ top: 'extralarge', right: 'small' }}
								width="fit"
							>
								<Icon icon="AtOutline" size="large" />
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large', left: 'small' }}
							>
								<Input
									label={t('label.domain_name', 'Domain Name')}
									value={domainName}
									readOnly
									backgroundColor="gray5"
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container crossAlignment="flex-start" padding={{ top: 'large', bottom: 'medium' }}>
								<Switch
									value={restoreAccountDetail?.lastAvailableStatus}
									label={t('label.use_last_available_status', 'Use last available status')}
									onClick={(): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											lastAvailableStatus: !restoreAccountDetail?.lastAvailableStatus
										}));
									}}
								/>
							</Container>

							<DatePickerContainer
								crossAlignment="flex-start"
								padding={{ top: 'large', bottom: 'medium' }}
							>
								<DateTimePicker
									label={t('label.date_time_picker', 'Date Time Picker')}
									defaultValue={date}
									onChange={handleChange}
									dateFormat="dd/MM/yyyy hh:mm"
									style={{ background: 'green' }}
								/>
							</DatePickerContainer>
						</ListRow>

						<ListRow>
							<Row padding={{ bottom: 'medium' }}>
								<Switch
									value={restoreAccountDetail?.hsmApply}
									label={t(
										'label.apply_hsm_policy_after_the_restore',
										'Apply HSM Policies after the restore'
									)}
									onClick={(): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											hsmApply: !restoreAccountDetail?.hsmApply
										}));
									}}
								/>
							</Row>
						</ListRow>
						<ListRow>
							<Row padding={{ bottom: 'medium' }}>
								<Switch
									value={restoreAccountDetail?.dataSource}
									label={t('label.restore_external_data_source', 'Restore External Data Sources')}
									onClick={(): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											dataSource: !restoreAccountDetail?.dataSource
										}));
									}}
								/>
							</Row>
						</ListRow>
						<ListRow>
							<Row padding={{ bottom: 'medium' }}>
								<Switch
									value={restoreAccountDetail?.isEmailNotificationEnable}
									label={t('label.email_notification', 'E-mail Notifications')}
									onClick={(): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											isEmailNotificationEnable: !restoreAccountDetail?.isEmailNotificationEnable
										}));
									}}
								/>
							</Row>
						</ListRow>
						<ListRow>
							<Row padding={{ bottom: 'medium' }} width="100%">
								<Input
									value={restoreAccountDetail?.notificationReceiver}
									backgroundColor="gray5"
									label={t(
										'label.who_needs_receive_this_email',
										'Who needs to receive this email?'
									)}
									onChange={(e: any): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											notificationReceiver: e.target.value
										}));
									}}
									disabled={!restoreAccountDetail?.isEmailNotificationEnable}
								/>
							</Row>
						</ListRow>
					</Row>
				</Container>
			</Row>
		</Container>
	);
};
export default RestoreDeleteAccountConfigSection;
