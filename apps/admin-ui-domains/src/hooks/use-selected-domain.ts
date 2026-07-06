/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDomainById } from '@zextras/ui-shared';
import { useParams } from 'react-router';

import type { Domain } from '../store/types';

export const useSelectedDomain = (applyConfig = 1) =>
	useDomainById<Domain>({ domainId: useParams().domainId, applyConfig });
