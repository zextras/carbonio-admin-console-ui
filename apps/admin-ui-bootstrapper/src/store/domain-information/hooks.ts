/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { ConfigAttributesState, DomainInformationState } from '../../../types';
import { useConfigStore } from '../config';

export const useDomainInformation = (): DomainInformationState => {
	const info: DomainInformationState = useConfigStore(
		(s: ConfigAttributesState) => s.domainInformation
	);
	return useMemo(() => info || {}, [info]);
};
