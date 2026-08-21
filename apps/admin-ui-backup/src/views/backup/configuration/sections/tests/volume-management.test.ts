/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import type { BucketItem, SelectOption } from '../../../../../../types';
import { getManageExternalVolumeBucketList } from '../volume-management';

describe('getManageExternalVolumeBucketList', () => {
  const bucketListOption: Array<SelectOption> = [
    { label: 'S3 | bucket-1', value: 'uuid-1' },
    { label: 'S3 | bucket-2', value: 'uuid-2' },
  ];

  const matchedBucket: BucketItem = {
    storeType: 'S3',
    bucketName: 'bucket-3',
    uuid: 'uuid-3',
  };

  it('returns the option matching selectedManageBucketId when it is set', () => {
    const result = getManageExternalVolumeBucketList('uuid-2', bucketListOption, matchedBucket);
    expect(result).toEqual({ label: 'S3 | bucket-2', value: 'uuid-2' });
  });

  it('falls back to matchedBucket when selectedManageBucketId is empty', () => {
    const result = getManageExternalVolumeBucketList('', bucketListOption, matchedBucket);
    expect(result).toEqual({ label: 'S3 | bucket-3', value: 'uuid-3' });
  });

  it('returns empty object when selectedManageBucketId is empty and no matchedBucket', () => {
    const result = getManageExternalVolumeBucketList('', bucketListOption, undefined);
    expect(result).toEqual({});
  });

  it('returns empty object when selectedManageBucketId does not match any option', () => {
    const result = getManageExternalVolumeBucketList('non-existent', bucketListOption, undefined);
    expect(result).toEqual({});
  });
});
