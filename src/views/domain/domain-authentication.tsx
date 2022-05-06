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
import { modifyDomain } from '../../services/modify-domain-service';

const ListRow: FC<{ children?: any; wrap?: any }> = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);

const ZimbraAuthMethod = {
	INTERNAL: 'zimbra',
	LDAP: 'ldap',
	EXTERNAL: 'ad'
} as const;

const DomainAuthentication: FC<{ domainInformation: any }> = ({ domainInformation }) => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [zimbraAuthMech, setZimbraAuthMech] = useState<string>('');
	const [zimbraAuthLdapSearchBindDn, setZimbraAuthLdapSearchBindDn] = useState<string>('');
	const [zimbraPasswordChangeListener, setZimbraPasswordChangeListener] = useState<string>('');
	const [zimbraAdminConsoleLoginURL, setZimbraAdminConsoleLoginURL] = useState<string>('');
	const [zimbraAdminConsoleLogoutURL, setZimbraAdminConsoleLogoutURL] = useState<string>('');
	const [zimbraWebClientLoginURL, setZimbraWebClientLoginURL] = useState<string>('');
	const [zimbraWebClientLogoutURL, setZimbraWebClientLogoutURL] = useState<string>('');
	const [zimbraWebClientLoginURLAllowedUA, setZimbraWebClientLoginURLAllowedUA] =
		useState<string>('');
	const [zimbraWebClientLogoutURLAllowedUA, setZimbraWebClientLogoutURLAllowedUA] =
		useState<string>('');
	const [zimbraWebClientLoginURLAllowedIP, setZimbraWebClientLoginURLAllowedIP] =
		useState<string>('');
	const [zimbraWebClientLogoutURLAllowedIP, setZimbraWebClientLogoutURLAllowedIP] =
		useState<string>('');
	const [zimbraAuthFallbackToLocal, setZimbraAuthFallbackToLocal] = useState<boolean>(false);
	const [zimbraForceClearCookies, setZimbraForceClearCookies] = useState<boolean>(false);
	const [domainAuthData, setDomainAuthData]: any = useState({});
	const createSnackbar: any = useContext(SnackbarManagerContext);

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
			if (obj.zimbraAuthLdapSearchBindDn) {
				setZimbraAuthLdapSearchBindDn(obj.zimbraAuthLdapSearchBindDn);
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
			if (obj.zimbraWebClientLoginURL) {
				setZimbraWebClientLoginURL(obj.zimbraWebClientLoginURL);
			} else {
				obj.zimbraWebClientLoginURL = '';
			}
			if (obj.zimbraWebClientLogoutURL) {
				setZimbraWebClientLogoutURL(obj.zimbraWebClientLogoutURL);
			} else {
				obj.zimbraWebClientLogoutURL = '';
			}
			if (obj.zimbraWebClientLoginURLAllowedUA) {
				setZimbraWebClientLoginURLAllowedUA(obj.zimbraWebClientLoginURLAllowedUA);
			} else {
				obj.zimbraWebClientLoginURLAllowedUA = '';
			}
			if (obj.zimbraWebClientLogoutURLAllowedUA) {
				setZimbraWebClientLogoutURLAllowedUA(obj.zimbraWebClientLogoutURLAllowedUA);
			} else {
				obj.zimbraWebClientLogoutURLAllowedUA = '';
			}
			if (obj.zimbraWebClientLoginURLAllowedIP) {
				setZimbraWebClientLoginURLAllowedIP(obj.zimbraWebClientLoginURLAllowedIP);
			} else {
				obj.zimbraWebClientLoginURLAllowedIP = '';
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
			if (domainAuthData.zimbraWebClientLoginURL !== zimbraWebClientLoginURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLoginURL]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLogoutURL !== zimbraWebClientLogoutURL) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLogoutURL]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLoginURLAllowedUA !== zimbraWebClientLoginURLAllowedUA) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLoginURLAllowedUA]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLogoutURLAllowedUA !== zimbraWebClientLogoutURLAllowedUA) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLogoutURLAllowedUA]);

	useEffect(() => {
		if (!_.isEmpty(domainAuthData)) {
			if (domainAuthData.zimbraWebClientLoginURLAllowedIP !== zimbraWebClientLoginURLAllowedIP) {
				setIsDirty(true);
			}
		}
	}, [domainAuthData, zimbraWebClientLoginURLAllowedIP]);

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

	const forceClearCookies = useCallback(() => setZimbraForceClearCookies((c) => !c), []);
	const authFallbackToLocal = useCallback(() => setZimbraAuthFallbackToLocal((c) => !c), []);

	const onCancel = (): void => {
		setZimbraPasswordChangeListener(domainAuthData.zimbraPasswordChangeListener);
		setZimbraAdminConsoleLoginURL(domainAuthData.zimbraAdminConsoleLoginURL);
		setZimbraAdminConsoleLogoutURL(domainAuthData.zimbraAdminConsoleLogoutURL);
		setZimbraWebClientLoginURL(domainAuthData.zimbraWebClientLoginURL);
		setZimbraWebClientLogoutURL(domainAuthData.zimbraWebClientLogoutURL);
		setZimbraWebClientLoginURLAllowedUA(domainAuthData.zimbraWebClientLoginURLAllowedUA);
		setZimbraWebClientLogoutURLAllowedUA(domainAuthData.zimbraWebClientLogoutURLAllowedUA);
		setZimbraWebClientLoginURLAllowedIP(domainAuthData.zimbraWebClientLoginURLAllowedIP);
		setZimbraWebClientLogoutURLAllowedIP(domainAuthData.zimbraWebClientLogoutURLAllowedIP);
		setZimbraAuthFallbackToLocal(domainAuthData.zimbraAuthFallbackToLocal === 'TRUE');
		setZimbraForceClearCookies(domainAuthData.zimbraForceClearCookies === 'TRUE');
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
			n: 'zimbraWebClientLoginURL',
			_content: zimbraWebClientLoginURL
		});
		attributes.push({
			n: 'zimbraWebClientLogoutURL',
			_content: zimbraWebClientLogoutURL
		});
		attributes.push({
			n: 'zimbraWebClientLoginURLAllowedUA',
			_content: zimbraWebClientLoginURLAllowedUA
		});
		attributes.push({
			n: 'zimbraWebClientLogoutURLAllowedUA',
			_content: zimbraWebClientLogoutURLAllowedUA
		});
		attributes.push({
			n: 'zimbraWebClientLoginURLAllowedIP',
			_content: zimbraWebClientLoginURLAllowedIP
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
				setIsDirty(false);
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
		<Container padding={{ all: 'large' }} background="gray5" height="calc(100% - 50px)">
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
					height="calc(100vh - 200px)"
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
									/>
								</Padding>
							</ListRow>
							{zimbraAuthMech !== ZimbraAuthMethod.INTERNAL && (
								<ListRow>
									<Padding vertical="small" horizontal="small" width="100%">
										<Input
											label={t('label.bind_dn_template', 'Bind DN Template')}
											value={domainAuthData.zimbraAuthLdapBindDn}
											disabled
										/>
									</Padding>
									<Padding vertical="small" horizontal="small" width="100%">
										<Input
											label={t('label.url', 'URL')}
											value={domainAuthData.zimbraAuthLdapURL}
											disabled
										/>
									</Padding>
								</ListRow>
							)}
							{zimbraAuthMech === ZimbraAuthMethod.LDAP && (
								<>
									<ListRow>
										<Padding vertical="small" horizontal="small" width="100%">
											<Input
												label={t('label.start_tls', 'StartTLS')}
												value={domainAuthData.zimbraAuthLdapStartTlsEnabled}
												disabled
											/>
										</Padding>
										<Padding vertical="small" horizontal="small" width="100%">
											<Input
												label={t('label.filter', 'Filter')}
												value={domainAuthData.zimbraAuthLdapSearchFilter}
												disabled
											/>
										</Padding>
									</ListRow>
									<ListRow>
										<Padding vertical="small" horizontal="small" width="100%">
											<Input
												label={t('label.search_base', 'Search Base')}
												value={domainAuthData.zimbraAuthLdapSearchBase}
												disabled
											/>
										</Padding>
									</ListRow>
								</>
							)}
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
							{zimbraAuthMech === ZimbraAuthMethod.LDAP && (
								<ListRow>
									<Padding vertical="small" horizontal="small" width="100%">
										<Switch
											value={zimbraAuthLdapSearchBindDn !== ''}
											label={t(
												'label.password_to_bind_external_server_msg',
												'I want to use DN/Password to bind to External Server'
											)}
											disabled
										/>
									</Padding>
								</ListRow>
							)}
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
										label={t('label.login_redirect_url', 'Login Redirect URL')}
										background="gray5"
										value={zimbraWebClientLoginURL}
										onChange={(e: any): any => {
											setZimbraWebClientLoginURL(e.target.value);
										}}
									/>
								</Padding>
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
										label={t('label.login_allowed_user_agent', 'Login Allowed User Agent')}
										background="gray5"
										value={zimbraWebClientLoginURLAllowedUA}
										onChange={(e: any): any => {
											setZimbraWebClientLoginURLAllowedUA(e.target.value);
										}}
									/>
								</Padding>
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
										label={t('label.login_allowed_ip', 'Login Allowed IP')}
										background="gray5"
										value={zimbraWebClientLoginURLAllowedIP}
										onChange={(e: any): any => {
											setZimbraWebClientLoginURLAllowedIP(e.target.value);
										}}
									/>
								</Padding>
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
		</Container>
	);
};

export default DomainAuthentication;
