/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/ui-shared';
import { resetMockWorker } from 'admin-ui-test-utils';
import { expect, it } from 'vitest';

it('answers SOAP requests with a flat empty envelope (undefined) after resetMockWorker', async () => {
  resetMockWorker();
  // Simulates a request fired after test teardown wiped per-test handlers.
  // Must resolve (not reject with "Empty response from NoOpRequest"), and must
  // resolve to undefined — a defined-but-empty {} payload crashes component
  // success callbacks written against undefined-able response data (data?.cos[0]).
  const response = await soapFetch('NoOp', {});
  expect(response).toBeUndefined();
});
