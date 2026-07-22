/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { VOLUME_CREATE_VALIDATION_MESSAGES, volumeCreateSchema } from '../schema';

function createValidValues(overrides: Record<string, unknown> = {}) {
  return {
    id: '',
    volumeName: 'primary-volume',
    volumeMain: 1,
    path: '/opt/zextras/store',
    isCurrent: false,
    isCompression: false,
    compressionThreshold: '',
    volumeAllocation: 0,
    ...overrides,
  };
}

describe('volumeCreateSchema', () => {
  describe('valid input', () => {
    it('should pass with all valid values', () => {
      const result = volumeCreateSchema.safeParse(createValidValues());
      expect(result.success).toBe(true);
    });

    it('should pass when compression is enabled with a numeric threshold', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: true, compressionThreshold: '4096' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('volume name validation', () => {
    it('should report volume_name_required when volumeName is empty', () => {
      const result = volumeCreateSchema.safeParse(createValidValues({ volumeName: '' }));
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.volume_name_required',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['volumeName']);
      }
    });

    it('should report volume_name_required when volumeName is undefined', () => {
      const result = volumeCreateSchema.safeParse(createValidValues({ volumeName: undefined }));
      expect(result.success).toBe(false);
    });
  });

  describe('path validation', () => {
    it('should report volume_path_required when path is empty', () => {
      const result = volumeCreateSchema.safeParse(createValidValues({ path: '' }));
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.volume_path_required',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['path']);
      }
    });

    it('should report volume_path_required when path is undefined', () => {
      const result = volumeCreateSchema.safeParse(createValidValues({ path: undefined }));
      expect(result.success).toBe(false);
    });

    it('should pass when path is provided', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ path: '/opt/zextras/index' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('compression threshold validation', () => {
    it('should report compression_threshold_required when isCompression is true and threshold is empty', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: true, compressionThreshold: '' }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.compression_threshold_required',
        );
        expect(issue).toBeDefined();
        expect(issue?.path).toEqual(['compressionThreshold']);
      }
    });

    it('should report compression_threshold_required when isCompression is true and threshold is non-numeric', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: true, compressionThreshold: 'abc' }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.message === 'storage.validation.compression_threshold_required',
        );
        expect(issue).toBeDefined();
      }
    });

    it('should pass when isCompression is false with empty threshold', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: false, compressionThreshold: '' }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when isCompression is false with non-numeric threshold', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: false, compressionThreshold: 'abc' }),
      );
      expect(result.success).toBe(true);
    });

    it('should pass when isCompression is true with numeric threshold containing only digits', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ isCompression: true, compressionThreshold: '12345' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('multiple issues', () => {
    it('should report both name and path issues when both are empty', () => {
      const result = volumeCreateSchema.safeParse(
        createValidValues({ volumeName: '', path: '' }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('storage.validation.volume_name_required');
        expect(messages).toContain('storage.validation.volume_path_required');
      }
    });
  });

  describe('VOLUME_CREATE_VALIDATION_MESSAGES', () => {
    it('should contain all expected validation message keys', () => {
      expect(VOLUME_CREATE_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.volume_name_required',
      );
      expect(VOLUME_CREATE_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.volume_path_required',
      );
      expect(VOLUME_CREATE_VALIDATION_MESSAGES).toHaveProperty(
        'storage.validation.compression_threshold_required',
      );
    });
  });
});
