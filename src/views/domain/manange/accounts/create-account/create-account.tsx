/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, useSnackbar } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useDomainStore } from '../../../../../store/domain/store';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import CreateAccountDetailSection from './create-account-detail-section';
import { Section } from '../../../../app/component/section';
import CreateAccountSectionView from './account-create-section';
import { AccountContext } from './account-context';

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
	opacity: '10%;
`;

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account.new.create_account_wizard', 'Create Account Wizard')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

interface AccountDetailObj {
	name: string;
	givenName: string;
	initials: string;
	sn: string;
	zimbraPasswordMustChange: boolean;
	generateFirst2FAToken: boolean;
	enableActiveSyncRemoteAccess: boolean;
	defaultCOS: boolean;
	zimbraAccountStatus: string;
	zimbraPrefLocale: string;
	zimbraPrefTimeZoneId: string;
	zimbraNotes: string;
	password: string;
	repeatPassword: string;
	displayName: string;
	zimbraCOSId: string;
	changeNameBool: boolean;
	changeDisplayNameBool: boolean;
}

// eslint-disable-next-line no-empty-pattern
const CreateAccount: FC<{
	setShowCreateAccountView: any;
	createAccountReq: any;
}> = ({ setShowCreateAccountView, createAccountReq }) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<AccountDetailObj>({
		name: '',
		givenName: '',
		initials: '',
		sn: '',
		zimbraPasswordMustChange: true,
		generateFirst2FAToken: true,
		enableActiveSyncRemoteAccess: true,
		defaultCOS: true,
		zimbraAccountStatus: '',
		zimbraPrefLocale: '',
		zimbraPrefTimeZoneId: '',
		zimbraNotes: '',
		password: '',
		repeatPassword: '',
		displayName: '',
		zimbraCOSId: '',
		changeNameBool: false,
		changeDisplayNameBool: false
	});

	const [wizardData, setWizardData] = useState();

	const wizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.details', 'DETAILS'),
				icon: 'Edit2Outline',
				view: CreateAccountDetailSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateAccountView(false)}
					/>
				),
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next_step', 'NEXT STEP')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.create', 'CREATE'),
				icon: 'PersonOutline',
				view: CreateAccountSectionView,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateAccountView(false)}
					/>
				),
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('commons.create_with_there_data', 'CREATE WITH THESE DATA')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => {
							if (
								accountDetail?.password &&
								accountDetail?.repeatPassword &&
								accountDetail?.password?.length < 6
							) {
								createSnackbar({
									key: 'error',
									type: 'error',
									label: t('label.password_lenght_msg', 'Password should be more then 5 character'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							} else if (accountDetail?.password !== accountDetail?.repeatPassword) {
								createSnackbar({
									key: 'error',
									type: 'error',
									label: t(
										'label.password_and repeat_password_not_match',
										'Password and repeat password not match'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							} else {
								createAccountReq(
									{
										givenName: accountDetail?.givenName,
										initials: accountDetail?.initials,
										sn: accountDetail?.sn,
										zimbraPasswordMustChange: accountDetail?.zimbraPasswordMustChange
											? 'TRUE'
											: 'FALSE',
										zimbraAccountStatus: accountDetail?.zimbraAccountStatus,
										zimbraPrefLocale: accountDetail?.zimbraPrefLocale,
										zimbraPrefTimeZoneId: accountDetail?.zimbraPrefTimeZoneId,
										zimbraNotes: accountDetail?.zimbraNotes,
										displayName: accountDetail?.displayName,
										zimbraCOSId: accountDetail?.defaultCOS ? '' : accountDetail?.zimbraCOSId
									},
									`${accountDetail?.name}@${domainName}`,
									accountDetail?.password || ''
								);
							}
						}}
					/>
				)
			}
		],
		[
			t,
			setShowCreateAccountView,
			accountDetail?.password,
			accountDetail?.repeatPassword,
			accountDetail?.givenName,
			accountDetail?.initials,
			accountDetail?.sn,
			accountDetail?.zimbraPasswordMustChange,
			accountDetail?.zimbraAccountStatus,
			accountDetail?.zimbraPrefLocale,
			accountDetail?.zimbraPrefTimeZoneId,
			accountDetail?.zimbraNotes,
			accountDetail?.displayName,
			accountDetail?.defaultCOS,
			accountDetail?.zimbraCOSId,
			accountDetail?.name,
			createSnackbar,
			createAccountReq,
			domainName
		]
	);

	const onComplete = useCallback(() => {
		setShowCreateAccountView(false);
	}, [setShowCreateAccountView]);

	return (
		<AccountDetailContainer background="gray5" mainAlignment="flex-start">
			<AccountContext.Provider value={{ accountDetail, setAccountDetail }}>
				<HorizontalWizard
					steps={wizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowCreateAccountView}
				/>
			</AccountContext.Provider>
		</AccountDetailContainer>
	);
};
export default CreateAccount;
