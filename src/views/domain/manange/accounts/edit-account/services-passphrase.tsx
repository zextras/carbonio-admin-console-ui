/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC, useCallback, useContext, useMemo, useState } from 'react';

import {
	Input,
	Row,
	Text,
	Select,
	Button,
	useSnackbar,
	Modal,
	Container,
	Icon
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../../../../../constants';
import { fetchSoap } from '../../../../../services/generateOTP-service';
import { useDomainStore } from '../../../../../store/domain/store';
import { ServicesPassphraseServices, ServicesPassphraseStatus } from '../../../../utility/utils';
import { AccountContext } from '../account-context';

interface CredentialTextDataType {
	password?: string;
}

interface CredentialType {
	id?: string;
	label?: string;
	services?: string;
	enabled?: boolean;
	// eslint-disable-next-line camelcase
	text_data?: CredentialTextDataType;
}

interface SelectServiceType {
	label: string;
	value: string;
}

interface SelectStatusType {
	label?: string;
	value?: boolean;
}

interface AddCredentialApiType {
	ok?: boolean;
	response?: {
		list?: CredentialType;
		// eslint-disable-next-line camelcase
		text_data: { password: '' };
	};
}

export const ServicesPassphrase: FC = () => {
	const context = useContext(AccountContext);
	const { accountDetail, credentialList, getCredentialList } = context;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [createCredentialModal, setCreateCredentialModal] = useState<boolean>(false);

	const SERVICE_PASSPHRASE_STATUS = useMemo(() => ServicesPassphraseStatus(t), [t]);
	const SERVICE_PASSPHRASE_SERVICES: any = useMemo(() => ServicesPassphraseServices(), []);
	const [createCredential, setCreateCredential] = useState<CredentialType>({
		label: '',
		services: SERVICE_PASSPHRASE_SERVICES[0].value
	});

	const [createCredentialResponse, setCreateCredentialResponse] = useState<CredentialType>({
		label: '',
		services: ''
	});

	const changeCredLabel = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCreateCredential((prev: CredentialType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setCreateCredential]
	);

	const onServicesPassphraseServicesChange = (v: any): void => {
		setCreateCredential((prev: CredentialType) => ({ ...prev, services: v }));
	};

	const onSave = useCallback((): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'credential',
			request: 'add',
			account: `${accountDetail?.uid}@${domainName}`,
			...createCredential
		}).then((res: AddCredentialApiType) => {
			if (res.ok) {
				setCreateCredentialResponse({
					label: res?.response?.list?.label,
					services: res?.response?.list?.label,
					text_data: res?.response?.text_data
				});
				setCreateCredential((prev: CredentialType) => ({ ...prev, label: '' }));
				getCredentialList(`${accountDetail?.uid}@${domainName}`);
				setCreateCredential({
					label: '',
					services: SERVICE_PASSPHRASE_SERVICES[0].value
				});
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'account_details.services_passphrase_created_successfully',
						'Services Passphrase created successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setCreateCredentialModal(true);
			} else {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	}, [
		SERVICE_PASSPHRASE_SERVICES,
		accountDetail?.uid,
		createCredential,
		createSnackbar,
		domainName,
		getCredentialList,
		t
	]);

	const onDelete = useCallback(
		(cred: CredentialType): void => {
			fetchSoap('zextras', {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxAuth',
				action: 'credential',
				request: 'delete',
				password_id: cred.id,
				account: `${accountDetail?.uid}@${domainName}`,
				...createCredential
			}).then((res: AddCredentialApiType) => {
				if (res.ok) {
					getCredentialList(`${accountDetail?.uid}@${domainName}`);
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'account_details.services_passphrase_deleted_successfully',
							'Services Passphrase deleted successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t('label.something_wrong_wrror_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			});
		},
		[accountDetail?.uid, createCredential, createSnackbar, domainName, getCredentialList, t]
	);

	return (
		<>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('account_details.services_passphrase', 'Services Passphrase')}
					</Text>
				</Row>
				{credentialList.map((item: CredentialType, index: number) => (
					<Row
						key={`credentialList${index}`}
						padding={{ top: 'large', left: 'large' }}
						width="100%"
						mainAlignment="space-between"
					>
						<Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
							<Input
								inputName="label"
								label={t('account_details.label', 'Label')}
								backgroundColor="gray5"
								value={item.label}
								textColor="secondary"
							/>
						</Row>
						<Row
							width="19%"
							mainAlignment="space-between"
							style={{ pointerEvents: 'none' }}
							padding={{ right: 'medium' }}
						>
							<Select
								items={SERVICE_PASSPHRASE_SERVICES}
								background="gray5"
								label={t('account_details.services', 'Services')}
								showCheckbox={false}
								selection={SERVICE_PASSPHRASE_SERVICES.find(
									(el: SelectServiceType) =>
										el.value?.toLowerCase() === item.services?.toLowerCase()
								)}
								disabled
								onChange={(): void => {
									// console.log('__');
								}}
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
							<Select
								items={SERVICE_PASSPHRASE_STATUS}
								background="gray5"
								label={t('account_details.status', 'Status')}
								showCheckbox={false}
								defaultSelection={
									SERVICE_PASSPHRASE_STATUS.filter(
										(el: SelectStatusType) => el.value === item?.enabled
									)[0]
								}
								onChange={(): null => null}
								style={{ paddingRight: 'medium' }}
								disabled
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between" style={{ pointerEvents: 'none' }}>
							<Input
								inputName="hash"
								label={t('account_details.passphrasaId', 'Passphrase ID')}
								backgroundColor="gray5"
								value={item.id}
								textColor="secondary"
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between">
							<Button
								type="outlined"
								label={t('account_details.DELETE', 'DELETE')}
								color="error"
								onClick={(): void => onDelete(item)}
							/>
						</Row>
					</Row>
				))}
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="19%" mainAlignment="space-between">
						<Input
							onChange={changeCredLabel}
							inputName="label"
							label={t('account_details.label', 'Label')}
							backgroundColor="gray5"
							value={createCredential.label}
						/>
					</Row>
					<Row width="19%" mainAlignment="space-between" padding={{ right: 'medium' }}>
						<Select
							items={SERVICE_PASSPHRASE_SERVICES}
							background="gray5"
							label={t('account_details.services', 'Services')}
							showCheckbox={false}
							onChange={onServicesPassphraseServicesChange}
							defaultSelection={SERVICE_PASSPHRASE_SERVICES[0]}
						/>
					</Row>

					<Row width="19%" mainAlignment="space-between">
						<Button
							type="outlined"
							label={t('account_details.create', 'CREATE')}
							color="primary"
							onClick={onSave}
						/>
					</Row>
					<Row width="19%" mainAlignment="space-between"></Row>
					<Row width="19%" mainAlignment="space-between"></Row>
				</Row>
			</Row>
			<Modal
				size="medium"
				title={t('account_details.service_label_password', ' {{ service_label }}’s Password', {
					service_label: createCredentialResponse?.label
				})}
				open={createCredentialModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '1rem' }}>
							<Button
								label={t(
									'account_details.i_have_copied_the_password',
									'I HAVE COPIED THE PASSWORD'
								)}
								color="primary"
								onClick={(): void => setCreateCredentialModal(false)}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => setCreateCredentialModal(false)}
			>
				<Row padding={{ vertical: 'extralarge' }} mainAlignment="center" crossAlignment="center">
					<Row
						width="80%"
						mainAlignment="center"
						crossAlignment="center"
						padding={{ bottom: 'large' }}
					>
						<Text size={'extralarge'} overflow="break-word">
							{t(
								'account_details.password_allow_once_user_to_connect',
								`This password will allow user to connect to this service without the 2FA even from an un-trusted network.`
							)}
						</Text>
					</Row>
					<Row width="80%" mainAlignment="center" crossAlignment="center">
						<Text size={'extralarge'} overflow="break-word">
							<Trans
								i18nKey="account_details.able_to_see_password_once"
								defaults=" Please note: you'll be able to see the password <bold>just once.</bold>"
								components={{ bold: <strong /> }}
							/>
						</Text>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Input
							label={t('account_details.service_password', 'Service Password')}
							backgroundColor="gray5"
							value={createCredentialResponse.text_data?.password}
							CustomIcon={(): any => (
								<Icon
									icon="CopyOutline"
									size="large"
									color="Gray0"
									onClick={(e): any => {
										e.preventDefault();
										e.stopPropagation();
										navigator.clipboard.writeText(
											createCredentialResponse.text_data?.password || ''
										);
									}}
									style={{ cursor: 'pointer' }}
								/>
							)}
							disabled
							textColor={'gray1'}
						/>
					</Row>
				</Row>
			</Modal>
		</>
	);
};
