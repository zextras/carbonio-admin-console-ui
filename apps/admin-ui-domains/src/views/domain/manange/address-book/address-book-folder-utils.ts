/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AddressBookEntry, AddressBookFolder } from '../../../../../types';

export function getFolderDisplayName(name: string): string {
  if (name === 'all') {
    return 'All folders';
  }
  if (!name.includes('/')) {
    return name;
  }
  const segments = name.split('/').filter(Boolean);
  return segments.at(-1) ?? name;
}

export function getFolderSelectLabel(name: string, isShared: boolean, sharedLabel: string): string {
  if (isShared) {
    return `${name} (${sharedLabel})`;
  }
  return name;
}

export function getLinkedFolderIds(entry: AddressBookEntry | undefined): Array<string> {
  if (!entry) {
    return [];
  }
  return (entry.folders ?? []).map((folder) => String(folder.id));
}

export function entryHasAllShared(entry: AddressBookEntry | undefined): boolean {
  return getLinkedFolderIds(entry).includes('all');
}

export function foldersHaveAllShared(folders: Array<AddressBookFolder>): boolean {
  return folders.some((folder) => String(folder.id) === 'all');
}
