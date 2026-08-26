/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { head } from 'lodash-es';

import { checkValidUserName, convertToAscii, getModifiedName } from '../../../utility/utils';
import type { CreateAccountFormValues } from './create-account-types';

/**
 * User name derived from the name parts (givenName[.initial].sn), normalized
 * to ascii. Returns `null` when the combination cannot produce a valid user
 * name (e.g. non-ascii characters) — the UI then blanks the auto-fill input
 * and shows the "auto fill user is disabled" alert.
 */
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

/** Display name derived from the name parts: "given initials sn". */
export function computeAutoFillDisplayName(values: CreateAccountFormValues): string {
  return `${values.givenName ? `${values.givenName} ` : ''}${
    values.initials ? `${values.initials} ` : ''
  }${values.sn ? `${values.sn} ` : ''}`.trim();
}

/** The user name to submit: the typed one, or the derived one when untouched. */
export function getEffectiveUserName(values: CreateAccountFormValues): string {
  if (values.changeNameBool) {
    return values.name;
  }
  return computeAutoFillUserName(values) ?? '';
}
