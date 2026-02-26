/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from "admin-ui-test-utils";
import { HttpResponse } from "msw";

import { setAccountQuota } from "../set-account-quota";

describe('setAccountQuota', () => {
    it('should call the API with the correct version header', async () => {
        const accountId = '12345';
        const newQuotaLimit = 2000000000;

        const apiInterceptor = createAPIInterceptor(
            'put',
            `/services/storages/admin/quota/config/accounts/${accountId}`,
            () => {
                return HttpResponse.json({}, { status: 200 });
            },
        );

        await setAccountQuota(accountId, newQuotaLimit);

        expect(apiInterceptor.getCalledTimes()).toBe(1);
        expect(apiInterceptor.getLastRequest().headers.get('X-API-Version')).toBe('2');
    });

    it('should call the API to set the account quota limit correctly', async() => {
        const accountId = '12345';
        const newQuotaLimit = 2000000000;

        const apiInterceptor = createAPIInterceptor(
            'put',
            `/services/storages/admin/quota/config/accounts/${accountId}`,
            () => {
                return HttpResponse.json({}, { status: 200 });
            },
        );

        await setAccountQuota(accountId, newQuotaLimit);

        expect(apiInterceptor.getCalledTimes()).toBe(1);
        const lastRequest = apiInterceptor.getLastRequest();
        const body = await lastRequest.json();
        expect(body).toEqual({ limit: newQuotaLimit });
    });

    it('should return success response if the API request is successful', async () => {
        const accountId = '12345';
        const newQuotaLimit = 2000000000;   

        createAPIInterceptor(
            'put',
            `/services/storages/admin/quota/config/accounts/${accountId}`,
            () => {
                return HttpResponse.json({}, { status: 200 });
            },
        );

        const result = await setAccountQuota(accountId, newQuotaLimit);

        expect(result).toEqual({
            type: 'success',
        });
    });

    it('should return an error if the API request fails', async () => {
        const accountId = '12345';
        const newQuotaLimit = 2000000000;

        createAPIInterceptor(
            'put',
            `/services/storages/admin/quota/config/accounts/${accountId}`,
            () => {
                return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
            },
        );

        const result = await setAccountQuota(accountId, newQuotaLimit);

        expect(result).toEqual({
            type: 'error',
            error: 'Internal Server Error',
        });
    });
});

