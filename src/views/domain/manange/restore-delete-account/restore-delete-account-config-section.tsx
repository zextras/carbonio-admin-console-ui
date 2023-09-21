/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Switch,
	DateTimePicker,
	Icon,
	Text,
	Divider,
	Dropdown
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { debounce } from 'lodash';
import ListRow from '../../../list/list-row';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { useDomainStore } from '../../../../store/domain/store';
import { getDomainList } from '../../../../services/search-domain-service';

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
	const [domainList, setDomainList] = useState([]);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [searchDomainName, setSearchDomainName] = useState(restoreAccountDetail?.copyDomain);
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
	const getDomainLists = useCallback((domain: string): any => {
		getDomainList(domain, 0).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setDomainList(searchResponse?.domain);
			} else {
				setDomainList([]);
			}
		});
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		getDomainLists('');
	}, [getDomainLists]);

	useEffect(() => {
		setRestoreAccountDetail((prev: any) => ({
			...prev,
			copyDomain: searchDomainName
		}));
		searchDomainCall(searchDomainName);
	}, [searchDomainName, searchDomainCall, setRestoreAccountDetail]);

	const items = domainList?.map((domain: any) => ({
		id: domain.id,
		label: domain.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.3rem',
					width: '100%'
				}}
				onClick={(): void => {
					setSearchDomainName(domain?.name);
				}}
			>
				{domain?.name}
			</Row>
		)
	}));

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extralarge' }}
		>
			<Row mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" background="gray6">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ bottom: 'large', right: 'large', left: 'large' }}
					>
						<ListRow>
							<Container padding={{ bottom: 'medium' }} crossAlignment="flex-start">
								{
									<Text size="medium" color="gray0" weight="regular">
										<Trans
											i18nKey="label.restore_config_info_row_1"
											defaults="<bold>{{accountName}}</bold> will be copied in the account you`ll select in the field below."
											components={{ bold: <strong />, accountName: restoreAccountDetail?.name }}
										/>
									</Text>
								}
							</Container>
						</ListRow>
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
								<Dropdown
									items={items}
									placement="bottom-start"
									disableAutoFocus
									width="100%"
									style={{
										width: '100%'
									}}
								>
									<Input
										label={t('label.domain', 'Domain')}
										onChange={(ev: any): void => {
											setSearchDomainName(ev.target.value);
										}}
										value={searchDomainName}
										backgroundColor="gray5"
									/>
								</Dropdown>
							</Container>
						</ListRow>
						<ListRow>
							<Container
								crossAlignment="flex-start"
								padding={{ top: 'extralarge', bottom: 'medium' }}
								width="50%"
							>
								<Switch
									value={restoreAccountDetail?.lastAvailableStatus}
									label={t('label.use_last_available_status', 'Use last available status')}
									onClick={(): void => {
										setRestoreAccountDetail((prev: any) => ({
											...prev,
											lastAvailableStatus: !restoreAccountDetail?.lastAvailableStatus
										}));
									}}
									iconColor="primary"
								/>
							</Container>
							<Container width="47.8%">
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
							</Container>
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
									iconColor="primary"
								/>
							</Row>
						</ListRow>
						<ListRow>
							<Container padding={{ top: 'medium', bottom: 'large' }}>
								<Divider />
							</Container>
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
									iconColor="primary"
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
