/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse,HttpResponseResolver } from 'msw';
import { setupServer } from 'msw/node';

const handleGetTranslations: HttpResponseResolver<never, any> = async () => HttpResponse.json({});
const defaultHandlers = [];
defaultHandlers.push(http.get('/i18n/en.json', handleGetTranslations));
export const server = setupServer(...defaultHandlers);
