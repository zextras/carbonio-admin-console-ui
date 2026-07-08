/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const MODIFY_VOLUME_VALIDATION_MESSAGES: Record<string, string> = {
  'storage.validation.volume_name_required': 'Volume name is required.',
  'storage.validation.compression_threshold_numeric': 'Compression Threshold must be numeric',
  'storage.validation.infrequent_threshold_required': 'Bytes Size Threshold is required',
  'storage.validation.tiering_mutual_exclusive': 'Cannot enable both infrequent access and intelligent tiering',
};

const modifyVolumeBase = z.object({
  name: z.string(),
  rootpath: z.string(),
  compressBlobs: z.boolean(),
  isCurrent: z.boolean(),
  compressionThreshold: z.string(),
  volumePrefix: z.string(),
  bucketConfigurationId: z.string(),
  useInfrequentAccess: z.boolean(),
  useIntelligentTiering: z.boolean(),
  infrequentAccessThreshold: z.string(),
});

export const modifyVolumeSchema = modifyVolumeBase.superRefine((val, ctx) => {
  if (!val.name || val.name === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: 'storage.validation.volume_name_required',
    });
  }
  if (val.compressBlobs && val.compressionThreshold && !/^[0-9]*$/.test(val.compressionThreshold)) {
    ctx.addIssue({
      code: 'custom',
      path: ['compressionThreshold'],
      message: 'storage.validation.compression_threshold_numeric',
    });
  }
  if (val.useInfrequentAccess && (!val.infrequentAccessThreshold || val.infrequentAccessThreshold === '')) {
    ctx.addIssue({
      code: 'custom',
      path: ['infrequentAccessThreshold'],
      message: 'storage.validation.infrequent_threshold_required',
    });
  }
  if (val.useInfrequentAccess && val.useIntelligentTiering) {
    ctx.addIssue({
      code: 'custom',
      path: ['useIntelligentTiering'],
      message: 'storage.validation.tiering_mutual_exclusive',
    });
  }
});
