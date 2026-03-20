/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BreadcrumbComponent } from '@zextras/ui-components';
import { useLastLoginTimestamp, useUserSettings } from '@zextras/ui-shared';

import { DASHBOARD } from '../../constants';

export const Breadcrumb = () => {
  const userSetting = useUserSettings();
  const { data: lastLoginTimestamp } = useLastLoginTimestamp({
    accountId: userSetting?.attrs?.zimbraId?.toString(),
    enabled: Boolean(userSetting?.attrs?.zimbraId),
  });

  return <BreadcrumbComponent dashboardRoute={DASHBOARD} lastLoginTimestamp={lastLoginTimestamp} />;
};
