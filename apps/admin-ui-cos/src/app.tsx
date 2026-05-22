/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, registerActions, removeRoute, useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { FC, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  APP_ID,
  COS,
  COS_ROUTE_ID,
  CREATE_COS,
  CREATE_NEW_COS_ROUTE_ID,
  GLOBAL,
  LIST_COS,
  MANAGE,
  MANAGE_APP_ID,
  PRIMARY_BAR_COS,
} from './constants';
import { useCosStore } from './store/cos/store';
import AppView from './views/app-view';

type RightEntry = {
  all?: Array<{
    getAttrs?: Array<{ all?: boolean }>;
    setAttrs?: Array<{ all?: boolean }>;
    right?: Array<{ n: string }>;
  }>;
  type: string;
};

function checkShowCOS(rights: RightEntry[] | undefined): boolean {
  const rightsConfig = find(rights, { type: COS }) ?? { all: [], type: COS };
  return !!(
    rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
    rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
    find(rightsConfig?.all?.[0]?.right, { n: LIST_COS })
  );
}

function checkCreateCosRight(rights: RightEntry[] | undefined): boolean {
  const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
  return !!(
    rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
    rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
    find(rightsConfig?.all?.[0]?.right, { n: CREATE_COS })
  );
}

const CosTooltipView: FC = () => {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.class_of_service_lbl"
          defaults="<bold>Class of Service</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.cos_primarybar_tooltip"
          defaults="View and manage your <bold>Class of Services</bold> details, <bold>features, Server Pools</bold> and <bold>Advanced</bold> settings."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );
};

const App: FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { setCosView } = useCosStore();
  const { data: rights } = useCurrentUserRights();

  const showCOS = checkShowCOS(rights);
  const createCosRight = checkCreateCosRight(rights);

  const managementSectionRef = useRef({
    id: MANAGE_APP_ID,
    label: t('label.management', 'Management'),
    position: 3,
  });
  managementSectionRef.current.label = t('label.management', 'Management');

  useEffect(() => {
    if (showCOS) {
      addRoute({
        route: COS_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.cos', 'COS') || '',
        primaryBar: 'SettingsModOutline',
        appView: AppView,
        primarybarSection: managementSectionRef.current,
        tooltip: CosTooltipView,
        trackerLabel: PRIMARY_BAR_COS,
      });
    } else {
      removeRoute(COS_ROUTE_ID);
    }
  }, [showCOS, t]);

  useEffect(() => {
    registerActions({
      action: (): any => ({
        id: 'new-cos',
        label: t('label.create_new_cos', 'Create New COS'),
        icon: '',
        onClick: (): void => {
          navigate(`/${MANAGE}/${COS_ROUTE_ID}/${CREATE_NEW_COS_ROUTE_ID}`);
          setCosView(CREATE_NEW_COS_ROUTE_ID);
        },
        disabled: !createCosRight,
        group: APP_ID,
        primary: false,
      }),
      id: 'new-cos',
      type: 'new',
    });
  }, [createCosRight, navigate, setCosView, t]);

  return null;
};

export default App;
