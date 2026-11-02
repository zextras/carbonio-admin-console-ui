/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { reduce } from 'lodash-es';

import type { SoapMailMessagePart } from './quarantine-list';

const isInlineImagePart = (part: SoapMailMessagePart): boolean =>
  !!part.part &&
  !part.part.includes('.') &&
  part.cd === 'inline' &&
  !part.ci &&
  part.ct !== 'text/plain';

// Escapes markup from a part whose content type doesn't match the body's own content type,
// so a text/plain part concatenated onto an HTML body can't inject executable HTML (CO-4561).
const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const findBodyPart = (
  mp: Array<SoapMailMessagePart>,
  acc: { contentType: string; content: string },
  id: string,
): { contentType: string; content: string } =>
  reduce(
    mp,
    (found, part) => {
      if (part.mp) return findBodyPart(part.mp, found, id);
      if (part?.body) {
        if (!found.contentType.length) {
          return { contentType: part.ct, content: part.content ?? '' };
        }
        if (isInlineImagePart(part)) {
          return {
            ...found,
            content: found.content.concat(
              `<img src='/service/home/~/?auth=co&loc=en&id=${id}&part=${part?.part}'>`,
            ),
          };
        }
        const partContent = part.content ?? '';
        const safeContent =
          found.contentType === 'text/html' && part.ct !== 'text/html'
            ? escapeHtml(partContent)
            : partContent;
        return { ...found, content: found.content.concat(safeContent) };
      }
      return found;
    },
    acc,
  );
