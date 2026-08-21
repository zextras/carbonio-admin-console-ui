/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  type DirectoryEntry,
  type DomainDirectories,
  searchDirectory,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';

const DIRECTORY_SEARCH_TYPE = 'accounts,distributionlists,aliases,resources,dynamicgroups';
const DIRECTORY_SEARCH_ATTRS =
  'zimbraAliasTargetId,zimbraId,targetName,uid,type,description,displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,displayName,zimbraId,zimbraMailHost,uid,zimbraAccountStatus,description,zimbraCalResType,displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus, zimbraIsSystemAccount';

const PAGE_LIMIT = 1000;

export async function collectDomainDirectories(domainName: string): Promise<DomainDirectories> {
  return collectPage(domainName, 0, {
    account: [],
    dl: [],
    alias: [],
    calresource: [],
  });
}

async function collectPage(
  domainName: string,
  offset: number,
  accumulated: DomainDirectories,
): Promise<DomainDirectories> {
  const data = await searchDirectory({
    attr: DIRECTORY_SEARCH_ATTRS,
    type: DIRECTORY_SEARCH_TYPE,
    domainName,
    query: '',
    offset,
    limit: PAGE_LIMIT,
  });

  const next: DomainDirectories = {
    account: [...accumulated.account],
    dl: [...accumulated.dl],
    alias: [...accumulated.alias],
    calresource: [...accumulated.calresource],
  };

  if (data.account?.length) {
    data.account.forEach((item: DirectoryEntry) => {
      const zimbraIsSystemAccount = find(item.a, { n: 'zimbraIsSystemAccount' });
      if (zimbraIsSystemAccount) {
        item.zimbraIsSystemAccount = zimbraIsSystemAccount._content;
      }
    });
    next.account.push(...data.account);
  }
  if (data.dl?.length) {
    next.dl.push(...data.dl);
  }
  if (data.alias?.length) {
    next.alias.push(...data.alias);
  }
  if (data.calresource?.length) {
    next.calresource.push(...data.calresource);
  }

  if (data.more) {
    return collectPage(domainName, offset + PAGE_LIMIT, next);
  }

  return next;
}
