/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useLocalStorage } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

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
import { CreateCosLegacy } from './create-new-cos-legacy';
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

export const CosDetailPanel = () => {
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    'new_subscription_feature_flag',
    null,
  );

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      background="gray6"
    >
      <CosDetailContent />
      <Routes>
        <Route index element={<Navigate to={COS_LIST} replace />} />
        <Route path={`:cosId/${GENERAL_INFORMATION}`} element={<CosGeneralInformation />} />
        <Route path={`:cosId/${FEATURES}`} element={<CosFeatures />} />
        <Route path={`:cosId/${WSC}`} element={<WscCosSettings />} />
        <Route path={`:cosId/${PREFERENCES}`} element={<COSPreferences />} />
        <Route path={`:cosId/${ADVANCED}`} element={<CosAdvanced />} />
        <Route path={`:cosId/${SERVER_POOLS}`} element={<CosServerPools />} />
        {!featureFlag && <Route path={CREATE_NEW_COS_ROUTE_ID} element={<CreateCosLegacy />} />}
        <Route path={COS_LIST} element={<CosList />} />
      </Routes>
    </Container>
  );
};
