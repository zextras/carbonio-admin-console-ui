/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_AUTH_METHOD } from '../schema';
import { filterTooltipItems, ldapUrlTooltipItems } from '../utils';

function AuthHelpIcon({ label }: Readonly<{ label: string }>) {
  return (
    <Tooltip placement="top" overflow="break-word" maxWidth="40rem" label={label}>
      <ds-text as="span">
        <ds-icon icon="QuestionMarkCircleOutline" size="large" color="secondary"></ds-icon>
      </ds-text>
    </Tooltip>
  );
}

export const AuthLdapUrlHelpIcon = () => {
  const [t] = useTranslation();
  const label = ldapUrlTooltipItems(t, ZIMBRA_AUTH_METHOD.LDAP)[0]?.label ?? '';
  return <AuthHelpIcon label={label} />;
};

export const AuthLdapFilterHelpIcon = () => {
  const [t] = useTranslation();
  const label = filterTooltipItems(t)[0]?.label ?? '';
  return <AuthHelpIcon label={label} />;
};
