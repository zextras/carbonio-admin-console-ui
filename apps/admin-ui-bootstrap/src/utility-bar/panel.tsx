/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useUtilityBarStore } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { FC, useEffect } from 'react';

import styles from './panel.module.css';
import { useUtilityViews } from './utils';

export const ShellUtilityPanel: FC = () => {
  const { mode, setMode, current, setCurrent } = useUtilityBarStore();
  const views = useUtilityViews();
  const currentPanel = find(views, (view) => view.id === current);
  useEffect(() => {
    if (!(current && currentPanel)) {
      setCurrent(views[0]?.id);
    }
  }, [current, currentPanel, setCurrent, views]);
  return currentPanel ? (
    <div className={styles.spacer} data-mode={mode}>
      <Container className={styles.panel} data-mode={mode} mainAlignment="flex-start">
        {currentPanel && <currentPanel.component mode={mode} setMode={setMode} />}
      </Container>
    </div>
  ) : null;
};
