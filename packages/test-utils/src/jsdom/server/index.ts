/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';
import { SetupServer } from 'msw/node';

import { server } from '../mocks/msw-server';

type HandlerRequest<T> = DefaultBodyType & {
  Body: Record<string, T>;
};

export type APIInterceptor = {
  getLastRequest: () => StrictRequest<DefaultBodyType>;
  getCalledTimes: () => number;
};

export const getSetupServer = (): SetupServer => server;

export const createAPIInterceptor = (
  method: 'get' | 'post',
  url: string,
  response: () => HttpResponse<DefaultBodyType>,
): APIInterceptor => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  getSetupServer().use(
    http[method](url, async ({ request }) => {
      calledTimes += 1;
      requests.push(request);
      return response();
    }),
  );

  return {
    getLastRequest: () => requests[requests.length - 1],
    getCalledTimes: () => calledTimes,
  };
};

export const createSoapAPIInterceptor = <RequestParamsType, ResponseType = never>(
  apiAction: string,
  response?: ResponseType,
): Promise<RequestParamsType> =>
  new Promise<RequestParamsType>((resolve, reject) => {
    server.use(
      http.post<never, HandlerRequest<RequestParamsType>>(
        `/service/admin/soap/${apiAction}Request`,
        async ({ request }) => {
          if (!request) {
            reject(new Error('Empty request'));
            return HttpResponse.json(
              {},
              {
                status: 500,
                statusText: 'Empty request',
              },
            );
          }

          const reqActionParamWrapper = `${apiAction}Request`;
          const requestContent = await request.json();
          const params = requestContent?.Body?.[reqActionParamWrapper];
          resolve(params);

          return HttpResponse.json({
            Body: {
              [`${apiAction}Response`]: response || {},
            },
          });
        },
      ),
    );
  });

const advancedSupportedURL = '/services/catalog/services';
export const advancedSupportedApi = {
  withError: (): APIInterceptor =>
    createAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
  withAdvancedSupported: (): APIInterceptor =>
    createAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 }),
    ),
  withAdvancedNotSupported: (): APIInterceptor =>
    createAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 }),
    ),
};

export const minMaxVersionApi = (supplier: () => HttpResponse<DefaultBodyType>): APIInterceptor =>
  createAPIInterceptor('get', '/zx/auth/supported', supplier);

export const loginConfigApi = (supplier: () => HttpResponse<DefaultBodyType>): APIInterceptor =>
  createAPIInterceptor('get', '/zx/login/v3/config', supplier);

export const getInfoRequestApi = (supplier: () => HttpResponse<DefaultBodyType>): APIInterceptor =>
  createAPIInterceptor('post', '/service/admin/soap/GetInfoRequest', supplier);

export const getAllConfigRequestApi = (
  supplier: () => HttpResponse<DefaultBodyType>,
): APIInterceptor =>
  createAPIInterceptor('post', '/service/admin/soap/GetAllConfigRequest', supplier);
