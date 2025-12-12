/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-console */

import i18next, { i18n } from "i18next";
import Backend from "i18next-http-backend";
import { dropRight, forEach } from "lodash-es";

import { CarbonioModule, II18nFactory } from "../../types";
import { SHELL_APP_ID } from "../constants";
import { getShell } from "../store/app";

export default class I18nFactory implements II18nFactory {
  _cache: { [pkg: string]: i18n } = {};

  locale = "en";

  public getShellI18n(): i18n {
    return this.getAppI18n(getShell() ?? { name: SHELL_APP_ID });
  }

  public setLocale(locale: string): void {
    if (this.locale !== locale) {
      this.locale = locale;
      forEach(this._cache, (appI18n) => {
        appI18n.changeLanguage(locale);
      });
    }
  }

  public getAppI18n(
    appPkgDescription: CarbonioModule | { name: string },
  ): i18n {
    if (this._cache[appPkgDescription.name]) {
      return this._cache[appPkgDescription.name];
    }
    const newI18n = i18next.createInstance();
    const baseI18nPath =
      appPkgDescription.name === SHELL_APP_ID
        ? BASE_PATH
        : dropRight(
            (appPkgDescription as CarbonioModule).js_entrypoint.split("/"),
          ).join("/");
    newI18n.use(Backend).init({
      compatibilityJSON: "v4",
      lng: this.locale,
      fallbackLng: "en",
      debug: false,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      missingKeyHandler: (lng, ns, key, fallbackValue) => {
        console.warn(`Missing translation with key '${key}'`);
      },
      backend: {
        loadPath: `${baseI18nPath}/i18n/{{lng}}.json`,
      },
    });
    this._cache[appPkgDescription.name] = newI18n;
    return newI18n;
  }
}
