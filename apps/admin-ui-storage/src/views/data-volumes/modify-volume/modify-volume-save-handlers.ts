/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';

import { ZIMBRA_ADMIN_URN } from '../../../constants';

type SoapContentResponse = {
  Body?: {
    response?: {
      content?: string;
    };
  };
};

type SnackbarCreator = (options: {
  key: string;
  severity: 'success' | 'error';
  label: string;
  autoHideTimeout?: number;
}) => void;

type SaveCallbacks = {
  onSuccess: () => void;
  onError: (errorDetails?: unknown) => void;
};

export function showVolumeSaveError(createSnackbar: SnackbarCreator, t: TFunction): void {
  createSnackbar({
    key: 'error',
    severity: 'error',
    label: t('label.volume_detail_error', '{{message}}', {
      message: 'Something went wrong, please try again',
    }),
    autoHideTimeout: 5000,
  });
}

export function showVolumeSaveSuccess(createSnackbar: SnackbarCreator, t: TFunction): void {
  createSnackbar({
    key: '1',
    severity: 'success',
    label: t('label.volume_detail_success', 'All changes have been saved successfully'),
  });
}

export function handleAdvancedUpdateResponse(
  res: unknown,
  selectedServerName: string,
  callbacks: SaveCallbacks,
): void {
  const typedRes = res as SoapContentResponse;
  const result = JSON.parse(typedRes?.Body?.response?.content || '{}');
  const updateResponse = result?.response?.[selectedServerName];

  if (updateResponse?.ok) {
    callbacks.onSuccess();
    return;
  }

  callbacks.onError(updateResponse?.exception ?? updateResponse?.error);
}

export type CeVolumeFormState = {
  id: string;
  name: string;
  rootpath: string;
  typeValue: number | undefined;
  compressBlobs: boolean;
  compressionThreshold: string;
  isCurrent: boolean;
};

export type CeSaveCallbacks = {
  onSuccess: () => void;
  onModifyError: (errorDetails?: unknown) => void;
  onSetCurrentError: (errorDetails?: unknown) => void;
};

export async function saveCeVolume(
  form: CeVolumeFormState,
  selectedServerId: string,
  _createSnackbar: SnackbarCreator,
  _t: TFunction,
  callbacks: CeSaveCallbacks,
): Promise<void> {
  try {
    await soapFetch(
      'ModifyVolume',
      {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxCore',
        action: 'ModifyVolumeRequest',
        id: form.id,
        volume: {
          id: form.id,
          name: form.name,
          rootpath: form.rootpath,
          type: form.typeValue,
          compressBlobs: form.compressBlobs ? 1 : 0,
          compressionThreshold: form.compressionThreshold,
          isCurrent: form.isCurrent ? 1 : 0,
        },
      },
      {
        targetServer: selectedServerId,
      },
    );
  } catch (error) {
    callbacks.onModifyError(error);
    return;
  }

  if (form.isCurrent) {
    void soapFetch(
      'SetCurrentVolume',
      {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxCore',
        action: 'SetCurrentVolumeRequest',
        id: form.id,
        type: form.typeValue,
      },
      {
        targetServer: selectedServerId,
      },
    ).catch((error) => {
      callbacks.onSetCurrentError(error);
    });
  }

  callbacks.onSuccess();
}
