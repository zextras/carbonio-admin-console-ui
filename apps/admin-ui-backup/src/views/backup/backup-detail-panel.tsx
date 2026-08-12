/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';

import { SERVERS_LIST } from '../../constants';
import { useGlobalConfig } from '../../services/use-global-config';
import { SECTION_ROUTES } from './backup-section-routes';

export const BackupDetailPanel = () => {
  const { data: globalConfig, isLoading } = useGlobalConfig();
  const [t] = useTranslation();

  const renderContent = () => {
    if (isLoading) {
      return <Container />;
    }
    if (Object.keys(globalConfig ?? {}).length === 0) {
      return (
        <Row background="info" width="100%" padding="small" mainAlignment="space-between">
          <Row mainAlignment="flex-start">
            <ds-icon icon="CloseCircleOutline" size="large" color="white"></ds-icon>
            <Padding left="large">
              <ds-text as="h2" color="white">
                {t(
                  'label.you_have_no_sufficient_administrationr_rights_to_see_this_section',
                  'You have no sufficient administration rights to see this section',
                )}
              </ds-text>
            </Padding>
          </Row>
        </Row>
      );
    }
    return (
      <Routes>
        <Route index element={<Navigate to={SERVERS_LIST} replace />} />
        {SECTION_ROUTES.map(({ id, prefix, Component }) => (
          <Route
            key={prefix ? `${prefix}/${id}` : id}
            path={prefix ? `${prefix}/${id}` : id}
            element={<Component />}
          />
        ))}
      </Routes>
    );
  };

  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      {renderContent()}
    </Container>
  );
};
