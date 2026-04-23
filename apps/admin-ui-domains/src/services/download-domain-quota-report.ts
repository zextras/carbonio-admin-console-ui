/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type DownloadResponse =
  | {
      type: 'success';
    }
  | {
      type: 'error';
      error: string;
    };
export const downloadDomainQuotaReport = async ({
  domainName,
}: {
  domainName: string;
}): Promise<DownloadResponse> => {
  const url = `/services/storages/admin/quota/domain/report/${domainName}`;
  return fetch(url)
    .then(() => ({ type: 'success' as const }))
    .catch(() => ({
      type: 'error',
      error: '',
    }));
};
