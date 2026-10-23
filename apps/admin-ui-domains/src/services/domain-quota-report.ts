/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { STORAGES_API_BASE_URL } from '../constants';

export type DomainAccountQuota = {
  account: string;
  mails: number;
  files: number;
  chats: number;
  totalUsed: number;
  /** Total limit in bytes, `'unlimited'` when no limit applies. */
  totalLimit: number | 'unlimited';
};

type GetDomainQuotaReportResponse =
  | {
      type: 'success';
      accounts: Array<DomainAccountQuota>;
    }
  | {
      type: 'error';
      error: string;
    };

const CSV_SEPARATOR = ', ';
/** Columns after the account address: mails, files, chats, total used, total limit. */
const CSV_NUMERIC_COLUMNS = 5;
const UNLIMITED = 'unlimited';

function parseNumber(value: string, line: string): number {
  const parsed = Number(value);
  if (value === '' || !Number.isFinite(parsed)) {
    throw new Error(`Malformed quota report row: ${line}`);
  }
  return parsed;
}

function parseReportRow(line: string): DomainAccountQuota {
  const columns = line.split(CSV_SEPARATOR);
  if (columns.length < CSV_NUMERIC_COLUMNS + 1) {
    throw new Error(`Malformed quota report row: ${line}`);
  }
  const numeric = columns.slice(-CSV_NUMERIC_COLUMNS);
  const account = columns.slice(0, -CSV_NUMERIC_COLUMNS).join(CSV_SEPARATOR);
  const [mails, files, chats, totalUsed] = numeric
    .slice(0, 4)
    .map((value) => parseNumber(value, line));
  const rawLimit = numeric[4];

  return {
    account,
    mails,
    files,
    chats,
    totalUsed,
    totalLimit: rawLimit === UNLIMITED ? UNLIMITED : parseNumber(rawLimit, line),
  };
}

/**
 * Parses the CSV produced by the storages service domain report:
 * `Account, Mails, Files, Chats, Total used, Total limit` (sizes in bytes, first row is the header).
 */
export function parseDomainQuotaReport(csv: string): Array<DomainAccountQuota> {
  return csv
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim() !== '')
    .map(parseReportRow);
}

/**
 * Returns the used space of every account of a domain, split by module.
 * Only global admins are allowed to call the underlying endpoint.
 * @param domainName The name of the domain.
 * @returns The quota usage of all the accounts of the domain.
 */
export const getDomainQuotaReport = async (
  domainName: string,
): Promise<GetDomainQuotaReportResponse> => {
  const url = `${STORAGES_API_BASE_URL}/quota/domain/report/${encodeURIComponent(domainName)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const csv = await response.text();
    return {
      type: 'success',
      accounts: parseDomainQuotaReport(csv),
    } satisfies GetDomainQuotaReportResponse;
  } catch (error) {
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    } satisfies GetDomainQuotaReportResponse;
  }
};
