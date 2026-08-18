/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

export const RESTORE_VALIDATION_MESSAGES: Record<string, string> = {
  'legal_hold.legal_hold_prefix_blank_error': 'Legal Hold prefix should not be blank',
  'legal_hold.legal_hold_fromdate_blank_error': 'Legal Hold from date should not be blank',
};

const optionalDate = z.union([z.date(), z.null()]);

export const restoreAccountSchema = z.object({
  legalHoldPrefix: z.string().min(1, 'legal_hold.legal_hold_prefix_blank_error'),
  fromDate: optionalDate.refine((value) => value !== null, {
    message: 'legal_hold.legal_hold_fromdate_blank_error',
  }),
  unDelete: z.boolean(),
  undeleteFromDate: optionalDate,
});
