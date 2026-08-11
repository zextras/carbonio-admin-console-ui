/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Button, Container, Input, ListRow, Padding, PasswordInput, Popper, RouteLeavingGuard, Row, Select, SelectItem, Switch, Tooltip as TooltipDefault, useSnackbar } from '@zextras/ui-components';
import { flushCache, useIsAdvanced, useUserSettings } from '@zextras/ui-shared';
import React, { FC, RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '../../../../types';
import { CHECK_OK, DISABLED, ENABLED, TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { CheckAuthConfig } from '../../../services/check-auth-config-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { isValidLdapBaseUrl } from '../../utility/utils';
import { DomainFormActions } from './components/domain-form-actions';
import { useDomainMutation } from './hooks/use-domain-mutation';
import {
	AUTHENTICATION_DEFAULTS,
	AuthenticationFormValues,
	authenticationSchema} from './schemas/domain-authentication-schema';

const ZimbraAuthMethod = {
	INTERNAL: 'zimbra',
	LDAP: 'ldap',
	EXTERNAL: 'ad'
} as const;

const Tooltip: FC<{ items: { label?: string }[] }> = ({ items }) => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		background="gray3"
		width="fit"
		height="fit"
		crossAlignment="flex-start"
	>
		<Padding left="small" right="small" bottom="small">
			{items.map((item, index) => (
				<Padding top="small" key={index}>
					<ds-text as="span" size="extrasmall" color="text" key={item.label}>
						{item.label}
					</ds-text>
				</Padding>
			))}
		</Padding>
	</Container>
);

type AuthMethodItem = {
	label: string;
	value: string;
	info_label: string;
	info_label_ce: string;
};

const DomainAuthentication: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	// UI-only states (not part of form data)
	const [zimbraAuthMech, setZimbraAuthMech] = useState<AuthMethodItem | undefined>();
	const [isVerifying, setIsVerifying] = useState<boolean>(false);
	const [isSuccessVerify, setIsSuccessVerify] = useState<boolean>(false);
	const [verifyAuthUserName, setVerifyAuthUserName] = useState<string>('');
	const [verifyAuthPassword, setVerifyAuthPassword] = useState<string>('');

	const { data: domain, isLoading } = useSelectedDomain();
	const domainInformation = domain?.a;

	const [open, setOpen] = useState(false);
	const iconRef = useRef<HTMLDivElement>(null);
	const [ldapUrlOpen, setLdapUrlOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const ldapUrlIconRef = useRef<HTMLDivElement>(null);
	const filterIconRef = useRef<HTMLDivElement>(null);
	const userSetting = useUserSettings();
	const isGlobalAdmin = userSetting?.attrs?.zimbraIsAdminAccount === TRUE;

	const isAdvanced = useIsAdvanced();
	const localLdapTrans = t(
		'label.method_allows_local_ldap_only',
		'This method allows usage of Local LDAP'
	);
	const DOMAIN_AUTH_LIST: AuthMethodItem[] = [
		{
			label: t('label.carbonio', 'Carbonio'),
			value: '',
			info_label: t(
				'domain.authentication.carbonio_info',
				'This method allows usage of Local LDAP, External AD/LDAP, Credential Password and SAML.'
			),
			info_label_ce: localLdapTrans
		},
		{
			label: t('label.local_ldap_only', 'Local LDAP only'),
			value: ZimbraAuthMethod.INTERNAL,
			info_label: localLdapTrans,
			info_label_ce: localLdapTrans
		},
		{
			label: t('label.external_ldap_only', 'External LDAP only'),
			value: ZimbraAuthMethod.LDAP,
			info_label: t(
				'label.external_ldap_only_infor',
				'This method allows usage of external LDAP'
			),
			info_label_ce: t(
				'label.external_ldap_only_info_ce',
				'This method allows usage of external LDAP'
			)
		},
		{
			label: t('label.external_ad_only', 'External AD only'),
			value: ZimbraAuthMethod.EXTERNAL,
			info_label: t('label.external_ad_only_info', 'This method allows usage of external AD'),
			info_label_ce: t(
				'label.external_ad_only_info_ce',
				'This method allows usage of external AD'
			)
		}
	];

	const DN_TEMPLATE_TOOLTIP = [
		{
			label: `%n = ${t('label.username_with', 'username with')} @ (${t('label.example', 'example')} username@domain.tld)`
		},
		{
			label: `%u = ${t('label.username_without', 'username without')} @ (${t('label.example', 'example')} username)`
		},
		{ label: `%d = ${t('label.domain', 'domain')} (${t('label.example', 'example')} domain.tld)` },
		{
			label: `%D = ${t('label.domain', 'domain')} (${t('label.example', 'example')} dc=domain,dc=tld)`
		}
	];

	const LDAP_URL_TOOLTIP = [
		{
			label: `${t('label.ex', 'ex.')} ldap[s]://${t('label.external_ldap_server', 'external-ldap-server')}[:389]`
		}
	];

	const FILTER_TOOLTIP = [{ label: `${t('label.ex', 'ex.')} (ou=text)` }];

	const [prevDomainInformation, setPrevDomainInformation] = useState(domainInformation);

	const form = useForm({
		defaultValues: AUTHENTICATION_DEFAULTS,
		validators: {
			onChange: authenticationSchema,
			onSubmit: authenticationSchema
		},
		onSubmit: async ({ value }) => {
			const attributes: { n: string; _content?: string }[] = [
				{ n: 'zimbraAuthMech', _content: value.zimbraAuthMech },
				{ n: 'zimbraPasswordChangeListener', _content: value.zimbraPasswordChangeListener },
				{ n: 'zimbraAuthLdapURL', _content: value.zimbraAuthLdapURL },
				{ n: 'zimbraAuthLdapSearchBindDn', _content: value.zimbraAuthLdapSearchBindDn },
				{
					n: 'zimbraAuthLdapSearchBindPassword',
					_content: value.zimbraAuthLdapSearchBindPassword
				},
				{
					n: 'zimbraAuthLdapStartTlsEnabled',
					_content: value.zimbraAuthLdapStartTlsEnabled ? 'TRUE' : 'FALSE'
				},
				{ n: 'zimbraAuthLdapSearchFilter', _content: value.zimbraAuthLdapSearchFilter },
				{ n: 'zimbraAuthLdapSearchBase', _content: value.zimbraAuthLdapSearchBase },
				{
					n: 'zimbraAuthFallbackToLocal',
					_content: value.zimbraAuthFallbackToLocal ? 'TRUE' : 'FALSE'
				}
			];

			if (isAdvanced) {
				attributes.push({
					n: 'zimbraFeatureResetPasswordStatus',
					_content: value.zimbraFeatureResetPasswordStatus ? ENABLED : DISABLED
				});
			}

			await mutate({
				id: value.zimbraId,
				_jsns: ZIMBRA_ADMIN_URN,
				a: attributes
			});
			form.reset(value, { keepDefaultValues: true });
		}
	});

	// Sync form with server data
	if (domainInformation !== prevDomainInformation) {
		setPrevDomainInformation(domainInformation);
		if (domainInformation && domainInformation.length > 0) {
			const obj: Record<string, string> = {};
			domainInformation.forEach((item: Attribute) => {
				obj[item?.n] = item._content;
			});

			const authMethod =
				DOMAIN_AUTH_LIST.find((item) => item.value === obj.zimbraAuthMech) ?? DOMAIN_AUTH_LIST[0];
			setZimbraAuthMech(authMethod);

			const formValues: AuthenticationFormValues = {
				zimbraAuthMech: authMethod.value,
				zimbraPasswordChangeListener: obj.zimbraPasswordChangeListener ?? '',
				zimbraAuthLdapURL: obj.zimbraAuthLdapURL ?? '',
				zimbraAuthLdapSearchBindDn: obj.zimbraAuthLdapSearchBindDn ?? '',
				zimbraAuthLdapSearchBindPassword: obj.zimbraAuthLdapSearchBindPassword ?? '',
				zimbraAuthLdapSearchFilter: obj.zimbraAuthLdapSearchFilter ?? '',
				zimbraAuthLdapSearchBase: obj.zimbraAuthLdapSearchBase ?? '',
				zimbraAuthFallbackToLocal: obj.zimbraAuthFallbackToLocal === 'TRUE',
				zimbraAuthLdapStartTlsEnabled: obj.zimbraAuthLdapStartTlsEnabled === 'TRUE',
				zimbraFeatureResetPasswordStatus: obj.zimbraFeatureResetPasswordStatus === ENABLED,
				zimbraId: obj.zimbraId ?? ''
			};
			form.reset(formValues, { keepDefaultValues: false });
		}
	}

	const isDirty = useSelector(form.store, (state) => !state.isDefaultValue);
	const formValues = useSelector(form.store, (state) => state.values);

	// Validation states derived from form
	const isValidLdapUrl =
		!formValues.zimbraAuthLdapURL ||
		isValidLdapBaseUrl(formValues.zimbraAuthLdapURL) ||
		(formValues.zimbraAuthMech !== ZimbraAuthMethod.EXTERNAL &&
			formValues.zimbraAuthMech !== ZimbraAuthMethod.LDAP);

	const ldapUrlRequired =
		(formValues.zimbraAuthMech === ZimbraAuthMethod.EXTERNAL ||
			formValues.zimbraAuthMech === ZimbraAuthMethod.LDAP) &&
		!formValues.zimbraAuthLdapURL;

	const { mutate, isPending } = useDomainMutation({
		mutationFn: async (body: { id: string; _jsns: string; a: { n: string; _content?: string }[] }) => {
			const result = await modifyDomain(body);
			if (isGlobalAdmin) {
				flushCache('domain', 'id', body.id);
			}
			return result;
		},
		successMessage: t('label.change_save_success_msg', 'The change has been saved successfully')
	});

	const onAuthMethodChange = (v: SelectItem[] | string | null): void => {
		const method = DOMAIN_AUTH_LIST.find((item) => item.value === v);
		setZimbraAuthMech(method);
		form.setFieldValue('zimbraAuthMech', (v as string) ?? '');
	};

	const onCancel = (): void => {
		form.reset();
		// After reset, values return to defaults - read from the reset state
		const resetValues = form.store.state.values;
		const authMethod = DOMAIN_AUTH_LIST.find(
			(item) => item.value === resetValues.zimbraAuthMech
		);
		setZimbraAuthMech(authMethod);
	};

	const handleSave = (): void => {
		form.handleSubmit();
	};

	const canVerify =
		(formValues.zimbraAuthMech === 'ldap' || formValues.zimbraAuthMech === 'ad') &&
		formValues.zimbraAuthLdapURL !== '' &&
		isValidLdapUrl &&
		formValues.zimbraAuthLdapSearchBindDn !== '' &&
		formValues.zimbraAuthLdapSearchBindPassword !== '' &&
		verifyAuthUserName !== '' &&
		verifyAuthPassword !== '';

	const handleClickLoginAndVerify = (): void => {
		setIsVerifying(true);
		setIsSuccessVerify(false);
		const body: {
			name?: string;
			password?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {
			_jsns: ZIMBRA_ADMIN_URN,
			a: [
				{ n: 'zimbraAuthMech', _content: formValues.zimbraAuthMech },
				{ n: 'zimbraAuthLdapURL', _content: formValues.zimbraAuthLdapURL },
				{ n: 'zimbraAuthLdapSearchFilter', _content: formValues.zimbraAuthLdapSearchFilter },
				{ n: 'zimbraAuthLdapSearchBindDn', _content: formValues.zimbraAuthLdapSearchBindDn },
				{
					n: 'zimbraAuthLdapSearchBindPassword',
					_content: formValues.zimbraAuthLdapSearchBindPassword
				}
			],
			name: verifyAuthUserName,
			password: verifyAuthPassword
		};
		CheckAuthConfig(body)
			.then((response) => {
				if (response?.code[0]?._content === CHECK_OK) {
					setIsSuccessVerify(true);
				} else {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 5000,
						hideButton: true,
						replace: true
					});
					setIsVerifying(false);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 5000,
					hideButton: true,
					replace: true
				});
				setIsVerifying(false);
			});
	};

	if (isLoading) {
		return (
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
				<ds-page-shimmer rows={6} />
			</Container>
		);
	}

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<ds-text as="h2" size="medium" weight="bold" color="gray0">
									{t('label.authentication', 'Authentication')}
								</ds-text>
							</Row>
							<DomainFormActions
								isDirty={isDirty}
								isPending={isPending}
								isValid={isValidLdapUrl && !ldapUrlRequired}
								onCancel={onCancel}
								onSave={handleSave}
							/>
						</Row>
					</Container>
					<ds-divider></ds-divider>
				</Row>
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					style={{ overflow: 'auto' }}
					width="100%"
					height="calc(100vh - 150px)"
				>
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
						<Container
							padding={{ all: 'small' }}
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
						>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<ds-text as="h3" size="small" color="gray0" weight="bold">
										{t('label.auth_method', 'Auth Method')}
									</ds-text>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									{zimbraAuthMech && (
										<Select
											data-testid={'auth-method-select'}
											background="gray5"
											label={t('label.your_auth_method_is', 'Your Auth Method is')}
											showCheckbox={false}
											items={DOMAIN_AUTH_LIST}
											selection={zimbraAuthMech}
											onChange={onAuthMethodChange}
										/>
									)}
									<Padding top="medium">
										{zimbraAuthMech && (
											<ds-text as="p" size="small" color="gray1">
												{isAdvanced ? zimbraAuthMech.info_label : zimbraAuthMech.info_label_ce}
											</ds-text>
										)}
									</Padding>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Popper
										open={open}
										anchorEl={iconRef as RefObject<HTMLElement>}
										placement="top-end"
										onClose={(): void => setOpen(false)}
									>
										<Tooltip items={DN_TEMPLATE_TOOLTIP} />
									</Popper>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapURL">
										{(field) => (
											<>
												<Input
													isRequired
													label={t('label.url', 'URL')}
													value={field.state.value}
													backgroundColor="gray5"
													onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
														field.handleChange(e.target.value);
													}}
													hasError={!isValidLdapUrl || ldapUrlRequired}
													CustomIcon={(): React.ReactElement => (
														<Container
															ref={ldapUrlIconRef}
															onMouseEnter={(): void => setLdapUrlOpen(true)}
															onMouseLeave={(): void => setLdapUrlOpen(false)}
														>
															<ds-icon
																icon="QuestionMarkCircleOutline"
																size="large"
																color="secondary"
															></ds-icon>
														</Container>
													)}
												/>
												{(!isValidLdapUrl || ldapUrlRequired) && (
													<Row>
														<Container
															mainAlignment="flex-start"
															crossAlignment="flex-start"
															width="fill"
														>
															<Padding top="small">
																<ds-text
																	as="span"
																	size="extrasmall"
																	weight="regular"
																	color="error"
																>
																	{field.state.value
																		? t('label.ldap_url_is_not_valid', 'Ldap url is not valid')
																		: t('label.required', 'Required')}
																</ds-text>
															</Padding>
														</Container>
													</Row>
												)}
											</>
										)}
									</form.Field>
									<Popper
										open={ldapUrlOpen}
										anchorEl={ldapUrlIconRef as RefObject<HTMLElement>}
										placement="top-end"
										onClose={(): void => setLdapUrlOpen(false)}
									>
										<Tooltip items={LDAP_URL_TOOLTIP} />
									</Popper>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapSearchFilter">
										{(field) => (
											<Input
												label={t('label.filter', 'Filter')}
												value={field.state.value}
												backgroundColor="gray5"
												onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
													field.handleChange(e.target.value);
												}}
												CustomIcon={(): React.ReactElement => (
													<Container
														ref={filterIconRef}
														onMouseEnter={(): void => setFilterOpen(true)}
														onMouseLeave={(): void => setFilterOpen(false)}
													>
														<ds-icon
															icon="QuestionMarkCircleOutline"
															size="large"
															color="secondary"
														></ds-icon>
													</Container>
												)}
											/>
										)}
									</form.Field>
									<Popper
										open={filterOpen}
										anchorEl={filterIconRef as RefObject<HTMLElement>}
										placement="top-end"
										onClose={(): void => setFilterOpen(false)}
									>
										<Tooltip items={FILTER_TOOLTIP} />
									</Popper>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapSearchBase">
										{(field) => (
											<Input
												label={t('label.search_base', 'Basic Search')}
												value={field.state.value}
												backgroundColor="gray5"
												onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
													field.handleChange(e.target.value);
												}}
											/>
										)}
									</form.Field>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapSearchBindDn">
										{(field) => (
											<Input
												label={t('domain.authentication.search_bind_user', 'Search Bind User')}
												value={field.state.value}
												backgroundColor="gray5"
												inputName="user"
												onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
													field.handleChange(e.target.value);
												}}
											/>
										)}
									</form.Field>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapSearchBindPassword">
										{(field) => (
											<PasswordInput
												label={t(
													'domain.authentication.search_bind_password',
													'Search Bind Password'
												)}
												backgroundColor="gray5"
												inputName="zimbraQuotaWarnInterval"
												value={field.state.value}
												onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
													field.handleChange(e.target.value);
												}}
											/>
										)}
									</form.Field>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<ds-divider></ds-divider>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<ds-text as="h3" size="small" color="gray0" weight="bold">
										{t('label.verify_auth', 'Verify Auth')}
									</ds-text>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="38%">
									<Input
										label={t('label.user_name', 'User Name')}
										value={verifyAuthUserName}
										backgroundColor="gray5"
										inputName="user"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setVerifyAuthUserName(e.target.value);
										}}
									/>
								</Padding>
								<Padding vertical="small" horizontal="small" width="38%">
									<PasswordInput
										label={t('label.password', 'Password')}
										backgroundColor="gray5"
										inputName="verifyAuthPassword"
										value={verifyAuthPassword}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setVerifyAuthPassword(e.target.value);
										}}
									/>
								</Padding>
								<Padding vertical="small" horizontal="small" width="24%">
									<Button
										type="outlined"
										label={
											isSuccessVerify
												? t('label.login_verified_button_title', 'LOGIN VERIFIED')
												: t('label.login_verify_button_title', 'LOGIN AND VERIFY')
										}
										icon="CheckmarkOutline"
										iconPlacement="right"
										color={isSuccessVerify ? 'success' : 'primary'}
										width="fill"
										size="extralarge"
										onClick={handleClickLoginAndVerify}
										disabled={!canVerify || isVerifying}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<ds-divider></ds-divider>
								</Padding>
							</ListRow>
							<Padding horizontal="small" width="90%"></Padding>
							<ListRow>
								{isAdvanced && (
									<Padding vertical="small" horizontal="small" width="70%">
										<form.Field name="zimbraFeatureResetPasswordStatus">
											{(field) => (
												<Switch
													data-testid="reset-password-switch"
													value={field.state.value}
													label={t(
														'label.show_forget_password_link',
														'Show "Forget Password" link in the login page'
													)}
													onClick={(): void => field.handleChange(!field.state.value)}
													iconColor="primary"
												/>
											)}
										</form.Field>
									</Padding>
								)}
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthFallbackToLocal">
										{(field) => (
											<TooltipDefault
												label={
													!isValidLdapBaseUrl(formValues.zimbraAuthLdapURL)
														? t(
																'label.please_add_ldap_url_endpoint_first',
																'To enable this, please add a ldap URL endpoint first'
															)
														: ''
												}
												disabled={isValidLdapBaseUrl(formValues.zimbraAuthLdapURL)}
											>
												<Switch
													value={
														!!field.state.value && isValidLdapBaseUrl(formValues.zimbraAuthLdapURL)
													}
													label={t(
														'label.enforce_external_auth',
														'Enforce External Auth (LDAP/AD)'
													)}
													onClick={(): void => field.handleChange(!field.state.value)}
													iconColor="primary"
													disabled={!isValidLdapBaseUrl(formValues.zimbraAuthLdapURL)}
												/>
											</TooltipDefault>
										)}
									</form.Field>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraAuthLdapStartTlsEnabled">
										{(field) => (
											<Switch
												data-testid={'enable-secure-connection'}
												value={field.state.value}
												label={t(
													'label.enable_secure_connection',
													'Enable Secure Connection (StartTLS/SSL)'
												)}
												onClick={(): void => field.handleChange(!field.state.value)}
												iconColor="primary"
											/>
										)}
									</form.Field>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<form.Field name="zimbraPasswordChangeListener">
										{(field) => (
											<Input
												label={t(
													'label.external_password_change_listener',
													'Endpoint to be used for password change'
												)}
												backgroundColor="gray5"
												value={field.state.value}
												onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
													field.handleChange(e.target.value);
												}}
											/>
										)}
									</form.Field>
								</Padding>
							</ListRow>
						</Container>
					</Row>
				</Container>
			</Container>

			<RouteLeavingGuard when={isDirty} onSave={handleSave} />
		</Container>
	);
};

export default DomainAuthentication;
