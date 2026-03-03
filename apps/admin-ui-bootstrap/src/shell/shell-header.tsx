/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type AppRoute, CARBONIO_LOGO_URL, useLoginConfigStore } from '@zextras/ui-shared';
import React, { FC, useMemo } from 'react';
import { tv } from 'tailwind-variants';

import Logo from '../svg/carbonio-admin-panel.svg';
import { CreationButton } from './creation-button';

const shellHeader = tv({
  slots: {
    root: 'flex flex-row w-full h-[60px] justify-between items-center bg-gray3-regular px-lg py-sm',
    leftSection: 'flex flex-row w-3/4 max-w-3/4 justify-between items-center',
    innerLeft: 'flex flex-row justify-start items-center w-auto',
    logoContainer: 'flex w-auto h-8 items-center',
    rightSection: 'flex flex-row w-1/4 justify-end items-center',
  },
});

const ShellHeader: FC<{
  activeRoute: AppRoute | undefined;
  children?: React.ReactNode;
}> = ({ activeRoute, children }) => {
  const { root, leftSection, innerLeft, logoContainer, rightSection } = shellHeader();
  const { carbonioAdminUiAppLogo, carbonioAdminUiDarkAppLogo, carbonioLogoURL } =
    useLoginConfigStore();

  const logoSrc = useMemo(() => {
    return carbonioAdminUiAppLogo || carbonioAdminUiDarkAppLogo;
  }, [carbonioAdminUiDarkAppLogo, carbonioAdminUiAppLogo]);

  const logoUrl = useMemo(() => carbonioLogoURL || CARBONIO_LOGO_URL, [carbonioLogoURL]);

  return (
    <div className={root()}>
      <div className={leftSection()}>
        <div className={innerLeft()}>
          <div className={logoContainer()}>
            <a target="_blank" href={logoUrl} rel="noreferrer">
              {logoSrc ? (
                <img src={logoSrc} alt="logo" style={{ height: '2rem' }} />
              ) : (
                <Logo height="2rem" />
              )}
            </a>
          </div>
          <div className="px-xl">
            <CreationButton activeRoute={activeRoute} />
          </div>
        </div>
      </div>
      <div className={rightSection()}>{children}</div>
    </div>
  );
};

export { ShellHeader };
