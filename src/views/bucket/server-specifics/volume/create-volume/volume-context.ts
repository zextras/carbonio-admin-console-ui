/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

type VolumeContext = {
	volumeDetail: any;
	setVolumeDetail: (arg: any) => void;
};
export const VolumeContext = createContext({} as VolumeContext);
