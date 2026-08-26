/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INTERNAL_GAL } from '../../constants';
import type { CreateDomainFormValues } from './types';

export const GAL_MODE_INTERNAL = 'zimbra';

export const CREATE_DOMAIN_DEFAULT_VALUES: CreateDomainFormValues = {
  domainName: '',
  zimbraDomainMaxAccounts: '',
  domainQuotaGB: '',
  description: '',
  zimbraNotes: '',
  galSyncAccountName: 'galsync',
  dataSourceName: INTERNAL_GAL,
  mailServer: undefined,
  zimbraDomainDefaultCOSId: '',
  isDomainDelegatedAdmin: false,
  carbonioNotificationFrom: '',
  carbonioNotificationRecipients: [],
};
