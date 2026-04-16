/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const CarbonioVersionInformation: FC<{
  userName: string;
  serverVersion: string;
}> = ({ userName, serverVersion }) => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  return (
    <Container
      mainAlignment="flex-start"
      crossAlignment="flex-start"
      padding={{ all: 'extralarge' }}
    >
      <ds-text color="secondary" overflow="break-word" weight="light" size="extralarge" as="h1">
        {t('welcome', 'Welcome')}
      </ds-text>
      <ds-text
        as="span"
        color="secondary"
        overflow="break-word"
        weight="light"
        size="large"
        style={{ '--ds-text-font-size': '2.25rem' } as React.CSSProperties}
      >
        {userName}
      </ds-text>
      {!isAdvanced && (
        <ds-text
          as="span"
          color="secondary"
          overflow="break-word"
          weight="light"
          size="large"
          style={{ '--ds-text-font-size': '2.25rem' } as React.CSSProperties}
        >
          {t('cumminity_edition', 'Community Edition!')}
        </ds-text>
      )}
      {serverVersion && (
        <Padding left="0.3rem" top="1rem">
          <ds-text
            as="span"
            color="secondary"
            overflow="break-word"
            weight="light"
            style={{ '--ds-text-font-size': '1.2rem' } as React.CSSProperties}
          >
            {`Version ${serverVersion}`}
          </ds-text>
        </Padding>
      )}
    </Container>
  );
};

export default CarbonioVersionInformation;
