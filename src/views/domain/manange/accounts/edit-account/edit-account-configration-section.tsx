/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useCallback, useState, useEffect, ChangeEvent } from 'react';

import {
	Container,
	Row,
	Text,
	ChipInput,
	Icon,
	Divider,
	Input,
	useSnackbar,
	Tooltip
} from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ACCOUNT } from '../../../../../constants';
import { getCoreAttributes } from '../../../../../services/get-core-attributes';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import CustomChip from '../../../../components/customChip';
import { Features } from '../../../../cos/features';
import InheritedSwitch from '../../../../utility/inherited-components/inherited-switch';
import { isValidEmail } from '../../../../utility/utils';
import { AccountContext } from '../account-context';
import { AccountType } from '../account-types/account-types';

const EditAccountConfigrationSection: FC = () => {
	const context = useContext(AccountContext);
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const { accountDetail, setAccountDetail, setInitAccountDetail, accSpecificDetail, cosDetail } =
		context;
	const [prefMailForwardingAddress, setPrefMailForwardingAddress] = useState<any[]>([]);
	const [mailForwardingAddress, setMailForwardingAddress] = useState<any[]>([]);
	const [prefCalendarForwardInvitesTo, setPrefCalendarForwardInvitesTo] = useState<any[]>([]);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	useEffect(() => {
		setPrefMailForwardingAddress(
			accountDetail?.zimbraPrefMailForwardingAddress
				? accountDetail.zimbraPrefMailForwardingAddress
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraPrefMailForwardingAddress]);
	useEffect(() => {
		setMailForwardingAddress(
			accountDetail?.zimbraMailForwardingAddress
				? accountDetail.zimbraMailForwardingAddress
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraMailForwardingAddress]);
	useEffect(() => {
		setPrefCalendarForwardInvitesTo(
			accountDetail?.zimbraPrefCalendarForwardInvitesTo
				? accountDetail.zimbraPrefCalendarForwardInvitesTo
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraPrefCalendarForwardInvitesTo]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);

	const setSwitchOptionValue = useCallback(
		(key: string, value: string): void => {
			setAccountDetail((prev: Record<string, string>) => ({ ...prev, [key]: value }));
			setInitAccountDetail((prev: Record<string, string>) => ({ ...prev, [key]: value }));
		},
		[setAccountDetail, setInitAccountDetail]
	);

	const getMobileFeatureSync = useCallback(() => {
		const body = [
			{
				configType: ACCOUNT,
				configName: [accountDetail?.name],
				attrName: ['mobileContactFeatureSync', 'mobileCalendarFeatureSync']
			}
		];
		getCoreAttributes(body)
			.then((data) => {
				if (data?.attributes) {
					setSwitchOptionValue(
						'mobileContactFeatureSync',
						data?.attributes?.mobileContactFeatureSync[0]?.value === 'enabled' ? 'TRUE' : 'FALSE'
					);
					setSwitchOptionValue(
						'mobileCalendarFeatureSync',
						data?.attributes?.mobileCalendarFeatureSync[0]?.value === 'enabled' ? 'TRUE' : 'FALSE'
					);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [accountDetail?.name, createSnackbar, setSwitchOptionValue, t]);

	useEffect(() => {
		if (isAdvanced && accountDetail?.name) {
			getMobileFeatureSync();
		}
	}, [accountDetail?.name, getMobileFeatureSync, isAdvanced]);

	const setEmptyValue = useCallback(
		(keyName: string) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setAccountDetail]
	);
	const changeAccDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setAccountDetail((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
		>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.forwarding', 'Forwarding')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<InheritedSwitch
							subValue={accountDetail?.zimbraFeatureMailForwardingEnabled}
							onChange={changeSwitchOption}
							label={t(
								'account_details.user_can_specify_forwarding_address',
								'User can specify forwarding address'
							)}
							iconColor="primary"
							inheritedValue={cosDetail.zimbraFeatureMailForwardingEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureMailForwardingEnabled}
							inputName={'zimbraFeatureMailForwardingEnabled'}
							onChangeReset={(): void => setEmptyValue('zimbraFeatureMailForwardingEnabled')}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<InheritedSwitch
							subValue={accountDetail?.zimbraPrefMailLocalDeliveryDisabled}
							onChange={changeSwitchOption}
							label={t(
								'account_details.dont_keep_local_copy_of_messages',
								`Don't Keep local copy of messages`
							)}
							iconColor="primary"
							inheritedValue={cosDetail.zimbraPrefMailLocalDeliveryDisabled}
							fromSubValue={accSpecificDetail?.zimbraPrefMailLocalDeliveryDisabled}
							inputName={'zimbraPrefMailLocalDeliveryDisabled'}
							onChangeReset={(): void => setEmptyValue('zimbraPrefMailLocalDeliveryDisabled')}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<InheritedSwitch
							subValue={accountDetail?.zimbraFeatureMailForwardingInFiltersEnabled}
							onChange={changeSwitchOption}
							label={t(
								'account_details.user_can_specify_mail_forwarding_filter',
								'User can specify mail forwarding filter'
							)}
							iconColor="primary"
							inheritedValue={cosDetail.zimbraFeatureMailForwardingInFiltersEnabled}
							fromSubValue={accSpecificDetail?.zimbraFeatureMailForwardingInFiltersEnabled}
							inputName={'zimbraFeatureMailForwardingInFiltersEnabled'}
							onChangeReset={(): void =>
								setEmptyValue('zimbraFeatureMailForwardingInFiltersEnabled')
							}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_addresses_specified_by_the_user',
								'Forwarding addresses specified by the user'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (isValidEmail(contact.label ?? '')) data.push(contact);
								});
								setPrefMailForwardingAddress(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraPrefMailForwardingAddress: map(data, 'label').join(', ')
								}));
							}}
							ChipComponent={CustomChip}
							defaultValue={prefMailForwardingAddress}
							value={prefMailForwardingAddress}
							background="gray5"
							hasError={some(prefMailForwardingAddress || [], { error: true })}
							maxChips={null}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_addresses_hidden_from_the_user',
								'Forwarding addresses hidden from the user'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (isValidEmail(contact.label ?? '')) data.push(contact);
								});
								setMailForwardingAddress(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraMailForwardingAddress: map(data, 'label').join(', ')
								}));
							}}
							defaultValue={mailForwardingAddress}
							value={mailForwardingAddress}
							background="gray5"
							hasError={some(mailForwardingAddress || [], { error: true })}
							ChipComponent={CustomChip}
							maxChips={null}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_calendar_invitations_to_these_addresses',
								'Forwarding calendar invitations to these addresses'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (isValidEmail(contact.label ?? '')) data.push(contact);
								});
								setPrefCalendarForwardInvitesTo(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraPrefCalendarForwardInvitesTo: map(data, 'label').join(', ')
								}));
							}}
							defaultValue={prefCalendarForwardInvitesTo}
							value={prefCalendarForwardInvitesTo}
							background="gray5"
							hasError={some(prefCalendarForwardInvitesTo || [], { error: true })}
							ChipComponent={CustomChip}
							maxChips={null}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.mail_transport', 'Mail Transport')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						onChange={changeAccDetail}
						inputName="zimbraMailTransport"
						label={t('label.mail_transport_map', 'Mail Transport Map')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.zimbraMailTransport || ''}
						value={accountDetail?.zimbraMailTransport || ''}
						CustomIcon={(): React.ReactElement => (
							<Tooltip
								placement="top"
								label={`${t('label.format', 'Format')} :  ${t(
									'label.protocol_server_port',
									'protocol:server:port'
									// eslint-disable-next-line sonarjs/no-nested-template-literals
								)}${` | `}:${` lmtp:server.demo.zextras.io:7025`}`}
							>
								<Text>
									<Icon icon="InfoOutline" size="large" color="secondary" />
								</Text>
							</Tooltip>
						)}
					/>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('', 'Workstream Collaboration')}
					</Text>
				</Row>
				{/* <WscSettings /> */}
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.features', 'Features')}
					</Text>
				</Row>
				<Features
					featuresDetail={accountDetail}
					setFeaturesDetail={setAccountDetail}
					cosDetail={cosDetail}
					accSpecificDetail={accSpecificDetail}
					setEmptyValue={setEmptyValue}
				/>
			</Row>
		</Container>
	);
};

export default EditAccountConfigrationSection;
