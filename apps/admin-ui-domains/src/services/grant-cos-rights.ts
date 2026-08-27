/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { Attribute, CosMaxAccountValues } from '../../types';
import { HELPDESK_ADMINS, ZIMBRA_ADMIN_URN, ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS } from '../constants';

const COS_RIGHTS = ['getCos', 'listCos', 'assignCos'] as const;

type CosRightTarget = { _content: string; type: 'cos'; by: 'id' };
type CosRightGrantee = { by: 'name'; type: 'grp'; _content: string };

function buildTargetAndGrantee(
  cosId: string,
  domainName: string,
): { target: CosRightTarget; grantee: CosRightGrantee } {
  return {
    target: { _content: cosId, type: 'cos', by: 'id' },
    grantee: { by: 'name', type: 'grp', _content: `${HELPDESK_ADMINS}@${domainName}` },
  };
}

export async function grantCosRights(cosId: string, domainName: string): Promise<void> {
  const { target, grantee } = buildTargetAndGrantee(cosId, domainName);
  for (const right of COS_RIGHTS) {
    await postSoapFetchRequest(
      '/service/admin/soap/GrantRightRequest',
      { _jsns: ZIMBRA_ADMIN_URN, target, grantee, right: { _content: right } },
      'GrantRightRequest',
    );
  }
}

export async function revokeCosRights(cosId: string, domainName: string): Promise<void> {
  const { target, grantee } = buildTargetAndGrantee(cosId, domainName);
  for (const right of COS_RIGHTS) {
    await postSoapFetchRequest(
      '/service/admin/soap/RevokeRightRequest',
      { _jsns: ZIMBRA_ADMIN_URN, target, grantee, right: { _content: right } },
      'RevokeRightRequest',
    );
  }
}

/**
 * Grants the delegation rights on every given COS in parallel, resolving once
 * all grants have settled (INIT DOMAIN flow).
 */
export async function grantAllCosRights(
  domainName: string,
  cosIds: Array<string>,
): Promise<Array<void>> {
  return Promise.all(cosIds.map((cosId) => grantCosRights(cosId, domainName)));
}

/**
 * Parses the `zimbraDomainCOSMaxAccounts` attributes of a domain into
 * `{ id, value }` pairs. A missing max-accounts value is reported as `-1`,
 * mirroring the server-side default (unlimited).
 */
export function parseCosMaxAccounts(
  attrs: Array<Attribute> | undefined,
): Array<CosMaxAccountValues> {
  return (attrs ?? [])
    .filter((attr) => attr.n === ZIMBRA_DOMAIN_COS_MAX_ACCOUNTS)
    .map((attr) => {
      const [id, value] = attr._content.split(':');
      return { id, value: value ?? '-1' };
    });
}
