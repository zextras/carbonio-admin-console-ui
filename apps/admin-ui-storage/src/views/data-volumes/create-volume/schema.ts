/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const VOLUME_CREATE_VALIDATION_MESSAGES: Record<string, string> = {
  'storage.validation.volume_name_required': 'Volume name is required.',
  'storage.validation.volume_path_required': 'Path is required',
  'storage.validation.compression_threshold_required': 'Compression Threshold is required',
};

const volumeCreateBase = z.object({
  id: z.string(),
  volumeName: z.string(),
  volumeMain: z.number(),
  path: z.string(),
  isCurrent: z.boolean(),
  isCompression: z.boolean(),
  compressionThreshold: z.string(),
  volumeAllocation: z.number(),
});

export const volumeCreateSchema = volumeCreateBase.superRefine((val, ctx) => {
  if (!val.volumeName || val.volumeName === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['volumeName'],
      message: 'storage.validation.volume_name_required',
    });
  }
  if (!val.path || val.path === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['path'],
      message: 'storage.validation.volume_path_required',
    });
  }
  if (val.isCompression) {
    if (
      !val.compressionThreshold ||
      val.compressionThreshold === '' ||
      !/^\d*$/.test(String(val.compressionThreshold))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['compressionThreshold'],
        message: 'storage.validation.compression_threshold_required',
      });
    }
  }
});
