/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { collectDomainDirectories } from './collect-domain-directories';

export function useCollectDomainDirectories() {
  return useMutation({
    mutationFn: (domainName: string) => collectDomainDirectories(domainName),
  });
}
