/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { head } from 'lodash-es';

import { checkValidUserName, convertToAscii, getModifiedName } from '../../../utility/utils';
import type { CreateAccountFormValues } from './create-account-types';

export function computeAutoFillUserName(values: CreateAccountFormValues): string | null {
  const userName: Array<string> = [];
  if (values.givenName.trim()) userName.push(getModifiedName(values.givenName.trim()));
  if (values.initials.trim()) userName.push(head(getModifiedName(values.initials.trim())) ?? '');
  if (values.sn.trim()) userName.push(String(getModifiedName(values.sn.trim())));
  const userNameString = userName.join('.');
  const asciiValue = convertToAscii(userNameString);
  if (userNameString.length === asciiValue.length && checkValidUserName(asciiValue)) {
    return asciiValue;
  }
  return null;
}

export function computeAutoFillDisplayName(values: CreateAccountFormValues): string {
  const parts: Array<string> = [];
  if (values.givenName) {
    parts.push(`${values.givenName} `);
  }
  if (values.initials) {
    parts.push(`${values.initials} `);
  }
  if (values.sn) {
    parts.push(`${values.sn} `);
  }
  return parts.join('').trim();
}

export function getEffectiveUserName(values: CreateAccountFormValues): string {
  if (values.changeNameBool) {
    return values.name;
  }
  return computeAutoFillUserName(values) ?? '';
}
