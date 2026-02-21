/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding } from '@zextras/ui-components';
import { type AppRoute, CARBONIO_LOGO_URL, useLoginConfigStore } from '@zextras/ui-shared';
import React, { FC, useMemo } from 'react';

import Logo from '../svg/carbonio-admin-panel.svg';
import { CreationButton } from './creation-button';

const ShellHeader: FC<{
  activeRoute: AppRoute;
  children?: React.ReactNode;
}> = ({ activeRoute, children }) => {
  const { carbonioAdminUiAppLogo, carbonioAdminUiDarkAppLogo, carbonioLogoURL } =
    useLoginConfigStore();
  const logoSrc = useMemo(() => {
    return carbonioAdminUiAppLogo || carbonioAdminUiDarkAppLogo;
  }, [carbonioAdminUiDarkAppLogo, carbonioAdminUiAppLogo]);

  const logoUrl = useMemo(() => carbonioLogoURL || CARBONIO_LOGO_URL, [carbonioLogoURL]);

  return (
    <Container
      orientation="horizontal"
      background="gray3"
      width="fill"
      height="60px"
      minHeight="60px"
      maxHeight="60px"
      mainAlignment="space-between"
      padding={{
        left: 'large',
        right: 'large',
        vertical: 'small',
      }}
    >
      <Container
        orientation="horizontal"
        width="75%"
        maxWidth="75%"
        mainAlignment="space-between"
        crossAlignment="center"
      >
        <Container
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="center"
          width="auto"
        >
          <Container width="auto" height={32} crossAlignment="flex-start">
            <a target="_blank" href={logoUrl} rel="noreferrer">
              {logoSrc ? (
                <img src={logoSrc} alt="logo" style={{ height: '2rem' }} />
              ) : (
                <Logo height="2rem" />
              )}
            </a>
          </Container>

          <Padding horizontal="extralarge">
            <CreationButton activeRoute={activeRoute} />
          </Padding>
        </Container>
      </Container>
      <Container orientation="horizontal" width="25%" mainAlignment="flex-end">
        {children}
      </Container>
    </Container>
  );
};
export default ShellHeader;
