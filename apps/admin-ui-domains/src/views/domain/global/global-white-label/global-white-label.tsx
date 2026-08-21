/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Button,
  Container,
  Padding,
  RouteLeavingGuard,
  Row,
  useSnackbar,
} from '@zextras/ui-components';
import { useAllConfig, useModifyConfig } from '@zextras/ui-shared';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../../types/domain';
import { isValidHexColor } from '../../../utility/utils';
import { ThemeConfigs } from '../../theme/theme-configs';
import { ResetTheme } from '../../theme/theme-reset';
import {
  buildWhiteLabelConfig,
  buildWhiteLabelResetAttributes,
} from '../../theme/white-label-defaults';

/**
 * Global white-label view: global whitelabel settings (logos, colors,
 * login URLs), saved via ModifyConfig.
 */
export const GlobalWhiteLabel = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const [themeConfig, setThemeConfig] = useState<themeConfigStore>({});
  const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
  const [isValidated, setIsValidated] = useState<boolean>(true);
  const { data: configInformation = [] } = useAllConfig();
  const modifyConfigMutation = useModifyConfig();

  const savedThemeConfig =
    configInformation.length > 0 ? buildWhiteLabelConfig(configInformation) : {};

  useEffect(() => {
    setThemeConfig(savedThemeConfig);
  }, [savedThemeConfig]);

  const isDirty = !isEqual(themeConfig, savedThemeConfig);

  const showErrorMessage = (msg: string): void => {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: msg,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  };

  const onSave = (): void => {
    if (
      themeConfig?.carbonioWebUiPrimaryColor &&
      !isValidHexColor(themeConfig?.carbonioWebUiPrimaryColor)
    ) {
      showErrorMessage(
        t('label.invalid_primary_color_light_mode', 'Primary Color for Light Mode is not valid'),
      );
      return;
    }
    if (
      themeConfig?.carbonioWebUiDarkPrimaryColor &&
      !isValidHexColor(themeConfig?.carbonioWebUiDarkPrimaryColor)
    ) {
      showErrorMessage(
        t('label.invalid_primary_color_dark_mode', 'Primary Color for Dark Mode is not valid'),
      );
      return;
    }
    const attributes = Object.entries(themeConfig).map(([n, _content]) => ({
      n,
      _content: _content as string,
    }));
    modifyConfigMutation.mutate(attributes);
  };

  const onCancel = (): void => {
    setThemeConfig(savedThemeConfig);
  };

  const onResetTheme = (): void => {
    setIsOpenResetDialog(true);
  };

  const closeHandler = (): void => {
    setIsOpenResetDialog(false);
  };

  const onResetHandler = (): void => {
    setIsOpenResetDialog(false);
    modifyConfigMutation.mutate(buildWhiteLabelResetAttributes());
  };

  return (
    <>
      {modifyConfigMutation.isPending && <ds-spinner></ds-spinner>}
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
        >
          <Row mainAlignment="flex-start" width="100%">
            <Container orientation="vertical" mainAlignment="space-around" height="56px">
              <Row orientation="horizontal" width="100%">
                <Row
                  padding={{ all: 'large' }}
                  mainAlignment="flex-start"
                  width="50%"
                  crossAlignment="flex-start"
                >
                  <ds-text as="h1" size="medium" weight="bold" color="gray0">
                    {t('label.whitelabel_settings', 'Whitelabel Settings')}
                  </ds-text>
                </Row>
                <Row
                  padding={{ all: 'large' }}
                  width="50%"
                  mainAlignment="flex-end"
                  crossAlignment="flex-end"
                >
                  <Padding right="small">
                    {isDirty && (
                      <Button
                        label={t('label.cancel', 'Cancel')}
                        color="secondary"
                        onClick={onCancel}
                      />
                    )}
                  </Padding>
                  {isDirty && (
                    <Button
                      label={t('label.save', 'Save')}
                      color="primary"
                      onClick={onSave}
                      disabled={!isValidated}
                    />
                  )}
                </Row>
              </Row>
            </Container>
            <ds-divider></ds-divider>
          </Row>
          <ThemeConfigs
            isGlobalTheme
            themeConfig={themeConfig}
            setThemeConfig={setThemeConfig}
            setIsValidated={setIsValidated}
            onResetTheme={onResetTheme}
          />
        </Container>
        {isOpenResetDialog && (
          <ResetTheme
            title={t('label.reset_global_whitelabel_settings', 'Reset global whitelabel settings')}
            isOpenResetDialog={isOpenResetDialog}
            closeHandler={closeHandler}
            onResetHandler={onResetHandler}
          />
        )}
        <RouteLeavingGuard when={isDirty} onSave={onSave} />
      </Container>
    </>
  );
};
