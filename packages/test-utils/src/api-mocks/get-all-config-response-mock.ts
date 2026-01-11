/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const allConfigBaseResponseMock = {
  a: [
    {
      n: 'zimbraReverseProxyClientCertMode',
      _content: 'off',
    },
    {
      n: 'zimbraGalSyncTimestampFormat',
      _content: "yyyyMMddHHmmss'Z'",
    },
    {
      n: 'zimbraMailDomainQuota',
      _content: '0',
    },

    {
      n: 'zimbraMtaPostscreenDnsblWhitelistThreshold',
      _content: '0',
    },
    {
      n: 'carbonioAdminProxyPort',
      _content: '6071',
    },
    {
      n: 'zimbraDatabaseSlowSqlThreshold',
      _content: '2s',
    },
    {
      n: 'zimbraMtaSmtpTlsMandatoryProtocols',
      _content: '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1',
    },
    {
      n: 'zimbraHttpRequestHeaderSize',
      _content: '8192',
    },
    {
      n: 'zimbraMtaMilterConnectTimeout',
      _content: '30s',
    },
    {
      n: 'zimbraSpamTagPercent',
      _content: '16',
    },
    {
      n: 'zimbraReverseProxySNIEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMailboxMoveSkipHsmBlobs',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaPostscreenBareNewlineAction',
      _content: 'ignore',
    },
    {
      n: 'zimbraMtaSmtpSaslAuthEnable',
      _content: 'no',
    },
    {
      n: 'zimbraMtaMaximalBackoffTime',
      _content: '4000s',
    },
    {
      n: 'zimbraCBPolicydMinSpareServers',
      _content: '4',
    },
    {
      n: 'zimbraReverseProxyPortQuery',
      _content: '(&(zimbraServiceHostname=${MAILHOST})(objectClass=zimbraServer))',
    },
    {
      n: 'zimbraNetworkModulesNGEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraAuthTokenNotificationInterval',
      _content: '60000',
    },
    {
      n: 'zimbraImapInactiveSessionEhcacheSize',
      _content: '1048576',
    },
    {
      n: 'zimbraTwoFactorAuthHashAlgorithm',
      _content: 'SHA1',
    },
    {
      n: 'zimbraLogRawLifetime',
      _content: '7d',
    },
    {
      n: 'zimbraActiveSyncEhcacheExpiration',
      _content: '5m',
    },
    {
      n: 'zimbraHsmAge',
      _content: '30d',
    },
    {
      n: 'zimbraImapProxyBindPort',
      _content: '143',
    },
    {
      n: 'zimbraMtaPostscreenBareNewlineEnable',
      _content: 'no',
    },
    {
      n: 'zimbraCalendarRecurrenceOtherFrequencyMaxYears',
      _content: '1',
    },
    {
      n: 'zimbraMtaAddressVerifyPollDelay',
      _content: '3s',
    },
    {
      n: 'zimbraMtaLmtpHostLookup',
      _content: 'dns',
    },
    {
      n: 'zimbraMtaSmtpTlsDaneInsecureMXPolicy',
      _content: 'dane',
    },
    {
      n: 'zimbraMailMode',
      _content: 'http',
    },
    {
      n: 'zimbraRedoLogCrashRecoveryLookbackSec',
      _content: '10',
    },
    {
      n: 'carbonioSMIMESignatureVerificationEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraWebClientSupportedHelps',
      _content: 'newFeatures',
    },
    {
      n: 'zimbraWebClientSupportedHelps',
      _content: 'onlineHelp',
    },
    {
      n: 'zimbraWebClientSupportedHelps',
      _content: 'productHelp',
    },
    {
      n: 'zimbraAccountExtraObjectClass',
      _content: 'amavisAccount',
    },
    {
      n: 'carbonioClamAVReadTimeout',
      _content: '900',
    },
    {
      n: 'zimbraMtaPostscreenDnsblAction',
      _content: 'ignore',
    },
    {
      n: 'zimbraActiveSyncEhcacheMaxDiskSize',
      _content: '10737418240',
    },
    {
      n: 'zimbraMailUncompressedCacheMaxBytes',
      _content: '1073741824',
    },
    {
      n: 'zimbraMtaDefaultProcessLimit',
      _content: '100',
    },
    {
      n: 'zimbraAdminConsoleCatchAllAddressEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraConfiguredServerIDForBlobDirEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraHsmBatchSize',
      _content: '10000',
    },
    {
      n: 'zimbraReverseProxyConnectTimeout',
      _content: '120000ms',
    },
    {
      n: 'zimbraAmavisOriginatingBypassSA',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCBPolicydBypassTimeout',
      _content: '30',
    },
    {
      n: 'zimbraMtaStpdSoftErrorLimit',
      _content: '10',
    },
    {
      n: 'zimbraTwoFactorScratchCodeLength',
      _content: '8',
    },
    {
      n: 'zimbraReverseProxyPop3ExposeVersionOnBanner',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyPop3SaslPlainEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyXmppBoshSSL',
      _content: 'FALSE',
    },
    {
      n: 'zimbraChatXmppSslPortEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraImapInactiveSessionCacheMaxDiskSize',
      _content: '10737418240',
    },
    {
      n: 'zimbraMtaSmtpdSaslTlsSecurityOptions',
      _content: '$smtpd_sasl_security_options',
    },
    {
      n: 'zimbraCBPolicydLogLevel',
      _content: '3',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'a',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'an',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'and',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'are',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'as',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'at',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'be',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'but',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'by',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'for',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'if',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'in',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'into',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'is',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'it',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'no',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'not',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'of',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'on',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'or',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'such',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'that',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'the',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'their',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'then',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'there',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'these',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'they',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'this',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'to',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'was',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'will',
    },
    {
      n: 'zimbraDefaultAnalyzerStopWords',
      _content: 'with',
    },
    {
      n: 'zimbraReverseProxyMailImapEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMailboxMoveSkipBlobs',
      _content: 'FALSE',
    },
    {
      n: 'zimbraPop3NumThreads',
      _content: '100',
    },
    {
      n: 'zimbraScheduledTaskNumThreads',
      _content: '20',
    },
    {
      n: 'zimbraProduct',
      _content: 'ZCS',
    },
    {
      n: 'zimbraReverseProxyRouteLookupTimeoutCache',
      _content: '60s',
    },
    {
      n: 'zimbraMtaSmtpdTlsProtocols',
      _content: '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1',
    },
    {
      n: 'zimbraReverseProxyCacheEntryTTL',
      _content: '1h',
    },
    {
      n: 'zimbraReverseProxyWorkerProcesses',
      _content: '4',
    },
    {
      n: 'cn',
      _content: 'config',
    },
    {
      n: 'zimbraMailReferMode',
      _content: 'reverse-proxied',
    },
    {
      n: 'zimbraSharingUpdatePublishInterval',
      _content: '15m',
    },
    {
      n: 'zimbraMailContentMaxSize',
      _content: '10240000',
    },
    {
      n: 'zimbraMtaSmtpTlsLoglevel',
      _content: '0',
    },
    {
      n: 'zimbraSieveFeatureVariablesEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaSmtpdTlsCiphers',
      _content: 'high',
    },
    {
      n: 'zimbraShareNotificationMtaAuthRequired',
      _content: 'FALSE',
    },
    {
      n: 'zimbraRemoteManagementPrivateKeyPath',
      _content: '/opt/zextras/.ssh/zimbra_identity',
    },
    {
      n: 'zimbraBackupTarget',
      _content: '/opt/zextras/backup',
    },
    {
      n: 'zimbraHttpThreadPoolMaxIdleTimeMillis',
      _content: '10000',
    },
    {
      n: 'zimbraReverseProxyStrictServerNameEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyPop3SaslGssapiEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCalendarCalDavDefaultCalendarId',
      _content: '10',
    },
    {
      n: 'zimbraMobileMetadataMaxSizeEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaBounceNoticeRecipient',
      _content: 'postmaster',
    },
    {
      n: 'zimbraAdminConsoleDNSCheckEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyMailMode',
      _content: 'redirect',
    },
    {
      n: 'zimbraCsrfRefererCheckEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraAmavisSALogLevel',
      _content: '0',
    },
    {
      n: 'zimbraBackupMinFreeSpace',
      _content: '0',
    },
    {
      n: 'zimbraMtaPostscreenDnsblMaxTTL',
      _content: '${postscreen_dnsbl_ttl?{$postscreen_dnsbl_ttl}:{1}}h',
    },
    {
      n: 'zimbraMtaInFlowDelay',
      _content: '1s',
    },
    {
      n: 'zimbraTwoFactorAuthSecretEncoding',
      _content: 'BASE32',
    },
    {
      n: 'zimbraReverseProxyUpstreamPollingTimeout',
      _content: '1h',
    },
    {
      n: 'zimbraFreebusyExchangeCachedInterval',
      _content: '60d',
    },
    {
      n: 'zimbraDNSUseTCP',
      _content: 'yes',
    },
    {
      n: 'zimbraGalSyncLdapPageSize',
      _content: '1000',
    },
    {
      n: 'zimbraMailboxdSSLRenegotiationAllowed',
      _content: 'TRUE',
    },
    {
      n: 'zimbraSpamTrashAlias',
      _content: '/Deleted Items',
    },
    {
      n: 'zimbraSpamTrashAlias',
      _content: '/Deleted Messages',
    },
    {
      n: 'zimbraMtaSmtpdHeloRequired',
      _content: 'yes',
    },
    {
      n: 'zimbraMtaTransportMaps',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-transport.cf',
    },
    {
      n: 'zimbraMailRedirectSetEnvelopeSender',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyIPLoginLimitTime',
      _content: '3600',
    },
    {
      n: 'zimbraReverseProxyHttpSSLPortAttribute',
      _content: 'zimbraMailSSLPort',
    },
    {
      n: 'zimbraReverseProxyLogLevel',
      _content: 'info',
    },
    {
      n: 'zimbraSmtpSendAddAuthenticatedUser',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaVirtualAliasExpansionLimit',
      _content: '10000',
    },
    {
      n: 'zimbraLastLogonTimestampFrequency',
      _content: '1d',
    },
    {
      n: 'zimbraVersionCheckNotificationSubject',
      _content: '${IS_CRITICAL} updates are available for your Zimbra server',
    },
    {
      n: 'zimbraScheduledTaskMaxRetries',
      _content: '10',
    },
    {
      n: 'zimbraMtaMinimalBackoffTime',
      _content: '300s',
    },
    {
      n: 'zimbraPop3SSLBindOnStartup',
      _content: 'TRUE',
    },
    {
      n: 'carbonioAdminUiTitle',
      _content: 'Carbonio Admin UI',
    },
    {
      n: 'zimbraSpnegoAuthEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraPop3ServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCBPolicydTimeoutIdle',
      _content: '1020',
    },
    {
      n: 'zimbraAdminURL',
      _content: '/carbonioAdmin',
    },
    {
      n: 'zimbraSoapRequestMaxSize',
      _content: '15360000',
    },
    {
      n: 'zimbraDNSUseUDP',
      _content: 'yes',
    },
    {
      n: 'zimbraSSDBResourcePoolTimeout',
      _content: '0',
    },
    {
      n: 'zimbraGalSyncSizeLimit',
      _content: '30000',
    },
    {
      n: 'zimbraReverseProxyZmlookupCachingEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSmtpdClientRestrictions',
      _content: 'reject_unauth_pipelining',
    },
    {
      n: 'zimbraCBPolicydGreylistingTrainingEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailKeepOutWebCrawlers',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCalendarRecurrenceYearlyMaxYears',
      _content: '100',
    },
    {
      n: 'zimbraCalendarCalDavCalendarAutoScheduleEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMailSSLClientCertPrincipalMap',
      _content: 'SUBJECT_EMAILADDRESS=name',
    },
    {
      n: 'zimbraCalendarCalDavClearTextPasswordEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMailEmptyFolderBatchSize',
      _content: '1000',
    },
    {
      n: 'zimbraPop3ExposeVersionOnBanner',
      _content: 'FALSE',
    },
    {
      n: 'zimbraRemoteImapBindPort',
      _content: '8143',
    },
    {
      n: 'zimbraAntispamExtractionBatchDelay',
      _content: '100',
    },
    {
      n: 'zimbraMtaPostscreenNonSmtpCommandEnable',
      _content: 'no',
    },
    {
      n: 'zimbraSoapExposeVersion',
      _content: 'FALSE',
    },
    {
      n: 'zimbraAutoProvNotificationSubject',
      _content: 'New account auto provisioned',
    },
    {
      n: 'zimbraMailPurgeSleepInterval',
      _content: '1m',
    },
    {
      n: 'zimbraMtaSmtpdSenderRestrictions',
      _content: 'reject_sender_login_mismatch',
    },
    {
      n: 'zimbraLmtpShutdownGraceSeconds',
      _content: '10',
    },
    {
      n: 'zimbraReverseProxyIPLoginImapLimit',
      _content: '0',
    },
    {
      n: 'zimbraReverseProxyIPThrottleWhitelistTime',
      _content: '300s',
    },
    {
      n: 'zimbraCommunityUsernameMapping',
      _content: 'uid',
    },
    {
      n: 'zimbraTableMaintenanceMinRows',
      _content: '10000',
    },
    {
      n: 'zimbraAuthTokenValidityValueEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMemcachedClientTimeoutMillis',
      _content: '10000',
    },
    {
      n: 'zimbraGCMUrl',
      _content: 'https://android.googleapis.com/gcm/send',
    },
    {
      n: 'zimbraVersionCheckNotificationBody',
      _content:
        '${BEGIN_PREFIX}The following updates were found:${NEWLINE}${NEWLINE}${END_PREFIX}${BEGIN_UPDATE}${UPDATE_COUNTER}.  ${IS_CRITICAL}.  Version: ${UPDATE_VERSION}, URL: ${UPDATE_URL}${NEWLINE}${NEWLINE}${END_UPDATE}${BEGIN_SIGNATURE}Zimbra Updater${NEWLINE}${END_SIGNATURE}',
    },
    {
      n: 'zimbraMilterMaxConnections',
      _content: '20000',
    },
    {
      n: 'zimbraMtaRestriction',
      _content: 'reject_invalid_helo_hostname',
    },
    {
      n: 'zimbraMtaRestriction',
      _content: 'reject_non_fqdn_sender',
    },
    {
      n: 'zimbraMtaRestriction',
      _content: 'reject_unknown_sender_domain',
    },
    {
      n: 'zimbraMtaSmtpdTlsReceivedHeader',
      _content: 'yes',
    },
    {
      n: 'zimbraCBPolicydMinServers',
      _content: '4',
    },
    {
      n: 'zimbraGalInternalSearchBase',
      _content: 'DOMAIN',
    },
    {
      n: 'zimbraAmavisFinalSpamDestiny',
      _content: 'D_DISCARD',
    },
    {
      n: 'zimbraMtaPostscreenCommandCountLimit',
      _content: '20',
    },
    {
      n: 'zimbraTableMaintenanceOperation',
      _content: 'ANALYZE',
    },
    {
      n: 'zimbraRedoLogEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCommunityHomeURL',
      _content: '/integration/zimbracollaboration',
    },
    {
      n: 'zimbraMtaBounceQueueLifetime',
      _content: '5d',
    },
    {
      n: 'zimbraMtaMilterDefaultAction',
      _content: 'tempfail',
    },
    {
      n: 'zimbraMtaPostscreenGreetAction',
      _content: 'ignore',
    },
    {
      n: 'carbonioSendAnalytics',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMessageChannelPort',
      _content: '7285',
    },
    {
      n: 'zimbraVersionCheckInterval',
      _content: '1d',
    },
    {
      n: 'zimbraVersionCheckURL',
      _content: 'updateUrl',
    },
    {
      n: 'zimbraImapBindPort',
      _content: '7143',
    },
    {
      n: 'zimbraAutoSubmittedNullReturnPath',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailFileDescriptorCacheSize',
      _content: '1000',
    },
    {
      n: 'zimbraMtaLmdbMapSize',
      _content: '16777216',
    },
    {
      n: 'zimbraExtensionBindPort',
      _content: '7072',
    },
    {
      n: 'zimbraMtaSmtpCnameOverridesServername',
      _content: 'no',
    },
    {
      n: 'zimbraReverseProxyImapSaslPlainEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyDomainNameQuery',
      _content: '(&(zimbraVirtualIPAddress=${IPADDR})(objectClass=zimbraDomain))',
    },
    {
      n: 'zimbraReverseProxyUserThrottleMsg',
      _content: 'Login rejected for this user',
    },
    {
      n: 'zimbraImapMaxRequestSize',
      _content: '10240',
    },
    {
      n: 'zimbraLastPurgeMaxDuration',
      _content: '30d',
    },
    {
      n: 'zimbraSpamCheckEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraTableMaintenanceGrowthFactor',
      _content: '10',
    },
    {
      n: 'zimbraMtaCommandDirectory',
      _content: '/opt/zextras/common/sbin',
    },
    {
      n: 'zimbraPop3ProxyBindPort',
      _content: '110',
    },
    {
      n: 'zimbraBackupAutoGroupedThrottled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyPop3PortAttribute',
      _content: 'zimbraPop3BindPort',
    },
    {
      n: 'zimbraImapInactiveSessionEhcacheMaxDiskSize',
      _content: '107374182400',
    },
    {
      n: 'zimbraMailProxyPort',
      _content: '0',
    },
    {
      n: 'carbonioAllowFeedback',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaLmtpTlsProtocols',
      _content: '!SSLv2, !SSLv3',
    },
    {
      n: 'zimbraMtaLmtpTlsLoglevel',
      _content: '0',
    },
    {
      n: 'zimbraMtaDaemonDirectory',
      _content: '/opt/zextras/common/libexec',
    },
    {
      n: 'zimbraClamAVBindAddress',
      _content: 'localhost',
    },
    {
      n: 'zimbraNetworkAdminEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyPop3SSLPortAttribute',
      _content: 'zimbraPop3SSLBindPort',
    },
    {
      n: 'zimbraHttpContextPathBasedThreadPoolBalancingFilterRules',
      _content: '/service:max=80%',
    },
    {
      n: 'zimbraHttpContextPathBasedThreadPoolBalancingFilterRules',
      _content: '/zimbra:max=15%',
    },
    {
      n: 'zimbraHttpContextPathBasedThreadPoolBalancingFilterRules',
      _content: '/zimbraAdmin:max=5%',
    },
    {
      n: 'zimbraScheduledTaskInitialRetryDelay',
      _content: '5s',
    },
    {
      n: 'carbonioWebUiTitle',
      _content: 'Carbonio Client',
    },
    {
      n: 'zimbraGalGroupIndicatorEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSmtpTransportRateDelay',
      _content: '$default_transport_rate_delay',
    },
    {
      n: 'zimbraReverseProxyUpstreamSendTimeout',
      _content: '60s',
    },
    {
      n: 'zimbraAuthTokenKey',
      _content: '0:1765804035137:d5f781a8cf216ff4505333cdcb4a7444577befd83ebcd1d455c8dba7a59976d5',
    },
    {
      n: 'zimbraMtaSmtpTlsProtocols',
      _content: '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1',
    },
    {
      n: 'zimbraReverseProxyMailPop3Enabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSendmailPath',
      _content: '/opt/zextras/common/sbin/sendmail',
    },
    {
      n: 'zimbraAmavisOutboundDisclaimersOnly',
      _content: 'FALSE',
    },
    {
      n: 'zimbraShareNotificationMtaConnectionType',
      _content: 'CLEARTEXT',
    },
    {
      n: 'zimbraRedoLogRolloverHardMaxFileSizeKB',
      _content: '4194304',
    },
    {
      n: 'zimbraChatConversationAuditEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraLdapGalSyncDisabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraAmavisEnableDKIMVerification',
      _content: 'TRUE',
    },
    {
      n: 'zimbraLmtpServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraRemoteImapServerEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaAntiSpamLockMethod',
      _content: 'flock',
    },
    {
      n: 'zimbraMtaPostscreenDnsblThreshold',
      _content: '1',
    },
    {
      n: 'zimbraGalTokenizeAutoCompleteKey',
      _content: 'and',
    },
    {
      n: 'zimbraReverseProxySSLECDHCurve',
      _content: 'auto',
    },
    {
      n: 'zimbraNotebookPageCacheSize',
      _content: '10240',
    },
    {
      n: 'zimbraCBPolicydAccountingEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailProxyMaxFails',
      _content: '1',
    },
    {
      n: 'zimbraMtaPostscreenPipeliningTTL',
      _content: '30d',
    },
    {
      n: 'zimbraSpamReportTypeSpam',
      _content: 'spam',
    },
    {
      n: 'carbonioReverseProxyResponseCSPHeader',
      _content:
        "Content-Security-Policy: \"default-src 'self' data: blob: cid:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.zextras.tools *.jsdelivr.net; style-src * 'unsafe-inline'; img-src * data: blob: cid:; font-src * data:; connect-src 'self' *.zextras.tools *.jsdelivr.net; media-src * blob: data: cid:; object-src 'self'; child-src 'self' blob: data: cid:; frame-src 'self' blob: data: cid:; frame-ancestors 'self'; form-action 'self';\"",
    },
    {
      n: 'zimbraExternalShareInvitationUrlExpiration',
      _content: '0',
    },
    {
      n: 'zimbraMtaPostscreenCacheCleanupInterval',
      _content: '12h',
    },
    {
      n: 'zimbraMailPort',
      _content: '8080',
    },
    {
      n: 'zimbraReverseProxyMailHostQuery',
      _content: '(|(zimbraMailDeliveryAddress=${USER})(zimbraMailAlias=${USER})(zimbraId=${USER}))',
    },
    {
      n: 'zimbraSpamHeader',
      _content: 'X-Spam-Flag',
    },
    {
      n: 'zimbraAdminProxyPort',
      _content: '9071',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'asd',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'bat',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'chm',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'cmd',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'com',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'dll',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'do',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'exe',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'hlp',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'hta',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'js',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'jse',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'lnk',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'ocx',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'pif',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'reg',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'scr',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'shb',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'shm',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'shs',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'vbe',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'vbs',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'vbx',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'vxd',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'wsf',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'wsh',
    },
    {
      n: 'zimbraMtaCommonBlockedExtension',
      _content: 'xl',
    },
    {
      n: 'zimbraMtaQueueDirectory',
      _content: '/opt/zextras/data/postfix/spool',
    },
    {
      n: 'zimbraMobileMetadataRetentionPolicy',
      _content: '180:30:1',
    },
    {
      n: 'zimbraMtaPostscreenDnsblMinTTL',
      _content: '60s',
    },
    {
      n: 'zimbraLdapGentimeFractionalSecondsEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraRedoLogLogPath',
      _content: 'redolog/redo.log',
    },
    {
      n: 'zimbraMailSSLProxyClientCertPort',
      _content: '3443',
    },
    {
      n: 'zimbraImapSSLProxyBindPort',
      _content: '993',
    },
    {
      n: 'zimbraBackupSkipSearchIndex',
      _content: 'FALSE',
    },
    {
      n: 'zimbraDefaultDomainName',
      _content: 'carbonio.localhost',
    },
    {
      n: 'zimbraAuthFallbackToLocal',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaQueueRunDelay',
      _content: '300s',
    },
    {
      n: 'zimbraRedoLogArchiveDir',
      _content: 'redolog/archive',
    },
    {
      n: 'zimbraMtaMilterContentTimeout',
      _content: '300s',
    },
    {
      n: 'zimbraInvalidLoginFilterDelayInMinBetwnReqBeforeReinstating',
      _content: '15',
    },
    {
      n: 'zimbraCalendarRecurrenceDailyMaxDays',
      _content: '730',
    },
    {
      n: 'zimbraReverseProxyIPLoginLimit',
      _content: '0',
    },
    {
      n: 'zimbraClientTypeRegex',
      _content: 'Android:(.*)Android(.*)',
    },
    {
      n: 'zimbraClientTypeRegex',
      _content: 'SyncClient:(.*)\\\\((.*)\\\\)$',
    },
    {
      n: 'zimbraClientTypeRegex',
      _content: 'Web UI:(.*)ZimbraWebClient(.*)',
    },
    {
      n: 'zimbraClientTypeRegex',
      _content: 'ipad:(.*)iPad(.*)',
    },
    {
      n: 'zimbraClientTypeRegex',
      _content: 'iphone:(.*)iPhone(.*)',
    },
    {
      n: 'zimbraPop3SSLServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSmtpdProxyTimeout',
      _content: '100s',
    },
    {
      n: 'zimbraMtaSmtpdErrorSleepTime',
      _content: '1s',
    },
    {
      n: 'zimbraMailEmptyFolderBatchThreshold',
      _content: '100000',
    },
    {
      n: 'zimbraSmimeOCSPEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraTwoFactorAuthSecretLength',
      _content: '16',
    },
    {
      n: 'zimbraAutoProvPollingInterval',
      _content: '15m',
    },
    {
      n: 'zimbraRemoteManagementUser',
      _content: 'zextras',
    },
    {
      n: 'zimbraMtaLmtpConnectionCacheTimeLimit',
      _content: '4s',
    },
    {
      n: 'zimbraReverseProxyIpThrottleMsg',
      _content: 'Login rejected from this IP',
    },
    {
      n: 'zimbraSpamKillPercent',
      _content: '75',
    },
    {
      n: 'zimbraConvertPoolTimeout',
      _content: '60000',
    },
    {
      n: 'zimbraFreebusyExchangeCachedIntervalStart',
      _content: '7d',
    },
    {
      n: 'zimbraMtaSmtpdTlsCcertVerifydepth',
      _content: '9',
    },
    {
      n: 'zimbraBackupSkipBlobs',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCBPolicydMaxServers',
      _content: '25',
    },
    {
      n: 'zimbraMemcachedClientBinaryProtocolEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraImapSSLBindPort',
      _content: '7993',
    },
    {
      n: 'zimbraBasicAuthRealm',
      _content: 'Carbonio',
    },
    {
      n: 'zimbraWebClientStaySignedInDisabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraVirusWarnRecipient',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMemcachedBindPort',
      _content: '11211',
    },
    {
      n: 'zimbraMtaSmtpdSoftErrorLimit',
      _content: '10',
    },
    {
      n: 'zimbraHsmPolicy',
      _content: 'message,document:before:-30days',
    },
    {
      n: 'zimbraLmtpNumThreads',
      _content: '20',
    },
    {
      n: 'zimbraMailboxThrottleReapInterval',
      _content: '60s',
    },
    {
      n: 'zimbraAmavisLogLevel',
      _content: '1',
    },
    {
      n: 'zimbraExternalAccountStatusCheckInterval',
      _content: '1d',
    },
    {
      n: 'zimbraCBPolicydGreylistingDeferMsg',
      _content: 'Greylisting in effect, please come back later',
    },
    {
      n: 'zimbraMtaPostscreenNonSmtpCommandAction',
      _content: 'drop',
    },
    {
      n: 'zimbraLogSummaryLifetime',
      _content: '30d',
    },
    {
      n: 'zimbraMtaMilterCommandTimeout',
      _content: '30s',
    },
    {
      n: 'zimbraMtaSmtpdRejectUnlistedSender',
      _content: 'yes',
    },
    {
      n: 'zimbraMtaBrokenSaslAuthClients',
      _content: 'yes',
    },
    {
      n: 'zimbraMailSSLClientCertPort',
      _content: '9443',
    },
    {
      n: 'zimbraMtaTlsSecurityLevel',
      _content: 'may',
    },
    {
      n: 'zimbraReverseProxyIPLoginPop3LimitTime',
      _content: '3600',
    },
    {
      n: 'zimbraMtaSmtpdDataRestrictions',
      _content: 'reject_unauth_pipelining',
    },
    {
      n: 'zimbraMtaMaximalQueueLifetime',
      _content: '5d',
    },
    {
      n: 'zimbraOpenidConsumerStatelessModeEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCalendarCompatibilityMode',
      _content: 'standard',
    },
    {
      n: 'zimbraRemoteImapSSLServerEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailboxMoveTempDir',
      _content: '/opt/zextras/backup/tmp/mboxmove',
    },
    {
      n: 'zimbraMtaNotifyClasses',
      _content: 'resource',
    },
    {
      n: 'zimbraMtaNotifyClasses',
      _content: 'software',
    },
    {
      n: 'zimbraAntispamExtractionBatchSize',
      _content: '25',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: '(binary) thumbnailPhoto=thumbnailPhoto',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: '(binary) userSMIMECertificate=userSMIMECertificate',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: '(certificate) userCertificate=userCertificate',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'co=workCountry',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'company=company',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'description=notes',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content:
        'displayName,cn=fullName,fullName2,fullName3,fullName4,fullName5,fullName6,fullName7,fullName8,fullName9,fullName10',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'facsimileTelephoneNumber,fax=workFax',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'givenName,gn=firstName',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'homeTelephoneNumber,homePhone=homePhone',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'initials=initials',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'l=workCity',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'mobileTelephoneNumber,mobile=mobilePhone',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'msExchResourceSearchProperties=zimbraAccountCalendarUserType',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'objectClass=objectClass',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'ou=department',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'pagerTelephoneNumber,pager=pager',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'physicalDeliveryOfficeName=office',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'postalCode=workPostalCode',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'sn=lastName',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'st=workState',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'street,streetAddress=workStreet',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'telephoneNumber=workPhone',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'title=jobTitle',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'whenChanged,modifyTimeStamp=modifyTimeStamp',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'whenCreated,createTimeStamp=createTimeStamp',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResBuilding=zimbraCalResBuilding',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResCapacity,msExchResourceCapacity=zimbraCalResCapacity',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResContactEmail=zimbraCalResContactEmail',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResFloor=zimbraCalResFloor',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResLocationDisplayName=zimbraCalResLocationDisplayName',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResSite=zimbraCalResSite',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraCalResType,msExchResourceSearchProperties=zimbraCalResType',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraDistributionListSubscriptionPolicy=zimbraDistributionListSubscriptionPolicy',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content:
        'zimbraDistributionListUnsubscriptionPolicy=zimbraDistributionListUnsubscriptionPolicy',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraId=zimbraId',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content:
        'zimbraMailDeliveryAddress,zimbraMailAlias,mail=email,email2,email3,email4,email5,email6,email7,email8,email9,email10,email11,email12,email13,email14,email15,email16',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraMailForwardingAddress=member',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraPhoneticCompany,ms-DS-Phonetic-Company-Name=phoneticCompany',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraPhoneticFirstName,ms-DS-Phonetic-First-Name=phoneticFirstName',
    },
    {
      n: 'zimbraGalLdapAttrMap',
      _content: 'zimbraPhoneticLastName,ms-DS-Phonetic-Last-Name=phoneticLastName',
    },
    {
      n: 'zimbraNotifyBindPort',
      _content: '7035',
    },
    {
      n: 'zimbraMtaAddressVerifyPollCount',
      _content: '${stress?3}${stress:5}',
    },
    {
      n: 'zimbraMtaSmtpdTlsMandatoryProtocols',
      _content: '!SSLv2, !SSLv3, !TLSv1, !TLSv1.1',
    },
    {
      n: 'zimbraMtaAuthTarget',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaNewaliasesPath',
      _content: '/opt/zextras/common/sbin/newaliases',
    },
    {
      n: 'zimbraTwoFactorTimeWindowOffset',
      _content: '1',
    },
    {
      n: 'zimbraCalendarCalDavDisableFreebusy',
      _content: 'FALSE',
    },
    {
      n: 'zimbraRemoteImapSSLBindPort',
      _content: '8993',
    },
    {
      n: 'zimbraReverseProxyCacheFetchTimeout',
      _content: '3s',
    },
    {
      n: 'zimbraImapSSLBindOnStartup',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaAlwaysAddMissingHeaders',
      _content: 'yes',
    },
    {
      n: 'zimbraMailSSLClientCertOCSPEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyWorkerConnections',
      _content: '10240',
    },
    {
      n: 'zimbraMailURL',
      _content: '/',
    },
    {
      n: 'zimbraRedoLogFsyncIntervalMS',
      _content: '10',
    },
    {
      n: 'zimbraAutoProvBatchSize',
      _content: '20',
    },
    {
      n: 'zimbraAttachmentsScanEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaLmtpTlsMandatoryCiphers',
      _content: 'medium',
    },
    {
      n: 'zimbraMessageChannelEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailSSLClientCertPrincipalMapLdapFilterEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyXmppBoshTimeout',
      _content: '90s',
    },
    {
      n: 'zimbraNotebookFolderCacheSize',
      _content: '1024',
    },
    {
      n: 'carbonioAdminDocumentationUrl',
      _content: 'https://docs.zextras.com/carbonio/html/adminpanel/introduction.html',
    },
    {
      n: 'zimbraMtaPropagateUnmatchedExtensions',
      _content: 'canonical',
    },
    {
      n: 'zimbraMtaSmtpdSaslSecurityOptions',
      _content: 'noanonymous',
    },
    {
      n: 'zimbraAllowNonLDHCharsInDomain',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMessageIdDedupeCacheSize',
      _content: '3000',
    },
    {
      n: 'zimbraMailboxdSSLProtocols',
      _content: 'TLSv1.2',
    },
    {
      n: 'zimbraAttachmentsScanClass',
      _content: 'com.zimbra.cs.scan.ClamScanner',
    },
    {
      n: 'zimbraImapSaslGssapiEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailUseDirectBuffers',
      _content: 'FALSE',
    },
    {
      n: 'zimbraThreadMonitorEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyMailHostAttribute',
      _content: 'zimbraMailHost',
    },
    {
      n: 'zimbraMtaMaxUse',
      _content: '100',
    },
    {
      n: 'zimbraMtaPostscreenPipeliningAction',
      _content: 'enforce',
    },
    {
      n: 'zimbraBackupAutoGroupedInterval',
      _content: '1d',
    },
    {
      n: 'zimbraReverseProxyImapStartTlsMode',
      _content: 'only',
    },
    {
      n: 'zimbraEphemeralBackendURL',
      _content: 'ldap://default',
    },
    {
      n: 'zimbraAttachmentsIndexedTextLimit',
      _content: '1048576',
    },
    {
      n: 'zimbraImapActiveSessionEhcacheMaxDiskSize',
      _content: '107374182400',
    },
    {
      n: 'zimbraMtaPostscreenCacheRetentionTime',
      _content: '7d',
    },
    {
      n: 'zimbraActiveSyncEhcacheHeapSize',
      _content: '10485760',
    },
    {
      n: 'zimbraMtaTlsAppendDefaultCA',
      _content: 'no',
    },
    {
      n: 'zimbraReverseProxyPop3EnabledCapability',
      _content: 'EXPIRE 31 USER',
    },
    {
      n: 'zimbraReverseProxyPop3EnabledCapability',
      _content: 'TOP',
    },
    {
      n: 'zimbraReverseProxyPop3EnabledCapability',
      _content: 'UIDL',
    },
    {
      n: 'zimbraReverseProxyPop3EnabledCapability',
      _content: 'USER',
    },
    {
      n: 'zimbraReverseProxyPop3EnabledCapability',
      _content: 'XOIP',
    },
    {
      n: 'zimbraMtaSmtpdBanner',
      _content: '$myhostname ESMTP $mail_name',
    },
    {
      n: 'zimbraPurgedConversationsQueueSize',
      _content: '1000000',
    },
    {
      n: 'zimbraLDAPSchemaVersion',
      _content: '1518163473',
    },
    {
      n: 'zimbraReverseProxyXmppBoshEnabled',
      _content: 'FALSE',
    },
    {
      n: 'carbonioWebUiDarkMode',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCBPolicydBypassMode',
      _content: 'tempfail',
    },
    {
      n: 'zimbraMailUncompressedCacheMaxFiles',
      _content: '5000',
    },
    {
      n: 'zimbraSpamTrainingSubjectPrefix',
      _content: 'spam-report:',
    },
    {
      n: 'zimbraCalendarRecurrenceMaxInstances',
      _content: '0',
    },
    {
      n: 'zimbraMtaPostscreenNonSmtpCommandTTL',
      _content: '30d',
    },
    {
      n: 'zimbraShortTermGranteeCacheExpiration',
      _content: '50s',
    },
    {
      n: 'zimbraZimletDataSensitiveInMixedModeDisabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaManpageDirectory',
      _content: '/opt/zextras/common/share/man',
    },
    {
      n: 'zimbraMtaSmtpdSaslAuthenticatedHeader',
      _content: 'no',
    },
    {
      n: 'zimbraCBPolicydAmavisEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraDomainAggregateQuota',
      _content: '0',
    },
    {
      n: 'zimbraMessageCacheSize',
      _content: '200',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'ad:(&(|(displayName=*%s*)(cn=*%s*)(sn=*%s*)(givenName=*%s*)(mail=*%s*))(!(msExchHideFromAddressLists=TRUE))(|(&(objectCategory=person)(objectClass=user)(!(homeMDB=*))(!(msExchHomeServerName=*)))(&(objectCategory=person)(objectClass=user)(|(homeMDB=*)(msExchHomeServerName=*)))(&(objectCategory=person)(objectClass=contact))(objectCategory=group)(objectCategory=publicFolder)(objectCategory=msExchDynamicDistributionList)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'adAutoComplete:(&(|(displayName=%s*)(cn=%s*)(sn=%s*)(givenName=%s*)(mail=%s*))(!(msExchHideFromAddressLists=TRUE))(|(&(objectCategory=person)(objectClass=user)(!(homeMDB=*))(!(msExchHomeServerName=*)))(&(objectCategory=person)(objectClass=user)(|(homeMDB=*)(msExchHomeServerName=*)))(&(objectCategory=person)(objectClass=contact))(objectCategory=group)(objectCategory=publicFolder)(objectCategory=msExchDynamicDistributionList)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'department_has:(ou=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email10_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email11_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email12_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email13_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email14_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email15_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email16_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email2_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email3_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email4_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email5_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email6_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email7_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email8_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email9_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'email_has:(mail=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'externalLdapAutoComplete:(|(cn=%s*)(sn=%s*)(gn=%s*)(mail=%s*))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'firstName_has:(gn=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'lastName_has:(sn=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'middleName_has:(initials=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'nickname_has:(|(displayName=*%s*)(cn=*%s*))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'notes_has:(description=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'phoneticFirstName_has:(zimbraPhoneticFirstName=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'phoneticLastName_has:(zimbraPhoneticLastName=*%s*)',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraAccountAutoComplete:(&(|(displayName=*%s*)(cn=%s*)(sn=%s*)(gn=%s*)(zimbraPhoneticFirstName=%s*)(zimbraPhoneticLastName=%s*)(mail=%s*)(zimbraMailDeliveryAddress=%s*)(zimbraMailAlias=%s*))(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup))(!(objectclass=zimbraCalendarResource)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraAccountSync:(&(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup))(!(objectclass=zimbraCalendarResource)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraAccounts:(&(|(displayName=*%s*)(cn=*%s*)(sn=*%s*)(gn=*%s*)(zimbraPhoneticFirstName=*%s*)(zimbraPhoneticLastName=*%s*)(mail=*%s*)(zimbraMailDeliveryAddress=*%s*)(zimbraMailAlias=*%s*))(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup))(!(objectclass=zimbraCalendarResource)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraAutoComplete:(&(|(displayName=%s*)(cn=%s*)(sn=%s*)(gn=%s*)(zimbraPhoneticFirstName=%s*)(zimbraPhoneticLastName=%s*)(mail=%s*)(zimbraMailDeliveryAddress=%s*)(zimbraMailAlias=%s*))(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraGroupAutoComplete:(&(|(displayName=%s*)(cn=%s*)(sn=%s*)(gn=%s*)(mail=%s*)(zimbraMailDeliveryAddress=%s*)(zimbraMailAlias=%s*))(|(objectclass=zimbraDistributionList)(objectclass=zimbraGroup)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content: 'zimbraGroupSync:(|(objectclass=zimbraDistributionList)(objectclass=zimbraGroup))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraGroups:(&(|(displayName=*%s*)(cn=*%s*)(sn=*%s*)(gn=*%s*)(mail=*%s*)(zimbraMailDeliveryAddress=*%s*)(zimbraMailAlias=*%s*))(|(objectclass=zimbraDistributionList)(objectclass=zimbraGroup)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraResourceAutoComplete:(&(|(displayName=%s*)(cn=%s*)(sn=%s*)(gn=%s*)(mail=%s*)(zimbraMailDeliveryAddress=%s*)(zimbraMailAlias=%s*))(objectclass=zimbraCalendarResource)(zimbraAccountStatus=active))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraResourceSync:(&(objectclass=zimbraCalendarResource)(zimbraAccountStatus=active))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraResources:(&(|(displayName=*%s*)(cn=*%s*)(sn=*%s*)(gn=*%s*)(mail=*%s*)(zimbraMailDeliveryAddress=*%s*)(zimbraMailAlias=*%s*))(objectclass=zimbraCalendarResource)(zimbraAccountStatus=active))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraSearch:(&(|(displayName=*%s*)(cn=*%s*)(sn=*%s*)(gn=*%s*)(zimbraPhoneticFirstName=*%s*)(zimbraPhoneticLastName=*%s*)(mail=*%s*)(zimbraMailDeliveryAddress=*%s*)(zimbraMailAlias=*%s*))(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup)))',
    },
    {
      n: 'zimbraGalLdapFilterDef',
      _content:
        'zimbraSync:(&(|(objectclass=zimbraAccount)(objectclass=zimbraDistributionList)(objectclass=zimbraGroup)(objectclass=zimbraAddressList)(objectclass=zimbraHabGroup))(!(&(objectclass=zimbraCalendarResource)(!(|(zimbraAccountStatus=active)(zimbraIsAddressListActive=TRUE)(zimbraMailStatus=enabled))))))',
    },
    {
      n: 'zimbraGalSyncMaxConcurrentClients',
      _content: '2',
    },
    {
      n: 'zimbraXMPPEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSmtpTlsMandatoryCiphers',
      _content: 'high',
    },
    {
      n: 'zimbraReverseProxyUserLoginLimit',
      _content: '0',
    },
    {
      n: 'zimbraLmtpExposeVersionOnBanner',
      _content: 'FALSE',
    },
    {
      n: 'zimbraChatServiceEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraFileUploadMaxSize',
      _content: '10485760',
    },
    {
      n: 'zimbraPrevFoldersToTrackMax',
      _content: '10',
    },
    {
      n: 'zimbraMtaLmtpTlsMandatoryProtocols',
      _content: '!SSLv2, !SSLv3',
    },
    {
      n: 'zimbraReverseProxyPop3StartTlsMode',
      _content: 'only',
    },
    {
      n: 'zimbraReverseProxyUpstreamFairShmSize',
      _content: '32',
    },
    {
      n: 'zimbraCBPolicydTimeoutBusy',
      _content: '120',
    },
    {
      n: 'zimbraHttpMaxFormContentSize',
      _content: '200000',
    },
    {
      n: 'zimbraMailProxyReconnectTimeout',
      _content: '10',
    },
    {
      n: 'zimbraImapBindOnStartup',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxySSLToUpstreamEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraVirusWarnAdmin',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCalendarRecurrenceMonthlyMaxMonths',
      _content: '360',
    },
    {
      n: 'zimbraReverseProxyAdminEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraAttachmentsBlocked',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyImapPortAttribute',
      _content: 'zimbraImapBindPort',
    },
    {
      n: 'zimbraMailSSLClientCertMode',
      _content: 'Disabled',
    },
    {
      n: 'zimbraRemoteManagementCommand',
      _content: '/opt/zextras/libexec/zmrcd',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'AnonymousIoService',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'CloudRoutingReaderThread',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'GC',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'ImapSSLServer',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'ImapServer',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'LmtpServer',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'Pop3SSLServer',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'Pop3Server',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'ScheduledTask',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'SocketAcceptor',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'Thread',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'Timer',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'btpool',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'pool',
    },
    {
      n: 'zimbraStatThreadNamePrefix',
      _content: 'qtp',
    },
    {
      n: 'zimbraMtaPostscreenPipeliningEnable',
      _content: 'no',
    },
    {
      n: 'zimbraHttpHeaderCacheSize',
      _content: '512',
    },
    {
      n: 'zimbraLmtpBindOnStartup',
      _content: 'FALSE',
    },
    {
      n: 'zimbraSmtpTimeout',
      _content: '60',
    },
    {
      n: 'zimbraExportMaxDays',
      _content: '0',
    },
    {
      n: 'zimbraCalendarResourceExtraObjectClass',
      _content: 'amavisAccount',
    },
    {
      n: 'zimbraNotifySSLServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraHsmMovePreviousRevisions',
      _content: 'FALSE',
    },
    {
      n: 'zimbraScheduledTaskRetry',
      _content: 'TRUE',
    },
    {
      n: 'zimbraImapLoadBalancingAlgorithm',
      _content: 'AccountIdHash',
    },
    {
      n: 'zimbraVirusDefinitionsUpdateFrequency',
      _content: '2h',
    },
    {
      n: 'zimbraImapShutdownGraceSeconds',
      _content: '10',
    },
    {
      n: 'zimbraMtaLmtpTlsSecurityLevel',
      _content: 'may',
    },
    {
      n: 'zimbraHttpNumThreads',
      _content: '250',
    },
    {
      n: 'zimbraInvalidLoginFilterReinstateIpTaskIntervalInMin',
      _content: '5',
    },
    {
      n: 'zimbraReverseProxyIPLoginPop3Limit',
      _content: '0',
    },
    {
      n: 'zimbraArchiveEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyDomainNameAttribute',
      _content: 'zimbraDomainName',
    },
    {
      n: 'zimbraAdminImapImportNumThreads',
      _content: '20',
    },
    {
      n: 'zimbraReverseProxyUserLoginLimitTime',
      _content: '3600',
    },
    {
      n: 'zimbraShareNotificationMtaEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCalendarCalDavDisableScheduling',
      _content: 'FALSE',
    },
    {
      n: 'zimbraFreebusyPropagationRetryInterval',
      _content: '1m',
    },
    {
      n: 'zimbraReverseProxyHttpPortAttribute',
      _content: 'zimbraMailPort',
    },
    {
      n: 'zimbraReverseProxyAcceptMutex',
      _content: 'on',
    },
    {
      n: 'zimbraAdminConsoleSkinEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraDataSourceReadTimeout',
      _content: '60',
    },
    {
      n: 'zimbraMailboxMoveSkipSearchIndex',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaUnverifiedRecipientDeferCode',
      _content: '250',
    },
    {
      n: 'zimbraReverseProxyCacheReconnectInterval',
      _content: '1m',
    },
    {
      n: 'zimbraMtaAuthEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaPostscreenWhitelistInterfaces',
      _content: 'static:all',
    },
    {
      n: 'zimbraReverseProxyUpstreamReadTimeout',
      _content: '60s',
    },
    {
      n: 'zimbraReverseProxySendPop3Xoip',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMilterServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaMailqPath',
      _content: '/opt/zextras/common/sbin/mailq',
    },
    {
      n: 'zimbraReverseProxySendImapId',
      _content: 'TRUE',
    },
    {
      n: 'zimbraAutoProvNotificationBody',
      _content:
        'Your account has been auto provisioned.  Your email address is ${ACCOUNT_ADDRESS}.',
    },
    {
      n: 'zimbraCBPolicydCheckHeloEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxySSLCiphers',
      _content:
        'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384',
    },
    {
      n: 'zimbraPop3BindPort',
      _content: '7110',
    },
    {
      n: 'zimbraHttpOutputBufferSize',
      _content: '32768',
    },
    {
      n: 'zimbraPublicServiceHostname',
      _content: 'localhost',
    },
    {
      n: 'zimbraMtaBlockedExtensionWarnAdmin',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaSmtpdClientAuthRateLimit',
      _content: '0',
    },
    {
      n: 'zimbraMtaBlockedExtensionWarnRecipient',
      _content: 'TRUE',
    },
    {
      n: 'zimbraInvalidLoginFilterMaxFailedLogin',
      _content: '10',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'Expect-CT: max-age=86400',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'Permissions-Policy: "geolocation=(self), microphone=(self)"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'Referrer-Policy: "same-origin"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'X-Content-Type-Options: "nosniff"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'X-Frame-Options: "sameorigin"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'X-Robots-Tag: "noindex, nofollow"',
    },
    {
      n: 'zimbraReverseProxyResponseHeaders',
      _content: 'X-XSS-Protection: "1; mode=block"',
    },
    {
      n: 'zimbraNetworkAdminNGEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyExternalRouteIncludeOriginalAuthusername',
      _content: 'FALSE',
    },
    {
      n: 'carbonioLogoUrl',
      _content: 'https://www.zextras.com',
    },
    {
      n: 'zimbraMtaSaslSmtpdMechList',
      _content: 'LOGIN',
    },
    {
      n: 'zimbraMtaSaslSmtpdMechList',
      _content: 'PLAIN',
    },
    {
      n: 'zimbraMtaEnableSmtpdPolicyd',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaPostscreenBlacklistAction',
      _content: 'ignore',
    },
    {
      n: 'zimbraRemoteManagementPort',
      _content: '22',
    },
    {
      n: 'zimbraReverseProxyUpstreamConnectTimeout',
      _content: '25',
    },
    {
      n: 'zimbraNotebookMaxCachedTemplatesPerFolder',
      _content: '256',
    },
    {
      n: 'zimbraCBPolicydQuotasEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraSieveRejectEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaAddressVerifyNegativeRefreshTime',
      _content: '10m',
    },
    {
      n: 'zimbraCsrfTokenKey',
      _content: '0:1765804034985:e5a057845db64fe6952bc1625a397c396aaaeece5c6316502539db2544938ef2',
    },
    {
      n: 'zimbraMailSSLPort',
      _content: '8443',
    },
    {
      n: 'zimbraAppSpecificPasswordLength',
      _content: '16',
    },
    {
      n: 'zimbraHttpSSLNumThreads',
      _content: '50',
    },
    {
      n: 'zimbraInvalidLoginFilterMaxSizeOfFailedIpDb',
      _content: '7000',
    },
    {
      n: 'zimbraSpamReportEnvelopeFrom',
      _content: '<>',
    },
    {
      n: 'zimbraMtaSmtpDnsSupportLevel',
      _content: 'enabled',
    },
    {
      n: 'zimbraPop3BindOnStartup',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCBPolicydBindPort',
      _content: '10031',
    },
    {
      n: 'zimbraCsrfTokenCheckEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaSmtpdTlsAskCcert',
      _content: 'no',
    },
    {
      n: 'zimbraSpamReportSenderHeader',
      _content: 'X-Zimbra-Spam-Report-Sender',
    },
    {
      n: 'zimbraCBPolicydGreylistingBlacklistMsg',
      _content: 'Greylisting in effect, sending server blacklisted',
    },
    {
      n: 'zimbraDataSourceConnectionType',
      _content: 'cleartext',
    },
    {
      n: 'zimbraMtaMaxMessageSize',
      _content: '10240000',
    },
    {
      n: 'zimbraMtaCanonicalMaps',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-canonical.cf',
    },
    {
      n: 'zimbraClamAVDatabaseMirror',
      _content: 'database.clamav.net',
    },
    {
      n: 'zimbraContactHiddenAttributes',
      _content: 'dn,vcardUID,vcardURL,vcardXProps,member',
    },
    {
      n: 'zimbraNotifySSLBindPort',
      _content: '7036',
    },
    {
      n: 'zimbraLmtpBindPort',
      _content: '7025',
    },
    {
      n: 'zimbraMilterNumThreads',
      _content: '100',
    },
    {
      n: 'zimbraMtaSmtpdVirtualTransport',
      _content: 'error',
    },
    {
      n: 'zimbraAmavisMaxServers',
      _content: '10',
    },
    {
      n: 'zimbraNotifyServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxySSLProtocols',
      _content: 'TLSv1.2',
    },
    {
      n: 'zimbraReverseProxySSLProtocols',
      _content: 'TLSv1.3',
    },
    {
      n: 'zimbraMtaPostscreenBareNewlineTTL',
      _content: '30d',
    },
    {
      n: 'zimbraMtaSmtpHeloName',
      _content: '$myhostname',
    },
    {
      n: 'zimbraVersionCheckSendNotifications',
      _content: 'TRUE',
    },
    {
      n: 'zimbraPop3SSLProxyBindPort',
      _content: '995',
    },
    {
      n: 'carbonioAmavisDisableVirusCheck',
      _content: 'FALSE',
    },
    {
      n: 'zimbraNetworkMobileNGEnabled',
      _content: 'FALSE',
    },
    {
      n: 'carbonioSendFullErrorStack',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailboxMoveFailedCleanupTaskInterval',
      _content: '20m',
    },
    {
      n: 'zimbraMemcachedClientHashAlgorithm',
      _content: 'KETAMA_HASH',
    },
    {
      n: 'zimbraRedoLogRolloverMinFileAge',
      _content: '60',
    },
    {
      n: 'zimbraClusterType',
      _content: 'none',
    },
    {
      n: 'zimbraVirusCheckEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaAliasMaps',
      _content: 'lmdb:/etc/aliases',
    },
    {
      n: 'zimbraReverseProxyImapExposeVersionOnBanner',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCBPolicydGreylistingEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraTableMaintenanceMaxRows',
      _content: '1000000',
    },
    {
      n: 'zimbraZimletJspEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMobileMaxMessageSize',
      _content: '10240000',
    },
    {
      n: 'zimbraDomainAggregateQuotaPolicy',
      _content: 'ALLOWSENDRECEIVE',
    },
    {
      n: 'zimbraReverseProxyAuthWaitInterval',
      _content: '10s',
    },
    {
      n: 'zimbraMtaLmtpTlsCiphers',
      _content: 'export',
    },
    {
      n: 'zimbraAPNSProduction',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyDnsLookupInServerEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyImapSaslGssapiEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyAdminPortAttribute',
      _content: 'zimbraAdminPort',
    },
    {
      n: 'zimbraRedoLogRolloverFileSizeKB',
      _content: '1048576',
    },
    {
      n: 'carbonioWebUiDescription',
      _content: 'Carbonio Client',
    },
    {
      n: 'zimbraAttachmentsViewInHtmlOnly',
      _content: 'FALSE',
    },
    {
      n: 'zimbraCBPolicydMaxRequests',
      _content: '1000',
    },
    {
      n: 'zimbraMtaVirtualAliasMaps',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-vam.cf',
    },
    {
      n: 'zimbraHttpDebugHandlerEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraGalAlwaysIncludeLocalCalendarResources',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailPurgeBatchSize',
      _content: '1000',
    },
    {
      n: 'zimbraScheduledTaskMaxRetryDelay',
      _content: '10m',
    },
    {
      n: 'zimbraMtaSmtpSaslSecurityOptions',
      _content: 'noplaintext,noanonymous',
    },
    {
      n: 'zimbraWebClientMaxInputBufferLength',
      _content: '1024',
    },
    {
      n: 'objectClass',
      _content: 'organizationalRole',
    },
    {
      n: 'objectClass',
      _content: 'zimbraGlobalConfig',
    },
    {
      n: 'zimbraAmavisDSPAMEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaAuthPort',
      _content: '7073',
    },
    {
      n: 'zimbraImapMaxConnections',
      _content: '200',
    },
    {
      n: 'zimbraImapDisplayMailFoldersOnly',
      _content: 'TRUE',
    },
    {
      n: 'zimbraFreebusyExchangeServerType',
      _content: 'webdav',
    },
    {
      n: 'zimbraCBPolicydAccessControlEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraLowestSupportedAuthVersion',
      _content: '2',
    },
    {
      n: 'zimbraMtaTlsAuthOnly',
      _content: 'TRUE',
    },
    {
      n: 'zimbraBackupSkipHsmBlobs',
      _content: 'FALSE',
    },
    {
      n: 'zimbraWebGzipEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraAdminAccessControlMech',
      _content: 'acl',
    },
    {
      n: 'zimbraItemActionBatchSize',
      _content: '1000',
    },
    {
      n: 'zimbraMtaPostscreenDnsblTimeout',
      _content: '10s',
    },
    {
      n: 'zimbraMtaSaslAuthEnable',
      _content: 'yes',
    },
    {
      n: 'zimbraSpellAvailableDictionary',
      _content: 'en_US',
    },
    {
      n: 'zimbraSmtpSendAddMailer',
      _content: 'TRUE',
    },
    {
      n: 'zimbraAdminSieveFeatureVariablesEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraDataSourceConnectTimeout',
      _content: '30',
    },
    {
      n: 'zimbraFeatureContactBackupLifeTime',
      _content: '15d',
    },
    {
      n: 'zimbraMtaMyDestination',
      _content: 'localhost',
    },
    {
      n: 'zimbraPop3MaxConnections',
      _content: '200',
    },
    {
      n: 'zimbraReverseProxySSLSessionCacheSize',
      _content: '10m',
    },
    {
      n: 'zimbraImapExposeVersionOnBanner',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaHeaderChecks',
      _content: 'pcre:/opt/zextras/conf/postfix_header_checks',
    },
    {
      n: 'zimbraMtaSmtpTlsSecurityLevel',
      _content: 'may',
    },
    {
      n: 'zimbraPop3SSLBindPort',
      _content: '7995',
    },
    {
      n: 'zimbraGalLdapValueMap',
      _content: 'zimbraAccountCalendarUserType: Room|Equipment RESOURCE',
    },
    {
      n: 'zimbraGalLdapValueMap',
      _content: 'zimbraCalResType: Room Location',
    },
    {
      n: 'zimbraReverseProxyMailEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraShortTermGranteeCacheSize',
      _content: '128',
    },
    {
      n: 'zimbraDomainMandatoryMailSignatureEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraSpamHeaderValue',
      _content: 'YES',
    },
    {
      n: 'zimbraHttpCompressionEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaVirtualMailboxDomains',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-vmd.cf',
    },
    {
      n: 'zimbraOpenImapFolderRequestChunkSize',
      _content: '1000',
    },
    {
      n: 'zimbraMailFileDescriptorBufferSize',
      _content: '4096',
    },
    {
      n: 'zimbraMtaSmtpdRejectUnlistedRecipient',
      _content: 'yes',
    },
    {
      n: 'zimbraInternalSharingCrossDomainEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraSmtpSendPartial',
      _content: 'FALSE',
    },
    {
      n: 'zimbraTwoFactorTimeWindowLength',
      _content: '30s',
    },
    {
      n: 'zimbraHttpConnectorMaxIdleTimeMillis',
      _content: '60000',
    },
    {
      n: 'zimbraRegexMaxAccessesWhenMatching',
      _content: '1000000',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'cer',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'crt',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'der',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'p7b',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'p7r',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'pem',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'spc',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'sst',
    },
    {
      n: 'zimbraSmimePublicCertificateExtensions',
      _content: 'sto',
    },
    {
      n: 'zimbraContactSearchDecomposition',
      _content: '2',
    },
    {
      n: 'zimbraReverseProxyExactServerVersionCheck',
      _content: 'on',
    },
    {
      n: 'zimbraSpamReportTypeHam',
      _content: 'ham',
    },
    {
      n: 'zimbraScheduledTaskRetryPolicy',
      _content: 'exponential',
    },
    {
      n: 'zimbraCalendarCalDavUseDistinctAppointmentAndToDoCollection',
      _content: 'FALSE',
    },
    {
      n: 'zimbraFileUploadMaxSizePerFile',
      _content: '2147483648',
    },
    {
      n: 'zimbraPop3ShutdownGraceSeconds',
      _content: '10',
    },
    {
      n: 'zimbraGalTokenizeSearchKey',
      _content: 'and',
    },
    {
      n: 'zimbraMtaSmtpdTlsMandatoryCiphers',
      _content: 'high',
    },
    {
      n: 'zimbraClamAVListenPort',
      _content: '3310',
    },
    {
      n: 'zimbraReverseProxyInactivityTimeout',
      _content: '1h',
    },
    {
      n: 'zimbraMemcachedClientExpirySeconds',
      _content: '86400',
    },
    {
      n: 'carbonioSearchAllDomainsByFeature',
      _content: 'FALSE',
    },
    {
      n: 'zimbraGalAutoCompleteLdapFilter',
      _content: 'externalLdapAutoComplete',
    },
    {
      n: 'zimbraReverseProxyGenConfigPerVirtualHostname',
      _content: 'TRUE',
    },
    {
      n: 'carbonioAutoProvTimestampFormat',
      _content: "yyyyMMddHHmmss.SSS'Z'",
    },
    {
      n: 'zimbraContactRankingTableRefreshInterval',
      _content: '7d',
    },
    {
      n: 'zimbraPop3CleartextLoginEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraEmptyFolderOpTimeout',
      _content: '3',
    },
    {
      n: 'zimbraRedoLogDeleteOnRollover',
      _content: 'TRUE',
    },
    {
      n: 'zimbraTwoFactorAuthScratchCodeEncoding',
      _content: 'BASE32',
    },
    {
      n: 'zimbraBackupAutoGroupedNumGroups',
      _content: '7',
    },
    {
      n: 'zimbraDomainAggregateQuotaWarnPercent',
      _content: '80',
    },
    {
      n: 'zimbraHttpResponseHeaderSize',
      _content: '8192',
    },
    {
      n: 'zimbraSSLExcludeCipherSuites',
      _content: '.*_RC4_.*',
    },
    {
      n: 'zimbraSSLExcludeCipherSuites',
      _content: '^.*_(MD5|SHA|SHA1)$',
    },
    {
      n: 'zimbraSSLExcludeCipherSuites',
      _content: '^TLS_RSA_.*',
    },
    {
      n: 'zimbraBackupReportEmailSubjectPrefix',
      _content: 'ZCS Backup Report',
    },
    {
      n: 'zimbraClamAVMaxThreads',
      _content: '10',
    },
    {
      n: 'zimbraHttpDosFilterDelayMillis',
      _content: '-1',
    },
    {
      n: 'zimbraVirusBlockEncryptedArchive',
      _content: 'TRUE',
    },
    {
      n: 'zimbraGalLdapPageSize',
      _content: '1000',
    },
    {
      n: 'zimbraChatXmppSslPort',
      _content: '5223',
    },
    {
      n: 'zimbraMtaAddressVerifyPositiveRefreshTime',
      _content: '12h',
    },
    {
      n: 'zimbraSpamReportTypeHeader',
      _content: 'X-Zimbra-Spam-Report-Type',
    },
    {
      n: 'zimbraSmtpHostname',
      _content: 'carbonio-postfix',
    },
    {
      n: 'zimbraMailSieveNotifyActionRFCCompliant',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaPolicyTimeLimit',
      _content: '3600',
    },
    {
      n: 'zimbraReverseProxyLookupTarget',
      _content: 'FALSE',
    },
    {
      n: 'zimbraLogToSyslog',
      _content: 'FALSE',
    },
    {
      n: 'zimbraReverseProxyMailPop3sEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraDNSTCPUpstream',
      _content: 'no',
    },
    {
      n: 'zimbraMtaHopcountLimit',
      _content: '50',
    },
    {
      n: 'zimbraReverseProxyXmppBoshLocalHttpBindURL',
      _content: '/http-bind',
    },
    {
      n: 'zimbraAdminConsoleLDAPAuthEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaPostscreenWatchdogTimeout',
      _content: '10s',
    },
    {
      n: 'carbonioAdminUiDescription',
      _content: 'Carbonio Admin UI',
    },
    {
      n: 'zimbraImapNumThreads',
      _content: '200',
    },
    {
      n: 'zimbraMailClearTextPasswordEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaPostscreenAccessList',
      _content: 'permit_mynetworks',
    },
    {
      n: 'zimbraLmtpLHLORequired',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaVirtualAliasDomains',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-vad.cf',
    },
    {
      n: 'zimbraMtaVirtualMailboxMaps',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-vmm.cf',
    },
    {
      n: 'zimbraLmtpPermanentFailureWhenOverQuota',
      _content: 'TRUE',
    },
    {
      n: 'zimbraFeatureContactBackupFrequency',
      _content: '0',
    },
    {
      n: 'zimbraShortTermAllEffectiveRightsCacheSize',
      _content: '128',
    },
    {
      n: 'zimbraMtaSmtpdHardErrorLimit',
      _content: '20',
    },
    {
      n: 'zimbraSSDBResourcePoolSize',
      _content: '0',
    },
    {
      n: 'zimbraMailDiskStreamingThreshold',
      _content: '1048576',
    },
    {
      n: 'zimbraGalMaxResults',
      _content: '100',
    },
    {
      n: 'zimbraMtaSmtpTlsCiphers',
      _content: 'high',
    },
    {
      n: 'zimbraMtaSmtpdClientPortLogging',
      _content: 'no',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'ACL',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'BINARY',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'CATENATE',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'CHILDREN',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'CONDSTORE',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'ENABLE',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'ESEARCH',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'ESORT',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'I18NLEVEL=1',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'ID',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'IDLE',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'IMAP4rev1',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'LIST-EXTENDED',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'LIST-STATUS',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'LITERAL+',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'MULTIAPPEND',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'NAMESPACE',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'QRESYNC',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'QUOTA',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'RIGHTS=ektx',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'SASL-IR',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'SEARCHRES',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'SORT',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'THREAD=ORDEREDSUBJECT',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'UIDPLUS',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'UNSELECT',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'WITHIN',
    },
    {
      n: 'zimbraReverseProxyImapEnabledCapability',
      _content: 'XLIST',
    },
    {
      n: 'carbonioUserDocumentationUrl',
      _content: 'https://docs.zextras.com/carbonio/html/usage.html',
    },
    {
      n: 'zimbraShortTermAllEffectiveRightsCacheExpiration',
      _content: '50s',
    },
    {
      n: 'zimbraCBPolicydCheckSPFEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraAdminPort',
      _content: '7071',
    },
    {
      n: 'zimbraReverseProxyIPLoginImapLimitTime',
      _content: '3600',
    },
    {
      n: 'zimbraMailTrustedIP',
      _content: '127.0.0.1',
    },
    {
      n: 'zimbraSmimeUserCertificateExtensions',
      _content: 'p12',
    },
    {
      n: 'zimbraSmimeUserCertificateExtensions',
      _content: 'pfx',
    },
    {
      n: 'zimbraChatAllowUnencryptedPassword',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMailSSLProxyPort',
      _content: '0',
    },
    {
      n: 'zimbraImapServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraSmtpPort',
      _content: '25',
    },
    {
      n: 'zimbraMessageIdDedupeCacheTimeout',
      _content: '0',
    },
    {
      n: 'zimbraReverseProxyImapSSLPortAttribute',
      _content: 'zimbraImapSSLBindPort',
    },
    {
      n: 'zimbraDomainExtraObjectClass',
      _content: 'amavisAccount',
    },
    {
      n: 'zimbraReverseProxyHttpEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraCBPolicydMaxSpareServers',
      _content: '12',
    },
    {
      n: 'zimbraReverseProxyRouteLookupTimeout',
      _content: '15s',
    },
    {
      n: 'zimbraSaslGssapiRequiresTls',
      _content: 'FALSE',
    },
    {
      n: 'zimbraIPMode',
      _content: 'ipv4',
    },
    {
      n: 'zimbraPop3SaslGssapiEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraImapCleartextLoginEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaSmtpdTlsLoglevel',
      _content: '1',
    },
    {
      n: 'zimbraMtaDelayWarningTime',
      _content: '0h',
    },
    {
      n: 'zimbraReverseProxyMailImapsEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraReverseProxyPassErrors',
      _content: 'TRUE',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'alias=zimbraMailAlias',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'commonName=cn',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'company=company',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'country=co',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'department=ou',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'displayName=displayName',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'firstName=givenName',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'initials=initials',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'jobTitle=title',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'lastName=sn',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'office=physicalDeliveryOfficeName',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'workCity=l',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'workPhone=telephoneNumber',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'workState=st',
    },
    {
      n: 'zimbraHABMemberLdapAttrMap',
      _content: 'workStreet=streetAddress',
    },
    {
      n: 'zimbraHttpDosFilterMaxRequestsPerSec',
      _content: '100',
    },
    {
      n: 'zimbraBackupMode',
      _content: 'Standard',
    },
    {
      n: 'zimbraCalendarRecurrenceWeeklyMaxWeeks',
      _content: '520',
    },
    {
      n: 'zimbraTwoFactorCodeLength',
      _content: '6',
    },
    {
      n: 'zimbraSmtpSendAddOriginatingIP',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMilterBindPort',
      _content: '7026',
    },
    {
      n: 'zimbraMtaDnsLookupsEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraChatXmppPort',
      _content: '5222',
    },
    {
      n: 'zimbraMtaPostscreenDnsblTTL',
      _content: '1h',
    },
    {
      n: 'zimbraImapSSLServerEnabled',
      _content: 'TRUE',
    },
    {
      n: 'zimbraMtaPostscreenGreetTTL',
      _content: '1d',
    },
    {
      n: 'zimbraReverseProxySSLSessionTimeout',
      _content: '10m',
    },
    {
      n: 'carbonioVideoServerRecordingEnabled',
      _content: 'FALSE',
    },
    {
      n: 'zimbraMtaSmtpdSenderLoginMaps',
      _content: 'proxy:ldap:/opt/zextras/conf/ldap-slm.cf',
    },
  ],
  _jsns: 'urn:zimbraAdmin',
};
