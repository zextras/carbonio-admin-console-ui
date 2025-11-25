/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const APP_ID = 'carbonio-admin-console-ui';
export const MANAGE = 'manage';
export const MAX_DOMAIN_DISPLAY = 20;
export const GENERAL_INFORMATION = 'general_information';
export const GENERAL_SETTINGS = 'general_settings';
export const GAL = 'gal';
export const AUTHENTICATION = 'authentication';
export const VIRTUAL_HOSTS = 'virtual_hosts';
export const MAILBOX_QUOTA = 'mailbox_quota';
export const WHITELABEL_SETTINGS = 'whitelabel_settings';
export const DOMAINS = 'domains';
export const TWO_FACTOR_AUTHENTICATION = '2-factor-authentication';
export const NOT_SET = 'not_set';
export const HTTP = 'http';
export const HTTPS = 'https';
export const ACTIVE = 'active';
export const CLOSED = 'closed';
export const LOCKED = 'locked';
export const MAINTENANCE = 'maintenance';
export const PENDING = 'pending';
export const SUSPENDED = 'suspended';
export const ALLOW_SEND_RECEIVE = 'ALLOWSENDRECEIVE';
export const BLOCK_SEND = 'BLOCKSEND';
export const BLOCK_SEND_RECEIVE = 'BLOCKSENDRECEIVE';
export const BYTE_PER_MB = 1048576;
export const MANAGE_APP_ID = 'manage';
export const DOMAINS_ROUTE_ID = 'domains';
export const SUBSCRIPTIONS_ROUTE_ID = 'subscriptions';
export const ZIMBRA_DOMAIN_NAME = 'zimbraDomainName';
export const ZIMBRA_ID = 'zimbraId';
export const ZIMBRA_VIRTUAL_HOSTNAME = 'zimbraVirtualHostname';
export const FIRST_PAGE = 1;
export const ACCOUNTS = 'accounts';
export const DISTRIBUTION_LIST = 'distribution_list';
export const RESOURCES = 'resources';
export const ACTIVE_SYNC = 'active_sync';
export const RESTORE_ACCOUNT = 'restore_account';
export const CREATE_NEW_DOMAIN_ROUTE_ID = 'create-new-domain';
export const DASHBOARD = 'dashboard';
export const MAX_COS_DISPLAY = 20;
export const DEFAULT = 'default';
export const RECORD_DISPLAY_LIMIT = 10;
export const TRUE = 'TRUE';
export const FALSE = 'FALSE';
export const MTA = 'mta';
export const ENABLED = 'enabled';
export const DISABLED = 'disabled';
export const SERVER_DETAIL_VIEW = 'server-detail';
export const CARBONIO_SEND_ANALYTICS = 'carbonioSendAnalytics';
export const PUB = 'pub';
export const ALL = 'all';
export const GRP = 'grp';
export const EMAIL = 'email';
export const ZX_MOBILE = 'ZxMobile';
export const ZX_CONFIG = 'ZxConfig';
export const WIPE_DEVICE = 'wipe device';
export const RESET_DEVICE = 'reset device';
export const SUSPEND_DEVICE = 'suspend device';
export const GLOBAL_ROUTE = 'global';
export const GLOBAL_DOMAIN_ROUTE = 'global/domains';
export const GLOBAL_QUARANTINE_ROUTE = 'global/quarantine';
export const GLOBAL_WHITELABEL_SETTINGS = 'global/whitelabel_settings';
export const GLOBAL_2FA_ROUTE = 'global/2-factor-authentication';
export const GLOBAL_ACTIVE_SYNC_ROUTE = 'global/active_sync';
export const DOMAIN_CERTIFICATE = 'domain_certificate';
export const DOMAIN_CERTIFICATE_CA_CHAIN = 'domain_certificate_ca_chain';
export const DOMAIN_CERTIFICATE_PRIVATE_KEY = 'domain_certificate_private_key';
export const INVALID = 'invalid';
export const ZIMBRA_SSL_CERTIFICATE = 'zimbraSSLCertificate';
export const ZIMBRA_SSL_PRIVATE_KEY = 'zimbraSSLPrivateKey';
export const COS = 'cos';
export const ACCOUNT = 'account';
export const MOBILE_CALENDAR_FEATURE_SYNC = 'mobileCalendarFeatureSync';
export const MOBILE_CONTACT_FEATURE_SYNC = 'mobileContactFeatureSync';
export const ASC = 'asc';
export const DESC = 'desc';
export const PERCENT_USED = 'percentUsed';
export const TOTAL_USED = 'totalUsed';
export const LDAP_QUERY = 'ldap:///??sub?(&(objectClass=inetOrgPerson)(mail=*@domain.tld))';
export const SEND_MAILS_ONLY = 'send_mails_only';
export const READ_MAILS_ONLY = 'read_mails_only';
export const SEND_READ_MAILS = 'send_read_mails';
export const MANAGE_NO_SEND = 'manage_no_send';
export const SEND_READ_MANAGE_MAILS = 'send_read_manage_mails';
export const INTERNAL_GAL = 'InternalGal';
export const ZIMBRA = 'zimbra';
export const SAML = 'saml';
export const CONTENT_TYPE_TEXT_PLAIN = 'text/plain';
export const SAML_METADATA_JSON_FILE = 'saml_metadata.json';
export const ZIMBRA_PUBLIC_SERVICE_HOSTNAME = 'zimbraPublicServiceHostname';
export const ZIMBRA_PUBLIC_SERVICE_PROTOCOL = 'zimbraPublicServiceProtocol';
export const EXTERNAL_SERVER_EXAMPLE =
	'e.g. ldap://192.168.1.151:3268 or ldaps://ldap.internal.tld';
export const LDAP_BIND_DN_LABLE =
	'e.g. CN=galsync, OU=Service Accounts, OU=Servers, DC=Corp, DC=domain, DC=com';
export const LDAP_FILTER_LABEL = 'e.g. (&(|(cn=%s*)(sn=%s*)(giveName=%s*)(mail=%s*)))';
export const LDAP_SEARCH_BASE_LABEL = 'e.g. dc=company,dc=local';
export const CHECK_OK = 'check.OK';
export const CONFIG = 'config';
export const GENERAL_SECTION = 'general';
export const PROFILE = 'profile';
export const CONFIGURATION = 'configuration';
export const USER_PREFERENCES = 'user_preferences';
export const SECURITY = 'security';
export const DELEGATES = 'delegates';
export const ADMINISTRATION = 'administration';
export const OK = 'ok';
export const SHORT = 'short';
export const LONG = 'long';
export const DOMAIN_NAME = 'domainName';
export const UID = 'uid';
export const CHANGE_NAME_BOOLEAN = 'changeNameBool';
export const IS_DEFAULT_USER_NAME = 'isDefaultUserName';
export const CHANGE_DISPLAY_NAME_BOOLEAN = 'changeDisplayNameBool';
export const ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS = 'zimbraDomainCOSMaxAccounts';
export const SECURITY_GROUP = 'security_group';
export const ZIMBRA_MTA_SMTPD_CLIENT_PORT_LOGGING = 'zimbraMtaSmtpdClientPortLogging';
export const ZIMBRA_AMAVIS_LOG_LEVEL = 'zimbraAmavisLogLevel';
export const ZIMBRA_AMAVIS_SA_LOG_LEVEL = 'zimbraAmavisSALogLevel';
export const ZIMBRA_MTA_SMTPD_TLS_LOG_LEVEL = 'zimbraMtaSmtpdTlsLoglevel';
export const ZIMBRA_MTA_LMTP_TLS_LOG_LEVEL = 'zimbraMtaLmtpTlsLoglevel';
export const ZIMBRA_CLAM_AV_MAX_THREADS = 'zimbraClamAVMaxThreads';
export const ZIMBRA_LMTP_NUM_THREADS = 'zimbraLmtpNumThreads';
export const ZIMBRA_MITER_NUM_THREADS = 'zimbraMilterNumThreads';
export const ZIMBRA_MTA_MESSAGE_SIZE = 'zimbraMtaMaxMessageSize';
export const ZIMBRA_MILTER_MAX_CONNECTIONS = 'zimbraMilterMaxConnections';
export const ZIMBRA_MTA_SMTP_SASL_AUTH_ENABLE = 'zimbraMtaSmtpSaslAuthEnable';
export const DL = 'dl';
export const USR = 'usr';
export const QUARANTINE = 'quarantine';
export const BACKUP_BASIC = 'backup_basic';
export const DELEGATES_DOMAIN_ADMINS = 'delegates_domain_admins';
export const DISCLAIMER = 'disclaimer';
export const ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED =
	'zimbraDomainMandatoryMailSignatureEnabled';
export const ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT = 'zimbraAmavisDomainDisclaimerText';
export const ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML = 'zimbraAmavisDomainDisclaimerHTML';
export const ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY = 'zimbraAmavisOutboundDisclaimersOnly';
export const CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE = 'carbonioSearchAllDomainsByFeature';
export const CARBONIO_SEARCH_SPECIFIED_DOMAINS_BY_FEATURE =
	'carbonioSearchSpecifiedDomainsByFeature';
export const GLOBAL_SETTINGS_ROUTE = 'global/settings';
export const SETTINGS = 'settings';
export const IS_DETAIL_LIST_EXPANDED = 'isDetailListExpanded';
export const IS_MANAGE_LIST_EXPANDED = 'isManageListExpanded';
export const IS_GLOBAL_LIST_EXPANDED = 'isGlobalListExpanded';
export const AMAVIS_DISCLAIMER_OPTIONS = 'amavisDisclaimerOptions';
export const SET_GLOBAL_CONFIG = 'set_global_config';
export const GET_GLOBAL_CONFIG = 'get_global_config';
export const GET = 'get';
export const SET = 'set';
export const ABQ_MODE = 'abqMode';
export const BACKUP_ENABLED = 'backupEnabled';
export const BACKUP_SELF_UNDELETE_ALLOWED = 'backupSelfUndeleteAllowed';
export const PERMISSIVE = 'Permissive';
export const INTERACTIVE = 'Interactive';
export const STRICT = 'Strict';
export const ABQ_DISABLED = 'Disabled';
export const paginationItems: Array<{ label: string; value: number }> = [
	{
		label: '5',
		value: 5
	},
	{
		label: '10',
		value: 10
	},
	{
		label: '15',
		value: 15
	},
	{
		label: '25',
		value: 25
	},
	{
		label: '50',
		value: 50
	},
	{
		label: '100',
		value: 100
	}
];
export const ZIMBRA_MTA_SMTPD_SENDER_LOGIN_MAPS = 'zimbraMtaSmtpdSenderLoginMaps';
export const HELPDESK_ADMINS = '__helpdesk_admins';
export const PRIMARY_BAR_DOMAINS = 'pb_domains';
export const LDAP = 'ldap:///';
export const GLOBAL = 'global';
export const CREATE_TOP_DOMAIN = 'createTopDomain';
export const ADMIN_LOGIN_AS = 'adminLoginAs';
export const BOOLEAN_FALSE = false;
export const GLOBAL_ADMINISTRATORS = 'global/administrators';
export const ADMINISTRATORS = 'administrators';
export const DISPLAYNAME = 'displayName';
export const FETCH_DATA_LIMIT = 50;
export const FILES_QUOTA_LIMIT = 'filesQuotaLimit';
export const FILES_QUOTA_USED = 'filesQuotaUsed';
export const MAILBOX_QUOTA_USED = 'mailboxQuotaUsed';
export const TOO_MANY_SEARCH_RESULTS_ERROR = 'too many search results returned';
export const SYSTEM_ACCOUNT_FLAG = 'systemAccount';
export const ADMIN_GROUP_FLAG = 'adminGroup';
export const PRIMARY_COLOR_CODE_EX = 'ex. #225CA8';
export const ZIMBRA_ADMIN_URN = 'urn:zimbraAdmin';
export const PH_PROJECT_API_KEY = 'phc_fMgU1UPSHulWuJCHXbrjyqoEoXwcb7rZJy69HdD7x2h';
export const PH_API_HOST = 'https://stats.zextras.tools';
