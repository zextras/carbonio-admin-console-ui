/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import { type EditHSMContextType, type HSMContextType } from '../../../../../types';

export const HSMContext = createContext({} as HSMContextType);
export const EditHSMContext = createContext({} as EditHSMContextType);
