/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	RefObject,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';

import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	SnackbarManagerContext,
	Switch,
	Select,
	Icon,
	Popper
} from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { Attribute, CreateSnackbarType, objectType } from '../../../../types';
import { CHECK_OK, DISABLED, ENABLED, TRUE } from '../../../constants';
import { CheckAuthConfig } from '../../../services/check-auth-config-service';
import { flushCache } from '../../../services/flush-cache-service';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useAuthIsAdvanced } from '../../../store/auth-advanced/store';
import { useDomainStore } from '../../../store/domain/store';
import ListRow from '../../list/list-row';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { isValidLdapBaseDN, isValidLdapBaseUrl } from '../../utility/utils';

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
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraAuthMech, setZimbraAuthMech] = useState<any>();
	const [zimbraPasswordChangeListener, setZimbraPasswordChangeListener] = useState<string>('');
	const [zimbraAuthFallbackToLocal, setZimbraAuthFallbackToLocal] = useState<boolean | null>(null);
	const [domainAuthData, setDomainAuthData] = useState<objectType>({});
	const [zimbraAuthLdapBindDn, setZimbraAuthLdapBindDn] = useState<string>('');
	const [zimbraAuthLdapURL, setZimbraAuthLdapURL] = useState<string>('');
	const [zimbraAuthLdapStartTlsEnabled, setZimbraAuthLdapStartTlsEnabled] =
		useState<boolean>(false);
	const [zimbraAuthLdapSearchFilter, setZimbraAuthLdapSearchFilter] = useState<string>('');
	const [zimbraAuthLdapSearchBase, setZimbraAuthLdapSearchBase] = useState<string>('');
	const [userName, setUserName] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [toggleLoginVerfyBtn, setToggleLoginVerfyBtn] = useState<boolean>(true);
	const [isSuccessVerify, setIsSuccessVerify] = useState<boolean>(false);
	const [isValidUserName, setIsValidUserName] = useState<boolean>(true);
	const [isValidPassword, setIsValidPassword] = useState<boolean>(true);
	const createSnackbar: (options: CreateSnackbarType) => void = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);

	const [open, setOpen] = useState(false);
	const iconRef: RefObject<HTMLDivElement> = useRef(null);
	const [isValidLdapDN, setIsValidLdapDn] = useState<boolean>(true);
	const [isValidLdapUrl, setIsValidLdapUrl] = useState<boolean>(true);
	const [ldapUrlOpen, setLdapUrlOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const ldapUrlIconRef: RefObject<HTMLDivElement> = useRef(null);
	const filterIconRef: RefObject<HTMLDivElement> = useRef(null);
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
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [zimbraFeatureResetPasswordStatus, setZimbraFeatureResetPasswordStatus] =
		useState<boolean>(false);

	const DOMAIN_AUTH_LIST = useMemo(
		() => [
			{ label: `${t('label.default', 'Default')}`, value: '' },
			{ label: `${t('label.local_ldap', 'Local LDAP')}`, value: ZimbraAuthMethod.INTERNAL },
			{ label: `${t('label.external_ldap', 'External LDAP')}`, value: ZimbraAuthMethod.LDAP },
			{
				label: `${t('label.external_active_directory', 'External Active Directory')}`,
				value: ZimbraAuthMethod.EXTERNAL
			}
		],
		[t]
	);

	const DN_TEMPLATE_TOOLTIP = useMemo(
		() => [
			{
				label: `%n = ${t('label.username_with', 'username with')} @ (${t(
					// eslint-disable-next-line sonarjs/no-duplicate-string
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
				)}[:389]`
			}
		],
		[t]
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: objectType = {};
			domainInformation.forEach((item: Attribute) => {
				obj[item?.n] = item._content;
			});
			setZimbraAuthMech(
				obj.zimbraAuthMech
					? DOMAIN_AUTH_LIST.find((item: { value?: string }) => item.value === obj.zimbraAuthMech)
					: DOMAIN_AUTH_LIST[0]
			);
			if (!obj.zimbraAuthMech) {
				obj.zimbraAuthMech = '';
			}
			if (obj.zimbraPasswordChangeListener) {
				setZimbraPasswordChangeListener(obj.zimbraPasswordChangeListener);
			} else {
				obj.zimbraPasswordChangeListener = '';
			}
			if (obj.zimbraAuthFallbackToLocal !== null) {
				setZimbraAuthFallbackToLocal(
					obj.zimbraAuthFallbackToLocal === 'TRUE' && isValidLdapBaseUrl(obj.zimbraAuthLdapURL)
				);
			}
			if (obj.zimbraAuthLdapBindDn) {
				setZimbraAuthLdapBindDn(obj.zimbraAuthLdapBindDn);
			} else {
				obj.zimbraAuthLdapBindDn = '';
			}
			if (obj.zimbraAuthLdapURL) {
				setZimbraAuthLdapURL(obj.zimbraAuthLdapURL);
			} else {
				obj.zimbraAuthLdapURL = '';
			}
			if (obj.zimbraAuthLdapSearchFilter) {
				setZimbraAuthLdapSearchFilter(obj.zimbraAuthLdapSearchFilter);
			} else {
				obj.zimbraAuthLdapSearchFilter = '';
			}
			if (obj.zimbraAuthLdapSearchBase) {
				setZimbraAuthLdapSearchBase(obj.zimbraAuthLdapSearchBase);
			} else {
				obj.zimbraAuthLdapSearchBase = '';
			}
			if (obj.zimbraAuthLdapStartTlsEnabled) {
				setZimbraAuthLdapStartTlsEnabled(obj.zimbraAuthLdapStartTlsEnabled === 'TRUE');
			}
			if (obj.zimbraFeatureResetPasswordStatus) {
				setZimbraFeatureResetPasswordStatus(obj.zimbraFeatureResetPasswordStatus === ENABLED);
			}
			setDomainAuthData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, DOMAIN_AUTH_LIST]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthMech !== zimbraAuthMech?.value) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthMech]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraPasswordChangeListener !== zimbraPasswordChangeListener) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraPasswordChangeListener]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			const oldFallbacktoLocalValue = domainAuthData.zimbraAuthFallbackToLocal === 'TRUE';
			if (oldFallbacktoLocalValue !== zimbraAuthFallbackToLocal) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthFallbackToLocal]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapBindDn !== zimbraAuthLdapBindDn) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapBindDn]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapURL !== zimbraAuthLdapURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapURL]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapSearchBase !== zimbraAuthLdapSearchBase) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapSearchBase]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
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
	const resetPassowrdStatusChange = useCallback(
		() => setZimbraFeatureResetPasswordStatus((c) => !c),
		[]
	);

	const onAuthMethodChange = useCallback(
		(v): void => {
			setZimbraAuthMech(DOMAIN_AUTH_LIST.find((item: { value: string }) => item.value === v));
			if (v === ZimbraAuthMethod.EXTERNAL || v === ZimbraAuthMethod.LDAP) {
				if (!zimbraAuthLdapBindDn) {
					setIsValidLdapDn(false);
				}
				if (!zimbraAuthLdapURL) {
					setIsValidLdapUrl(false);
				}
			} else {
				setIsValidLdapDn(true);
				setIsValidLdapUrl(true);
			}
		},
		[DOMAIN_AUTH_LIST, zimbraAuthLdapBindDn, zimbraAuthLdapURL]
	);

	const onCancel = (): void => {
		setZimbraAuthMech(
			DOMAIN_AUTH_LIST.find(
				(item: { value?: string }) => item.value === domainAuthData.zimbraAuthMech
			)
		);
		setZimbraPasswordChangeListener(domainAuthData.zimbraPasswordChangeListener);
		setZimbraAuthFallbackToLocal(domainAuthData.zimbraAuthFallbackToLocal === 'TRUE');
		setZimbraAuthLdapBindDn(domainAuthData.zimbraAuthLdapBindDn);
		setZimbraAuthLdapSearchBase(domainAuthData.zimbraAuthLdapSearchBase);
		setZimbraAuthLdapSearchFilter(domainAuthData.zimbraAuthLdapSearchFilter);
		setZimbraAuthLdapURL(domainAuthData.zimbraAuthLdapURL);
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
		body._jsns = 'urn:zimbraAdmin';

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
			n: 'zimbraAuthLdapBindDn',
			_content: zimbraAuthLdapBindDn
		});
		attributes.push({
			n: 'zimbraAuthLdapURL',
			_content: zimbraAuthLdapURL
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
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', domainAuthData.zimbraId);
				}
				const domain: objectType = data?.domain[0];
				if (domain) {
					setDomain(domain);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	useEffect(() => {
		if (
			(zimbraAuthMech?.value === 'ldap' || zimbraAuthMech?.value === 'ad') &&
			isValidLdapDN &&
			zimbraAuthLdapBindDn !== '' &&
			zimbraAuthLdapURL !== '' &&
			isValidLdapUrl &&
			userName !== '' &&
			isValidUserName &&
			password !== '' &&
			isValidPassword
		) {
			setIsSuccessVerify(false);
			setToggleLoginVerfyBtn(false);
		} else {
			setToggleLoginVerfyBtn(true);
		}
	}, [
		isValidLdapDN,
		isValidLdapUrl,
		isValidPassword,
		isValidUserName,
		password,
		userName,
		zimbraAuthLdapBindDn,
		zimbraAuthLdapURL,
		zimbraAuthMech?.value
	]);

	const handleClickLoginAndVarify = useCallback(() => {
		setToggleLoginVerfyBtn(true);
		const body: {
			name?: string;
			password?: string;
			_jsns?: string;
			a?: { n: string; _content?: string }[];
		} = {};
		const attributes: { n: string; _content?: string }[] = [];
		body._jsns = 'urn:zimbraAdmin';

		attributes.push({
			n: 'zimbraAuthMech',
			_content: zimbraAuthMech?.value
		});
		attributes.push({
			n: 'zimbraAuthLdapURL',
			_content: zimbraAuthLdapURL
		});
		attributes.push({
			n: 'zimbraAuthLdapBindDn',
			_content: zimbraAuthLdapBindDn
		});
		body.a = attributes;
		body.name = userName;
		body.password = password;
		CheckAuthConfig(body)
			.then((response) => {
				if (response?.code[0]?._content === CHECK_OK) {
					setIsSuccessVerify(true);
				} else {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 5000,
						hideButton: true,
						replace: true
					});
					setToggleLoginVerfyBtn(false);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 5000,
					hideButton: true,
					replace: true
				});
				setToggleLoginVerfyBtn(false);
			});
	}, [
		createSnackbar,
		password,
		t,
		userName,
		zimbraAuthLdapBindDn,
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
											label={t('label.cancel', 'Cancel')}
											color="secondary"
											onClick={onCancel}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button
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
										background="gray5"
										label={t('label.your_auth_method_is', 'Your Auth Method is')}
										showCheckbox={false}
										items={DOMAIN_AUTH_LIST}
										selection={zimbraAuthMech}
										onChange={onAuthMethodChange}
									></Select>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.bind_dn_template', 'Bind Distinguished Name (DN) Template')}
										value={zimbraAuthLdapBindDn}
										backgroundColor="gray5"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value) {
												const validLdapDn = isValidLdapBaseDN(e.target.value);
												setIsValidLdapDn(validLdapDn);
											} else if (
												zimbraAuthMech?.value === ZimbraAuthMethod.EXTERNAL ||
												zimbraAuthMech?.value === ZimbraAuthMethod.LDAP
											) {
												setIsValidLdapDn(false);
											} else {
												setIsValidLdapDn(true);
											}
											setZimbraAuthLdapBindDn(e.target.value);
										}}
										hasError={!isValidLdapDN}
										CustomIcon={(): React.ReactElement => (
											<Container
												ref={iconRef}
												onMouseEnter={(): void => setOpen(true)}
												onMouseLeave={(): void => setOpen(false)}
											>
												<Icon icon="QuestionMarkCircleOutline" size="large" color="secondary" />
											</Container>
										)}
									/>
									{!isValidLdapDN && (
										<Row>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												width="fill"
											>
												<Padding top="small">
													<Text size="extrasmall" weight="regular" color="error">
														{zimbraAuthLdapBindDn
															? t('label.base_dn_is_not_valid', 'Base DN is not valid')
															: // eslint-disable-next-line sonarjs/no-duplicate-string
															  t('label.required', 'Required')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
									<Popper
										open={open}
										anchorEl={iconRef}
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
										anchorEl={ldapUrlIconRef}
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
										anchorEl={filterIconRef}
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
								<Padding vertical="small" horizontal="small" width="38%">
									<Input
										label={t('label.user', 'User')}
										value={userName}
										backgroundColor="gray5"
										inputName="user"
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value !== '') {
												setIsValidUserName(true);
											} else {
												setIsValidUserName(false);
											}
											setUserName(e.target.value);
										}}
										hasError={!isValidUserName}
									/>
									{!isValidUserName && (
										<Row>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												width="fill"
											>
												<Padding top="small">
													<Text size="extrasmall" weight="regular" color="error">
														{t('label.required', 'Required')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
								</Padding>
								<Padding vertical="small" horizontal="small" width="38%">
									<Input
										label={t('label.password', 'Password')}
										backgroundColor="gray5"
										inputName="zimbraQuotaWarnInterval"
										value={password}
										onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
											if (e.target.value !== '') {
												setIsValidPassword(true);
											} else {
												setIsValidPassword(false);
											}
											setPassword(e.target.value);
										}}
										hasError={!isValidPassword}
									/>
									{!isValidPassword && (
										<Row>
											<Container
												mainAlignment="flex-start"
												crossAlignment="flex-start"
												width="fill"
											>
												<Padding top="small">
													<Text size="extrasmall" weight="regular" color="error">
														{t('label.required', 'Required')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
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
										onClick={handleClickLoginAndVarify}
										disabled={toggleLoginVerfyBtn}
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
											value={zimbraFeatureResetPasswordStatus}
											label={t(
												'label.show_forget_password_link',
												'Show "Forget Password" link in the login page'
											)}
											onClick={resetPassowrdStatusChange}
											iconColor="primary"
										/>
									</Padding>
								)}
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
										value={!!zimbraAuthFallbackToLocal}
										label={t('label.enforce_external_auth', 'Enforce External Auth (LDAP/AD)')}
										onClick={authFallbackToLocal}
										iconColor="primary"
										disabled={
											zimbraAuthFallbackToLocal === null || !isValidLdapBaseUrl(zimbraAuthLdapURL)
										}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
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
