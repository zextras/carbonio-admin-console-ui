/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useCurrentUserRights } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { ACCOUNT, ADMIN_LOGIN_AS } from '../../../../constants';
import { useDelegateAuth } from '../../../../services/use-delegate-auth';

type AccountHeaderActionsProps = {
  accountId: string;
  zimbraId: string | undefined;
  onDelete: () => void;
};

function hasAdminLoginAsRight(
  rights: NonNullable<ReturnType<typeof useCurrentUserRights>['data']>,
): boolean {
  const rightsConfig = find(rights, { type: ACCOUNT }) ?? {
    all: [],
    inDomains: [],
    type: ACCOUNT,
  };
  return (
    !!rightsConfig?.all?.[0]?.right?.find((right) => right?.n === ADMIN_LOGIN_AS) ||
    !!rightsConfig?.inDomains?.[0]?.rights?.[0].right?.find(
      (right) => right?.n === ADMIN_LOGIN_AS,
    )
  );
}

export const AccountHeaderActions = ({ accountId, zimbraId, onDelete }: AccountHeaderActionsProps) => {
  const { t } = useTranslation();
  const { data: rights = [] } = useCurrentUserRights();
  const viewMailMutation = useDelegateAuth();

  const allowSetPrivacy = hasAdminLoginAsRight(rights);

  const onViewMail = (): void => {
    viewMailMutation.mutate(accountId, {
      onSuccess: (authToken) => {
        window.open(
          `https://${globalThis.location.hostname}/service/preauth?authtoken=${authToken}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
          'blank',
        );
      },
    });
  };

  return (
    <>
      <div className="pr-md">
        <Button
          size="medium"
          type="outlined"
          color="error"
          onClick={onDelete}
          icon="Trash2Outline"
          disabled={!zimbraId || zimbraId !== accountId}
          label={t('label.delete', 'delete')}
        />
      </div>
      <div className="pr-md">
        <Button
          size="medium"
          type="outlined"
          color="primary"
          onClick={onViewMail}
          icon="MailModOutline"
          disabled={!allowSetPrivacy || viewMailMutation.isPending}
          label={t('label.view_mail', 'VIEW MAIL')}
        />
      </div>
    </>
  );
};
