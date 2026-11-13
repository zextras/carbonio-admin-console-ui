/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '@zextras/ui-shared';
import { isEmpty, map } from 'lodash-es';

export const AppLoaderMounter = () => {
  const entryPoints = useAppStore((store) => store.entryPoints);
  const entries = isEmpty(entryPoints)
    ? null
    : map(entryPoints, (Comp, appId) => (
        <div key={appId} id={appId}>
          <Comp />
        </div>
      ));

  return (
    <div
      data-testid="app-mounter"
      key="app-mounter"
      hidden
      style={{ height: 0, overflow: 'hidden' }}
    >
      {entries}
    </div>
  );
};
