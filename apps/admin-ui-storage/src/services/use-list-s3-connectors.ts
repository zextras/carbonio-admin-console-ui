/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { S3Connector } from '../../types';
import { listS3Connector } from './bucket-service';
import { bucketVolumeQueryKeys } from './bucket-volume-query-keys';

export const useListS3Connectors = () =>
  useQuery({
    queryKey: bucketVolumeQueryKeys.s3Connectors(),
    queryFn: async (): Promise<Array<S3Connector>> => listS3Connector(),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
