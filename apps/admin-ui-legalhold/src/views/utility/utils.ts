/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type Details = {
  [key: string]: string;
};

export type ErrorResponse = {
  code: string;
  details?: Details;
  message: string;
  time: number;
};

export function formattedErrorMessage(response: ErrorResponse): ErrorResponse {
  if (!response.details) {
    return response;
  }

  let message = response.message;
  Object.entries(response.details).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });

  return { ...response, message };
}
