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

function syncLocale(i18nFactory: I18nFactory): void {
  const currentLocale = useI18nStore.getState().locale;

  if (currentLocale !== 'en') {
    i18nFactory.setLocale(currentLocale);
    return;
  }

  const settings = queryClient.getQueryData<AccountSettings>(['account', 'settings']);
  const fallbackLocale = getLocaleFromSettings(settings);

  if (fallbackLocale !== 'en') {
    i18nFactory.setLocale(fallbackLocale);
    useI18nStore.getState().setLocale(fallbackLocale);
  }
}

export async function init(i18nFactory: I18nFactory): Promise<InitResult> {
  try {
    const advancedSupport = await queryFnIsAdvancedSupported();

    if (!advancedSupport) {
      return { error: 'Advanced is not supported' };
    }

    if (advancedSupport?.supported) {
      await loginConfig();
    }
    await loadAllApps();
    await getAccount();

    syncLocale(i18nFactory);
    loadAppTranslations();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
