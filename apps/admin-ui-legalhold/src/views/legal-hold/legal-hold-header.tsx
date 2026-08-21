/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

export const LegalHoldHeader = () => {
  const [t] = useTranslation();

  return (
    <>
      <Container
        orientation="vertical"
        mainAlignment="space-around"
        background="gray6"
        height="3.625rem"
      >
        <Row
          orientation="horizontal"
          width="100%"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          padding={{ left: 'extralarge' }}
        >
          <Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
            <ds-text as="h2" size="medium" weight="bold" color="gray0">
              {t('label.legal_hold', 'Legal Hold')}
            </ds-text>
          </Row>
        </Row>
      </Container>
      <Row orientation="horizontal" width="100%" background="gray6">
        <ds-divider></ds-divider>
      </Row>
    </>
  );
};
