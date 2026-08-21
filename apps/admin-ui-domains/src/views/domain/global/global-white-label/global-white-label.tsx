/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Padding, RouteLeavingGuard, Row, useSnackbar } from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../../types/domain';
import { modifyConfig } from '../../../../services/modify-config';
import { isValidHexColor } from '../../../utility/utils';
import { ThemeConfigs } from '../../theme/theme-configs';
import { ResetTheme } from '../../theme/theme-reset';

/**
 * Global white-label view: global whitelabel settings (logos, colors,
 * login URLs), saved via ModifyConfig.
 */
export const GlobalWhiteLabel = () => {
  const [t] = useTranslation();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const [globalTheme, setGlobalTheme] = useState<themeConfigStore>({});
  const { data: configInformation = [], invalidate } = useAllConfig();
  const [intialThemeConfig, setIntialThemeConfig] = useState<themeConfigStore>({});
  const [isOpenResetDialog, setIsOpenResetDialog] = useState<boolean>(false);
  const [isValidated, setIsValidated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setValue = useCallback(
    (key: string, value: any): void => {
      setGlobalTheme((prev: any) => ({ ...prev, [key]: value }));
      setIntialThemeConfig((prev: any) => ({ ...prev, [key]: value }));
    },
    [setGlobalTheme],
  );

  const setInitalValues = useCallback(
    (obj: any): void => {
      if (obj) {
        setValue('carbonioWebUiDarkMode', obj?.carbonioWebUiDarkMode);
        setValue('carbonioWebUiLoginLogo', obj?.carbonioWebUiLoginLogo);
        setValue('carbonioWebUiDarkLoginLogo', obj?.carbonioWebUiDarkLoginLogo);
        setValue('carbonioWebUiLoginBackground', obj?.carbonioWebUiLoginBackground);
        setValue('carbonioWebUiDarkLoginBackground', obj?.carbonioWebUiDarkLoginBackground);
        setValue('carbonioWebUiAppLogo', obj?.carbonioWebUiAppLogo);
        setValue('carbonioWebUiDarkAppLogo', obj?.carbonioWebUiDarkAppLogo);
        setValue('carbonioWebUiFavicon', obj?.carbonioWebUiFavicon);
        setValue('carbonioWebUiTitle', obj?.carbonioWebUiTitle);
        setValue('carbonioWebUiDescription', obj?.carbonioWebUiDescription);
        setValue('carbonioAdminUiLoginLogo', obj?.carbonioAdminUiLoginLogo);
        setValue('carbonioAdminUiDarkLoginLogo', obj?.carbonioAdminUiDarkLoginLogo);
        setValue('carbonioAdminUiAppLogo', obj?.carbonioAdminUiAppLogo);
        setValue('carbonioAdminUiDarkAppLogo', obj?.carbonioAdminUiDarkAppLogo);
        setValue('carbonioAdminUiBackground', obj?.carbonioAdminUiBackground);
        setValue('carbonioAdminUiDarkBackground', obj?.carbonioAdminUiDarkBackground);
        setValue('carbonioAdminUiFavicon', obj?.carbonioAdminUiFavicon);
        setValue('carbonioAdminUiTitle', obj?.carbonioAdminUiTitle);
        setValue('carbonioAdminUiDescription', obj?.carbonioAdminUiDescription);
        setValue('carbonioLogoUrl', obj?.carbonioLogoUrl);
        setValue('carbonioWebUiPrimaryColor', obj?.carbonioWebUiPrimaryColor);
        setValue('carbonioWebUiDarkPrimaryColor', obj?.carbonioWebUiDarkPrimaryColor);
        setValue('carbonioWebUILoginURL', obj?.carbonioWebUILoginURL);
        setValue('carbonioWebUILogoutURL', obj?.carbonioWebUILogoutURL);
        setValue('carbonioAdminUILoginURL', obj?.carbonioAdminUILoginURL);
        setValue('carbonioAdminUILogoutURL', obj?.carbonioAdminUILogoutURL);
        setValue('carbonioAdminDocumentationUrl', obj?.carbonioAdminDocumentationUrl);
      }
    },
    [setValue],
  );

  useEffect(() => {
    if (!!configInformation && configInformation.length > 0) {
      const defaultValues: any = {
        carbonioWebUiDarkMode: 'FALSE',
        carbonioWebUiLoginLogo: '',
        carbonioWebUiDarkLoginLogo: '',
        carbonioWebUiLoginBackground: '',
        carbonioWebUiDarkLoginBackground: '',
        carbonioWebUiAppLogo: '',
        carbonioWebUiDarkAppLogo: '',
        carbonioWebUiFavicon: '',
        carbonioWebUiTitle: '',
        carbonioWebUiDescription: '',
        carbonioAdminUiLoginLogo: '',
        carbonioAdminUiDarkLoginLogo: '',
        carbonioAdminUiAppLogo: '',
        carbonioAdminUiDarkAppLogo: '',
        carbonioAdminUiBackground: '',
        carbonioAdminUiDarkBackground: '',
        carbonioAdminUiFavicon: '',
        carbonioAdminUiTitle: '',
        carbonioAdminUiDescription: '',
        carbonioLogoUrl: '',
        carbonioWebUiPrimaryColor: '',
        carbonioWebUiDarkPrimaryColor: '',
        carbonioWebUILoginURL: '',
        carbonioWebUILogoutURL: '',
        carbonioAdminUILoginURL: '',
        carbonioAdminUILogoutURL: '',
        carbonioAdminDocumentationUrl: '',
      };

      const obj: any = { ...defaultValues };
      configInformation.forEach((item) => {
        if (item?.n in obj) {
          obj[item.n] = item._content || defaultValues[item.n];
        }
      });
      setInitalValues(obj);
      setIsDirty(false);
    }
  }, [configInformation, setInitalValues]);

  useEffect(() => {
    if (globalTheme && !isEqual(globalTheme, intialThemeConfig)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [globalTheme, intialThemeConfig]);

  const modifyConfigRequest = (attributes: Array<any>): void => {
    setIsLoading(true);
    modifyConfig(attributes)
      .then(() => {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        invalidate();
        setIsLoading(false);
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setIsLoading(false);
      });
  };

  const showErrorMessage = useCallback(
    (msg: string) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: msg,
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    [createSnackbar],
  );

  const onSave = (): void => {
    const attributes: any[] = [];
    if (
      globalTheme?.carbonioWebUiPrimaryColor &&
      !isValidHexColor(globalTheme?.carbonioWebUiPrimaryColor)
    ) {
      showErrorMessage(
        t('label.invalid_primary_color_light_mode', 'Primary Color for Light Mode is not valid'),
      );
      return;
    }
    if (
      globalTheme?.carbonioWebUiDarkPrimaryColor &&
      !isValidHexColor(globalTheme?.carbonioWebUiDarkPrimaryColor)
    ) {
      showErrorMessage(
        t('label.invalid_primary_color_dark_mode', 'Primary Color for Dark Mode is not valid'),
      );
      return;
    }
    const entries = Object.entries(globalTheme);
    entries.forEach(([key, value]) => {
      attributes.push({ n: key, _content: value });
    });
    modifyConfigRequest(attributes);
  };

  const onCancel = (): void => {
    setInitalValues(intialThemeConfig);
    setIsDirty(false);
  };

  const onResetTheme = useCallback(() => {
    setIsOpenResetDialog(true);
  }, []);

  const closeHandler: () => void = useCallback(() => {
    setIsOpenResetDialog(false);
  }, []);

  const onResetHandler = (): void => {
    setIsOpenResetDialog(false);
    const attributes: any[] = [];
    const domainDefaultElements: any = {
      carbonioWebUiDarkMode: 'FALSE',
      carbonioWebUiLoginLogo: '',
      carbonioWebUiDarkLoginLogo: '',
      carbonioWebUiLoginBackground: '',
      carbonioWebUiDarkLoginBackground: '',
      carbonioWebUiAppLogo: '',
      carbonioWebUiDarkAppLogo: '',
      carbonioWebUiFavicon: '',
      carbonioWebUiTitle: '',
      carbonioWebUiDescription: '',
      carbonioAdminUiLoginLogo: '',
      carbonioAdminUiDarkLoginLogo: '',
      carbonioAdminUiAppLogo: '',
      carbonioAdminUiDarkAppLogo: '',
      carbonioAdminUiBackground: '',
      carbonioAdminUiDarkBackground: '',
      carbonioAdminUiFavicon: '',
      carbonioAdminUiTitle: '',
      carbonioAdminUiDescription: '',
      carbonioLogoUrl: '',
      carbonioWebUiPrimaryColor: '',
      carbonioWebUiDarkPrimaryColor: '',
      carbonioWebUILoginURL: '',
      carbonioWebUILogoutURL: '',
      carbonioAdminUILoginURL: '',
      carbonioAdminUILogoutURL: '',
      carbonioAdminDocumentationUrl: '',
    };
    Object.keys(domainDefaultElements).forEach((ele: any) =>
      attributes.push({ n: ele, _content: domainDefaultElements[ele] }),
    );
    modifyConfigRequest(attributes);
  };

  return (
    <>
      {isLoading && <ds-spinner></ds-spinner>}
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
            themeConfig={globalTheme}
            setThemeConfig={setGlobalTheme}
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
