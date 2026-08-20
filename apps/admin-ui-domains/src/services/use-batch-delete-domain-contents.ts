/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { batchDeleteDomainContents } from './batch-delete-domain-contents';

export function useBatchDeleteDomainContents() {
  return useMutation({
    mutationFn: batchDeleteDomainContents,
  });
}
