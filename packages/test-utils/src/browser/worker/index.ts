/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	DefaultBodyType,
	http,
	HttpResponse,
	HttpResponseResolver,
	passthrough,
	StrictRequest,
} from 'msw';
import { setupWorker } from 'msw/browser';

const handleGetTranslations: HttpResponseResolver<never, any> = async () => HttpResponse.json({});

const handleZextrasSoapAction: HttpResponseResolver = async ({ request }) => {
	const body = (await request.clone().json().catch(() => null)) as
		| { Body?: { zextras?: { action?: string } } }
		| null;
	const action = body?.Body?.zextras?.action;
	const withContent = (payload: unknown) =>
		HttpResponse.json({ Body: { response: { content: JSON.stringify(payload) } } });
	if (action === 'getLicenseInfo') {
		return withContent({ ok: true, response: { type: 'None', features: [] } });
	}
	if (action === 'getVersion') {
		return withContent({ ok: true, response: { version: '0.0.0' } });
	}
	return passthrough();
};

const defaultHandlers = [
	http.get('/i18n/en.json', handleGetTranslations),
	http.get(/\[object%20Object\]/, () => new HttpResponse(null, { status: 200 })),
	http.post('/service/admin/soap/zextras', handleZextrasSoapAction),
];

export const worker = setupWorker(...defaultHandlers);

type HandlerRequest<T> = DefaultBodyType & {
  Body: Record<string, T>;
};

type BrowserAPIInterceptor = {
  getLastRequest: () => StrictRequest<DefaultBodyType>;
  getCalledTimes: () => number;
};

export const startMockWorker = async () => {
  await worker.start({ onUnhandledRequest: 'warn', quiet: true });
};

export const stopMockWorker = () => {
  worker.stop();
};

export const resetMockWorker = () => {
  worker.resetHandlers(...defaultHandlers);
};

export const createBrowserAPIInterceptor = async (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string | RegExp,
  response: () => HttpResponse<DefaultBodyType>,
): Promise<BrowserAPIInterceptor> => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  worker.use(
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

export const createBrowserSoapAPIInterceptor = <RequestParamsType, ResponseType = never>(
  apiAction: string,
  response?: ResponseType,
): Promise<RequestParamsType> =>
  new Promise<RequestParamsType>((resolve, reject) => {
    worker.use(
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
export const advancedSupportedApiForBrowser = {
  withError: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
  withAdvancedSupported: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 }),
    ),
  withAdvancedNotSupported: async (): Promise<BrowserAPIInterceptor> =>
    await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
      HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 }),
    ),
};

export const minMaxVersionApiForBrowser = async (
  supplier: () => HttpResponse<DefaultBodyType>,
): Promise<BrowserAPIInterceptor> =>
  await createBrowserAPIInterceptor('get', '/zx/auth/supported', supplier);

export const loginConfigApiForBrowser = async (
  supplier: () => HttpResponse<DefaultBodyType>,
): Promise<BrowserAPIInterceptor> =>
  await createBrowserAPIInterceptor('get', '/zx/login/v3/config', supplier);

export const getInfoRequestApiForBrowser = async (
  supplier: () => HttpResponse<DefaultBodyType>,
): Promise<BrowserAPIInterceptor> =>
  await createBrowserAPIInterceptor('post', '/service/admin/soap/GetInfoRequest', supplier);

export const getAllConfigRequestApiForBrowser = async (
  supplier: () => HttpResponse<DefaultBodyType>,
): Promise<BrowserAPIInterceptor> =>
  await createBrowserAPIInterceptor('post', '/service/admin/soap/GetAllConfigRequest', supplier);

export const delayedSoapApiForBrowser = <RequestParamsType, ResponseType = never>(
  apiAction: string,
  response: ResponseType,
  delayMs: number = 100,
): BrowserAPIInterceptor => {
  let calledTimes = 0;
  const requests: Array<StrictRequest<DefaultBodyType>> = [];

  worker.use(
    http.post<never, HandlerRequest<RequestParamsType>>(
      `/service/admin/soap/${apiAction}Request`,
      async ({ request }) => {
        calledTimes += 1;
        requests.push(request);

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        return HttpResponse.json({
          Body: {
            [`${apiAction}Response`]: response || {},
          },
        });
      },
    ),
  );

  return {
    getLastRequest: () => requests[requests.length - 1],
    getCalledTimes: () => calledTimes,
  };
};

export const createBrowserZextrasActionInterceptor = (
	action: string,
	response: () => HttpResponse<DefaultBodyType>,
) => {
	let calledTimes = 0;
	const requestBodies: Array<unknown> = [];

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.clone().json()) as Record<string, unknown>;
			const zextras = (body?.Body as Record<string, unknown>)?.zextras as
				| Record<string, unknown>
				| undefined;
			if (zextras?.action !== action) {
				return HttpResponse.json({ Body: {} });
			}
			calledTimes += 1;
			requestBodies.push(body);
			return response();
		}),
	);

	return {
		getCalledTimes: () => calledTimes,
		getLastRequestBody: <T = Record<string, unknown>>() => requestBodies.at(-1) as T | undefined,
	};
};

export const delayedBrowserZextrasActionInterceptor = (
	action: string,
	response: () => HttpResponse<DefaultBodyType>,
	delayMs: number = 100,
): BrowserAPIInterceptor => {
	let calledTimes = 0;
	const requests: Array<StrictRequest<DefaultBodyType>> = [];

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.clone().json()) as Record<string, unknown>;
			const zextras = (body?.Body as Record<string, unknown>)?.zextras as
				| Record<string, unknown>
				| undefined;
			if (zextras?.action !== action) {
				return HttpResponse.json({ Body: {} });
			}
			calledTimes += 1;
			requests.push(request);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
			return response();
		}),
	);

	return {
		getLastRequest: () => requests[requests.length - 1],
		getCalledTimes: () => calledTimes,
	};
};
