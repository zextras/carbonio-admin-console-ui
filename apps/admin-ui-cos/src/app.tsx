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
} from '@zextras/admin-ui-bootstrap';
import { find } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo } from 'react';
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
  SERVICES_ROUTE_ID,
} from './constants';
import { useCosStore } from './store/cos/store';
import AppView from './views/app-view';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';

const App: FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { setCosView } = useCosStore();
  const { data: rights } = useCurrentUserRights();

  const showCOS = useMemo(() => {
    const rightsConfig = find(rights, { type: COS }) ?? { all: [], type: COS };
    return !!(
      rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
      rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
      find(rightsConfig?.all?.[0]?.right, { n: LIST_COS })
    );
  }, [rights]);

  const createCosRight = useMemo(() => {
    const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
    return !!(
      rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
      rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
      find(rightsConfig?.all?.[0]?.right, { n: CREATE_COS })
    );
  }, [rights]);

  const managementSection = useMemo(
    () => ({
      id: MANAGE_APP_ID,
      label: t('label.management', 'Management'),
      position: 3,
    }),
    [t],
  );

  const cosTooltipItems = useMemo(
    () => [
      {
        header: (
          <>
            <Trans
              i18nKey="label.class_of_service_lbl"
              defaults="<bold>Class of Service</bold>"
              components={{ bold: <strong /> }}
              t={t}
            />
            {'\n\n'}
            <Trans
              i18nKey="label.cos_primarybar_tooltip"
              defaults="View and manage your <bold>Class of Services</bold> details, <bold>features, Server Pools</bold> and <bold>Advanced</bold> settings."
              components={{ bold: <strong /> }}
              t={t}
            />
          </>
        ),
        options: [],
      },
    ],
    [t],
  );

  const CosTooltipView: FC = useCallback(
    () => <PrimaryBarTooltip items={cosTooltipItems} />,
    [cosTooltipItems],
  );

  const cosPrimaryBar = useCallback(
    () => (
      <icon-wc
        icon-name="SettingsModOutline"
        size="large"
        onClick={(): void => {
          navigate(`/${SERVICES_ROUTE_ID}/${COS_ROUTE_ID}`);
        }}
      ></icon-wc>
    ),
    [navigate],
  );

  useEffect(() => {
    if (showCOS) {
      addRoute({
        route: COS_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.cos', 'COS') || '',
        primaryBar: cosPrimaryBar,
        appView: AppView,
        primarybarSection: { ...managementSection },
        tooltip: CosTooltipView,
        trackerLabel: PRIMARY_BAR_COS,
      });
    } else {
      removeRoute(COS_ROUTE_ID);
    }
  }, [CosTooltipView, cosPrimaryBar, managementSection, showCOS, t]);

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
