/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import type { AdvancedVolumeWizardDetail } from '../../../../../../../types';

type AdvancedVolumeContextType = {
	advancedVolumeDetail: AdvancedVolumeWizardDetail;
	setAdvancedVolumeDetail: (arg: AdvancedVolumeWizardDetail | ((prev: AdvancedVolumeWizardDetail) => AdvancedVolumeWizardDetail)) => void;
};
export const AdvancedVolumeContext = createContext({} as AdvancedVolumeContextType);
