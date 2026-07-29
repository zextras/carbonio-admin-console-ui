/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, useContext } from 'react';

import type { AdvancedVolumeFormApi } from './types';

export type AdvancedVolumeContextType = {
  form: AdvancedVolumeFormApi;
};

export const AdvancedVolumeContext = createContext<AdvancedVolumeContextType | undefined>(
  undefined,
);

export function useAdvancedVolumeContext(): AdvancedVolumeContextType {
  const context = useContext(AdvancedVolumeContext);
  if (!context) {
    throw new Error(
      'useAdvancedVolumeContext must be used within an AdvancedVolumeContext.Provider',
    );
  }
  return context;
}
