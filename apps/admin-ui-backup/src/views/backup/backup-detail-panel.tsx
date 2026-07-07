/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Row } from '@zextras/ui-components';
import { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router';

import type { DumpGlobalConfigResponse } from '../../../types';
import {
  ADVANCED,
  ADVANCED_LBL,
  CONFIGURATION_BACKUP,
  IMPORT_EXTERNAL_BACKUP,
  SERVER_CONFIG,
  SERVERS_LIST,
} from '../../constants';
import { dumpGlobalConfig } from '../../services/dump-global-config';
import { useBackupStore } from '../../store/backup/store';
import ImportExternalBackup from './actions/import-external-backup';
import BackupConfiguration from './configuration/backup-configuration';
import BackupAdvanced from './default-setting/backup-advanced';
import BackupServerConfig from './default-setting/backup-server-config';
import ServersList from './default-setting/backup-servers-list';
import ServerAdvanced from './server-advanced/server-advanced';

const BackupDetailPanel: FC = () => {
  const globalConfig = useBackupStore((state) => state.globalConfig);
  const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);
  const [t] = useTranslation();
  const getGlobalConfig = useCallback((): void => {
    dumpGlobalConfig().then((data: DumpGlobalConfigResponse) => {
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
      ) : (
        <Routes>
          <Route path={`/${SERVER_CONFIG}`} element={<BackupServerConfig />} />
          <Route path={`/${ADVANCED}`} element={<BackupAdvanced />} />
          <Route path={`/${SERVERS_LIST}`} element={<ServersList />} />
          <Route path={`/${IMPORT_EXTERNAL_BACKUP}`} element={<ImportExternalBackup />} />
          <Route path={`/:server/${CONFIGURATION_BACKUP}`} element={<BackupConfiguration />} />
          <Route path={`/:server/${ADVANCED_LBL}`} element={<ServerAdvanced />} />
        </Routes>
      )}
    </Container>
  );
};
export default BackupDetailPanel;
