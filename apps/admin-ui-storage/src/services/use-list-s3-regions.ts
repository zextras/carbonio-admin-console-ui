/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { S3Region } from '../../types';
import { listS3Regions } from './s3-connector-service';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

export const useListS3Regions = () =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.s3Regions(),
    queryFn: async (): Promise<Array<S3Region>> => listS3Regions(),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
