/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { CosFeatures } from './cos-features';
import { CosGeneralInformation } from './cos-general-information';
import { CosServerPools } from './cos-server-pools';
import { COSPreferences } from './preferences/COSPreferences';

export const CosDetailOperation = () => {
  const { operation } = useParams();

  switch (operation) {
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
