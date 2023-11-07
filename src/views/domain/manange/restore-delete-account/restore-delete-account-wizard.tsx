/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import RestoreAccountConfigSection from './restore-delete-account-config-section';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';
import RestoreSelectAccountSection from './restore-delete-account-select-section';
import RestoreAccountStartSection from './restore-delete-account-start-section';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { Section } from '../../../app/component/section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('label.restore_account', 'Restore Account')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose={false}
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const RestoreDeleteAccountWizard: FC<{
	setShowRestoreAccountWizard: any;
	restoreAccountRequest: any;
	isRequestWorkInProgress: any;
}> = ({ setShowRestoreAccountWizard, restoreAccountRequest, isRequestWorkInProgress }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const history = useHistory();
	const onComplete = useCallback(() => {
		console.log('Completed');
	}, []);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>();
	interface AccountDetailObj {
		name: string;
		id: string;
		createDate: string;
		status: string;
		copyAccount: string;
		dateTime: any;
		lastAvailableStatus: boolean;
		hsmApply: boolean;
		dataSource: boolean;
		isEmailNotificationEnable: boolean;
		notificationReceiver: string;
		copyDomain: string;
	}
	const [restoreAccountDetail, setRestoreAccountDetail] = useState<AccountDetailObj>({
		name: '',
		id: '',
		createDate: '',
		status: '',
		copyAccount: '',
		dateTime: null,
		lastAvailableStatus: false,
		hsmApply: false,
		dataSource: false,
		isEmailNotificationEnable: false,
		notificationReceiver: '',
		copyDomain: ''
	});

	const onRestoreAccount = useCallback(() => {
		restoreAccountRequest(
			restoreAccountDetail?.name,
			restoreAccountDetail?.id,
			restoreAccountDetail?.createDate,
			restoreAccountDetail?.status,
			restoreAccountDetail?.copyAccount,
			restoreAccountDetail?.dateTime,
			restoreAccountDetail?.lastAvailableStatus,
			restoreAccountDetail?.hsmApply,
			restoreAccountDetail?.dataSource,
			restoreAccountDetail?.notificationReceiver,
			restoreAccountDetail?.isEmailNotificationEnable,
			restoreAccountDetail?.copyDomain
		);
	}, [restoreAccountDetail, restoreAccountRequest]);

	const backToFirstTab = useCallback(() => {
		const lastloc = history?.location?.pathname;
		history.push(lastloc.replace('/restore_account', ''));
		setTimeout(() => {
			history.push(lastloc);
		}, 100);
	}, [history]);

	useEffect(() => {
		if (isRequestWorkInProgress === false) {
			setIsRequestInProgress(undefined);
		}
	}, [isRequestWorkInProgress]);

	const wizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.select_an_account', 'Select An Account'),
				icon: 'AtOutline',
				view: RestoreSelectAccountSection,
				canGoNext: (): any => restoreAccountDetail?.id !== '',
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						// eslint-disable-next-line sonarjs/no-duplicate-string
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={backToFirstTab}
					/>
				),
				PrevButton: (props: any) => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'members',
				label: t('label.config', 'Config'),
				icon: 'OptionsOutline',
				view: RestoreAccountConfigSection,
				canGoNext: (): any => restoreAccountDetail?.copyAccount,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={backToFirstTab}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.start', 'start'),
				icon: 'PowerOutline',
				view: RestoreAccountStartSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.cancel', 'Cancel')}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={backToFirstTab}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.restore_account', 'Restore Account')}
						icon="PowerOutline"
						iconPlacement="right"
						onClick={(): void => {
							if (isRequestInProgress === undefined) {
								setIsRequestInProgress(true);
							}
						}}
						disabled={restoreAccountDetail?.name === '' || restoreAccountDetail?.copyAccount === ''}
					/>
				)
			}
		],
		[
			t,
			restoreAccountDetail?.name,
			restoreAccountDetail?.copyAccount,
			backToFirstTab,
			isRequestInProgress,
			restoreAccountDetail?.id
		]
	);

	useEffect(() => {
		setTimeout(() => {
			if (!!isRequestInProgress && isRequestInProgress) {
				onRestoreAccount();
			}
		}, 500);
	}, [isRequestInProgress, onRestoreAccount]);

	return (
		<Container background="gray5" mainAlignment="flex-start">
			<RestoreDeleteAccountContext.Provider
				value={{ restoreAccountDetail, setRestoreAccountDetail }}
			>
				<HorizontalWizard
					steps={wizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowRestoreAccountWizard}
				/>
			</RestoreDeleteAccountContext.Provider>
		</Container>
	);
};

export default RestoreDeleteAccountWizard;
