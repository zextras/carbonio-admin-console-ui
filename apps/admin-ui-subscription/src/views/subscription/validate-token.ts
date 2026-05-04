/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const activationTokenSchema = z
	.string()
	.trim()
	.min(1, 'subscription.activate.error.empty')
	.min(10, 'subscription.activate.error.too_short')
	.max(2048, 'subscription.activate.error.too_long')
	.regex(/^[\x20-\x7E]+$/, 'subscription.activate.error.invalid_chars');

export type ActivationTokenError = z.inferFormattedError<typeof activationTokenSchema>;
