/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import type { VolumeWizardDetail } from '../../../../../../types';

type VolumeContextType = {
	volumeDetail: VolumeWizardDetail;
	setVolumeDetail: (arg: VolumeWizardDetail | ((prev: VolumeWizardDetail) => VolumeWizardDetail)) => void;
};
export const VolumeContext = createContext({} as VolumeContextType);
