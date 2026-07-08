/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, useMemo, useState } from 'react';

import type { VolumeWizardDetail } from '../../../types';
import { VolumeContext } from './server-specifics/volume/create-volume/volume-context';
import VolumesDetailPanel from './server-specifics/volume/volumes-list';

export const VolumesDetailRoute: FC = () => {
  const [volumeDetail, setVolumeDetail] = useState<VolumeWizardDetail>({
    id: '',
    volumeName: '',
    volumeMain: 1,
    path: '',
    isCurrent: false,
    isCompression: false,
    compressionThreshold: '',
    volumeAllocation: 0,
  });

  const volumeContextValue = useMemo(
    () => ({ volumeDetail, setVolumeDetail }),
    [volumeDetail, setVolumeDetail],
  );

  return (
    <Container style={{ transition: 'max-width 300ms' }}>
      <VolumeContext.Provider value={volumeContextValue}>
        <VolumesDetailPanel />
      </VolumeContext.Provider>
    </Container>
  );
};
