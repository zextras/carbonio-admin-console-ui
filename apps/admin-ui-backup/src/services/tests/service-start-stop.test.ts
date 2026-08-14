/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: vi.fn(),
}));

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { BACKUP_SOAP_URL, ZIMBRA_ADMIN_URN } from '../../constants';
import { serviceStartStop } from '../service-start-stop';

describe('serviceStartStop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls postSoapFetchRequest with doStartService action', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({ Body: { response: { content: '' } } } as never);

    await serviceStartStop({ action: 'doStartService', server: 'mail.example.com' });

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      BACKUP_SOAP_URL,
      {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxBackup',
        action: 'doStartService',
        service_name: 'module',
        targetServers: 'mail.example.com',
      },
      'zextras',
    );
  });

  it('calls postSoapFetchRequest with doStopService action', async () => {
    vi.mocked(postSoapFetchRequest).mockResolvedValue({ Body: { response: { content: '' } } } as never);

    await serviceStartStop({ action: 'doStopService', server: 'mail.example.com' });

    expect(postSoapFetchRequest).toHaveBeenCalledWith(
      BACKUP_SOAP_URL,
      expect.objectContaining({ action: 'doStopService' }),
      'zextras',
    );
  });
});
