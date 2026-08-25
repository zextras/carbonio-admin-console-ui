/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { z } from 'zod';

import type { createDomainSchema } from './schema';

export type CreateDomainFormValues = z.infer<typeof createDomainSchema>;

export type MailServerSelectItem = z.infer<typeof createDomainSchema>['mailServer'];
