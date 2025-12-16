/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from "react";
import { I18nextProvider } from "react-i18next";

import { SHELL_APP_ID } from "../constants";
import I18nFactory from "../i18n/i18n-factory";
import { useI18nStore } from "../store/i18n/store";
import { BootstrapperContext } from "./bootstrapper-context";

const BootstrapperContextProvider: FC<{
  i18nFactory: I18nFactory;
  children: React.ReactNode;
}> = ({ children, i18nFactory }) => {
  const i18n = useI18nStore((s) => s.instances[SHELL_APP_ID]);
  return (
    <BootstrapperContext.Provider
      value={{
        i18nFactory,
      }}
    >
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </BootstrapperContext.Provider>
  );
};
export default BootstrapperContextProvider;
