/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import {
	Container,
	Input,
	Row,
	Text,
	IconButton,
	Padding,
	Icon,
	Quota,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getMailboxQuota } from '../../../../services/account-list-directory-service';

const AccountDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 43px;
	right: 12px;
	bottom: 0px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
`;

const AccountDetailView: FC<any> = ({
	selectedAccount,
	setShowAccountDetailView,
	setShowEditAccountView,
	STATUS_COLOR
}) => {
	const [t] = useTranslation();
	const [usedQuota, setUsedQuota] = useState(0);

	const getDataSourceDetail = useCallback((): void => {
		getMailboxQuota(selectedAccount?.id)
			.then((response) => response.json())
			.then((data) => {
				setUsedQuota(data?.Body?.GetMailboxResponse?.mbox?.[0]?.s || 0);
			});
	}, [selectedAccount?.id]);
	useEffect(() => {
		getDataSourceDetail();
	}, [getDataSourceDetail]);
	return (
		<AccountDetailContainer background="gray5" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="48px"
				style={{ borderBottom: '1px solid #E6E9ED' }}
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{`${selectedAccount?.name} ${t('label.details', 'Details')}`}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setShowAccountDetailView(false)}
					/>
				</Row>
			</Row>
			<Container
				padding={{ left: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100% - 64px)"
				background="white"
			>
				<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
					<Padding right="medium" top="large">
						<IconButton
							iconColor="gray6"
							backgroundColor="primary"
							icon="EditAsNewOutline"
							height={36}
							width={36}
							onClick={(): void => {
								setShowAccountDetailView(false);
								setShowEditAccountView(true);
							}}
						/>
					</Padding>
					<Padding right="medium">
						<IconButton
							iconColor="gray6"
							backgroundColor="error"
							icon="DeletePermanentlyOutline"
							height={36}
							width={36}
							onClick={(): void => {
								console.log('delete to be');
							}}
						/>
					</Padding>
					<Padding right="medium">
						<Button
							type="outlined"
							label={t('label.view_mail', 'VIEW MAIL')}
							icon="EmailReadOutline"
							iconPlacement="right"
							color="primary"
						/>
					</Padding>
					<Button
						type="outlined"
						label={t('label.restart_replica', 'RESTART REPLICA')}
						icon="RefreshOutline"
						iconPlacement="right"
						color="primary"
						disabled
					/>
				</Row>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.account', 'Account')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Padding left="medium" />
					<Row
						width="48%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="PersonOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray6"
								value={selectedAccount?.displayName || ''}
								readOnly
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="EmailOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								label={t('label.email', 'E-mail')}
								backgroundColor="gray6"
								value={selectedAccount?.name || ''}
								readOnly
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Padding left="medium" />
					<Row
						width="48%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HardDriveOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								label={t('label.server', 'Server')}
								readOnly
								backgroundColor="gray6"
								value={selectedAccount?.zimbraMailHost}
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CubeOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								readOnly
								label={t('label.space', 'Space')}
								backgroundColor="gray6"
								value={`${(usedQuota / 1048576).toFixed(3)} MB of ${
									selectedAccount?.zimbraMailQuota
										? `${(selectedAccount.zimbraMailQuota / 1048576).toFixed(3)} MB`
										: t('label.unlimited', 'Unlimited')
								}`}
							/>
							<Quota
								fill={
									!selectedAccount?.zimbraMailQuota
										? 1
										: (usedQuota / selectedAccount.zimbraMailQuota) * 100
								}
								background="gray5"
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Padding left="medium" />
					<Row
						width="48%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FingerPrintOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input readOnly label="ID" backgroundColor="gray6" value={selectedAccount?.id} />
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon
								icon="DashboardOutline"
								size="large"
								color={STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.color}
							/>
						</Row>
						<Row width="80%">
							<Input
								label={t('label.status', 'Status')}
								backgroundColor="gray6"
								readOnly
								value={STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.label}
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Padding left="medium" />
					<Row
						width="48%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CalendarOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								label={t('label.creation_date', 'Creation Date')}
								backgroundColor="gray6"
								readOnly
								value={moment(selectedAccount?.zimbraCreateTimestamp, 'YYYYMMDDHHmmss.Z').format(
									'DD MMM YYYY | hh:MM:SS A'
								)}
							/>
						</Row>
					</Row>
					<Row
						width="50%"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="ClockOutline" size="large" color="gray0" />
						</Row>
						<Row width="80%">
							<Input
								label={t('label.last_access', 'Last Access')}
								backgroundColor="gray6"
								readOnly
								value={
									selectedAccount?.zimbraLastLogonTimestamp
										? moment(selectedAccount?.zimbraLastLogonTimestamp, 'YYYYMMDDHHmmss.Z').format(
												'DD MMM YYYY | hh:MM:SS A'
										  )
										: t('label.never_logged_in', 'Never logged in')
								}
							/>
						</Row>
					</Row>
				</Row>
				<Row
					padding={{ top: 'extralarge' }}
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Input
						label={t('label.description', 'Description')}
						backgroundColor="gray6"
						width="100%"
						value={selectedAccount?.description || ''}
						readOnly
					></Input>
				</Row>
				<Row
					padding={{ top: 'extralarge' }}
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Input
						label={t('label.notes', 'Notes')}
						backgroundColor="gray6"
						width="100%"
						value={selectedAccount?.zimbraNotes || ''}
						readOnly
					></Input>
				</Row>
			</Container>
		</AccountDetailContainer>
	);
};
export default AccountDetailView;
