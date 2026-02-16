/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useUtilityBarStore } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { FC, useEffect, useMemo } from 'react';

import AppContextProvider from '../boot/app/app-context-provider';
import styles from './panel.module.css';
import { useUtilityBarStore } from './store';
import { useUtilityViews } from './utils';

export const ShellUtilityPanel: FC = () => {
  const { mode, setMode, current, setCurrent } = useUtilityBarStore();
  const views = useUtilityViews();
  const currentPanel = useMemo(() => find(views, (view) => view.id === current), [current, views]);
  useEffect(() => {
    if (!(current && currentPanel)) {
      setCurrent(views[0]?.id);
    }
  }, [current, currentPanel, setCurrent, views]);
  return currentPanel ? (
    <div className={styles.spacer} data-mode={mode}>
      <Container className={styles.panel} data-mode={mode} mainAlignment="flex-start">
        {currentPanel && (
          <AppContextProvider pkg={currentPanel?.id}>
            <currentPanel.component mode={mode} setMode={setMode} />
          </AppContextProvider>
        )}
      </Container>
    </div>
  ) : null;
};
