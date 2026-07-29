/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const operationQueryKeys = {
	all: ['operation'] as const,
	allOperations: () => [...operationQueryKeys.all, 'all-operations'] as const,
	doneOperations: () => [...operationQueryKeys.all, 'done-operations'] as const,
} as const;
