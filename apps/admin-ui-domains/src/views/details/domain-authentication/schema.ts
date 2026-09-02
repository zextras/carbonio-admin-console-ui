/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidLdapBaseUrl } from '../../utility/utils';

export const ZIMBRA_AUTH_METHOD = {
  CARBONIO: '',
  INTERNAL: 'zimbra',
  LDAP: 'ldap',
  EXTERNAL: 'ad',
} as const;

export const DOMAIN_AUTH_VALIDATION_MESSAGES: Record<string, string> = {
  'label.ldap_url_is_not_valid': 'Ldap url is not valid',
  'label.required': 'Required',
};

function isExternalAuthMech(mech: string): boolean {
  return mech === ZIMBRA_AUTH_METHOD.LDAP || mech === ZIMBRA_AUTH_METHOD.EXTERNAL;
}

export const domainAuthenticationSchema = z
  .object({
    zimbraAuthMech: z.string(),
    zimbraPasswordChangeListener: z.string(),
    zimbraAuthFallbackToLocal: z.boolean(),
    zimbraAuthLdapURL: z.string(),
    zimbraAuthLdapSearchBindDn: z.string(),
    zimbraAuthLdapSearchBindPassword: z.string(),
    zimbraAuthLdapStartTlsEnabled: z.boolean(),
    zimbraAuthLdapSearchFilter: z.string(),
    zimbraAuthLdapSearchBase: z.string(),
    zimbraFeatureResetPasswordStatus: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!isExternalAuthMech(values.zimbraAuthMech)) {
      if (values.zimbraAuthLdapURL !== '' && !isValidLdapBaseUrl(values.zimbraAuthLdapURL)) {
        ctx.addIssue({
          code: 'custom',
          path: ['zimbraAuthLdapURL'],
          message: 'label.ldap_url_is_not_valid',
        });
      }
      return;
    }

    if (values.zimbraAuthLdapURL === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['zimbraAuthLdapURL'],
        message: 'label.required',
      });
      return;
    }

    if (!isValidLdapBaseUrl(values.zimbraAuthLdapURL)) {
      ctx.addIssue({
        code: 'custom',
        path: ['zimbraAuthLdapURL'],
        message: 'label.ldap_url_is_not_valid',
      });
    }
  });

export type DomainAuthenticationFormValues = z.infer<typeof domainAuthenticationSchema>;

export function isExternalAuth(mech: string): boolean {
  return isExternalAuthMech(mech);
}
