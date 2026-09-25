/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/ui-shared';
import { resetMockWorker } from 'admin-ui-test-utils';
import { expect, it } from 'vitest';

it('answers SOAP requests with a valid empty envelope after resetMockWorker', async () => {
  resetMockWorker();
  // Simulates a request fired after test teardown wiped per-test handlers.
  // Must resolve with the standard empty response, not reject with
  // "Empty response from NoOpRequest" (passthrough to dev server).
  const response = await soapFetch('NoOp', {});
  expect(response).toEqual({});
});
