/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createS3Connector,
  deleteS3Connector,
  fetchSoap,
  listS3Connector,
  listS3Regions,
  testS3Connector,
  updateS3Connector,
} from '../s3-connector-service';

const mockPostSoapFetchRequest = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
  postSoapFetchRequest: mockPostSoapFetchRequest,
}));

function makeSoapResponse(content: unknown): {
  Body: { response: { content: string } };
} {
  return { Body: { response: { content: JSON.stringify(content) } } };
}

describe('s3-connector-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseSoapContent (via fetchSoap consumers)', () => {
    it('should throw when SOAP response content is missing', async () => {
      mockPostSoapFetchRequest.mockResolvedValue({ Body: { response: {} } });

      await expect(listS3Regions()).rejects.toThrow('Missing SOAP response content');
    });

    it('should throw when SOAP Body is missing entirely', async () => {
      mockPostSoapFetchRequest.mockResolvedValue({});

      await expect(listS3Connector()).rejects.toThrow('Missing SOAP response content');
    });
  });

  describe('listS3Regions', () => {
    it('should return region values on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({
          ok: true,
          response: { values: [{ id: 'us-east-1', description: 'US East 1' }] },
        }),
      );

      const result = await listS3Regions();

      expect(result).toEqual([{ id: 'us-east-1', description: 'US East 1' }]);
    });

    it('should return empty array when response values are absent', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, response: {} }));

      const result = await listS3Regions();

      expect(result).toEqual([]);
    });

    it('should throw with server error message when ok is false', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: false, error: 'Region unavailable' }),
      );

      await expect(listS3Regions()).rejects.toThrow('Region unavailable');
    });

    it('should throw fallback message when ok is false and no error field', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: false }));

      await expect(listS3Regions()).rejects.toThrow('Failed to list S3 regions');
    });

    it('should call fetchSoap with correct listS3Regions payload', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { values: [] } }),
      );

      await listS3Regions();

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        expect.objectContaining({ action: 'listS3Regions', module: 'ZxPowerstore' }),
        'zextras',
      );
    });
  });

  describe('listS3Connector', () => {
    it('should return connector values on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({
          ok: true,
          response: { values: [{ uuid: 'abc', label: 'Main' }] },
        }),
      );

      const result = await listS3Connector();

      expect(result).toEqual([{ uuid: 'abc', label: 'Main' }]);
    });

    it('should return empty array when response values are absent', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true, response: {} }));

      const result = await listS3Connector();

      expect(result).toEqual([]);
    });

    it('should throw with server error message when ok is false', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: false, error: 'Connector error' }),
      );

      await expect(listS3Connector()).rejects.toThrow('Connector error');
    });

    it('should throw fallback message when ok is false and no error field', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: false }));

      await expect(listS3Connector()).rejects.toThrow('Failed to list S3 connectors');
    });
  });

  describe('createS3Connector', () => {
    const payload = {
      _jsns: 'urn:zimbraAdmin',
      module: 'ZxPowerstore' as const,
      action: 'createS3Connector' as const,
      iAmSure: true,
      bucketName: 'my-bucket',
      label: 'Main',
      region: 'us-east-1',
      accessKey: 'AKIA_TEST',
      secret: 'SECRET',
    };

    it('should return mutation response on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { message: 'created' } }),
      );

      const result = await createS3Connector(payload);

      expect(result).toEqual({ ok: true, response: { message: 'created' } });
    });

    it('should return mutation response when server signals failure', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: false, error: 'Bucket already exists' }),
      );

      const result = await createS3Connector(payload);

      expect(result).toEqual({ ok: false, error: 'Bucket already exists' });
    });

    it('should pass payload directly to fetchSoap', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true }));

      await createS3Connector(payload);

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        payload,
        'zextras',
      );
    });
  });

  describe('updateS3Connector', () => {
    const payload = {
      _jsns: 'urn:zimbraAdmin',
      module: 'ZxPowerstore' as const,
      action: 'updateS3Connector' as const,
      uuid: 'conn-1',
      iAmSure: true,
    };

    it('should return mutation response on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { message: 'updated' } }),
      );

      const result = await updateS3Connector(payload);

      expect(result).toEqual({ ok: true, response: { message: 'updated' } });
    });

    it('should pass payload to fetchSoap', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true }));

      await updateS3Connector(payload);

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        payload,
        'zextras',
      );
    });
  });

  describe('deleteS3Connector', () => {
    const payload = {
      _jsns: 'urn:zimbraAdmin',
      module: 'ZxPowerstore' as const,
      action: 'deleteS3Connector' as const,
      uuid: 'conn-1',
      iAmSure: true,
    };

    it('should return mutation response on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { message: 'deleted' } }),
      );

      const result = await deleteS3Connector(payload);

      expect(result).toEqual({ ok: true, response: { message: 'deleted' } });
    });

    it('should return failure response when server signals error', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: false, error: 'Connector not found' }),
      );

      const result = await deleteS3Connector(payload);

      expect(result).toEqual({ ok: false, error: 'Connector not found' });
    });

    it('should pass payload directly to fetchSoap', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true }));

      await deleteS3Connector(payload);

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        payload,
        'zextras',
      );
    });

    it('should throw when SOAP response content is missing', async () => {
      mockPostSoapFetchRequest.mockResolvedValue({ Body: {} });

      await expect(deleteS3Connector(payload)).rejects.toThrow('Missing SOAP response content');
    });
  });

  describe('testS3Connector', () => {
    const payload = {
      _jsns: 'urn:zimbraAdmin',
      module: 'ZxPowerstore' as const,
      action: 'testS3Connector' as const,
      uuid: 'conn-1',
      label: 'Test connector',
      bucketName: 'test-bucket',
      accessKey: 'AKIA_TEST',
      secret: 'secret-key',
      url: 'https://s3.example.test',
      region: 'us-east-1',
      insecureHttps: true,
    };

    it('should return mutation response on success', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: true, response: { message: 'tested' } }),
      );

      const result = await testS3Connector(payload);

      expect(result).toEqual({ ok: true, response: { message: 'tested' } });
    });

    it('should return failure response when server signals error', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(
        makeSoapResponse({ ok: false, error: 'Connection failed' }),
      );

      const result = await testS3Connector(payload);

      expect(result).toEqual({ ok: false, error: 'Connection failed' });
    });

    it('should pass payload to fetchSoap', async () => {
      mockPostSoapFetchRequest.mockResolvedValue(makeSoapResponse({ ok: true }));

      await testS3Connector(payload);

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        payload,
        'zextras',
      );
    });
  });

  describe('fetchSoap', () => {
    it('should call postSoapFetchRequest with correct URL and body', async () => {
      mockPostSoapFetchRequest.mockResolvedValue({});

      await fetchSoap('zextras', { action: 'test' });

      expect(mockPostSoapFetchRequest).toHaveBeenCalledWith(
        '/service/admin/soap/zextras',
        { action: 'test' },
        'zextras',
      );
    });
  });
});
