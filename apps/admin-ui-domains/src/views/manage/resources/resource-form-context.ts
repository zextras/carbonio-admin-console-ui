/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, useContext } from 'react';

import type { useCreateResourceForm } from './use-create-resource-form';

export type ResourceFormApi = ReturnType<typeof useCreateResourceForm>;

type ResourceFormContextValue = {
  form: ResourceFormApi;
};

export const ResourceFormContext = createContext<ResourceFormContextValue | null>(null);

export function useResourceForm(): ResourceFormApi {
  const ctx = useContext(ResourceFormContext);
  if (!ctx) {
    throw new Error('useResourceForm must be used within ResourceFormContext.Provider');
  }
  return ctx.form;
}
