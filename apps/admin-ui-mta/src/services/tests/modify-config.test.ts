/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { modifyConfig } from '../modify-config';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('modifyConfig', () => {
  it('should call soapFetch with ModifyConfig and urn:zimbraAdmin', async () => {
    const attributes = [{ n: 'attr', _content: 'TRUE' }];
    vi.mocked(soapFetch).mockResolvedValue({});

    await modifyConfig(attributes);

    expect(soapFetch).toHaveBeenCalledWith('ModifyConfig', {
      _jsns: 'urn:zimbraAdmin',
      a: attributes,
    });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(modifyConfig([{ n: 'attr', _content: 'FALSE' }])).rejects.toThrow('SOAP fault');
  });
});
