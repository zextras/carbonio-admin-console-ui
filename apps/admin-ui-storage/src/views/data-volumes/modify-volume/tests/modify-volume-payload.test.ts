/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { PRIMARY, SECONDARY } from '../../../../constants';
import {
  type AdvancedUpdateVolumeFormState,
  buildAdvancedUpdatePayload,
} from '../modify-volume-payload';

const labelMap: Record<number | string, string> = {
  1: PRIMARY,
  2: SECONDARY,
};

function createForm(
  overrides: Partial<AdvancedUpdateVolumeFormState> = {},
): AdvancedUpdateVolumeFormState {
  return {
    name: 'test-volume',
    typeValue: 1,
    id: '42',
    isCurrent: false,
    storeType: undefined,
    externalVolDetail: {},
    rootpath: '/opt/zextras/store',
    compressBlobs: true,
    compressionThreshold: '4096',
    volumePrefix: undefined,
    bucketConfigurationId: undefined,
    useInfrequentAccess: undefined,
    infrequentAccessThreshold: undefined,
    useIntelligentTiering: undefined,
    ...overrides,
  };
}

describe('buildAdvancedUpdatePayload', () => {
  it('should include local volume fields when externalVolDetail is empty', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 'old-name', labelMap, {
      ...createForm(),
      rootpath: '/opt/store',
      compressBlobs: true,
      compressionThreshold: '8192',
    });

    expect(payload.volumePath).toBe('/opt/store');
    expect(payload.volumeCompressed).toBe(true);
    expect(payload.volumeThreshold).toBe('8192');
    expect(payload.bucketConfigurationId).toBeUndefined();
  });

  it('should include S3 tiering fields for external S3 volumes', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 's3primary', labelMap, {
      ...createForm({
        storeType: 'S3',
        externalVolDetail: { storeType: 'S3' },
        volumePrefix: 'mail',
        bucketConfigurationId: 'bucket-uuid',
        useInfrequentAccess: true,
        infrequentAccessThreshold: 65536,
        useIntelligentTiering: false,
      }),
    });

    expect(payload.volumePrefix).toBe('mail');
    expect(payload.bucketConfigurationId).toBe('bucket-uuid');
    expect(payload.useInfrequentAccess).toBe(true);
    expect(payload.infrequentAccessThreshold).toBe(65536);
    expect(payload.useIntelligentTiering).toBe(false);
    expect(payload.volumePath).toBeUndefined();
  });

  it('should include prefix bucket fields for Ceph volumes without tiering fields', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 'cephprimary', labelMap, {
      ...createForm({
        storeType: 'Ceph',
        externalVolDetail: { storeType: 'Ceph' },
        volumePrefix: 'data',
        bucketConfigurationId: 'ceph-uuid',
        useInfrequentAccess: false,
        useIntelligentTiering: false,
      }),
    });

    expect(payload.volumePrefix).toBe('data');
    expect(payload.bucketConfigurationId).toBe('ceph-uuid');
    expect(payload.useInfrequentAccess).toBeUndefined();
    expect(payload.useIntelligentTiering).toBeUndefined();
  });

  it('should include fileblob path fields for FILEBLOB store type', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 'fileblob-vol', labelMap, {
      ...createForm({
        storeType: 'FILEBLOB',
        externalVolDetail: { storeType: 'FILEBLOB' },
        rootpath: '/mnt/blob',
        compressBlobs: false,
        compressionThreshold: '0',
      }),
    });

    expect(payload.volumePath).toBe('/mnt/blob');
    expect(payload.volumeCompressed).toBe(false);
    expect(payload.volumeThreshold).toBe('0');
  });

  it('should include openio placeholder fields for OPENIO store type', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 'openio-vol', labelMap, {
      ...createForm({
        storeType: 'OPENIO',
        externalVolDetail: { storeType: 'OPENIO' },
      }),
    });

    expect(payload.url).toBe('');
    expect(payload.account).toBe('');
    expect(payload.namespace).toBe('');
    expect(payload.proxyPort).toBe(1);
    expect(payload.accountPort).toBe(1);
  });

  it('should include swift placeholder fields for SWIFT store type', () => {
    const payload = buildAdvancedUpdatePayload('mailstore1.example.com', 'swift-vol', labelMap, {
      ...createForm({
        storeType: 'SWIFT',
        externalVolDetail: { storeType: 'SWIFT' },
      }),
    });

    expect(payload.url).toBe('');
    expect(payload.username).toBe('');
    expect(payload.proxyPort).toBe(10);
    expect(payload.maxDeleteObjectsCount).toBe(10);
  });
});
