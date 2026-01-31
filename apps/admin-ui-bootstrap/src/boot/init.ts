/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { loadAllApps } from '../apps/loader';
import I18nFactory from '../i18n/i18n-factory';
import { getAccount } from '../network/get-account';
import { loginConfig } from '../network/login-config';
import { queryClient } from '../providers/react-query-provider';
import { queryFnIsAdvancedSupported } from '../react-query/use-is-advanced-supported';
import { fetchAccountSettings } from '../services/account-api';
import { useAppStore } from '../store/app/store';
import { useI18nStore } from '../store/i18n/store';

type InitError = {
  error: string;
};

type InitResult = InitError | void;

type AccountSettings = {
  prefs?: { zimbraPrefLocale?: string };
  attrs?: { zimbraLocale?: string };
};

function loadAppTranslations(): void {
  const apps = Object.values(useAppStore.getState().apps);
  const { locale, addI18n } = useI18nStore.getState();
  addI18n(apps, locale);
}

function getLocaleFromSettings(settings: AccountSettings | undefined): string {
  const rawLocale = settings?.prefs?.zimbraPrefLocale ?? settings?.attrs?.zimbraLocale;
  return rawLocale?.split('_')[0] ?? 'en';
}

async function initLocale(i18nFactory: I18nFactory): Promise<void> {
  try {
    // Fetch account settings to get the user's preferred locale
    const settings = await fetchAccountSettings();

    // Cache settings in query client for later use
    queryClient.setQueryData(['account', 'settings'], settings);

    const locale = getLocaleFromSettings(settings);

    if (locale !== 'en') {
      i18nFactory.setLocale(locale);
      useI18nStore.getState().setLocale(locale);
    }
  } catch {
    // If settings fetch fails, continue with default 'en' locale
  }
}

export async function init(i18nFactory: I18nFactory): Promise<InitResult> {
  try {
    const advancedSupport = await queryFnIsAdvancedSupported();

    if (!advancedSupport || 'errorMessage' in advancedSupport) {
      return { error: 'Advanced is not supported' };
    }

    if (advancedSupport?.supported) {
      await loginConfig();
    }

    // Fetch locale from account settings before loading apps and translations
    await initLocale(i18nFactory);

    await loadAllApps();
    await getAccount();

    loadAppTranslations();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
