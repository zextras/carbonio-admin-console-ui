/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import type { VolumeCreateFormApi } from './types';

type VolumeContextType = {
	form: VolumeCreateFormApi;
};
export const VolumeContext = createContext({} as VolumeContextType);
