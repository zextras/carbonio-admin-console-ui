/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Container,
  DefaultTabBarItem,
  InheritedSelect,
  type Item as TabBarItem,
  ListRow,
  Padding,
  Row,
  TabBar,
} from '@zextras/ui-components';
import { getAllRights, useCurrentUserRights } from '@zextras/ui-shared';
import { noop } from 'lodash-es';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../types/domain';
import { CONFIG, PRIMARY_COLOR_CODE_EX } from '../../../constants';
import { AdminPanelThemeConfig } from './admin-panel-theme-configs';
import { EndUserThemeConfigs } from './end-user-theme-configs';
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
    <Row padding="small">
      <ds-text as="span" size="small" color={selected ? 'primary' : 'gray'}>
        {item.label}
      </ds-text>
    </Row>
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
  globalTheme?: themeConfigStore | undefined;
  isGlobalTheme?: boolean;
  onResetTheme: () => void;
}) => {
  const [t] = useTranslation();
  const [change, setChange] = useState('end_user');

  const { data: rights } = useCurrentUserRights();
  const hasModifyRights = !isGlobalTheme || computeHasGlobalModifyRights(rights);

  const darkMode = useSelector(
    form.store,
    (s) => (s.values as themeConfigStore).carbonioWebUiDarkMode,
  );

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
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflow: 'auto' }}
      width="100%"
      height="calc(100vh - 150px)"
    >
      <Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
        <Container
          padding={{ all: 'small' }}
          height="fit"
          crossAlignment="flex-start"
          background="gray6"
        >
          <ListRow>
            <Padding vertical="large" horizontal="small" width="100%">
              <ds-text as="h3" size="small" color="gray0" weight="bold">
                {t('label.apperance', 'Apperance')}
              </ds-text>
            </Padding>
          </ListRow>
          <ListRow>
            <InheritedSelect
              label={t('cos.dark_mode', 'Dark Mode')}
              items={THEME_MODE}
              subValue={darkMode}
              inheritedValue={globalTheme?.carbonioWebUiDarkMode}
              fromSubValue={globalTheme ? darkMode : ''}
              background="gray5"
              selectName="carbonioWebUiDarkMode"
              onChange={(v): void => {
                form.setFieldValue('carbonioWebUiDarkMode', v as string | undefined);
              }}
              onChangeReset={(): void => {
                form.setFieldValue('carbonioWebUiDarkMode', undefined);
              }}
            />
          </ListRow>
          <ListRow>
            <Padding vertical="large" horizontal="small" width="100%">
              <ds-text as="h4" size="small" color="gray0" weight="bold">
                {t('label.logo_url_destination', 'Logo URL Destination')}
              </ds-text>
            </Padding>
          </ListRow>
          <ListRow>
            <ThemeFieldInput
              form={form}
              name="carbonioLogoUrl"
              label={t(
                'label.logo_redirection_title',
                'Clicking on the Logo will redirect the users to...',
              )}
              globalTheme={globalTheme}
            />
          </ListRow>
          <ListRow>
            <Padding vertical="large" horizontal="small" width="100%">
              <ds-text as="h4" size="small" color="gray0" weight="bold">
                {t('label.color_scheme', 'Color Scheme')}
              </ds-text>
            </Padding>
          </ListRow>
          <ListRow>
            <Padding vertical="small" horizontal="small" width="100%">
              <ds-text as="p" size="small" color="gray0">
                {t(
                  'label.primary_color_hint',
                  'To change the Primary color, please use a HEX color code.',
                )}
              </ds-text>
            </Padding>
          </ListRow>
          <ListRow>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ all: 'small' }}
            >
              <ds-text as="label" size="small" color="gray0">
                <Trans
                  i18nKey="label.primary_color_for_light_mode"
                  defaults="<bold>Primary</bold> Color for Light Mode"
                  components={{ bold: <strong /> }}
                />
              </ds-text>
            </Container>
            <Container
              mainAlignment="flex-start"
              crossAlignment="flex-start"
              padding={{ all: 'small' }}
            >
              <ds-text as="label" size="small" color="gray0">
                <Trans
                  i18nKey="label.primary_color_for_dark_mode"
                  defaults="<bold>Primary</bold> Color for Dark Mode"
                  components={{ bold: <strong /> }}
                />
              </ds-text>
            </Container>
          </ListRow>
          <ListRow>
            <Container padding={{ all: 'small' }}>
              <ThemeFieldInput
                form={form}
                name="carbonioWebUiPrimaryColor"
                label={PRIMARY_COLOR_CODE_EX}
                globalTheme={globalTheme}
                errorLabel={LIGHT_PRIMARY_COLOR_ERROR_LABEL}
                errorLabelDefault="Primary Color for Light Mode is not valid"
              />
            </Container>
            <Container padding={{ all: 'small' }}>
              <ThemeFieldInput
                form={form}
                name="carbonioWebUiDarkPrimaryColor"
                label={PRIMARY_COLOR_CODE_EX}
                globalTheme={globalTheme}
                errorLabel={DARK_PRIMARY_COLOR_ERROR_LABEL}
                errorLabelDefault="Primary Color for Dark Mode is not valid"
              />
            </Container>
          </ListRow>
          <Row
            width="100%"
            mainAlignment="center"
            crossAlignment="center"
            padding={{ top: 'large' }}
          >
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
          </Row>
          <Row width="100%">
            <ds-divider></ds-divider>
          </Row>
          <Container crossAlignment="flex-start" padding={{ all: '0px' }}>
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
          </Container>
          <Container padding={{ top: 'small' }}>
            <ds-divider></ds-divider>
          </Container>
          <ListRow>
            <Container padding={{ all: 'small' }} width="100%" style={{ display: 'block' }}>
              <Padding vertical="large" width="100%">
                <Button
                  type="outlined"
                  label={t('label.empty_all_fields', 'Empty all fields')}
                  color="error"
                  size="large"
                  width="fill"
                  onClick={onResetTheme}
                  style={{ width: '100%' }}
                  disabled={isGlobalTheme && !hasModifyRights}
                />
              </Padding>
            </Container>
          </ListRow>
        </Container>
      </Row>
    </Container>
  );
};
