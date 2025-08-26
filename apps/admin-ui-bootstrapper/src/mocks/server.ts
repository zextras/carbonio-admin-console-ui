/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponseResolver, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handleGetConvRequest: HttpResponseResolver<never, any> = async () => HttpResponse.json({});
const defaultHandlers = [];
defaultHandlers.push(http.get('/i18n/en.json', handleGetConvRequest));
const server = setupServer(...defaultHandlers);
export default server;
