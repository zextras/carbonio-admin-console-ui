/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

const numericSettingSchema = z.string().regex(/^\d+$/, 'error.invalid_number');

/**
 * Validation for the Mobile DOS Protection form. Applied form-level with
 * `validators: { onChange, onSubmit }`; invalid numeric values block submit.
 */
export const globalActiveSyncSchema = z.object({
  enabled: z.boolean(),
  jailDuration: numericSettingSchema,
  maxRequests: numericSettingSchema,
  timeWindow: numericSettingSchema,
});

export type GlobalActiveSyncFormValues = z.infer<typeof globalActiveSyncSchema>;
