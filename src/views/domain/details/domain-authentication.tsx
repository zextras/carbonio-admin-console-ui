/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Padding,
	Divider,
	Text,
	Input,
	Button,
	SnackbarManagerContext,
	Switch
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { modifyDomain } from '../../../services/modify-domain-service';
import { useDomainStore } from '../../../store/domain/store';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import ListRow from '../../list/list-row';

const ZimbraAuthMethod = {
	INTERNAL: 'zimbra',
	LDAP: 'ldap',
	EXTERNAL: 'ad'
} as const;

const DomainAuthentication: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraAuthMech, setZimbraAuthMech] = useState<string>('');
	const [zimbraPasswordChangeListener, setZimbraPasswordChangeListener] = useState<string>('');
	const [zimbraAdminConsoleLoginURL, setZimbraAdminConsoleLoginURL] = useState<string>('');
	const [zimbraAdminConsoleLogoutURL, setZimbraAdminConsoleLogoutURL] = useState<string>('');
	const [zimbraWebClientLogoutURL, setZimbraWebClientLogoutURL] = useState<string>('');
	const [zimbraWebClientLogoutURLAllowedUA, setZimbraWebClientLogoutURLAllowedUA] =
		useState<string>('');
	const [zimbraWebClientLogoutURLAllowedIP, setZimbraWebClientLogoutURLAllowedIP] =
		useState<string>('');
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

	useEffect(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: any = {};
			domainInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (obj.zimbraAuthMech) {
				setZimbraAuthMech(obj.zimbraAuthMech);
			} else {
				setZimbraAuthMech(ZimbraAuthMethod.INTERNAL);
			}
			if (obj.zimbraPasswordChangeListener) {
				setZimbraPasswordChangeListener(obj.zimbraPasswordChangeListener);
			} else {
				obj.zimbraPasswordChangeListener = '';
			}
			if (obj.zimbraAdminConsoleLoginURL) {
				setZimbraAdminConsoleLoginURL(obj.zimbraAdminConsoleLoginURL);
			} else {
				obj.zimbraAdminConsoleLoginURL = '';
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
			if (obj.zimbraWebClientLogoutURLAllowedUA) {
				setZimbraWebClientLogoutURLAllowedUA(obj.zimbraWebClientLogoutURLAllowedUA);
			} else {
				obj.zimbraWebClientLogoutURLAllowedUA = '';
			}
			if (obj.zimbraWebClientLogoutURLAllowedIP) {
				setZimbraWebClientLogoutURLAllowedIP(obj.zimbraWebClientLogoutURLAllowedIP);
			} else {
				obj.zimbraWebClientLogoutURLAllowedIP = '';
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
	}, [domainInformation]);

	const authMechLabel = useMemo(() => {
		const labels: any = {
			ad: t('label.external_active_directory', 'External Active Directory'),
			zimbra: t('label.internal', 'Internal'),
			ldap: t('label.external_ldap', 'External LDAP')
		};
		return labels;
	}, [t]);

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
			if (domainAuthData.zimbraAdminConsoleLoginURL !== zimbraAdminConsoleLoginURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraAdminConsoleLoginURL]);

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
			if (domainAuthData.zimbraWebClientLogoutURLAllowedUA !== zimbraWebClientLogoutURLAllowedUA) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLogoutURLAllowedUA]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLogoutURLAllowedIP !== zimbraWebClientLogoutURLAllowedIP) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLogoutURLAllowedIP]);

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
	const onCancel = (): void => {
		setZimbraPasswordChangeListener(domainAuthData.zimbraPasswordChangeListener);
		setZimbraAdminConsoleLoginURL(domainAuthData.zimbraAdminConsoleLoginURL);
		setZimbraAdminConsoleLogoutURL(domainAuthData.zimbraAdminConsoleLogoutURL);
		setZimbraWebClientLogoutURL(domainAuthData.zimbraWebClientLogoutURL);
		setZimbraWebClientLogoutURLAllowedUA(domainAuthData.zimbraWebClientLogoutURLAllowedUA);
		setZimbraWebClientLogoutURLAllowedIP(domainAuthData.zimbraWebClientLogoutURLAllowedIP);
		setZimbraAuthFallbackToLocal(domainAuthData.zimbraAuthFallbackToLocal === 'TRUE');
		setZimbraForceClearCookies(domainAuthData.zimbraForceClearCookies === 'TRUE');
		setZimbraAuthLdapBindDn(domainAuthData.zimbraAuthLdapBindDn);
		setZimbraAuthLdapSearchBase(domainAuthData.zimbraAuthLdapSearchBase);
		setZimbraAuthLdapSearchFilter(domainAuthData.zimbraAuthLdapSearchFilter);
		setZimbraAuthLdapURL(domainAuthData.zimbraAuthLdapURL);
		setZimbraAuthLdapStartTlsEnabled(domainAuthData.zimbraAuthLdapStartTlsEnabled === 'TRUE');
		setIsDirty(false);
	};

	const onSave = (): void => {
		const body: any = {};
		const attributes: any[] = [];
		body.id = domainAuthData.zimbraId;
		body._jsns = 'urn:zimbraAdmin';

		attributes.push({
			n: 'zimbraPasswordChangeListener',
			_content: zimbraPasswordChangeListener
		});
		attributes.push({
			n: 'zimbraAdminConsoleLoginURL',
			_content: zimbraAdminConsoleLoginURL
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
			n: 'zimbraWebClientLogoutURLAllowedUA',
			_content: zimbraWebClientLogoutURLAllowedUA
		});
		attributes.push({
			n: 'zimbraWebClientLogoutURLAllowedIP',
			_content: zimbraWebClientLogoutURLAllowedIP
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
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
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
									<Input
										label={t('label.your_auth_method_is', 'Your Auth Method is')}
										value={authMechLabel[zimbraAuthMech]}
										disabled
										// eslint-disable-next-line @typescript-eslint/no-empty-function
										onChange={(e: any): any => {}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.bind_dn_template', 'Bind DN Template')}
										value={zimbraAuthLdapBindDn}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraAuthLdapBindDn(e.target.value);
										}}
									/>
								</Padding>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.url', 'URL')}
										value={zimbraAuthLdapURL}
										background="gray5"
										onChange={(e: any): any => {
											setZimbraAuthLdapURL(e.target.value);
										}}
									/>
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
											'label.sso_login_redirect_admin_to_msg',
											'SSO Login will redirect the admin to'
										)}
										background="gray5"
										value={zimbraAdminConsoleLoginURL}
										onChange={(e: any): any => {
											setZimbraAdminConsoleLoginURL(e.target.value);
										}}
									/>
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
									<Input
										label={t('label.logout_allowed_user_agent', 'Logout Allowed User Agent')}
										background="gray5"
										value={zimbraWebClientLogoutURLAllowedUA}
										onChange={(e: any): any => {
											setZimbraWebClientLogoutURLAllowedUA(e.target.value);
										}}
									/>
								</Padding>
							</ListRow>
							<ListRow>
								<Padding vertical="small" horizontal="small" width="100%">
									<Input
										label={t('label.logout_allowed_ip', 'Logout Allowed IP')}
										background="gray5"
										value={zimbraWebClientLogoutURLAllowedIP}
										onChange={(e: any): any => {
											setZimbraWebClientLogoutURLAllowedIP(e.target.value);
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
