/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  DefaultTabBarItem,
  type Item as TabBarItem,
  Select,
  TabBar,
} from '@zextras/ui-components';
import { getAllRights, useCurrentUserRights } from '@zextras/ui-shared';
import { noop } from 'lodash-es';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { themeConfigStore } from '../../../types/domain';
import { CONFIG, PRIMARY_COLOR_CODE_EX } from '../../constants';
import { RevertToInheritedIcon } from '../../views/utility/revert-to-inherited-icon';
import { AdminPanelThemeConfig } from './admin-panel-theme-configs';
import { EndUserThemeConfigs } from './end-user-theme-configs';
import styles from './theme-configs.module.css';
import { ThemeFieldInput } from './theme-field-input';
import {
  DARK_PRIMARY_COLOR_ERROR_LABEL,
  LIGHT_PRIMARY_COLOR_ERROR_LABEL,
} from './white-label-schema';

type ReusedDefaultTabBarProps = {
  item: TabBarItem;
  selected: boolean;
  onClick: (ev: React.MouseEvent<HTMLDivElement> | KeyboardEvent) => void;
};

const ReusedDefaultTabBar = ({ item, selected, onClick }: ReusedDefaultTabBarProps) => (
  <DefaultTabBarItem
    item={item}
    selected={selected}
    onClick={onClick}
    orientation="horizontal"
    background="gray6"
    underlineColor="primary"
    forceWidthEquallyDistributed={false}
  >
    <div className={styles.tabBarLabel}>
      <ds-text as="span" size="small" color={selected ? 'primary' : 'gray'}>
        {item.label}
      </ds-text>
    </div>
  </DefaultTabBarItem>
);

function computeHasGlobalModifyRights(rights: unknown): boolean {
  if (!rights || !Array.isArray(rights) || rights.length === 0) {
    return false;
  }
  const allRights = getAllRights(rights as never, CONFIG);
  const right = allRights?.[0];
  const setAttrs = right?.all?.[0]?.setAttrs ?? [];
  return setAttrs.some((item: Record<string, unknown>) => item?.all === true);
}

export const ThemeConfigs = ({
  form,
  globalTheme = undefined,
  isGlobalTheme = false,
  onResetTheme,
}: {
  form: AnyFormApi;
  globalTheme?: themeConfigStore;
  isGlobalTheme?: boolean;
  onResetTheme: () => void;
}) => {
  const [t] = useTranslation();
  const location = useLocation();
  // The blocked admin branding fields live on the ADMIN PANEL tab: when deep-linking
  // with #logo, start there so the target section is mounted before scrolling.
  const [change, setChange] = useState(location.hash === '#logo' ? 'admin_panel' : 'end_user');

  useEffect(() => {
    if (location.hash === '#logo') {
      document.getElementById('logo')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const { data: rights } = useCurrentUserRights();
  const hasModifyRights = !isGlobalTheme || computeHasGlobalModifyRights(rights);

  const darkMode = useSelector(
    form.store,
    (s) => (s.values as themeConfigStore).carbonioWebUiDarkMode,
  );

  const isInheritedMode = globalTheme !== undefined;
  const isDarkModeOverridden = isInheritedMode && darkMode !== undefined;

  const items = [
    {
      id: 'end_user',
      label: `${t('label.end_user_title', 'END USER')}`,
      CustomComponent: ReusedDefaultTabBar,
    },
    {
      id: 'admin_panel',
      label: `${t('label.admin_panel_title', 'ADMIN PANEL')}`,
      CustomComponent: ReusedDefaultTabBar,
    },
  ];

  const THEME_MODE = [
    { label: `${t('label.disabled', 'Disabled')}`, value: 'FALSE' },
    { label: `${t('label.enabled', 'Enabled')}`, value: 'TRUE' },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <ds-text as="h3" size="small" color="gray0" weight="bold">
            {t('label.appearance', 'Appearance')}
          </ds-text>
        </div>
        <Select
          label={t('cos.dark_mode', 'Dark Mode')}
          items={THEME_MODE}
          selection={
            THEME_MODE.find((item) => item.value === darkMode) ??
            THEME_MODE.find((item) => item.value === globalTheme?.carbonioWebUiDarkMode) ??
            THEME_MODE[0]
          }
          onChange={(v: string): void => {
            form.setFieldValue('carbonioWebUiDarkMode', v);
          }}
          chip={
            isInheritedMode && !isDarkModeOverridden ? t('label.inherited', 'Inherited') : undefined
          }
          icon={
            isDarkModeOverridden ? (
              <RevertToInheritedIcon
                label={t(
                  'label.click_to_revert_to_the_inherited_value',
                  'Click to revert to the inherited value',
                )}
                onClick={(): void => {
                  form.setFieldValue('carbonioWebUiDarkMode', undefined);
                }}
              />
            ) : undefined
          }
        />
        <div className={styles.groupHeader}>
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.logo_url_destination', 'Logo URL Destination')}
          </ds-text>
        </div>
        <ThemeFieldInput
          form={form}
          name="carbonioLogoUrl"
          label={t(
            'label.logo_redirection_title',
            'Clicking on the Logo will redirect the users to...',
          )}
          globalTheme={globalTheme}
          isGlobalTheme={isGlobalTheme}
          hasModifyRights={hasModifyRights}
        />
        <div className={styles.groupHeader}>
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.color_scheme', 'Color Scheme')}
          </ds-text>
        </div>
        <div className={styles.hint}>
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.primary_color_hint',
              'To change the Primary color, please use a HEX color code.',
            )}
          </ds-text>
        </div>
        <div className={styles.listRow}>
          <div className={styles.fieldLabel}>
            <ds-text as="label" size="small" color="gray0">
              <Trans
                i18nKey="label.primary_color_for_light_mode"
                defaults="<bold>Primary</bold> Color for Light Mode"
                components={{ bold: <strong /> }}
              />
            </ds-text>
          </div>
          <div className={styles.fieldLabel}>
            <ds-text as="label" size="small" color="gray0">
              <Trans
                i18nKey="label.primary_color_for_dark_mode"
                defaults="<bold>Primary</bold> Color for Dark Mode"
                components={{ bold: <strong /> }}
              />
            </ds-text>
          </div>
        </div>
        <div className={styles.listRow}>
          <div className={styles.fieldWrapper}>
            <ThemeFieldInput
              form={form}
              name="carbonioWebUiPrimaryColor"
              label={PRIMARY_COLOR_CODE_EX}
              globalTheme={globalTheme}
              isGlobalTheme={isGlobalTheme}
              hasModifyRights={hasModifyRights}
              errorLabel={LIGHT_PRIMARY_COLOR_ERROR_LABEL}
              errorLabelDefault="Primary Color for Light Mode is not valid"
            />
          </div>
          <div className={styles.fieldWrapper}>
            <ThemeFieldInput
              form={form}
              name="carbonioWebUiDarkPrimaryColor"
              label={PRIMARY_COLOR_CODE_EX}
              globalTheme={globalTheme}
              isGlobalTheme={isGlobalTheme}
              hasModifyRights={hasModifyRights}
              errorLabel={DARK_PRIMARY_COLOR_ERROR_LABEL}
              errorLabelDefault="Primary Color for Dark Mode is not valid"
            />
          </div>
        </div>
        <div className={styles.tabBarRow}>
          <TabBar
            items={items}
            selected={change}
            onChange={(ev: unknown, selectedId: string): void => {
              setChange(selectedId);
            }}
            onClick={noop}
            width={300}
            background="gray6"
          />
        </div>
        <div className={styles.dividerRow}>
          <ds-divider></ds-divider>
        </div>
        <div className={styles.tabContent}>
          {change === 'end_user' && (
            <EndUserThemeConfigs
              form={form}
              globalTheme={globalTheme}
              isGlobalTheme={isGlobalTheme}
              hasModifyRights={hasModifyRights}
            />
          )}
          {change === 'admin_panel' && (
            <AdminPanelThemeConfig
              form={form}
              globalTheme={globalTheme}
              isGlobalTheme={isGlobalTheme}
              hasModifyRights={hasModifyRights}
            />
          )}
        </div>
        <div className={styles.dividerContainer}>
          <ds-divider></ds-divider>
        </div>
        <div className={styles.buttonBlock}>
          <Button
            type="outlined"
            label={t('label.empty_all_fields', 'Empty all fields')}
            color="error"
            size="large"
            width="fill"
            onClick={(e) => {
              e.preventDefault();
              onResetTheme();
            }}
            style={{ width: '100%' }}
            disabled={isGlobalTheme && !hasModifyRights}
          />
        </div>
      </div>
    </div>
  );
};
