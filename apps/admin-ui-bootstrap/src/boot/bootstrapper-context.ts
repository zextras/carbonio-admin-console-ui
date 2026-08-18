/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { I18nFactory } from '@zextras/ui-shared';
import { createContext, useContext } from 'react';

type BootstrapperContextValue = {
  i18nFactory?: I18nFactory;
};

export const BootstrapperContext = createContext<BootstrapperContextValue | null>(null);

export function useI18nFactory(): I18nFactory | undefined {
  const ctx = useContext(BootstrapperContext);
  return ctx?.i18nFactory;
}
