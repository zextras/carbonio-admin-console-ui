/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Dispatch, type SetStateAction } from 'react';

import { type EditHsmDetailObj, type HsmDetailObj } from '../hsm';
import { type AdvancedVolumeDetailObj, type VolumeDetailObj } from '../volume';

export type VolumeContextType = {
    volumeDetail: VolumeDetailObj;
    setVolumeDetail: Dispatch<SetStateAction<VolumeDetailObj>>;
};

export type HSMContextType = {
    hsmDetail: HsmDetailObj;
    setHsmDetail: Dispatch<SetStateAction<HsmDetailObj>>;
};

export type EditHSMContextType = {
    hsmDetail: EditHsmDetailObj;
    setHsmDetail: Dispatch<SetStateAction<EditHsmDetailObj>>;
};

export type AdvancedVolumeContextType = {
    advancedVolumeDetail: AdvancedVolumeDetailObj;
    setAdvancedVolumeDetail: Dispatch<SetStateAction<AdvancedVolumeDetailObj>>;
};
