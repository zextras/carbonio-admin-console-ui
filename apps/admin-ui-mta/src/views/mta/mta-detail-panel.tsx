/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router';

import { SECTION_ROUTES } from './mta-section-routes';

const EmptyState = () => {
  const [t] = useTranslation();
  return (
    <Container height="fill" mainAlignment="center" crossAlignment="center">
      <Padding horizontal="large">
        <ds-text as="p" size="medium" color="secondary">
          {t('mta.select_an_option', 'Please select an option from the list')}
        </ds-text>
      </Padding>
    </Container>
  );
}

export const MTADetailPanel = () => {
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      <Routes>
        <Route index element={<EmptyState />} />

        {SECTION_ROUTES.map(({ id, prefix, Component }) => (
          <Route
            key={prefix ? `${prefix}/${id}` : id}
            path={prefix ? `${prefix}/${id}` : id}
            element={<Component />}
          />
        ))}

        <Route path="*" element={null} />
      </Routes>
    </Container>
  );
}
