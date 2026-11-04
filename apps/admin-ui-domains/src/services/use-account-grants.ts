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

/** Folder grantee types that are real delegates; pub/all/dom/guest/key shares are not. */
const DELEGATE_FOLDER_GRANTEE_TYPES: Record<string, true> = { usr: true, grp: true };

const SEND_RIGHTS: Record<string, true> = { sendAs: true, sendOnBehalfOf: true };

type GrantRight = { _content: string };

function flatten(item: any): any {
  return [item, flatMapDeep(item.folder, flatten)];
}

/**
 * GetGrants returns one entry per (grantee, right). Collapse them to one identity per grantee so a
 * delegate holding several rights is a single row. Send rights come first because consumers read
 * `right[0]`.
 */
function mergeAdminGrants(grants: Array<any>): Array<any> {
  const identities = new Map<string, any>();
  grants.forEach((grant) => {
    const grantee = grant?.grantee?.[0];
    const key = grantee?.id ?? grantee?.name ?? '';
    const rights: Array<GrantRight> = grant?.right ?? [];
    const existing = identities.get(key);
    if (existing) {
      rights.forEach((right) => {
        if (!existing.right.some((r: GrantRight) => r._content === right._content)) {
          existing.right.push(right);
        }
      });
    } else {
      identities.set(key, { ...grant, right: [...rights] });
    }
  });
  return [...identities.values()].map((identity) => ({
    ...identity,
    right: [...identity.right].sort(
      (a: GrantRight, b: GrantRight) =>
        Number(!!SEND_RIGHTS[b._content]) - Number(!!SEND_RIGHTS[a._content]),
    ),
  }));
}

export type AccountGrants = {
  folderList: Array<any>;
  identitiesList: Array<any>;
};

export function mergeFolderGrants(
  filteredFolders: Array<any>,
  grants: Array<any> = [],
): AccountGrants {
  const identitiesList = mergeAdminGrants(grants);
  filteredFolders.forEach((folder) => {
    folder?.acl?.grant?.forEach((grant: any) => {
      if (!DELEGATE_FOLDER_GRANTEE_TYPES[grant?.gt] || !grant?.d) {
        return;
      }
      const folderGrant = { ...grant, id: folder.id, name: folder.name };
      const index = identitiesList.findIndex(
        (identity) => identity?.grantee?.[0]?.name?.toLowerCase() === grant.d.toLowerCase(),
      );
      if (index >= 0) {
        const existing = identitiesList[index];
        identitiesList[index] = { ...existing, folder: [...(existing.folder ?? []), folderGrant] };
      } else {
        identitiesList.push({
          grantee: [{ id: grant.zid, name: grant.d, type: grant.gt }],
          folder: [folderGrant],
        });
      }
    });
  });
  return { folderList: filteredFolders, identitiesList };
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
      const allFolder: Array<any> = flatMapDeep(
        folderRes?.Body?.GetFolderResponse?.folder ?? [],
        flatten,
      );
      allFolder.forEach((ele: any) => {
        ele.id = ele.id?.split(':')?.[1];
      });
      const filteredFolders = filter(allFolder, (ele: any) => ROOT_FOLDER_IDS.has(ele.id));
      return mergeFolderGrants(filteredFolders, grantsRes?.Body?.GetGrantsResponse?.grant ?? []);
    },
    enabled: !!account?.id && !!account?.name,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
