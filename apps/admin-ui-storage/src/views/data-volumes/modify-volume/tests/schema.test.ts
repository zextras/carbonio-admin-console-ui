/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { MODIFY_VOLUME_VALIDATION_MESSAGES, modifyVolumeSchema } from '../schema';

function createValidValues(overrides: Record<string, unknown> = {}) {
  return {
    name: 'volume-1',
    rootpath: '/opt/zextras/store',
    compressBlobs: false,
    isCurrent: false,
    compressionThreshold: '4096',
    volumePrefix: '',
    bucketConfigurationId: '',
    useInfrequentAccess: false,
    useIntelligentTiering: false,
    infrequentAccessThreshold: '',
    ...overrides,
  };
}

describe('modifyVolumeSchema', () => {
  describe('valid input', () => {
    it('should pass with all valid values', () => {
      const result = modifyVolumeSchema.safeParse(createValidValues());
      expect(result.success).toBe(true);
    });

    it('should pass with empty name when not compressing', () => {
      const result = modifyVolumeSchema.safeParse(createValidValues({ name: '' }));
      expect(result.success).toBe(false);
    });
  });

  describe('name validation', () => {
    it('should report volume_name_required when name is empty', () => {
      const result = modifyVolumeSchema.safeParse(createValidValues({ name: '' }));
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.volume_name_required',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['name']);
      }
    });

    it('should report volume_name_required when name is undefined', () => {
      const result = modifyVolumeSchema.safeParse(createValidValues({ name: undefined }));
      expect(result.success).toBe(false);
    });
  });

  describe('compression threshold validation', () => {
    it('should report compression_threshold_numeric when threshold is non-numeric', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ compressBlobs: true, compressionThreshold: 'abc' }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.compression_threshold_numeric',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['compressionThreshold']);
      }
    });

    it('should pass when compressBlobs is true and threshold is numeric', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ compressBlobs: true, compressionThreshold: '4096' }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when compressBlobs is true and threshold is empty', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ compressBlobs: true, compressionThreshold: '' }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when compressBlobs is false with non-numeric threshold', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ compressBlobs: false, compressionThreshold: 'abc' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('infrequent access threshold validation', () => {
    it('should report infrequent_threshold_required when useInfrequentAccess is true and threshold is empty', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ useInfrequentAccess: true, infrequentAccessThreshold: '' }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.infrequent_threshold_required',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['infrequentAccessThreshold']);
      }
    });

    it('should pass when useInfrequentAccess is true and threshold has a value', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ useInfrequentAccess: true, infrequentAccessThreshold: '1024' }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when useInfrequentAccess is false and threshold is empty', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ useInfrequentAccess: false, infrequentAccessThreshold: '' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('mutual exclusivity validation', () => {
    it('should report tiering_mutual_exclusive when both useInfrequentAccess and useIntelligentTiering are true', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ useInfrequentAccess: true, useIntelligentTiering: true }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.tiering_mutual_exclusive',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['useIntelligentTiering']);
      }
    });

    it('should pass when only useInfrequentAccess is true', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({
          useInfrequentAccess: true,
          useIntelligentTiering: false,
          infrequentAccessThreshold: '1024',
        }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when only useIntelligentTiering is true', () => {
      const result = modifyVolumeSchema.safeParse(
        createValidValues({ useInfrequentAccess: false, useIntelligentTiering: true }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('MODIFY_VOLUME_VALIDATION_MESSAGES', () => {
    it('should contain all expected validation message keys', () => {
      expect(MODIFY_VOLUME_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.volume_name_required',
      );
      expect(MODIFY_VOLUME_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.compression_threshold_numeric',
      );
      expect(MODIFY_VOLUME_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.infrequent_threshold_required',
      );
      expect(MODIFY_VOLUME_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.tiering_mutual_exclusive',
      );
    });
  });
});
