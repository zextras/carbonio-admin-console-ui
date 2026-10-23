/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import { ZIMBRA_ADMIN_URN } from '../constants';

export const ASSIGN_COS_RIGHT = 'assignCos';

/**
 * Whether the given admin is allowed to assign the COS to an account.
 * @param cosId The ID of the COS.
 * @param granteeName The name (email) of the admin.
 */
export const checkAssignCosRight = async (cosId: string, granteeName: string): Promise<boolean> => {
  const response: unknown = await soapFetch('CheckRight', {
    _jsns: ZIMBRA_ADMIN_URN,
    target: { _content: cosId, type: 'cos', by: 'id' },
    grantee: { _content: granteeName, by: 'name' },
    right: { _content: ASSIGN_COS_RIGHT },
  });

  return typeof response === 'object' && response !== null && 'allow' in response
    ? Boolean(response.allow)
    : false;
};
