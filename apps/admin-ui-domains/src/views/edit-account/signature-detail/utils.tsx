/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Signature = {
  id: string;
  name: string;
  content?: Array<{ type: string; _content?: string }>;
};

/** Case-sensitive substring filter over signature names; empty search passes through. */
export function filterSignatures(list: Array<Signature>, search: string): Array<Signature> {
  if (!search) {
    return list;
  }
  return list.filter((item) => item?.name?.includes(search));
}

export type SignatureRow = {
  id: string;
  columns: Array<string | React.ReactElement>;
  item: Signature;
  label?: string;
  clickable: boolean;
};

/** Table row descriptors for the signature list. */
export function buildSignatureRows(list: Array<Signature>): Array<SignatureRow> {
  return list.map((item) => ({
    id: item?.id,
    columns: [
      <ds-text size="medium" weight="light" key={`${item?.id}-name`} color="gray0" as="span">
        {item?.name}
      </ds-text>,
    ],
    item,
    label: item?.name,
    clickable: true,
  }));
}
