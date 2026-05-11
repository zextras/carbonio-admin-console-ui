/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, useState } from 'react';
import { useParams } from 'react-router';

import type { VolumeWizardDetail } from '../../../types';
import { BUCKET_LIST, DATA_VOLUMES, HSM_SETTINGS, SERVERS_LIST } from '../../constants';
import BucketDetailPanel from './bucket-detail-panel';
import ServersDetailPanel from './global-servers/server-detail-panel';
import HSMsettingPanel from './hsm/hsm-setting-panel';
import { VolumeContext } from './server-specifics/volume/create-volume/volume-context';
import VolumesDetailPanel from './server-specifics/volume/volumes-list';

const BucketOperation: FC = () => {
  const { operation } = useParams();
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

  return (
    <>
      {((): any => {
        switch (operation) {
          case SERVERS_LIST:
            return (
              <Container style={{ transition: 'max-width 300ms' }}>
                <ServersDetailPanel />
              </Container>
            );
          case BUCKET_LIST:
            return (
              <Container style={{ transition: 'max-width 300ms' }}>
                <BucketDetailPanel />
              </Container>
            );
          case DATA_VOLUMES:
            return (
              <Container style={{ transition: 'max-width 300ms' }}>
                <VolumeContext.Provider value={{ volumeDetail, setVolumeDetail }}>
                  <VolumesDetailPanel />
                </VolumeContext.Provider>
              </Container>
            );
          case HSM_SETTINGS:
            return (
              <Container style={{ transition: 'max-width 300ms' }}>
                <HSMsettingPanel />
              </Container>
            );
          default:
            return null;
        }
      })()}
    </>
  );
};
export default BucketOperation;
