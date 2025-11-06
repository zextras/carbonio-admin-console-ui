/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced , useDomainStore , useAdminConfigStore } from '@zextras/admin-ui-bootstrap';
import { Container, Button, useSnackbar, Padding } from '@zextras/carbonio-design-system';
import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ZIMBRA_ADMIN_URN } from '../../../../../constants';
import { createAccountRequest } from '../../../../../services/create-account';
import { fetchSoap } from '../../../../../services/generateOTP-service';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section-component';
import OverlayDivision from '../../../../components/overlayDivision';

import { AccountContext } from './account-context';
import CreateOtpSectionView from './account-otp-section';
import CreateAccountDetailSection from './create-account-detail-section';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 39.4rem;
	top: 0;
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

const AccountDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	transition: left 0.2s ease-in-out;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1);
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
	generateOTP: boolean;
	administrationRigths: boolean;
	qrData: string;
	secrateCode: string;
	pinCodes: string;
	showOtpOptionSection: boolean;
	description: string;
}

 
const CreateAccount: FC<{
	setShowCreateAccountView: any;
	getAccountList: any;
	setShowEditAccountView: any;
	openDetailView: any;
	setShowAccountDetailView: any;
	setDefaultTab: any;
}> = ({
	setShowCreateAccountView,
	getAccountList,
	setShowEditAccountView,
	openDetailView,
	setShowAccountDetailView,
	setDefaultTab
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const { userId } = useAdminConfigStore((state) => state);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [accountDetail, setAccountDetail] = useState<AccountDetailObj>({
		name: '',
		givenName: '',
		initials: '',
		sn: '',
		zimbraPasswordMustChange: false,
		generateFirst2FAToken: true,
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
		changeDisplayNameBool: false,
		generateOTP: false,
		administrationRigths: false,
		qrData: '',
		secrateCode: '',
		pinCodes: '',
		showOtpOptionSection: true,
		description: ''
	});
	const [wizardData, setWizardData] = useState();
	const [activeStep, setActiveStep] = useState('');
	const [accountCreate, setAccountCreate] = useState('');
	const isAdvanced = useIsAdvanced();
	const [showNext, setShowNext] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const createAccountAPI = useCallback((): void => {
		setIsLoading(true);
		createAccountRequest(
			{
				givenName: accountDetail?.givenName,
				initials: accountDetail?.initials,
				sn: accountDetail?.sn,
				zimbraPasswordMustChange: accountDetail?.zimbraPasswordMustChange ? 'TRUE' : 'FALSE',
				zimbraAccountStatus: accountDetail?.zimbraAccountStatus,
				zimbraPrefLocale: accountDetail?.zimbraPrefLocale,
				zimbraPrefTimeZoneId: accountDetail?.zimbraPrefTimeZoneId,
				zimbraNotes: accountDetail?.zimbraNotes,
				displayName: accountDetail?.displayName,
				zimbraCOSId: accountDetail?.defaultCOS ? '' : accountDetail?.zimbraCOSId,
				description: accountDetail?.description
			},
			`${accountDetail?.name}@${domainName}`,
			accountDetail?.password || ''
		)
			.then((data) => {
				const isCreateAccount = data;
				if (isCreateAccount) {
					if (isAdvanced) {
						setActiveStep('otp');
					} else {
						setShowCreateAccountView(false);
					}
					setAccountDetail((prev) => ({
						...prev,
						id: data?.account[0]?.id,
						name: data?.account[0]?.name
					}));

					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t(
							'label.account_created_successfully',
							'The account has been created successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
				getAccountList();
				setIsLoading(false);
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
				setIsLoading(false);
			});
	}, [
		accountDetail,
		createSnackbar,
		domainName,
		getAccountList,
		isAdvanced,
		setShowCreateAccountView,
		t
	]);

	const createNewAccount = useCallback((): void => {
		setAccountDetail({
			name: '',
			givenName: '',
			initials: '',
			sn: '',
			zimbraPasswordMustChange: true,
			generateFirst2FAToken: true,
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
			changeDisplayNameBool: false,
			generateOTP: false,
			administrationRigths: false,
			qrData: '',
			secrateCode: '',
			pinCodes: '',
			showOtpOptionSection: true,
			description: ''
		});
		setActiveStep('details');
		setAccountCreate('');
	}, [setActiveStep]);

	const handleOnGenerateOTP = useCallback((): void => {
		fetchSoap('zextras', {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxAuth',
			action: 'totp_generate_command',
			account: `${accountDetail?.name}`
		}).then((res) => {
			if (res.ok) {
				setAccountDetail((prev: any) => ({
					...prev,
					qrData: `otpauth://totp/${encodeURIComponent(res.response.label)}?secret=${
						res.response.secret
					}&issuer=${res.response.issuer}&algorithm=${res.response.algorithm}&digits=${
						res.response.digits_length
					}&period=${res.response.period}`,
					secrateCode: res.response.secret,
					pinCodes: res.response.static_otp_codes,
					showOtpOptionSection: false
				}));
			}
		});
	}, [accountDetail]);

	const handleNext = useCallback((): void => {
		if (accountDetail?.generateOTP && accountDetail?.showOtpOptionSection) {
			handleOnGenerateOTP();
		} else if (
			(!accountDetail.generateOTP && accountDetail?.administrationRigths) ||
			(!accountDetail?.showOtpOptionSection && accountDetail?.administrationRigths)
		) {
			setShowCreateAccountView(false);
			openDetailView(accountDetail);
			setShowAccountDetailView(false);
			setShowEditAccountView(true);
			setDefaultTab('administration');
		} else {
			setShowCreateAccountView(false);
		}
	}, [
		accountDetail,
		handleOnGenerateOTP,
		setShowCreateAccountView,
		openDetailView,
		setShowAccountDetailView,
		setShowEditAccountView,
		setDefaultTab
	]);

	useEffect(() => {
		if (accountCreate === 'create') {
			if (!accountDetail?.sn?.trim()) {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.surname_required', 'Surname is required'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setAccountCreate('');
			} else if (
				accountDetail?.password &&
				accountDetail?.repeatPassword &&
				accountDetail?.password?.length < 6
			) {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.password_length_msg', 'Password should be more than 5 character'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setAccountCreate('');
			} else if (accountDetail?.password !== accountDetail?.repeatPassword) {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.password_and_repeat_password_not_match', 'Passwords do not match'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setAccountCreate('');
			} else {
				setAccountCreate('');
				createAccountAPI();
			}
		} else if (accountCreate === 'next') {
			setAccountCreate('');
			handleNext();
		}
	}, [accountCreate, accountDetail, createAccountAPI, createSnackbar, handleNext, t]);

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
						onClick={(): void => {
							setShowCreateAccountView(false);
						}}
					/>
				),
				PrevButton: (props: any): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						label={t('commons.create_with_there_data', 'CREATE WITH THESE DATA')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => {
							setAccountCreate('create');
						}}
					/>
				)
			},

			{
				name: 'otp',
				label: t('label.otp', 'OTP'),
				icon: 'KeyOutline',
				view: CreateOtpSectionView,
				clickDisabled: true,
				CancelButton: () => <></>,
				PrevButton: (): ReactElement => (
					<>
						<Padding right="small">
							<Button
								type="outlined"
								disabled={accountDetail?.administrationRigths}
								label={t('label.create_another_account', 'CREATE ANOTHER ACCOUNT')}
								onClick={(): void => createNewAccount()}
							/>
						</Padding>
					</>
				),
				NextButton: (props: { toggleNextBtn: boolean }): ReactElement => (
					<Button
						label={props?.toggleNextBtn ? t('commons.next', 'NEXT') : t('commons.close', 'CLOSE')}
						onClick={(): void => {
							setAccountCreate('next');
						}}
					/>
				)
			}
		],

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t, createSnackbar]
	);

	const onComplete = useCallback(() => {
		setShowCreateAccountView(false);
	}, [setShowCreateAccountView]);

	const wizardStepItems = useMemo(
		() => (!isAdvanced ? wizardSteps.filter((item: any) => item?.name !== 'otp') : wizardSteps),
		[isAdvanced, wizardSteps]
	);
	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<AccountDetailContainer background="gray5" mainAlignment="flex-start">
				<AccountContext.Provider
					value={{ accountDetail, setAccountDetail, setShowCreateAccountView }}
				>
					<HorizontalWizard
						steps={wizardStepItems}
						Wrapper={WizardInSection}
						onChange={setWizardData}
						onComplete={onComplete}
						activeStep={activeStep}
						setToggleWizardSection={setShowCreateAccountView}
					/>
				</AccountContext.Provider>
			</AccountDetailContainer>
		</>
	);
};
export default CreateAccount;
