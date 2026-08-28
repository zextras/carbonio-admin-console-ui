/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { sortedUniq } from 'lodash';

import { getAllEmailFromString, isValidEmail } from '../../../../utility/utils';

const SPECIAL_CHARS = /[ `'"<>,;]/;

export function filterMemberRows(dlm: Array<string>, filterMember: string): Array<string> {
  return dlm.filter((item) => item.toLowerCase().includes(filterMember.toLowerCase()));
}

export function pageRows<T>(rows: Array<T>, offset: number, limit: number): Array<T> {
  return rows.slice(offset, offset + limit);
}

export type NewMembersResolution =
  | { type: 'blank' }
  | { type: 'undefined' }
  | { type: 'invalid' }
  | { type: 'alreadyInList' }
  | { type: 'ok'; members: Array<string> };

/**
 * Resolves the outcome of adding the search-box content to the member list,
 * mirroring the original `onAdd` validation order:
 * 1. blank input;
 * 2. multi-email input that cannot be parsed;
 * 3. any invalid email address in the input;
 * 4. the raw input already present in the list;
 * 5. ok — the deduped emails not yet in the list (may be empty → no-op).
 */
export function resolveNewMembers(
  searchMember: string,
  dlm: Array<string>
): NewMembersResolution {
  if (searchMember === '') {
    return { type: 'blank' };
  }

  const allEmails: Array<string> | null | undefined = SPECIAL_CHARS.test(searchMember)
    ? getAllEmailFromString(searchMember)
    : [searchMember];

  if (allEmails === undefined) {
    return { type: 'undefined' };
  }
  if (allEmails === null || allEmails === undefined) {
    return { type: 'undefined' };
  }

  const invalidEmailAddress = allEmails.filter((item) => !isValidEmail(item));
  if (invalidEmailAddress.length > 0) {
    return { type: 'invalid' };
  }
  if (dlm.includes(searchMember)) {
    return { type: 'alreadyInList' };
  }

  const sortedList = sortedUniq(allEmails);
  return { type: 'ok', members: sortedList.filter((item) => !dlm.includes(item)) };
}
