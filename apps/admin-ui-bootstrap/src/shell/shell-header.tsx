/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type AppRoute, CARBONIO_LOGO_URL, useLoginConfigStore } from '@zextras/ui-shared';
import React, { FC } from 'react';

import Logo from '../svg/carbonio-admin-panel.svg';
import { CreationButton } from './creation-button';

const styles = {
  root: 'flex flex-row w-full h-[60px] justify-between items-center bg-gray3-regular px-lg py-sm box-border',
  leftSection: 'flex flex-row items-center gap-xl',
  logoAnchor: 'flex h-8 items-center',
  rightSection: 'flex flex-row justify-end items-center',
};

const ShellHeader: FC<{
  activeRoute: AppRoute | undefined;
  children?: React.ReactNode;
}> = ({ activeRoute, children }) => {
  const { carbonioAdminUiAppLogo, carbonioAdminUiDarkAppLogo, carbonioLogoURL } =
    useLoginConfigStore();

  const logoSrc = carbonioAdminUiAppLogo || carbonioAdminUiDarkAppLogo;
  const logoUrl = carbonioLogoURL || CARBONIO_LOGO_URL;

  return (
    <header className={styles.root}>
      <div className={styles.leftSection}>
        <a className={styles.logoAnchor} target="_blank" href={logoUrl} rel="noreferrer">
          {logoSrc ? (
            <img src={logoSrc} alt="logo" style={{ height: '2rem' }} />
          ) : (
            <Logo height="2rem" />
          )}
        </a>
        <CreationButton activeRoute={activeRoute} />
      </div>
      <div className={styles.rightSection}>{children}</div>
    </header>
  );
};

export { ShellHeader };
