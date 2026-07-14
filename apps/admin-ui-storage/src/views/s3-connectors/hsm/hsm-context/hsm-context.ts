/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import type { Volume } from '../../../../../types';
import type { HsmFormApi } from '../types';

type HSMContextType = {
	form: HsmFormApi;
	allVolumes: Array<Volume>;
};
export const HSMContext = createContext({} as HSMContextType);
