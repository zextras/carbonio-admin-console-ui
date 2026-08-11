/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const operationsContentSchema = z
  .object({
    response: z
      .record(z.string(), z.object({ ok: z.boolean().optional() }).passthrough())
      .optional(),
    operations: z.array(z.any()).optional(),
    ok: z.boolean().optional(),
  })
  .passthrough();

export const doneOperationsContentSchema = z
  .object({
    ok: z.boolean().optional(),
  })
  .passthrough();
