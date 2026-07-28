/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFunction } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type CeVolumeFormState,
  handleAdvancedUpdateResponse,
  saveCeVolume,
  showVolumeSaveError,
  showVolumeSaveSuccess,
} from '../modify-volume-save-handlers';

const mockSoapFetch = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: mockSoapFetch,
}));

function createForm(overrides: Partial<CeVolumeFormState> = {}): CeVolumeFormState {
  return {
    id: 'vol-1',
    name: 'volume-1',
    rootpath: '/opt/zextras/store',
    typeValue: 1,
    compressBlobs: false,
    compressionThreshold: '4096',
    isCurrent: false,
    ...overrides,
  };
}

const mockT = vi.fn((key: string, fallback?: string) => fallback ?? key) as unknown as TFunction;

describe('modify-volume-save-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSoapFetch.mockResolvedValue({});
  });

  describe('showVolumeSaveError', () => {
    it('should call createSnackbar with error severity', () => {
      const createSnackbar = vi.fn();

      showVolumeSaveError(createSnackbar, mockT);

      expect(createSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'error',
          severity: 'error',
          autoHideTimeout: 5000,
        }),
      );
    });
  });

  describe('showVolumeSaveSuccess', () => {
    it('should call createSnackbar with success severity', () => {
      const createSnackbar = vi.fn();

      showVolumeSaveSuccess(createSnackbar, mockT);

      expect(createSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          key: '1',
          severity: 'success',
        }),
      );
    });
  });

  describe('handleAdvancedUpdateResponse', () => {
    it('should call onSuccess when response ok is true', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const res = {
        Body: {
          response: {
            content: JSON.stringify({
              response: { 'server-1': { ok: true } },
            }),
          },
        },
      };

      handleAdvancedUpdateResponse(res, 'server-1', { onSuccess, onError });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError when response ok is false', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const res = {
        Body: {
          response: {
            content: JSON.stringify({
              response: { 'server-1': { ok: false } },
            }),
          },
        },
      };

      handleAdvancedUpdateResponse(res, 'server-1', { onSuccess, onError });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onError when ok is missing', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const res = {
        Body: {
          response: {
            content: JSON.stringify({ response: {} }),
          },
        },
      };

      handleAdvancedUpdateResponse(res, 'server-1', { onSuccess, onError });

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('should call onError when content is missing (fallback to empty object)', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const res = { Body: { response: {} } };

      handleAdvancedUpdateResponse(res, 'server-1', { onSuccess, onError });

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveCeVolume', () => {
    it('should call ModifyVolume with correct payload', async () => {
      const onSuccess = vi.fn();
      const form = createForm();

      await saveCeVolume(form, 'server-1', vi.fn(), mockT, {
        onSuccess,
        onModifyError: vi.fn(),
        onSetCurrentError: vi.fn(),
      });

      expect(mockSoapFetch).toHaveBeenCalledWith(
        'ModifyVolume',
        expect.objectContaining({
          id: 'vol-1',
          volume: expect.objectContaining({
            name: 'volume-1',
            rootpath: '/opt/zextras/store',
            type: 1,
            compressBlobs: 0,
            compressionThreshold: '4096',
            isCurrent: 0,
          }),
        }),
        { targetServer: 'server-1' },
      );
    });

    it('should always call onSuccess after ModifyVolume', async () => {
      const onSuccess = vi.fn();

      await saveCeVolume(createForm(), 'server-1', vi.fn(), mockT, {
        onSuccess,
        onModifyError: vi.fn(),
        onSetCurrentError: vi.fn(),
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should not call SetCurrentVolume when isCurrent is false', async () => {
      await saveCeVolume(createForm({ isCurrent: false }), 'server-1', vi.fn(), mockT, {
        onSuccess: vi.fn(),
        onModifyError: vi.fn(),
        onSetCurrentError: vi.fn(),
      });

      expect(mockSoapFetch).toHaveBeenCalledTimes(1);
      expect(mockSoapFetch).not.toHaveBeenCalledWith(
        'SetCurrentVolume',
        expect.anything(),
        expect.anything(),
      );
    });

    it('should call SetCurrentVolume when isCurrent is true', async () => {
      await saveCeVolume(createForm({ isCurrent: true }), 'server-1', vi.fn(), mockT, {
        onSuccess: vi.fn(),
        onModifyError: vi.fn(),
        onSetCurrentError: vi.fn(),
      });

      expect(mockSoapFetch).toHaveBeenCalledTimes(2);
      expect(mockSoapFetch).toHaveBeenNthCalledWith(
        2,
        'SetCurrentVolume',
        expect.objectContaining({
          id: 'vol-1',
          type: 1,
        }),
        { targetServer: 'server-1' },
      );
    });

    it('should call onSetCurrentError when SetCurrentVolume fails', async () => {
      mockSoapFetch.mockResolvedValueOnce({});
      mockSoapFetch.mockRejectedValueOnce(new Error('network error'));

      const createSnackbar = vi.fn();
      const onSetCurrentError = vi.fn();

      await saveCeVolume(createForm({ isCurrent: true }), 'server-1', createSnackbar, mockT, {
        onSuccess: vi.fn(),
        onModifyError: vi.fn(),
        onSetCurrentError,
      });

      await vi.waitFor(() => {
        expect(onSetCurrentError).toHaveBeenCalledTimes(1);
      });

      expect(createSnackbar).not.toHaveBeenCalled();
    });

    it('should map compressBlobs and isCurrent to numeric values', async () => {
      await saveCeVolume(
        createForm({ compressBlobs: true, isCurrent: false }),
        'server-1',
        vi.fn(),
        mockT,
        { onSuccess: vi.fn(), onModifyError: vi.fn(), onSetCurrentError: vi.fn() },
      );

      expect(mockSoapFetch).toHaveBeenCalledWith(
        'ModifyVolume',
        expect.objectContaining({
          volume: expect.objectContaining({ compressBlobs: 1, isCurrent: 0 }),
        }),
        expect.anything(),
      );
    });
  });
});
