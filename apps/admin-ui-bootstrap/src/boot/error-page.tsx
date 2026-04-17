/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Row } from '@zextras/ui-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorSVG from '../svg/carbonio-load-app-error.svg';

export const ErrorPage = (): React.JSX.Element => {
  const [t] = useTranslation();
  return (
    <Container gap={'10px'} orientation={'vertical'} mainAlignment={'center'} background={'gray5'}>
      <Container gap={'70px'} orientation={'horizontal'} height={'fit'} mainAlignment={'center'}>
        <Container width={'fit'}>
          <ErrorSVG />
        </Container>
        <Container
          width={'fit'}
          gap={'104px'}
          orientation={'column'}
          crossAlignment={'flex-start'}
          mainAlignment={'space-evenly'}
          style={{ marginTop: '64px' }}
        >
          <Container
            width={'fit'}
            gap={'32px'}
            orientation={'column'}
            crossAlignment={'flex-start'}
          >
            <ds-text
              as="h1"
              weight="medium"
              color="primary"
              style={{ '--ds-text-font-size': '64px' } as React.CSSProperties}
            >
              {t('error.something_went_wrong', 'Something went wrong')}
            </ds-text>
            <ds-text
              as="p"
              overflow="break-word"
              weight="light"
              color="secondary"
              style={{ '--ds-text-font-size': '40px' } as React.CSSProperties}
            >
              {t(
                'error.loading_page',
                'We’re sorry, but there was an error trying to load this page.',
              )}
            </ds-text>
          </Container>
          <Container crossAlignment={'flex-start'} height={'fit'}>
            <Row gap={'16px'}>
              <ds-text
                as="p"
                weight="regular"
                color="secondary"
                style={{ '--ds-text-font-size': '24px' } as React.CSSProperties}
              >
                {t('error.contact_support', 'Contact support or try refreshing the page')}
              </ds-text>
              <Button
                iconPlacement={'left'}
                icon="Refresh"
                label={t('button.refresh_page', 'REFRESH')}
                type={'outlined'}
                onClick={(): void => window.location.reload()}
                color="primary"
              />
            </Row>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};
