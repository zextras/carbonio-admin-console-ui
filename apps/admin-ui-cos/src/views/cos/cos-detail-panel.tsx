/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Route, Routes } from 'react-router';

import {
  ADVANCED,
  COS_LIST,
  CREATE_NEW_COS_ROUTE_ID,
  FEATURES,
  GENERAL_INFORMATION,
  PREFERENCES,
  SERVER_POOLS,
  WSC,
} from '../../constants';
import { WscCosSettings } from '../../wsc/wsc-cos-settings';
import { CosAdvanced } from './advanced/cos-advanced';
import { CosFeatures } from './cos-features/cos-features';
import { CosList } from './cos-list/cos-list';
import { CosServerPools } from './cos-server-pools/cos-server-pools';
import { CreateCos } from './create-new-cos';
import { CosGeneralInformation } from './general-information/cos-general-information';
import { COSPreferences } from './preferences/cos-preferences';

export const CosDetailPanel = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    background="gray6"
  >
    <Routes>
      <Route index element={<CosList />} />
      <Route path={`:cosId/${GENERAL_INFORMATION}`} element={<CosGeneralInformation />} />
      <Route path={`:cosId/${FEATURES}`} element={<CosFeatures />} />
      <Route path={`:cosId/${WSC}`} element={<WscCosSettings />} />
      <Route path={`:cosId/${PREFERENCES}`} element={<COSPreferences />} />
      <Route path={`:cosId/${ADVANCED}`} element={<CosAdvanced />} />
      <Route path={`:cosId/${SERVER_POOLS}`} element={<CosServerPools />} />
      <Route path={CREATE_NEW_COS_ROUTE_ID} element={<CreateCos />} />
      <Route path={COS_LIST} element={<CosList />} />
    </Routes>
  </Container>
);
