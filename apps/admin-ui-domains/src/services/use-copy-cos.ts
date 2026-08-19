/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { copyCos } from './copy-cos-service';

type CopyCosVariables = {
  newName: string;
  cosId: string;
};

export function useCopyCos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newName, cosId }: CopyCosVariables) => copyCos(newName, cosId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos', 'list'] });
    },
  });
}
