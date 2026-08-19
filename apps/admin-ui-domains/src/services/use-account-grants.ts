/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQuery } from '@tanstack/react-query';
import { postSoapFetchRequest } from '@zextras/ui-shared';
import { filter, flatMapDeep } from 'lodash-es';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { domainQueryKeys } from './domain-query-keys';

const ROOT_FOLDER_IDS = new Set(['1', '2', '7', '10', '4', '5', '6', '3']);

function flatten(item: any): any {
  return [item, flatMapDeep(item.folder, flatten)];
}

export type AccountGrants = {
  folderList: Array<any>;
  identitiesList: Array<any>;
};

export function mergeFolderGrants(
  filteredFolders: Array<any>,
  delegateList: Array<any> = [],
): AccountGrants {
  const userDelegate: Array<any> = [];
  filteredFolders.forEach((ele) => {
    ele?.acl?.grant?.forEach((el: any) => {
      userDelegate.push({ ...el, id: ele.id, name: ele.name });
    });
  });
  userDelegate.forEach((ele) => {
    const existing = delegateList.find((el: any) => el?.grantee?.[0]?.name === ele?.d);
    if (existing) {
      existing.folder = [...(existing.folder ?? []), ele];
    } else {
      delegateList.push({
        grantee: [{ id: ele.zid, name: ele.d, type: ele.gt }],
        folder: [ele],
      });
    }
  });
  return { folderList: filteredFolders, identitiesList: delegateList };
}

export const useAccountGrants = (account: { id: string; name: string } | undefined) =>
  useQuery({
    queryKey: domainQueryKeys.accountGrants(account?.id ?? ''),
    queryFn: async () => {
      const grantsRes = await postSoapFetchRequest<any, any>(
        `/service/admin/soap/GetGrantsRequest`,
        {
          _jsns: ZIMBRA_ADMIN_URN,
          target: { _content: account!.name, type: 'account', by: 'name' },
        },
        'GetGrantsRequest',
        account!.id,
      );
      const folderRes = await postSoapFetchRequest<any, any>(
        `/service/admin/soap/GetFolderRequest`,
        { _jsns: 'urn:zimbraMail' },
        'GetFolderRequest',
        account!.id,
      );
      const allFolder =
        folderRes?.Body?.GetFolderResponse?.folder ||
        flatMapDeep(folderRes?.Body?.GetFolderResponse?.folder, flatten) ||
        [];
      allFolder.forEach((ele: any) => {
        ele.id = ele.id?.split(':')?.[1];
      });
      const filteredFolders = filter(allFolder, (ele: any) => ROOT_FOLDER_IDS.has(ele.id));
      return mergeFolderGrants(filteredFolders, grantsRes?.Body?.GetGrantsResponse?.grant || []);
    },
    enabled: !!account?.id && !!account?.name,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
