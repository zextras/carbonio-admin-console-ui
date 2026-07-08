/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { Container } from '@zextras/ui-components';
import { FC } from 'react';

import { volumeCreateSchema } from './server-specifics/volume/create-volume/schema';
import type { VolumeCreateFormValues } from './server-specifics/volume/create-volume/types';
import { VolumeContext } from './server-specifics/volume/create-volume/volume-context';
import VolumesDetailPanel from './server-specifics/volume/volumes-list';

export const VolumesDetailRoute: FC = () => {
  const form = useForm({
    defaultValues: {
      id: '',
      volumeName: '',
      volumeMain: 1,
      path: '',
      isCurrent: false,
      isCompression: false,
      compressionThreshold: '',
      volumeAllocation: 0,
    } as VolumeCreateFormValues,
    validators: {
      onChange: volumeCreateSchema,
    },
    onSubmit: async () => {},
  });

  return (
    <Container style={{ transition: 'max-width 300ms' }}>
      <VolumeContext.Provider value={{ form }}>
        <VolumesDetailPanel />
      </VolumeContext.Provider>
    </Container>
  );
};
