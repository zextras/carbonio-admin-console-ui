/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useParams } from 'react-router';

import {
  ADVANCED,
  FEATURES,
  GENERAL_INFORMATION,
  PREFERENCES,
  SERVER_POOLS,
  WSC,
} from '../../constants';
import { WscCosSettings } from '../../wsc/wsc-cos-settings';
import { CosAdvanced } from './advanced/cos-advanced';
import { CosFeatures } from './cos-features/cos-features';
import { CosServerPools } from './cos-server-pools/cos-server-pools';
import { CosGeneralInformation } from './general-information/cos-general-information';
import { COSPreferences } from './preferences/cos-preferences';

const CosDetailContent = () => {
  const { operation } = useParams();
  switch (operation?.toLowerCase()) {
    case GENERAL_INFORMATION:
      return <CosGeneralInformation />;
    case FEATURES:
      return <CosFeatures />;
    case WSC:
      return <WscCosSettings />;
    case PREFERENCES:
      return <COSPreferences />;
    case ADVANCED:
      return <CosAdvanced />;
    case SERVER_POOLS:
      return <CosServerPools />;
    default:
      return null;
  }
};

export const CosDetailPanel = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    background="gray6"
  >
    <CosDetailContent />
  </Container>
);
