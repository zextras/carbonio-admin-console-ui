/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon, Padding, Row, Text } from '@zextras/ui-components';
import { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router-dom';

import { dumpGlobalConfig } from '../../services/dump-global-config';
import { useBackupStore } from '../../store/backup/store';
import BackupDetailOperation from './backup-detail-operation';

const BackupDetailPanel: FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const globalConfig = useBackupStore((state) => state.globalConfig);
  const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
  const [t] = useTranslation();
  const getGlobalConfig = useCallback((): void => {
    const serverName = window.location.hostname;
    dumpGlobalConfig(serverName).then((data: any) => {
      if (data?.Body?.response?.content) {
        const parseData = JSON.parse(data.Body.response.content);
        if (parseData?.response) {
          setGlobalConfig(parseData?.response);
        }
      }
    });
  }, [setGlobalConfig]);

  useEffect(() => {
    !globalConfig?.privateKeyAlgorithm && getGlobalConfig();
  }, [getGlobalConfig, globalConfig?.privateKeyAlgorithm]);
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      {!Object.keys(globalConfig).length ? (
        <Row background="info" width="100%" padding="small" mainAlignment="space-between">
          <Row mainAlignment="flex-start">
            <Icon icon="CloseCircleOutline" size="large" color="white" />
            <Padding left="large">
              <Text color="white">
                {t(
                  'label.you_have_no_sufficient_administrationr_rights_to_see_this_section',
                  'You have no sufficient administration rights to see this section',
                )}
              </Text>
            </Padding>
          </Row>
        </Row>
      ) : (
        <Routes>
          <Route path={`/:operation`} element={<BackupDetailOperation />} />
          <Route path={`/:server/:operation`} element={<BackupDetailOperation />} />
        </Routes>
      )}
    </Container>
  );
};
export default BackupDetailPanel;
