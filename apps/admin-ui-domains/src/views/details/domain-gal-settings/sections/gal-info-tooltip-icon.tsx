/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tooltip } from '@zextras/ui-components';

import {
  EXTERNAL_SERVER_EXAMPLE,
  LDAP_BIND_DN_LABLE,
  LDAP_FILTER_LABEL,
  LDAP_SEARCH_BASE_LABEL,
} from '../../../../constants';

type GalInfoIconProps = {
  hasFocus?: boolean;
};

type GalInfoTooltipIconProps = GalInfoIconProps & {
  label: string;
};

const GalInfoTooltipIcon = ({ hasFocus, label }: GalInfoTooltipIconProps) => (
  <Tooltip placement="top" overflow="break-word" maxWidth="40rem" label={label}>
    <ds-text as="span">
      <ds-icon icon="InfoOutline" size="large" color={hasFocus ? 'primary' : 'text'}></ds-icon>
    </ds-text>
  </Tooltip>
);

export const GalExternalServerInfoIcon = ({ hasFocus }: GalInfoIconProps) => (
  <GalInfoTooltipIcon hasFocus={hasFocus} label={EXTERNAL_SERVER_EXAMPLE} />
);

export const GalLdapFilterInfoIcon = ({ hasFocus }: GalInfoIconProps) => (
  <GalInfoTooltipIcon hasFocus={hasFocus} label={LDAP_FILTER_LABEL} />
);

export const GalLdapSearchBaseInfoIcon = ({ hasFocus }: GalInfoIconProps) => (
  <GalInfoTooltipIcon hasFocus={hasFocus} label={LDAP_SEARCH_BASE_LABEL} />
);

export const GalBindDnInfoIcon = ({ hasFocus }: GalInfoIconProps) => (
  <GalInfoTooltipIcon hasFocus={hasFocus} label={LDAP_BIND_DN_LABLE} />
);
