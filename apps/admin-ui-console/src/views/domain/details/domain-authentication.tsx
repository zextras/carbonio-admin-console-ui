/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsAdvanced, useUserSettings, useDomainStore } from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	PasswordInput,
	Popper,
	Row,
	Select,
	SelectItem,
	Switch,
	Text,
	Tooltip as TooltipDefault,
	useSnackbar
} from '@zextras/carbonio-design-system';
import _ from 'lodash';
import React, { FC, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute, objectType } from '../../../../types';
import { CHECK_OK, DISABLED, ENABLED, TRUE, ZIMBRA_ADMIN_URN } from '../../../constants';
import { CheckAuthConfig } from '../../../services/check-auth-config-service';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { isValidLdapBaseUrl } from '../../utility/utils';

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
					<Text size="extrasmall" color="text" key={item.label}>
						{item.label}
					</Text>
				</Padding>
			))}
		</Padding>
	</Container>
);

const DomainAuthentication: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const [isDirty, setIsDirty] = useState<boolean>(false);

	const [domainAuthData, setDomainAuthData] = useState<objectType>({});

	const [zimbraAuthMech, setZimbraAuthMech] = useState<any>();
	const [zimbraPasswordChangeListener, setZimbraPasswordChangeListener] = useState<string>('');
	const [zimbraAuthFallbackToLocal, setZimbraAuthFallbackToLocal] = useState<boolean>(false);
	const [zimbraAuthLdapURL, setZimbraAuthLdapURL] = useState<string>('');
	const [zimbraAuthLdapSearchBindDn, setZimbraAuthLdapSearchBindDn] = useState<string>('');
	const [zimbraAuthLdapSearchBindPassword, setZimbraAuthLdapSearchBindPassword] =
		useState<string>('');
	const [zimbraAuthLdapStartTlsEnabled, setZimbraAuthLdapStartTlsEnabled] =
		useState<boolean>(false);
	const [zimbraAuthLdapSearchFilter, setZimbraAuthLdapSearchFilter] = useState<string>('');
	const [zimbraAuthLdapSearchBase, setZimbraAuthLdapSearchBase] = useState<string>('');
	const [zimbraFeatureResetPasswordStatus, setZimbraFeatureResetPasswordStatus] =
		useState<boolean>(false);

	const [toggleLoginVerifyBtn, setToggleLoginVerifyBtn] = useState<boolean>(true);
	const [isSuccessVerify, setIsSuccessVerify] = useState<boolean>(false);
	const [isValidUserName, setIsValidUserName] = useState<boolean>(true);
	const [isValidPassword, setIsValidPassword] = useState<boolean>(true);
	const [verifyAuthUserName, setVerifyAuthUserName] = useState<string>('');
	const [verifyAuthPassword, setVerifyAuthPassword] = useState<string>('');

	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);

	const [open, setOpen] = useState(false);
	const iconRef = useRef<HTMLDivElement>(null);
	const [isValidLdapDN, setIsValidLdapDn] = useState<boolean>(true);
	const [isValidLdapUrl, setIsValidLdapUrl] = useState<boolean>(true);
	const [ldapUrlOpen, setLdapUrlOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const ldapUrlIconRef = useRef<HTMLDivElement>(null);
	const filterIconRef = useRef<HTMLDivElement>(null);
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();

	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const isAdvanced = useIsAdvanced();
	const localLdapTrans = t(
		'label.method_allows_local_ldap_only',
		'This method allows usage of Local LDAP'
	);
	const DOMAIN_AUTH_LIST = useMemo(
		() => [
			{
				label: `${t('label.carbonio', 'Carbonio')}`,
				value: '',
				info_label: `${t(
					'domain.authentication.carbonio_info',
					'This method allows usage of Local LDAP, External AD/LDAP, Credential Password and SAML.'
				)}`,
				info_label_ce: `${localLdapTrans}`
			},
			{
				label: `${t('label.local_ldap_only', 'Local LDAP only')}`,
				value: ZimbraAuthMethod.INTERNAL,
				info_label: `${localLdapTrans}`,
				info_label_ce: `${localLdapTrans}`
			},
			{
				label: `${t('label.external_ldap_only', 'External LDAP only')}`,
				value: ZimbraAuthMethod.LDAP,
				info_label: `${t(
					'label.external_ldap_only_infor',
					'This method allows usage of external LDAP'
				)}`,
				info_label_ce: `${t(
					'label.external_ldap_only_info_ce',
					'This method allows usage of external LDAP'
				)}`
			},
			{
				label: `${t('label.external_ad_only', 'External AD only')}`,
				value: ZimbraAuthMethod.EXTERNAL,
				info_label: `${t(
					'label.external_ad_only_info',
					'This method allows usage of external AD'
				)}`,
				info_label_ce: `${t(
					'label.external_ad_only_info_ce',
					'This method allows usage of external AD'
				)}`
			}
		],
		[localLdapTrans, t]
	);

	const DN_TEMPLATE_TOOLTIP = useMemo(
		() => [
			{
				label: `%n = ${t('label.username_with', 'username with')} @ (${t(
					'label.example',
					'example'
				)} username@domain.tld)`
			},
			{
				label: `%u = ${t('label.username_without', 'username without')} @ (${t(
					'label.example',
					'example'
				)} username)`
			},
			{
				label: `%d = ${t('label.domain', 'domain')} (${t('label.example', 'example')} domain.tld)`
			},
			{
				label: `%D = ${t('label.domain', 'domain')} (${t(
					'label.example',
					'example'
				)} dc=domain,dc=tld)`
			}
		],
		[t]
	);

	const DnTemplateTooltip: FC = useCallback(
		() => <Tooltip items={DN_TEMPLATE_TOOLTIP} />,
		[DN_TEMPLATE_TOOLTIP]
	);

	const LDAP_URL_TOOLTIP = useMemo(
		() => [
			{
				label: `${t('label.ex', 'ex.')} ldap[s]://${t(
					'label.external_ldap_server',
					'external-ldap-server'
				)}${zimbraAuthMech?.value !== ZimbraAuthMethod.EXTERNAL ? '[:389]' : '[:3268]'}`
			}
		],
		[t, zimbraAuthMech]
	);

	const LdapUrlTooltip: FC = useCallback(
		() => <Tooltip items={LDAP_URL_TOOLTIP} />,
		[LDAP_URL_TOOLTIP]
	);

	const FILTER_TOOLTIP = useMemo(
		() => [
			{
				label: `${t('label.ex', 'ex.')} (ou=text)`
			}
		],
		[t]
	);

	const FilterTooltip: FC = useCallback(() => <Tooltip items={FILTER_TOOLTIP} />, [FILTER_TOOLTIP]);

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: Record<string, any> = {};
			domainInformation.forEach((item: Attribute) => {
				obj[item?.n] = item._content;
			});

			setZimbraAuthMech(
				obj.zimbraAuthMech
					? (DOMAIN_AUTH_LIST.find(
							(item: { value?: string }) => item.value === obj.zimbraAuthMech
						) ?? DOMAIN_AUTH_LIST[0])
					: DOMAIN_AUTH_LIST[0]
			);

			const setValue = <T extends string>(
				key: keyof typeof obj,
				setter: (value: T) => void,
				defaultValue: T
			): void => {
				const value = obj[key] ?? defaultValue;
				obj[key] = value;
				setter(value);
			};

			setValue<string>('zimbraPasswordChangeListener', setZimbraPasswordChangeListener, '');
			setValue<string>('zimbraAuthLdapURL', setZimbraAuthLdapURL, '');
			setValue<string>('zimbraAuthLdapSearchBindDn', setZimbraAuthLdapSearchBindDn, '');
			setValue<string>('zimbraAuthLdapSearchBindPassword', setZimbraAuthLdapSearchBindPassword, '');
			setValue<string>('zimbraAuthLdapSearchFilter', setZimbraAuthLdapSearchFilter, '');
			setValue<string>('zimbraAuthLdapSearchBase', setZimbraAuthLdapSearchBase, '');

			setZimbraAuthFallbackToLocal(obj.zimbraAuthFallbackToLocal === 'TRUE');
			setZimbraAuthLdapStartTlsEnabled(obj.zimbraAuthLdapStartTlsEnabled === 'TRUE');
			setZimbraFeatureResetPasswordStatus(obj.zimbraFeatureResetPasswordStatus === ENABLED);

			setDomainAuthData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, DOMAIN_AUTH_LIST]);

	useEffect(() => {
		if (
			!_.isEmpty(domainAuthData) &&
			domainAuthData.zimbraAuthMech !== undefined &&
			zimbraAuthMech?.value !== undefined
		) {
			if (domainAuthData.zimbraAuthMech !== zimbraAuthMech.value) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthMech]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraPasswordChangeListener !== zimbraPasswordChangeListener) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraPasswordChangeListener]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			const oldFallbackToLocalValue = domainAuthData.zimbraAuthFallbackToLocal === 'TRUE';
			if (oldFallbackToLocalValue !== zimbraAuthFallbackToLocal) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthFallbackToLocal]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapURL !== zimbraAuthLdapURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapURL]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapSearchBase !== zimbraAuthLdapSearchBase) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapSearchBase]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapSearchFilter !== zimbraAuthLdapSearchFilter) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapSearchFilter]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			const oldAuthLdapStartTlsValue = domainAuthData.zimbraAuthLdapStartTlsEnabled === 'TRUE';
			if (oldAuthLdapStartTlsValue !== zimbraAuthLdapStartTlsEnabled) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapStartTlsEnabled]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			const oldResetPasswordStatus = domainAuthData.zimbraFeatureResetPasswordStatus === ENABLED;
			if (oldResetPasswordStatus !== zimbraFeatureResetPasswordStatus) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraFeatureResetPasswordStatus]);

	const authFallbackToLocal = useCallback(() => setZimbraAuthFallbackToLocal((c) => !c), []);
	const authLdapStartTlsEnabled = useCallback(
		() => setZimbraAuthLdapStartTlsEnabled((c) => !c),
		[]
	);
	const resetPasswordStatusChange = useCallback(
		() => setZimbraFeatureResetPasswordStatus((c) => !c),
		[]
	);

	const onAuthMethodChange = useCallback(
		(v: SelectItem[] | string | null): void => {
			setZimbraAuthMech(DOMAIN_AUTH_LIST.find((item: { value: string }) => item.value === v));
			if (v === ZimbraAuthMethod.EXTERNAL || v === ZimbraAuthMethod.LDAP) {
				if (!zimbraAuthLdapURL) {
					setIsValidLdapUrl(false);
				}
			} else {
				setIsValidLdapDn(true);
				setIsValidLdapUrl(true);
			}
		},
		[DOMAIN_AUTH_LIST, zimbraAuthLdapURL]
	);

	const onCancel = (): void => {
		setZimbraAuthMech(
			DOMAIN_AUTH_LIST.find(
				(item: { value?: string }) => item.value === domainAuthData.zimbraAuthMech
			)
		);
		setZimbraPasswordChangeListener(domainAuthData.zimbraPasswordChangeListener);
		setZimbraAuthFallbackToLocal(domainAuthData.zimbraAuthFallbackToLocal === 'TRUE');
		setZimbraAuthLdapSearchBase(domainAuthData.zimbraAuthLdapSearchBase);
		setZimbraAuthLdapSearchFilter(domainAuthData.zimbraAuthLdapSearchFilter);
		setZimbraAuthLdapURL(domainAuthData.zimbraAuthLdapURL);
		setZimbraAuthLdapSearchBindDn(domainAuthData.zimbraAuthLdapSearchBindDn);
		setZimbraAuthLdapSearchBindPassword(domainAuthData.zimbraAuthLdapSearchBindPassword);
		setZimbraAuthLdapStartTlsEnabled(domainAuthData.zimbraAuthLdapStartTlsEnabled === 'TRUE');
		setZimbraFeatureResetPasswordStatus(
			domainAuthData.zimbraFeatureResetPasswordStatus === ENABLED
		);
		setIsDirty(false);
		setIsValidLdapDn(true);
		setIsValidLdapUrl(true);
	};

	const onSave = (): void => {
		const body: {
			id?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		const attributes: { n: string; _content?: string }[] = [];
		body.id = domainAuthData.zimbraId;
		body._jsns = ZIMBRA_ADMIN_URN;

		attributes.push({
			n: 'zimbraAuthMech',
			_content: zimbraAuthMech?.value
		});
		attributes.push({
			n: 'zimbraPasswordChangeListener',
			_content: zimbraPasswordChangeListener
		});
		if (zimbraAuthFallbackToLocal !== null) {
			attributes.push({
				n: 'zimbraAuthFallbackToLocal',
				_content: zimbraAuthFallbackToLocal ? 'TRUE' : 'FALSE'
			});
		}

		attributes.push({
			n: 'zimbraAuthLdapURL',
			_content: zimbraAuthLdapURL
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchBindDn',
			_content: zimbraAuthLdapSearchBindDn
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchBindPassword',
			_content: zimbraAuthLdapSearchBindPassword
		});

		attributes.push({
			n: 'zimbraAuthLdapStartTlsEnabled',
			_content: zimbraAuthLdapStartTlsEnabled ? 'TRUE' : 'FALSE'
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchFilter',
			_content: zimbraAuthLdapSearchFilter
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchBase',
			_content: zimbraAuthLdapSearchBase
		});
		if (isAdvanced) {
			attributes.push({
				n: 'zimbraFeatureResetPasswordStatus',
				_content: zimbraFeatureResetPasswordStatus ? ENABLED : DISABLED
			});
		}
		body.a = attributes;
		modifyDomain(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', domainAuthData.zimbraId).then((): void => {
						// no operation
					});
				}
				const domain: objectType = data?.domain[0];
				if (domain) {
					setDomain(domain);
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
	};

	useEffect(() => {
		if (
			(zimbraAuthMech?.value === 'ldap' || zimbraAuthMech?.value === 'ad') &&
			zimbraAuthLdapURL !== '' &&
			isValidLdapUrl &&
			zimbraAuthLdapSearchBindDn !== '' &&
			isValidUserName &&
			zimbraAuthLdapSearchBindPassword !== '' &&
			isValidPassword
		) {
			setIsSuccessVerify(false);
			setToggleLoginVerifyBtn(false);
		} else {
			setToggleLoginVerifyBtn(true);
		}
	}, [
		isValidLdapUrl,
		isValidPassword,
		isValidUserName,
		zimbraAuthLdapSearchBindDn,
		zimbraAuthLdapSearchBindPassword,
		zimbraAuthLdapURL,
		zimbraAuthMech?.value
	]);

	const handleClickLoginAndVerify = useCallback(() => {
		setToggleLoginVerifyBtn(true);
		const body: {
			name?: string;
			password?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		const attributes: { n: string; _content?: string }[] = [];
		body._jsns = ZIMBRA_ADMIN_URN;

		attributes.push({
			n: 'zimbraAuthMech',
			_content: zimbraAuthMech?.value
		});
		attributes.push({
			n: 'zimbraAuthLdapURL',
			_content: zimbraAuthLdapURL
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchFilter',
			_content: zimbraAuthLdapSearchFilter
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchBindDn',
			_content: zimbraAuthLdapSearchBindDn
		});
		attributes.push({
			n: 'zimbraAuthLdapSearchBindPassword',
			_content: zimbraAuthLdapSearchBindPassword
		});
		body.a = attributes;
		body.name = verifyAuthUserName;
		body.password = verifyAuthPassword;
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
					setToggleLoginVerifyBtn(false);
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
				setToggleLoginVerifyBtn(false);
			});
	}, [
		createSnackbar,
		t,
		verifyAuthPassword,
		verifyAuthUserName,
		zimbraAuthLdapSearchBindDn,
		zimbraAuthLdapSearchBindPassword,
		zimbraAuthLdapSearchFilter,
		zimbraAuthLdapURL,
		zimbraAuthMech?.value
	]);

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
								<Text size="medium" weight="bold" color="gray0">
									{t('label.authentication', 'Authentication')}
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
											data-testid={'cancel-button'}
											label={t('label.cancel', 'Cancel')}
											color="secondary"
											onClick={onCancel}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button
										data-testid={'save-button'}
										label={t('label.save', 'Save')}
										color="primary"
										onClick={onSave}
										disabled={!isValidLdapUrl || !isValidLdapDN}
									/>
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
									<Text size="small" color="gray0" weight="bold">
										{t('label.auth_method', 'Auth Method')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Select
										data-testid={'auth-method-select'}
										background="gray5"
										label={t('label.your_auth_method_is', 'Your Auth Method is')}
										showCheckbox={false}
										items={DOMAIN_AUTH_LIST}
										selection={zimbraAuthMech}
										onChange={onAuthMethodChange}
									></Select>
									<Padding top="medium">
										{zimbraAuthMech && (
											<Text size="small" color="gray1">
												{isAdvanced ? zimbraAuthMech.info_label : zimbraAuthMech.info_label_ce}
											</Text>
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
										disableRestoreFocus
									>
										<DnTemplateTooltip />
									</Popper>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.url', 'URL')}
										value={zimbraAuthLdapURL}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value) {
												const validLdapUrl = isValidLdapBaseUrl(e.target.value);
												setIsValidLdapUrl(validLdapUrl);
											} else if (
												zimbraAuthMech?.value === ZimbraAuthMethod.EXTERNAL ||
												zimbraAuthMech?.value === ZimbraAuthMethod.LDAP
											) {
												setIsValidLdapUrl(false);
											} else {
												setIsValidLdapUrl(true);
											}
											setZimbraAuthLdapURL(e.target.value);
										}}
										hasError={!isValidLdapUrl}
										CustomIcon={(): React.ReactElement => (
											<Container
												ref={ldapUrlIconRef}
												onMouseEnter={(): void => setLdapUrlOpen(true)}
												onMouseLeave={(): void => setLdapUrlOpen(false)}
											>
												<Icon icon="QuestionMarkCircleOutline" size="large" color="secondary" />
											</Container>
										)}
									/>
									{!isValidLdapUrl && (
										<Row>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												width="fill"
											>
												<Padding top="small">
													<Text size="extrasmall" weight="regular" color="error">
														{zimbraAuthLdapURL
															? t('label.ldap_url_is_not_valid', 'Ldap url is not valid')
															: t('label.required', 'Required')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
									<Popper
										open={ldapUrlOpen}
										anchorEl={ldapUrlIconRef as RefObject<HTMLElement>}
										placement="top-end"
										onClose={(): void => setLdapUrlOpen(false)}
										disableRestoreFocus
									>
										<LdapUrlTooltip />
									</Popper>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.filter', 'Filter')}
										value={zimbraAuthLdapSearchFilter}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraAuthLdapSearchFilter(e.target.value);
										}}
										CustomIcon={(): React.ReactElement => (
											<Container
												ref={filterIconRef}
												onMouseEnter={(): void => setFilterOpen(true)}
												onMouseLeave={(): void => setFilterOpen(false)}
											>
												<Icon icon="QuestionMarkCircleOutline" size="large" color="secondary" />
											</Container>
										)}
									/>
									<Popper
										open={filterOpen}
										anchorEl={filterIconRef as RefObject<HTMLElement>}
										placement="top-end"
										onClose={(): void => setFilterOpen(false)}
										disableRestoreFocus
									>
										<FilterTooltip />
									</Popper>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.search_base', 'Basic Search')}
										value={zimbraAuthLdapSearchBase}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraAuthLdapSearchBase(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('domain.authentication.search_bind_user', 'Search Bind User')}
										value={zimbraAuthLdapSearchBindDn}
										backgroundColor="gray5"
										inputName="user"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value !== '') {
												setIsValidUserName(true);
											} else {
												setIsValidUserName(false);
											}
											setZimbraAuthLdapSearchBindDn(e.target.value);
										}}
									/>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<PasswordInput
										label={t('domain.authentication.search_bind_password', 'Search Bind Password')}
										backgroundColor="gray5"
										inputName="zimbraQuotaWarnInterval"
										value={zimbraAuthLdapSearchBindPassword}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value !== '') {
												setIsValidPassword(true);
											} else {
												setIsValidPassword(false);
											}
											setZimbraAuthLdapSearchBindPassword(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Divider color="gray2" />
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.verify_auth', 'Verify Auth')}
									</Text>
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
										hasError={!isValidPassword}
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
										disabled={toggleLoginVerifyBtn}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Divider color="gray2" />
								</Padding>
							</ListRow>
							<Padding horizontal="small" width="90%"></Padding>
							<ListRow>
								{isAdvanced && (
									<Padding vertical="small" horizontal="small" width="70%">
										<Switch
											data-testid="reset-password-switch"
											value={zimbraFeatureResetPasswordStatus}
											label={t(
												'label.show_forget_password_link',
												'Show "Forget Password" link in the login page'
											)}
											onClick={resetPasswordStatusChange}
											iconColor="primary"
										/>
									</Padding>
								)}
								<Padding vertical="small" horizontal="small" width="100%">
									<TooltipDefault
										label={
											zimbraAuthFallbackToLocal === null
												? t(
														'label.enable_global_enforce_external_auth_ldap',
														'You must enable the Global Enforce External Auth (LDAP/AD) first'
													)
												: t(
														'label.please_add_ldap_url_endpoint_first',
														'To enable this, please add a ldap URL endpoint first'
													)
										}
										disabled={
											!(
												zimbraAuthFallbackToLocal === null || !isValidLdapBaseUrl(zimbraAuthLdapURL)
											)
										}
									>
										<Switch
											value={!!zimbraAuthFallbackToLocal && isValidLdapBaseUrl(zimbraAuthLdapURL)}
											label={t('label.enforce_external_auth', 'Enforce External Auth (LDAP/AD)')}
											onClick={authFallbackToLocal}
											iconColor="primary"
											disabled={
												zimbraAuthFallbackToLocal === null || !isValidLdapBaseUrl(zimbraAuthLdapURL)
											}
										/>
									</TooltipDefault>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
										data-testid={'enable-secure-connection'}
										value={zimbraAuthLdapStartTlsEnabled}
										label={t(
											'label.enable_secure_connection',
											'Enable Secure Connection (StartTLS/SSL)'
										)}
										onClick={authLdapStartTlsEnabled}
										iconColor="primary"
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t(
											'label.external_password_change_listener',
											'Endpoint to be used for password change'
										)}
										backgroundColor="gray5"
										value={zimbraPasswordChangeListener}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											setZimbraPasswordChangeListener(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
						</Container>
					</Row>
				</Container>
			</Container>

			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};

export default DomainAuthentication;
