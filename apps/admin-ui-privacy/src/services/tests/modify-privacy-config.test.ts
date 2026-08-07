/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { modifyPrivacyConfig } from '../modify-privacy-config';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('modifyPrivacyConfig', () => {
  it('should call soapFetch with Batch and mapped TRUE/FALSE attributes', async () => {
    const mockResponse = { BatchResponse: {} };
    vi.mocked(soapFetch).mockResolvedValue(mockResponse);

    const result = await modifyPrivacyConfig({
      allowFeedback: true,
      sendFullError: false,
      sendAnalytics: true,
    });

    expect(soapFetch).toHaveBeenCalledWith('Batch', {
      ModifyConfigRequest: [
        { n: 'carbonioAllowFeedback', _content: 'TRUE' },
        { n: 'carbonioSendFullErrorStack', _content: 'FALSE' },
        { n: 'carbonioSendAnalytics', _content: 'TRUE' },
      ],
      _jsns: 'urn:zimbra',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should map all false values to FALSE', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await modifyPrivacyConfig({
      allowFeedback: false,
      sendFullError: false,
      sendAnalytics: false,
    });

    expect(soapFetch).toHaveBeenCalledWith('Batch', {
      ModifyConfigRequest: [
        { n: 'carbonioAllowFeedback', _content: 'FALSE' },
        { n: 'carbonioSendFullErrorStack', _content: 'FALSE' },
        { n: 'carbonioSendAnalytics', _content: 'FALSE' },
      ],
      _jsns: 'urn:zimbra',
    });
  });

  it('should call soapFetch exactly once per invocation', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await modifyPrivacyConfig({
      allowFeedback: true,
      sendFullError: true,
      sendAnalytics: true,
    });

    expect(soapFetch).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(
      modifyPrivacyConfig({
        allowFeedback: true,
        sendFullError: true,
        sendAnalytics: true,
      }),
    ).rejects.toThrow('SOAP fault');
  });
});
