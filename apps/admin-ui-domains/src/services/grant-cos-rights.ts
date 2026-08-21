/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { HELPDESK_ADMINS, ZIMBRA_ADMIN_URN } from '../constants';

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
