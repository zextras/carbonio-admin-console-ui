/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import type { HsmPolicyEditDetail } from '../../../../../types';

type HSMContext = {
	hsmDetail: HsmPolicyEditDetail;
	setHsmDetail: (arg: HsmPolicyEditDetail | ((prev: HsmPolicyEditDetail) => HsmPolicyEditDetail)) => void;
};
export const HSMContext = createContext({} as HSMContext);
