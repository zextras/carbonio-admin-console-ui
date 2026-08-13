/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  addRoute,
  registerActions,
  removeRoute,
  useCurrentUserRights,
  useLicenseInfo,
} from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  APP_ID,
  COS_ROUTE_ID,
  CREATE_NEW_COS_ROUTE_ID,
  MANAGE,
  MANAGE_APP_ID,
  PRIMARY_BAR_COS,
} from './constants';
import { checkCreateCosRight, checkShowCOS } from './utils/check-rights';
import { AppView } from './views/app-view';
import { CosTooltipView } from './views/cos-tooltip-view';

const App = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { data: rights } = useCurrentUserRights();
  const { data: licenseData } = useLicenseInfo();
  const showCOS = checkShowCOS(rights);
  const createCosRight = checkCreateCosRight(rights);

  useEffect(() => {
    if (showCOS) {
      const managementSection = {
        id: MANAGE_APP_ID,
        label: t('label.management', 'Management'),
        position: 3,
      };
      addRoute({
        route: COS_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.cos', 'COS') || '',
        primaryBar: 'SettingsModOutline',
        appView: AppView,
        primarybarSection: managementSection,
        tooltip: CosTooltipView,
        trackerLabel: PRIMARY_BAR_COS,
      });
    } else {
      removeRoute(COS_ROUTE_ID);
    }
  }, [showCOS, t]);

  useEffect(() => {
    const canCreate = Boolean(licenseData) && createCosRight;
    const tooltipLabel = t(
      'tooltip.create_cos_disabled',
      'A valid subscription is needed to create a COS',
    );
    registerActions({
      action: () => ({
        id: 'new-cos',
        label: t('label.create_new_cos', 'Create New COS'),
        icon: '',
        onClick: () => {
          navigate(`/${MANAGE}/${COS_ROUTE_ID}/${CREATE_NEW_COS_ROUTE_ID}`);
        },
        disabled: !canCreate,
        tooltipLabel: !canCreate ? tooltipLabel : undefined,
        group: APP_ID,
        primary: false,
      }),
      id: 'new-cos',
      type: 'new',
    });
  }, [createCosRight, licenseData, navigate, t]);

  return null;
};

export default App;
