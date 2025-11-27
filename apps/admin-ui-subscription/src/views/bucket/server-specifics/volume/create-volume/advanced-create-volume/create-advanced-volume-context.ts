/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type VolumeContext = {
	advancedVolumeDetail: any;
	setAdvancedVolumeDetail: (arg: any) => void;
};
export const AdvancedVolumeContext = createContext({} as VolumeContext);
