/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Button,
	Container,
	Divider,
	Input,
	Padding,
	Row,
	Switch,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { doPurgeActiveSync } from '../../../services/do-purge-mobile-state';
import { doStratStopJail } from '../../../services/do-start-stop-jail';
import { getMobileAntiDosService } from '../../../services/get-mobile-anti-dos-service';
import { getMobileAntiDosServiceJailDuration } from '../../../services/get-mobile-anti-dos-service-jail-duration';
import { getMobileAntiDosServiceMaxRequests } from '../../../services/get-mobile-anti-dos-service-max-requests';
import { getMobileAntiDosServiceTimeWindow } from '../../../services/get-mobile-anti-dos-service-time-window';
import { setAntiDosServiceEnabled } from '../../../services/set-mobile-anti-dos-service';
import { setAntiDosServiceJailDuration } from '../../../services/set-mobile-anti-dos-service-jail-duration';
import { setAntiDosServiceMaxRequests } from '../../../services/set-mobile-anti-dos-service-max-requests';
import { setAntiDosServiceTimeWindow } from '../../../services/set-mobile-anti-dos-service-time-window';
import { useMailstoreList } from '@zextras/admin-ui-bootstrap';
import OverlayDivision from '../../components/overlayDivision';
import ListRow from '../../list/list-row';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 70.35rem;
	top: 6.5rem;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const GlobalActiveSync: FC = () => {
	const [t] = useTranslation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [intMobileAntiDosServiceEnbled, setIntMobileAntiDosServiceEnbled] = useState(false);
	const [intMobileAntiDosServiceJailDuration, setIntMobileAntiDosServiceJailDuration] =
		useState('');
	const [intMobileAntiDosServiceMaxRequests, setIntMobileAntiDosServiceMaxRequests] = useState('');
	const [intMobileAntiDosServiceTimeWindow, setIntMobileAntiDosServiceTimeWindow] = useState('');
	const [mobileAntiDosServiceEnbled, setMobileAntiDosServiceEnbled] = useState(false);
	const [mobileAntiDosServiceJailDuration, setMobileAntiDosServiceJailDuration] = useState('');
	const [mobileAntiDosServiceMaxRequests, setMobileAntiDosServiceMaxRequests] = useState('');
	const [mobileAntiDosServiceTimeWindow, setMobileAntiDosServiceTimeWindow] = useState('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const { data: mailstoresList } = useMailstoreList();
	const createSnackbar = useSnackbar();

	const successSnackbar = (): void => {
		createSnackbar({
			key: 'success',
			severity: 'success',
			label: t(
				'label.the_last_changes_has_been_saved_successfully',
				'Changes have been saved successfully'
			),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	};
	const callAllRequest = (requests: any): void => {
		setIsLoading(true);
		Promise.all(requests)
			.then((response: any) => Promise.all(response))
			.then((data: any) => {
				 
				let isError = false;
				let errorMessage = '';
				data.forEach((item: any) => {
					if (item?.Fault) {
						isError = true;
						errorMessage = item?.Fault?.Reason?.Text;
					}
				});
				if (isError) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: errorMessage,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t('label.servers_have_been_restared', 'Servers have been restared'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				setIsLoading(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsLoading(false);
			});
	};

	const restartJail = (): void => {
		if ((mailstoresList || []).length > 0) {
			const request: any[] = [];
			setIsLoading(true);
			(mailstoresList || []).forEach((mailbox) =>
				request.push(doStratStopJail('doStartService', mailbox?.name))
			);
			if (request?.length > 0) {
				callAllRequest(request);
			}
		}
	};
	const PurgeActiveSync = (): void => {
		if ((mailstoresList || []).length > 0) {
			setIsLoading(true);
			doPurgeActiveSync().then(() => {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'label.active_sync_has_been_purged_successfully',
						'ActiveSync has been purged successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setIsLoading(false);
			});
		}
	};
	const onSave = (): void => {
		setIsLoading(true);
		if (mobileAntiDosServiceEnbled !== intMobileAntiDosServiceEnbled) {
			setAntiDosServiceEnabled(mobileAntiDosServiceEnbled).then(() => {
				setIntMobileAntiDosServiceEnbled(mobileAntiDosServiceEnbled);
				successSnackbar();
				setIsLoading(false);
			});
		}
		if (mobileAntiDosServiceJailDuration !== intMobileAntiDosServiceJailDuration) {
			setAntiDosServiceJailDuration(Number(mobileAntiDosServiceJailDuration)).then(() => {
				setIntMobileAntiDosServiceJailDuration(mobileAntiDosServiceJailDuration);
				successSnackbar();
				setIsLoading(false);
			});
		}
		if (mobileAntiDosServiceMaxRequests !== intMobileAntiDosServiceMaxRequests) {
			setAntiDosServiceMaxRequests(Number(mobileAntiDosServiceMaxRequests)).then(() => {
				setIntMobileAntiDosServiceMaxRequests(mobileAntiDosServiceMaxRequests);
				successSnackbar();
				setIsLoading(false);
			});
		}
		if (mobileAntiDosServiceTimeWindow !== intMobileAntiDosServiceTimeWindow) {
			setAntiDosServiceTimeWindow(Number(mobileAntiDosServiceTimeWindow)).then(() => {
				setIntMobileAntiDosServiceTimeWindow(mobileAntiDosServiceTimeWindow);
				successSnackbar();
				setIsLoading(false);
			});
		}
		setIsDirty(false);
	};

	const onCancel = (): void => {
		setMobileAntiDosServiceEnbled(intMobileAntiDosServiceEnbled);
		setMobileAntiDosServiceJailDuration(intMobileAntiDosServiceJailDuration);
		setMobileAntiDosServiceMaxRequests(intMobileAntiDosServiceMaxRequests);
		setMobileAntiDosServiceTimeWindow(intMobileAntiDosServiceTimeWindow);
		setIsDirty(false);
	};

	useEffect(() => {
		getMobileAntiDosService().then((data): any => {
			const parseData = JSON.parse(data?.Body?.response?.content);
			setIntMobileAntiDosServiceEnbled(parseData.response?.values[0]?.value);
			setMobileAntiDosServiceEnbled(parseData?.response?.values[0]?.value);
		});
		getMobileAntiDosServiceJailDuration().then((data): any => {
			const parseData = JSON.parse(data?.Body?.response?.content);
			const JailDurationData = parseData.response?.values[0]?.value
				? parseData.response?.values[0]?.value
				: parseData.response?.values[0]?.inheritedValue;
			setIntMobileAntiDosServiceJailDuration(JailDurationData);
			setMobileAntiDosServiceJailDuration(JailDurationData);
		});
		getMobileAntiDosServiceMaxRequests().then((data): any => {
			const parseData = JSON.parse(data?.Body?.response?.content);
			const MaxRequestsData = parseData.response?.values[0]?.value
				? parseData.response?.values[0]?.value
				: parseData.response?.values[0]?.inheritedValue;
			setMobileAntiDosServiceMaxRequests(MaxRequestsData);
			setIntMobileAntiDosServiceMaxRequests(MaxRequestsData);
		});
		getMobileAntiDosServiceTimeWindow().then((data): any => {
			const parseData = JSON.parse(data?.Body?.response?.content);
			const TimeWindowData = parseData.response?.values[0]?.value
				? parseData.response?.values[0]?.value
				: parseData.response?.values[0]?.inheritedValue;
			setMobileAntiDosServiceTimeWindow(TimeWindowData);
			setIntMobileAntiDosServiceTimeWindow(TimeWindowData);
		});

		 
	}, []);

	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container mainAlignment="flex-start" background="gray6">
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.active_sync', 'ActiveSync')}
								</Text>
							</Row>
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Padding right="small">
									{isDirty && (
										<Button
											label={t('label.cancel', 'Cancel')}
											color="secondary"
											onClick={onCancel}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								)}
							</Row>
						</Row>
					</Container>
					<Divider color="gray2" />
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 9.375rem)"
				>
					<Row mainAlignment="flex-end" width="100%" padding={{ top: 'large' }}>
						<Padding right="large">
							<Button
								type="outlined"
								label={t('label.restart_jail', 'Restart Jail')}
								color="primary"
								size="large"
								onClick={(): void => restartJail()}
							/>
						</Padding>
						<Padding right="large">
							<Button
								type="outlined"
								label={t('label.purge_active_sync', 'Purge ActiveSync')}
								color="primary"
								size="large"
								onClick={(): void => PurgeActiveSync()}
							/>
						</Padding>
					</Row>
					<Row
						mainAlignment="flex-start"
						width="100%"
						background="gray6"
						padding={{ left: 'large' }}
					>
						<Text size="small" weight="bold">
							{t('label.mobile_dos_protection', 'Mobile DOS Protection')}
						</Text>
					</Row>
					<ListRow>
						<Container
							crossAlignment="flex-start"
							mainAlignment="flex-start"
							padding={{
								left: 'large',
								top: 'extralarge'
							}}
						>
							<Switch
								label={t(
									'label.enable_the_mobile_dos_protection_service',
									'Enable the Mobile DOS Protection Service'
								)}
								value={mobileAntiDosServiceEnbled}
								onClick={(): void => {
									if (intMobileAntiDosServiceEnbled === mobileAntiDosServiceEnbled) {
										setIsDirty(true);
									}
									setMobileAntiDosServiceEnbled(!mobileAntiDosServiceEnbled);
								}}
								iconColor="primary"
							/>
						</Container>
						<Container padding={{ all: 'medium' }}>
							<Input
								label={t('domain.jail_duration', 'Jail Duration (ms)')}
								backgroundColor="gray5"
								value={mobileAntiDosServiceJailDuration}
								type="number"
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									if (intMobileAntiDosServiceJailDuration !== e.target.value) {
										setIsDirty(true);
									}
									setMobileAntiDosServiceJailDuration(e.target.value);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container padding={{ all: 'medium' }}>
							<Input
								label={t('label.maximum_of_requests_allowed', 'Maximum of Requests Allowed')}
								value={mobileAntiDosServiceMaxRequests}
								backgroundColor="gray5"
								type="number"
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									if (intMobileAntiDosServiceMaxRequests !== e.target.value) {
										setIsDirty(true);
									}
									setMobileAntiDosServiceMaxRequests(e.target.value);
								}}
							/>
						</Container>
						<Container padding={{ all: 'medium' }}>
							<Input
								label={t(
									'label.time_window_for_allowed_requests',
									'Time Window for Allowed Requests (ms)'
								)}
								type="number"
								value={mobileAntiDosServiceTimeWindow}
								backgroundColor="gray5"
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									if (intMobileAntiDosServiceTimeWindow !== e.target.value) {
										setIsDirty(true);
									}
									setMobileAntiDosServiceTimeWindow(e.target.value);
								}}
							/>
						</Container>
					</ListRow>
				</Container>
			</Container>
		</>
	);
};

export default GlobalActiveSync;
