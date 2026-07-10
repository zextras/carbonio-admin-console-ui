/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSignature } from '../create-signature-service';

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: vi.fn(),
}));

const { postSoapFetchRequest } = await import('@zextras/ui-shared');

describe('createSignature', () => {
  beforeEach(() => {
    vi.mocked(postSoapFetchRequest).mockReset();
  });

  it('should call postSoapFetchRequest with correct parameters', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({
      Body: {
        CreateSignatureResponse: {
          signature: [{ id: 'sig-1', name: 'Test Signature' }],
        },
      },
    });

    await createSignature('account-123', 'My Signature', 'Regards, John');

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      '/service/admin/soap/CreateSignatureRequest',
      {
        _jsns: 'urn:zimbraAccount',
        signature: {
          name: 'My Signature',
          content: {
            type: 'text/plain',
            _content: 'Regards, John',
          },
        },
      },
      'CreateSignatureRequest',
      'account-123',
    );
  });

  it('should return success response with signature data', async () => {
    const successResponse = {
      Body: {
        CreateSignatureResponse: {
          signature: [{ id: 'new-sig-id', name: 'New Signature' }],
        },
      },
    };
    vi.mocked(postSoapFetchRequest).mockResolvedValue(successResponse);

    const result = await createSignature('acc-1', 'Test', 'Content');

    expect(result).toEqual(successResponse);
    expect(result.Body.CreateSignatureResponse.signature?.[0]?.id).toBe('new-sig-id');
  });

  it('should return fault response when API returns error', async () => {
    const faultResponse = {
      Body: {
        Fault: {
          Reason: {
            Text: 'Signature already exists',
          },
        },
      },
    };
    vi.mocked(postSoapFetchRequest).mockResolvedValue(faultResponse);

    const result = await createSignature('acc-1', 'Existing', 'Content');

    expect(result.Body.Fault?.Reason?.Text).toBe('Signature already exists');
  });

  it('should handle response with undefined signature array', async () => {
    const responseWithUndefinedSignature = {
      Body: {
        CreateSignatureResponse: {
          // signature array is undefined
        },
      },
    };
    vi.mocked(postSoapFetchRequest).mockResolvedValue(responseWithUndefinedSignature);

    const result = await createSignature('acc-1', 'Test', 'Content');

    // Using optional chaining should not throw
    expect(result.Body.CreateSignatureResponse?.signature?.[0]).toBeUndefined();
  });

  it('should handle response with empty signature array', async () => {
    const responseWithEmptySignature = {
      Body: {
        CreateSignatureResponse: {
          signature: [],
        },
      },
    };
    vi.mocked(postSoapFetchRequest).mockResolvedValue(responseWithEmptySignature);

    const result = await createSignature('acc-1', 'Test', 'Content');

    expect(result.Body.CreateSignatureResponse?.signature?.[0]).toBeUndefined();
  });
});
