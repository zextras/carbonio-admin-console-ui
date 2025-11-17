/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tags } from '../../../types';

import { useTagStore } from './store';

/* THIS FILE CONTAINS HOOKS, BUT ESLINT IS DUMB */

export const getTags = (): Tags => useTagStore.getState().tags;
