/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Container, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import RestoreAccountWizard from './restore-delete-account-wizard';
import { doRestoreDeleteAccount } from '../../../../services/restore-delete-account-service';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import { useDomainStore } from '../../../../store/domain/store';

const RestoreDeleteAccount: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [showRestoreAccountWizard, setShowRestoreAccountWizard] = useState<boolean>(false);
	const context = useContext(RestoreDeleteAccountContext);
	const { restoreAccountDetail, setRestoreAccountDetail } = context;
	const [isSuccess, setIsSuccess] = useState(false);
	const [isRequestWorkInProgress, setIsRequestWorkInProgress] = useState<any>();
	const domainName = useDomainStore((state) => state.domain?.name);

	const backToFirstTab = useCallback(() => {
		const lastloc = history?.location?.pathname;
		history.push(lastloc.replace('/restore_account', ''));
		setTimeout(() => {
			history.push(lastloc);
		}, 10);
	}, [history]);

	const resetAllFields = useCallback(() => {
		setRestoreAccountDetail((prev: any) => ({
			...prev,
			name: '',
			id: '',
			status: '',
			createDate: '',
			copyAccount: '',
			dateTime: null,
			lastAvailableStatus: false,
			hsmApply: false,
			dataSource: false,
			isEmailNotificationEnable: false,
			notificationReceiver: ''
		}));
	}, [setRestoreAccountDetail]);

	useMemo(() => {
		if (isSuccess) {
			backToFirstTab();
			setIsSuccess(false);
		}
	}, [isSuccess, backToFirstTab]);

	const restoreAccountRequest = useCallback(
		(
			name,
			id,
			createDate,
			status,
			copyAccount,
			dateTime,
			lastAvailableStatus,
			hsmApply,
			dataSource,
			notificationReceiver,
			isEmailNotificationEnable
		) => {
			const body: any = {
				srcAccountName: id,
				obeyHSM: hsmApply,
				restoreDatasources: dataSource
			};
			if (notificationReceiver !== '' && isEmailNotificationEnable) {
				body.notificationMails = [notificationReceiver];
			}
			if (copyAccount !== '') {
				body.dstAccountName = `${copyAccount.split('@')[0]}@${domainName}`;
			}
			setIsRequestWorkInProgress(true);
			doRestoreDeleteAccount(body)
				.then((data) => {
					let error = data?.error?.details?.cause || data?.error?.message;
					const success = data?.operationId;
					if (error === undefined && data?.status !== 200) {
						error = t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
					}
					setIsRequestWorkInProgress(false);
					if (error) {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: error,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
					if (success) {
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t(
								'label.restore_account_has_added_operation_queue',
								'The restore of the account has been added to the operation queue successfully'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setIsSuccess(true);
					}
				})
				.catch((error: any) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, domainName]
	);

	return (
		<Container background="gray5" mainAlignment="flex-start">
			<Container
				orientation="column"
				background="gray5"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
				>
					<RestoreAccountWizard
						setShowRestoreAccountWizard={setShowRestoreAccountWizard}
						restoreAccountRequest={restoreAccountRequest}
						isRequestWorkInProgress={isRequestWorkInProgress}
					/>
				</Container>
			</Container>
		</Container>
	);
};
export default RestoreDeleteAccount;
