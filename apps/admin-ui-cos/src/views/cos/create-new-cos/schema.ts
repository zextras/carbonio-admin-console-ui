/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const CREATE_COS_VALIDATION_MESSAGES: Record<string, string> = {
  'cos.validation.cos_name_required': 'COS name is required',
  'cos.validation.cos_name_lowercase': 'COS name must contain only lowercase letters',
};

export const createCosSchema = z.object({
  cn: z
    .string()
    .min(1, 'cos.validation.cos_name_required')
    .regex(/^[a-z]*$/, 'cos.validation.cos_name_lowercase'),
  description: z.string(),
  zimbraNotes: z.string(),
  edition: z.enum(['mail', 'workspace']),
  carbonioFeatureMailsAppEnabled: z.string(),
  zimbraFeatureContactsEnabled: z.string(),
  zimbraFeatureCalendarEnabled: z.string(),
  carbonioFeatureFilesEnabled: z.string(),
  carbonioFeatureFilesAppEnabled: z.string(),
  carbonioFeatureTasksEnabled: z.string(),
  carbonioFeatureWscEnabled: z.string(),
  carbonioWscVideoCallEnabled: z.string(),
});
