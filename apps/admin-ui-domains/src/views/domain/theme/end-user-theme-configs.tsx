/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { Container, ListRow, Padding } from '@zextras/ui-components';
import { Trans, useTranslation } from 'react-i18next';

import { themeConfigStore } from '../../../../types';
import { ThemeFieldInput } from './theme-field-input';
import { HTTPS_URL_ERROR_LABEL } from './white-label-schema';

type EndUserThemeConfigsProps = {
  form: AnyFormApi;
  globalTheme?: themeConfigStore;
  isGlobalTheme?: boolean;
  hasModifyRights?: boolean;
};

export const EndUserThemeConfigs = ({
  form,
  globalTheme,
  isGlobalTheme,
  hasModifyRights,
}: EndUserThemeConfigsProps) => {
  const [t] = useTranslation();

  return (
    <>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h3" size="small" color="gray0" weight="bold">
            {t('label.end_user_webapp', 'End User Webapp')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.end_user_theme_description',
              'In this section you can customize the WebApp with your company logo and image.',
            )}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.title_and_copyrights_information', 'Title & Copyrights Information')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t('label.title_theme_note', 'The title is the name that will appear on the browser tab')}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiTitle"
            label={t('label.title', 'Title')}
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.copyrights_theme_note',
              'The copyrights information will appear on the login box footer',
            )}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiDescription"
            label={t('label.copyrights_information', 'Copyrights information')}
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
          />
        </Container>
      </ListRow>
      <Container padding={{ top: 'small' }}>
        <ds-divider></ds-divider>
      </Container>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.logo', 'Logo')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.logo_description',
              'Paste the URL of the logo for the login page. Use SVG or PNG file with transparent background, dimension 240x120 pixels.',
            )}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.light_mode"
              defaults="<bold>Light</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.logo_for_login_page', 'Logo for Login Page')}
          </ds-text>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.dark_mode"
              defaults="<bold>Dark</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.logo_for_login_page', 'Logo for Login Page')}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiLoginLogo"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiDarkLoginLogo"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.light_mode"
              defaults="<bold>Light</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.logo_for_webapp', 'Logo for WebApp')}
          </ds-text>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.dark_mode"
              defaults="<bold>Dark</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.logo_for_webapp', 'Logo for WebApp')}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiAppLogo"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiDarkAppLogo"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
      </ListRow>
      <Container padding={{ top: 'small' }}>
        <ds-divider></ds-divider>
      </Container>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.favicon', 'Favicon')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.favicon_description',
              'Paste the URL of the favicon for the login page. Use an ICO file, dimension 32x32 pixels.',
            )}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiFavicon"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
      </ListRow>
      <Container padding={{ top: 'small' }}>
        <ds-divider></ds-divider>
      </Container>
      <ListRow>
        <Padding vertical="large" horizontal="small" width="100%">
          <ds-text as="h4" size="small" color="gray0" weight="bold">
            {t('label.background_for_the_login_page', 'Background for the Login Page')}
          </ds-text>
        </Padding>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="p" size="small" color="gray0">
            {t(
              'label.background_description',
              'Paste the URL of the image for the login page. Use a JPG or a PNG file, with a minimum resolution of 1280x720 pixels, a ratio of 16:9 and smaller than 800KB.',
            )}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.light_mode"
              defaults="<bold>Light</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.background_login_page', 'Background Login Page')}
          </ds-text>
        </Container>
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          padding={{ all: 'small' }}
        >
          <ds-text as="label" size="small" color="gray0">
            <Trans
              i18nKey="label.dark_mode"
              defaults="<bold>Dark</bold> Mode"
              components={{ bold: <strong /> }}
            />{' '}
            {t('label.background_login_page', 'Background Login Page')}
          </ds-text>
        </Container>
      </ListRow>
      <ListRow>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiLoginBackground"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
        <Container padding={{ all: 'small' }}>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUiDarkLoginBackground"
            label="Ex. https://upload.yourlogo.com/"
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
      </ListRow>
      <Container padding={{ top: 'small' }}>
        <ds-divider></ds-divider>
      </Container>
      <ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ vertical: 'large', horizontal: 'small' }}
          >
            <ds-text as="p" size="small" color="gray0">
              <Trans
                i18nKey="label.please_note"
                defaults="<bold>Please note</bold>"
                components={{ bold: <strong /> }}
              />{' '}
              {t(
                'label.virtualhost_avaibility_helpertext',
                'that in order to make the virtualHost available, nginx configuration must be reloaded on all the proxyes first.',
              )}
            </ds-text>
          </Container>
        </ListRow>
      </ListRow>
      <ListRow>
        <Container padding={{ bottom: 'small', horizontal: 'small' }}>
          <ListRow>
            <Padding bottom="large" horizontal="small" width="100%">
              <ds-text as="h4" size="small" color="gray0" weight="bold">
                {t('label.login', 'Login')}
              </ds-text>
            </Padding>
          </ListRow>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUILoginURL"
            label={t('label.enduser_login_redirect_url', 'LogIn redirect destination (URL)')}
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
        <Container padding={{ bottom: 'small', horizontal: 'small' }}>
          <ListRow>
            <Padding bottom="large" horizontal="small" width="100%">
              <ds-text as="h4" size="small" color="gray0" weight="bold">
                {t('label.logout', 'Logout')}
              </ds-text>
            </Padding>
          </ListRow>
          <ThemeFieldInput
            form={form}
            name="carbonioWebUILogoutURL"
            label={t('label.enduser_logout_redirect_url', 'On Logout, redirect the User to (URL)')}
            globalTheme={globalTheme}
            isGlobalTheme={isGlobalTheme}
            hasModifyRights={hasModifyRights}
            errorLabel={HTTPS_URL_ERROR_LABEL}
            errorLabelDefault="You need to use the HTTPS protocol"
          />
        </Container>
      </ListRow>
    </>
  );
};
