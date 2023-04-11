/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { Input, Row, Text, Select, Button, useSnackbar } from '@zextras/carbonio-design-system';

import { useTranslation } from 'react-i18next';
import { ServicesPassphraseServices, ServicesPassphraseStatus } from '../../../../utility/utils';

import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { fetchSoap } from '../../../../../services/generateOTP-service';

export const ServicesPassphrase: FC<any> = () => {
	const conext = useContext(AccountContext);
	const { accountDetail, credentialList, getCredentialList } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const SERVICE_PASSPHRASE_STATUS = useMemo(() => ServicesPassphraseStatus(t), [t]);
	const SERVICE_PASSPHRASE_SERVICES = useMemo(() => ServicesPassphraseServices(), []);
	const [createCredential, setCreateCredential] = useState({
		label: '',
		services: SERVICE_PASSPHRASE_SERVICES[0].value
	});

	const changeAccDetail = useCallback(
		(e) => {
			setCreateCredential((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setCreateCredential]
	);

	const onServicesPassphraseServicesChange = (v: any): any => {
		setCreateCredential((prev: any) => ({ ...prev, services: v }));
	};

	const onSave = useCallback((): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxAuth',
			action: 'credential',
			request: 'add',
			account: `${accountDetail?.uid}@${domainName}`,
			...createCredential
		}).then((res: any) => {
			if (res.ok) {
				getCredentialList(`${accountDetail?.uid}@${domainName}`);
				setCreateCredential({
					label: '',
					services: SERVICE_PASSPHRASE_SERVICES[0].value
				});
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t(
						'account_details.services_passphrase_created_successfully',
						'Services Passphrase created successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			} else {
				createSnackbar({
					key: 'error',
					type: 'error',
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
		(cred: any): void => {
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxAuth',
				action: 'credential',
				request: 'delete',
				password_id: cred.id,
				account: `${accountDetail?.uid}@${domainName}`,
				...createCredential
			}).then((res: any) => {
				if (res.ok) {
					getCredentialList(`${accountDetail?.uid}@${domainName}`);
					createSnackbar({
						key: 'success',
						type: 'success',
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
						type: 'error',
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
				{/* {console.log('credentialList ===>', credentialList)} */}
				{credentialList.map((item: any, index: number): any => (
					<Row
						key={`credentialList${index}`}
						padding={{ top: 'large', left: 'large' }}
						width="100%"
						mainAlignment="space-between"
					>
						<Row width="19%" mainAlignment="space-between">
							<Input
								inputName="label"
								label={t('account_details.label', 'Label')}
								backgroundColor="gray5"
								value={item.label}
								disabled
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between">
							<Select
								items={SERVICE_PASSPHRASE_SERVICES}
								background="gray5"
								label={t('labeaccount_detailsl.services', 'Services')}
								showCheckbox={false}
								defaultSelection={SERVICE_PASSPHRASE_SERVICES.find(
									(el: any) => el.value.toLowerCase() === item?.services.toLowerCase()
								)}
								padding={{ right: 'medium' }}
								disabled
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between">
							<Select
								items={SERVICE_PASSPHRASE_STATUS}
								background="gray5"
								label={t('labeaccount_detailsl.status', 'Status')}
								showCheckbox={false}
								defaultSelection={SERVICE_PASSPHRASE_STATUS.find(
									(el: any) => el.value === item?.enabled
								)}
								padding={{ right: 'medium' }}
								disabled
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between">
							<Input
								inputName="hash"
								label={t('account_details.passphrasaId', 'Passphrase ID')}
								backgroundColor="gray5"
								value={item.hash}
								disabled
							/>
						</Row>
						<Row width="19%" mainAlignment="space-between">
							<Button
								type="outlined"
								label={t('labeaccount_detailsl.DELETE', 'DELETE')}
								color="error"
								onClick={(): void => onDelete(item)}
							/>
						</Row>
					</Row>
				))}
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="19%" mainAlignment="space-between">
						<Input
							onChange={changeAccDetail}
							inputName="label"
							label={t('account_details.label', 'Label')}
							backgroundColor="gray5"
						/>
					</Row>
					{/* <Row width="19%" mainAlignment="space-between">
						<Select
							items={SERVICE_PASSPHRASE_STATUS}
							background="gray5"
							label={t('labeaccount_detailsl.status', 'Status')}
							showCheckbox={false}
							onChange={onServicesPassphraseStatusChange}
							defaultSelection={SERVICE_PASSPHRASE_STATUS[0]}
							padding={{ right: 'medium' }}
						/>
					</Row> */}
					<Row width="19%" mainAlignment="space-between">
						<Select
							items={SERVICE_PASSPHRASE_SERVICES}
							background="gray5"
							label={t('labeaccount_detailsl.services', 'Services')}
							showCheckbox={false}
							onChange={onServicesPassphraseServicesChange}
							defaultSelection={SERVICE_PASSPHRASE_SERVICES[0]}
							padding={{ right: 'medium' }}
						/>
					</Row>

					<Row width="19%" mainAlignment="space-between">
						<Button
							type="outlined"
							label={t('labeaccount_detailsl.SAVE', 'SAVE')}
							color="primary"
							onClick={onSave}
						/>
					</Row>
					<Row width="19%" mainAlignment="space-between"></Row>
					<Row width="19%" mainAlignment="space-between"></Row>
				</Row>
			</Row>
		</>
	);
};
