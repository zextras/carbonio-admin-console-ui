/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';
import { isValidLdapBaseDN, isValidLdapBaseUrl } from '../../utility/utils';

const ZimbraAuthMethod = {
	INTERNAL: 'zimbra',
	LDAP: 'ldap',
	EXTERNAL: 'ad'
} as const;

const Tooltip: FC<{ items: any[] }> = ({ items }) => (
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
	const [zimbraAdminConsoleLogoutURL, setZimbraAdminConsoleLogoutURL] = useState<string>('');
	const [zimbraWebClientLogoutURL, setZimbraWebClientLogoutURL] = useState<string>('');
	const [zimbraAuthFallbackToLocal, setZimbraAuthFallbackToLocal] = useState<boolean>(false);
	const [zimbraForceClearCookies, setZimbraForceClearCookies] = useState<boolean>(false);
	const [domainAuthData, setDomainAuthData]: any = useState({});
	const [zimbraAuthLdapBindDn, setZimbraAuthLdapBindDn] = useState<string>('');
	const [zimbraAuthLdapURL, setZimbraAuthLdapURL] = useState<string>('');
	const [zimbraAuthLdapStartTlsEnabled, setZimbraAuthLdapStartTlsEnabled] =
		useState<boolean>(false);
	const [zimbraAuthLdapSearchFilter, setZimbraAuthLdapSearchFilter] = useState<string>('');
	const [zimbraAuthLdapSearchBase, setZimbraAuthLdapSearchBase] = useState<string>('');
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const setDomain = useDomainStore((state) => state.setDomain);

	const [open, setOpen] = useState(false);
	const iconRef = useRef(undefined);
	const [isValidLdapDN, setIsValidLdapDn] = useState<boolean>(true);
	const [isValidLdapUrl, setIsValidLdapUrl] = useState<boolean>(true);

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

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setZimbraAuthMech(
				obj.zimbraAuthMech
					? DOMAIN_AUTH_LIST.find((item: any) => item.value === obj.zimbraAuthMech)
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
			if (obj.zimbraAdminConsoleLogoutURL) {
				setZimbraAdminConsoleLogoutURL(obj.zimbraAdminConsoleLogoutURL);
			} else {
				obj.zimbraAdminConsoleLogoutURL = '';
			}
			if (obj.zimbraWebClientLogoutURL) {
				setZimbraWebClientLogoutURL(obj.zimbraWebClientLogoutURL);
			} else {
				obj.zimbraWebClientLogoutURL = '';
			}
			if (obj.zimbraAuthFallbackToLocal) {
				setZimbraAuthFallbackToLocal(obj.zimbraAuthFallbackToLocal === 'TRUE');
			}
			if (obj.zimbraForceClearCookies) {
				setZimbraForceClearCookies(obj.zimbraForceClearCookies === 'TRUE');
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
			setDomainAuthData(obj);
			setIsDirty(false);
		}
	}, [domainInformation, DOMAIN_AUTH_LIST]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthMech !== zimbraAuthMech?.value) {
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
			const oldFallbacktoLocalValue = domainAuthData.zimbraAuthFallbackToLocal === 'TRUE';
			if (oldFallbacktoLocalValue !== zimbraAuthFallbackToLocal) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthFallbackToLocal]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAdminConsoleLogoutURL !== zimbraAdminConsoleLogoutURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAdminConsoleLogoutURL]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLogoutURL !== zimbraWebClientLogoutURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLogoutURL]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			const oldForceClearCookiesValue = domainAuthData.zimbraForceClearCookies === 'TRUE';
			if (oldForceClearCookiesValue !== zimbraForceClearCookies) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraForceClearCookies]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraAuthLdapBindDn !== zimbraAuthLdapBindDn) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAuthLdapBindDn]);

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

	const forceClearCookies = useCallback(() => setZimbraForceClearCookies((c) => !c), []);
	const authFallbackToLocal = useCallback(() => setZimbraAuthFallbackToLocal((c) => !c), []);
	const authLdapStartTlsEnabled = useCallback(
		() => setZimbraAuthLdapStartTlsEnabled((c) => !c),
		[]
	);

	const onAuthMethodChange = useCallback(
		(v: string): void => {
			setZimbraAuthMech(
				DOMAIN_AUTH_LIST.find(
					// eslint-disable-next-line max-len
					(item: any) => item.value === v
				)
			);
		},
		[setZimbraAuthMech, DOMAIN_AUTH_LIST]
	);

	const onCancel = (): void => {
		setZimbraAuthMech(
			DOMAIN_AUTH_LIST.find((item: any) => item.value === domainAuthData.zimbraAuthMech)
		);
		setZimbraPasswordChangeListener(domainAuthData.zimbraPasswordChangeListener);
		setZimbraAdminConsoleLogoutURL(domainAuthData.zimbraAdminConsoleLogoutURL);
		setZimbraWebClientLogoutURL(domainAuthData.zimbraWebClientLogoutURL);
		setZimbraAuthFallbackToLocal(domainAuthData.zimbraAuthFallbackToLocal === 'TRUE');
		setZimbraForceClearCookies(domainAuthData.zimbraForceClearCookies === 'TRUE');
		setZimbraAuthLdapBindDn(domainAuthData.zimbraAuthLdapBindDn);
		setZimbraAuthLdapSearchBase(domainAuthData.zimbraAuthLdapSearchBase);
		setZimbraAuthLdapSearchFilter(domainAuthData.zimbraAuthLdapSearchFilter);
		setZimbraAuthLdapURL(domainAuthData.zimbraAuthLdapURL);
		setZimbraAuthLdapStartTlsEnabled(domainAuthData.zimbraAuthLdapStartTlsEnabled === 'TRUE');
		setIsDirty(false);
		setIsValidLdapDn(true);
		setIsValidLdapUrl(true);
	};

	const onSave = (): void => {
		const body: any = {};
		const attributes: any[] = [];
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
		attributes.push({
			n: 'zimbraAdminConsoleLogoutURL',
			_content: zimbraAdminConsoleLogoutURL
		});
		attributes.push({
			n: 'zimbraWebClientLogoutURL',
			_content: zimbraWebClientLogoutURL
		});
		attributes.push({
			n: 'zimbraAuthFallbackToLocal',
			_content: zimbraAuthFallbackToLocal ? 'TRUE' : 'FALSE'
		});
		attributes.push({
			n: 'zimbraForceClearCookies',
			_content: zimbraForceClearCookies ? 'TRUE' : 'FALSE'
		});
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
		body.a = attributes;
		modifyDomain(body)
			.then((response) => response.json())
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const domain: any = data?.Body?.ModifyDomainResponse?.domain[0];
				if (domain) {
					setDomain(domain);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							padding={{ all: 'small' }}
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							className="ff"
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
										label={t('label.bind_dn_template', 'Bind DN Template')}
										value={zimbraAuthLdapBindDn}
										background="gray5"
										onChange={(e: any): any => {
											if (e.target.value) {
												const validLdapDn = isValidLdapBaseDN(e.target.value);
												setIsValidLdapDn(validLdapDn);
											} else {
												setIsValidLdapDn(true);
											}
											setZimbraAuthLdapBindDn(e.target.value);
										}}
										hasError={!isValidLdapDN}
										CustomIcon={(): any => (
											<Container
												ref={iconRef} // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
												onMouseEnter={() => setOpen(true)}
												// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
												onMouseLeave={() => setOpen(false)}
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
														{t('label.base_dn_is_not_valid', 'Base DN is not valid')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
									<Popper
										open={open}
										anchorEl={iconRef}
										placement="top-end"
										// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
										onClose={() => setOpen(false)}
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
										background="gray5"
										onChange={(e: any): any => {
											if (e.target.value) {
												const validLdapUrl = isValidLdapBaseUrl(e.target.value);
												setIsValidLdapUrl(validLdapUrl);
											} else {
												setIsValidLdapUrl(true);
											}
											setZimbraAuthLdapURL(e.target.value);
										}}
										hasError={!isValidLdapUrl}
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
														{t('label.ldap_url_is_not_valid', 'Ldap url is not valid')}
													</Text>
												</Padding>
											</Container>
										</Row>
									)}
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.filter', 'Filter')}
										value={zimbraAuthLdapSearchFilter}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraAuthLdapSearchFilter(e.target.value);
										}}
									/>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.search_base', 'Search Base')}
										value={zimbraAuthLdapSearchBase}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraAuthLdapSearchBase(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
										value={zimbraAuthLdapStartTlsEnabled}
										label={t('label.enable_start_tls', 'Enable StartTLS')}
										onClick={authLdapStartTlsEnabled}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
										value={zimbraAuthFallbackToLocal}
										label={t(
											'label.fall_back_to_local_msg',
											'Fall back to local password management in case of failure'
										)}
										onClick={authFallbackToLocal}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t(
											'label.external_password_change_listener',
											'External Password change listener'
										)}
										background="gray5"
										value={zimbraPasswordChangeListener}
										onChange={(e: any): any => {
											setZimbraPasswordChangeListener(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.console_redirection', 'Console Redirection')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t(
											'label.sso_logout_redirect_admin_to_msg',
											'SSO Logout will redirect the admin to'
										)}
										background="gray5"
										value={zimbraAdminConsoleLogoutURL}
										onChange={(e: any): any => {
											setZimbraAdminConsoleLogoutURL(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="large" horizontal="small" width="100%">
									<Text size="small" color="gray0" weight="bold">
										{t('label.web_client', 'Web Client')}
									</Text>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.logout_redirect_url', 'Logout Redirect URL')}
										background="gray5"
										value={zimbraWebClientLogoutURL}
										onChange={(e: any): any => {
											setZimbraWebClientLogoutURL(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Switch
										value={zimbraForceClearCookies}
										label={t('label.auto_logout_users', 'Auto Logout Users')}
										onClick={forceClearCookies}
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
