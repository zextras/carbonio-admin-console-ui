/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getAllConfigRightsBaseResponseMock = {
  grantee: [
    {
      type: 'usr',
      id: 'test-user-id',
      name: 'test@example.com',
    },
  ],
  target: [
    {
      type: 'account',
      all: [
        {
          right: [
            {
              n: 'addAccountAlias',
            },
            {
              n: 'adminLoginAs',
            },
            {
              n: 'changeAccountPassword',
            },
            {
              n: 'checkPasswordStrength',
            },
            {
              n: 'checkRightUsr',
            },
            {
              n: 'deleteAccount',
            },
            {
              n: 'getAccountInfo',
            },
            {
              n: 'getAccountMembership',
            },
            {
              n: 'getMailboxInfo',
            },
            {
              n: 'listAccount',
            },
            {
              n: 'manageAccountArchives',
            },
            {
              n: 'moveAccountMailbox',
            },
            {
              n: 'purgeMessages',
            },
            {
              n: 'reindexMailbox',
            },
            {
              n: 'remoteWipe',
            },
            {
              n: 'removeAccountAlias',
            },
            {
              n: 'renameAccount',
            },
            {
              n: 'setAccountPassword',
            },
            {
              n: 'viewAccountAdminUI',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'config',
      all: [
        {
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'global',
      all: [
        {
          right: [
            {
              n: 'checkSoftwareUpdates',
            },
            {
              n: 'countCos',
            },
            {
              n: 'countDomain',
            },
            {
              n: 'countServer',
            },
            {
              n: 'createCos',
            },
            {
              n: 'createServer',
            },
            {
              n: 'createTopDomain',
            },
            {
              n: 'createXMPPComponent',
            },
            {
              n: 'createZimlet',
            },
            {
              n: 'getAllFreeBusyProviders',
            },
            {
              n: 'installZCSLicense',
            },
            {
              n: 'uploadClientSoftware',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'xmppcomponent',
    },
    {
      type: 'calresource',
      all: [
        {
          right: [
            {
              n: 'addCalendarResourceAlias',
            },
            {
              n: 'adminLoginCalendarResourceAs',
            },
            {
              n: 'changeCalendarResourcePassword',
            },
            {
              n: 'checkCalendarResourcePasswordStrength',
            },
            {
              n: 'deleteCalendarResource',
            },
            {
              n: 'getCalendarResourceInfo',
            },
            {
              n: 'listCalendarResource',
            },
            {
              n: 'manageCalendarResourceArchives',
            },
            {
              n: 'moveCalendarResourceMailbox',
            },
            {
              n: 'reindexCalendarResourceMailbox',
            },
            {
              n: 'removeCalendarResourceAlias',
            },
            {
              n: 'renameCalendarResource',
            },
            {
              n: 'setCalendarResourcePassword',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'dl',
      all: [
        {
          right: [
            {
              n: 'addDistributionListAlias',
            },
            {
              n: 'addDistributionListMember',
            },
            {
              n: 'checkRightGrp',
            },
            {
              n: 'deleteDistributionList',
            },
            {
              n: 'getDistributionListMembership',
            },
            {
              n: 'listDistributionList',
            },
            {
              n: 'removeDistributionListAlias',
            },
            {
              n: 'removeDistributionListMember',
            },
            {
              n: 'renameDistributionList',
            },
            {
              n: 'viewDistributionListAdminUI',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      all: [
        {
          right: [
            {
              n: 'addGroupAlias',
            },
            {
              n: 'addGroupMember',
            },
            {
              n: 'deleteGroup',
            },
            {
              n: 'listGroup',
            },
            {
              n: 'removeGroupAlias',
            },
            {
              n: 'removeGroupMember',
            },
            {
              n: 'renameGroup',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'cos',
      all: [
        {
          right: [
            {
              n: 'assignCos',
            },
            {
              n: 'deleteCos',
            },
            {
              n: 'listCos',
            },
            {
              n: 'manageZimlet',
            },
            {
              n: 'renameCos',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'domain',
      all: [
        {
          right: [
            {
              n: 'accessGAL',
            },
            {
              n: 'autoProvisionAccount',
            },
            {
              n: 'checkExchangeAuthConfig',
            },
            {
              n: 'countAccount',
            },
            {
              n: 'countAlias',
            },
            {
              n: 'countCalendarResource',
            },
            {
              n: 'countDistributionList',
            },
            {
              n: 'createAccount',
            },
            {
              n: 'createAlias',
            },
            {
              n: 'createCalendarResource',
            },
            {
              n: 'createDistributionList',
            },
            {
              n: 'createGroup',
            },
            {
              n: 'createSubDomain',
            },
            {
              n: 'crossDomainAdmin',
            },
            {
              n: 'deleteAlias',
            },
            {
              n: 'deleteDomain',
            },
            {
              n: 'getDomainQuotaUsage',
            },
            {
              n: 'listAlias',
            },
            {
              n: 'listDomain',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'server',
      all: [
        {
          right: [
            {
              n: 'applianceAll',
            },
            {
              n: 'backupAccount',
            },
            {
              n: 'checkDirectoryOnFileSystem',
            },
            {
              n: 'checkHealth',
            },
            {
              n: 'createMigrationTask',
            },
            {
              n: 'deleteServer',
            },
            {
              n: 'deployZimlet',
            },
            {
              n: 'flushCache',
            },
            {
              n: 'generateCSR',
            },
            {
              n: 'getCSR',
            },
            {
              n: 'getCertificateInfo',
            },
            {
              n: 'getHSMStatus',
            },
            {
              n: 'getMailboxStats',
            },
            {
              n: 'getServerStats',
            },
            {
              n: 'getServiceStatus',
            },
            {
              n: 'getSessions',
            },
            {
              n: 'installCertificate',
            },
            {
              n: 'listServer',
            },
            {
              n: 'manageAccountLogger',
            },
            {
              n: 'manageCrossMailboxSearchTask',
            },
            {
              n: 'manageMailQueue',
            },
            {
              n: 'manageVolume',
            },
            {
              n: 'moveBlobs',
            },
            {
              n: 'moveMailboxFromServer',
            },
            {
              n: 'moveMailboxToServer',
            },
            {
              n: 'restoreAccount',
            },
            {
              n: 'rolloverRedoLog',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
    {
      type: 'zimlet',
      all: [
        {
          right: [
            {
              n: 'deleteZimlet',
            },
            {
              n: 'listZimlet',
            },
          ],
          setAttrs: [
            {
              all: true,
            },
          ],
          getAttrs: [
            {
              all: true,
            },
          ],
        },
      ],
    },
  ],
  _jsns: 'urn:zimbraAdmin',
};
